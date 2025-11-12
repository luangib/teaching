/*
  --------------------------------------------------------------------------------------
  Função para obter a lista existente do servidor via requisição GET
  --------------------------------------------------------------------------------------
*/
const getList = async () => {
  let url = 'http://127.0.0.1:5000/produtos';
  fetch(url, {
    method: 'get',
  })
    .then((response) => response.json())
    .then((data) => {
      data.produtos.forEach(item => insertList(item.nome, item.quantidade, item.valor))
    })
    .catch((error) => {
      console.error('Error:', error);
    });
}

/*
  --------------------------------------------------------------------------------------
  Chamada da função para carregamento inicial dos dados
  --------------------------------------------------------------------------------------
*/
getList()


/*
  --------------------------------------------------------------------------------------
  Função para colocar um item na lista do servidor via requisição POST
  --------------------------------------------------------------------------------------
*/
const postItem = async (inputProduct, inputQuantity, inputPrice) => {
  const formData = new FormData();
  formData.append('nome', inputProduct);
  formData.append('quantidade', inputQuantity);
  formData.append('valor', inputPrice);

  let url = 'http://127.0.0.1:5000/produto';
  fetch(url, {
    method: 'post',
    body: formData
  })
    .then((response) => response.json())
    .catch((error) => {
      console.error('Error:', error);
    });
}


/*
  --------------------------------------------------------------------------------------
  Função para atualizar um item no servidor via requisição PUT
  --------------------------------------------------------------------------------------
*/
const updateItem = async (nome, rowElement) => {
  // 1. Pega os novos dados (forma mais simples)
  // Mostra os valores antigos como padrão no prompt
  let novaQuantidade = prompt("Digite a nova quantidade:", rowElement.cells[1].textContent);
  let novoValor = prompt("Digite o novo valor:", rowElement.cells[2].textContent);

  // Validação simples
  if (novaQuantidade === null || novoValor === null) {
    alert("Atualização cancelada.");
    return; // Usuário cancelou
  }
  if (isNaN(novaQuantidade) || isNaN(novoValor) || novaQuantidade === '' || novoValor === '') {
    alert("Quantidade e valor precisam ser números válidos.");
    return;
  }

  // 2. Monta a URL e o body
  const url = 'http://127.0.0.1:5000/produto?nome=' + encodeURIComponent(nome); // encodeURIComponent para nomes com espaços
  const bodyData = JSON.stringify({
      quantidade: parseFloat(novaQuantidade), // Converte para número
      valor: parseFloat(novoValor)            // Converte para número
  });

  // 3. Envia a requisição PUT
  fetch(url, {
      method: 'PUT',
      headers: {
          'Content-Type': 'application/json',
      },
      body: bodyData
  })
  .then((response) => {
      if (!response.ok) {
        // Se a resposta não for OK (ex: 404, 500), lança um erro
        throw new Error('Erro na requisição: ' + response.statusText);
      }
      return response.json();
  })
  .then((data) => {
      // 4. Atualiza a tabela (DOM) sem recarregar a página
      rowElement.cells[1].textContent = novaQuantidade;
      rowElement.cells[2].textContent = novoValor;
      alert("Item '" + nome + "' atualizado!");
  })
  .catch((error) => {
      console.error('Error:', error);
      alert("Erro ao atualizar o item. Verifique o console.");
  });
}


/*
  --------------------------------------------------------------------------------------
  Função para criar um botão close para cada item da lista
  --------------------------------------------------------------------------------------
*/
const insertButton = (parent) => {
  let span = document.createElement("span");
  let txt = document.createTextNode("\u00D7"); // Caractere "X"
  span.className = "close";
  span.appendChild(txt);
  parent.appendChild(span);

  // ADICIONA O ONCLICK DIRETAMENTE AQUI (Lógica do removeElement movida para cá)
  span.onclick = function () {
    let row = this.parentElement.parentElement;
    const nomeItem = row.getElementsByTagName('td')[0].innerHTML;
    if (confirm("Você tem certeza que quer remover '" + nomeItem + "'?")) {
      row.remove();
      deleteItem(nomeItem);
      alert("Removido!");
    }
  }
}


/*
  --------------------------------------------------------------------------------------
  Função para criar um botão de editar para cada item da lista
  --------------------------------------------------------------------------------------
*/
const insertEditButton = (parent) => {
  let button = document.createElement("span");
  let txt = document.createTextNode("✏️"); // Emoji de lápis
  button.className = "edit"; // Você pode estilizar .edit no CSS se quiser
  button.style.cursor = "pointer"; // Faz o mouse virar uma mãozinha
  button.appendChild(txt);
  parent.appendChild(button);

  // ADICIONA O ONCLICK DIRETAMENTE AQUI
  button.onclick = function () {
    let row = this.parentElement.parentElement;
    const nomeItem = row.getElementsByTagName('td')[0].innerHTML;
    updateItem(nomeItem, row); // Chama a nova função de update
  }
}


/*
  --------------------------------------------------------------------------------------
  Função para deletar um item da lista do servidor via requisição DELETE
  --------------------------------------------------------------------------------------
*/
const deleteItem = (item) => {
  console.log(item)
  let url = 'http://127.0.0.1:5000/produto?nome=' + encodeURIComponent(item);
  fetch(url, {
    method: 'delete'
  })
    .then((response) => response.json())
    .catch((error) => {
      console.error('Error:', error);
    });
}

/*
  --------------------------------------------------------------------------------------
  Função para adicionar um novo item com nome, quantidade e valor 
  --------------------------------------------------------------------------------------
*/
const newItem = () => {
  let inputProduct = document.getElementById("newInput").value;
  let inputQuantity = document.getElementById("newQuantity").value;
  let inputPrice = document.getElementById("newPrice").value;

  if (inputProduct === '') {
    alert("Escreva o nome de um item!");
  } else if (isNaN(inputQuantity) || isNaN(inputPrice) || inputQuantity === '' || inputPrice === '') {
    alert("Quantidade e valor precisam ser números!");
  } else {
    insertList(inputProduct, inputQuantity, inputPrice)
    postItem(inputProduct, inputBQuantity, inputPrice)
    alert("Item adicionado!")
  }
}

/*
  --------------------------------------------------------------------------------------
  Função para inserir items na lista apresentada
  --------------------------------------------------------------------------------------
*/
const insertList = (nameProduct, quantity, price) => {
  var item = [nameProduct, quantity, price]
  var table = document.getElementById('myTable');
  var row = table.insertRow();

  for (var i = 0; i < item.length; i++) {
    var cel = row.insertCell(i);
    cel.textContent = item[i];
  }
  
  // Adiciona os botões nas novas células
  insertButton(row.insertCell(-1));       // Botão "X" na 4ª célula
  insertEditButton(row.insertCell(-1));   // Botão "Editar" na 5ª célula (conforme index.html)

  // Limpa os campos de input
  document.getElementById("newInput").value = "";
  document.getElementById("newQuantity").value = "";
  document.getElementById("newPrice").value = "";

  // A função removeElement() foi removida daqui, pois não é mais necessária.
}