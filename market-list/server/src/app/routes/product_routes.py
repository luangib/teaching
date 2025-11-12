from urllib.parse import unquote

from flask_openapi3 import Tag
from src.app.schemas import (
    ErrorSchema,
    ListagemProdutosSchema,
    ProdutoBuscaPorNomeSchema,
    ProdutoBuscaSchema,
    ProdutoDelSchema,
    ProdutoSchema,
    ProdutoViewSchema,

    apresenta_produto,
    apresenta_produtos,
)
from src.app.schemas.product import ProdutoUpdateSchema
from src.core.exceptions import ProductAlreadyExists, ProductNotFound
from src.core.use_cases.add_product import AddProductUseCase
from src.core.use_cases.delete_product import DeleteProductUseCase
from src.core.use_cases.get_product import GetProductUseCase
from src.core.use_cases.list_products import ListProductsUseCase
# <--- MUDANÇA: Importa o novo use case
from src.core.use_cases.update_product import UpdateProductUseCase

produto_tag = Tag(
    name="Produto",
    description="Adição, visualização e remoção de produtos à base",
)


def register_product_routes(
    app,
    add_use_case: AddProductUseCase,
    list_use_case: ListProductsUseCase,
    get_use_case: GetProductUseCase,
    delete_use_case: DeleteProductUseCase,
    update_use_case: UpdateProductUseCase,  # <--- MUDANÇA: Adiciona o novo use case
) -> None:
    @app.post(
        "/produto",
        tags=[produto_tag],
        responses={
            "200": ProdutoViewSchema,
            "409": ErrorSchema,
            "400": ErrorSchema,
        },
    )
    def add_produto(form: ProdutoSchema):
        try:
            produto = add_use_case.execute(
                form.nome, form.quantidade, form.valor
            )
            return apresenta_produto(produto), 200
        except ProductAlreadyExists as error:
            return {"mesage": str(error)}, 409
        except Exception:
            return {"mesage": "Não foi possível salvar novo item :/"}, 400

    @app.get(
        "/produtos",
        tags=[produto_tag],
        responses={"200": ListagemProdutosSchema, "404": ErrorSchema},
    )
    def get_produtos():
        produtos = list_use_case.execute()
        if not produtos:
            return {"produtos": []}, 200
        return apresenta_produtos(produtos), 200

    @app.get(
        "/produto",
        tags=[produto_tag],
        responses={"200": ProdutoViewSchema, "404": ErrorSchema},
    )
    def get_produto(query: ProdutoBuscaSchema):
        try:
            produto = get_use_case.execute(query.id)
            return apresenta_produto(produto), 200
        except ProductNotFound as error:
            return {"mesage": str(error)}, 404

    @app.delete(
        "/produto",
        tags=[produto_tag],
        responses={"200": ProdutoDelSchema, "404": ErrorSchema},
    )
    def del_produto(query: ProdutoBuscaPorNomeSchema):
        nome = unquote(unquote(query.nome))
        try:
            delete_use_case.execute(nome)
            return {"mesage": "Produto removido", "nome": nome}, 200
        except ProductNotFound as error:
            return {"mesage": str(error)}, 404

    # <--- MUDANÇA: Rota PUT inteira adicionada ---
    @app.put(
        '/produto',
        tags=[produto_tag],
        summary="Atualiza a quantidade e o valor de um produto",
        responses={
            "200": ProdutoViewSchema,
            "404": ErrorSchema,
            "400": ErrorSchema,
        },
    )
    def update_produto(
        query: ProdutoBuscaPorNomeSchema,  # Busca pelo nome (na URL)
        body: ProdutoUpdateSchema        # Pega dados do body
    ):
        """
        Atualiza um produto existente (quantidade e valor)
        buscando pelo nome.
        """
        nome = unquote(unquote(query.nome))
        try:
            produto = update_use_case.execute(
                nome=nome,
                quantidade=body.quantidade,
                valor=body.valor
            )
            return apresenta_produto(produto), 200
        except ProductNotFound as error:
            return {"mesage": str(error)}, 404
        except Exception as e:
            return {"mesage": f"Não foi possível atualizar o item: {e}"}, 400