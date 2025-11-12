from src.core.entities.product import Product
from src.core.exceptions import ProductNotFound
from src.core.interfaces.product_repository import ProductRepository


class UpdateProductUseCase:
    """
    Caso de uso para atualizar um produto existente.
    """
    def __init__(self, repository: ProductRepository):
        self._repository = repository

    def execute(
        self, product_id: int, nome: str, quantidade: int, valor: float
    ) -> Product:
        """
        Executa o caso de uso.
        
        Args:
            product_id (int): O ID do produto a ser atualizado.
            nome (str): O NOVO nome do produto.
            quantidade (int): A nova quantidade.
            valor (float): O novo valor.
        """
        # 1. Busca o produto pelo ID (NÃO MAIS PELO NOME)
        product = self._repository.get_by_id(product_id)

        # 2. Verifica se existe
        if product is None:
            raise ProductNotFound(f"Produto com o id '{product_id}' não encontrado.")

        # 3. Atualiza todos os atributos
        product.nome = nome  # <--- ADICIONADO
        product.quantidade = quantidade
        product.valor = valor

        # 4. Salva as mudanças
        updated_product = self._repository.update(product)

        # 5. Retorna o produto
        return updated_product