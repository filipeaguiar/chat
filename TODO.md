# Plano de Implementação - Emotion Chatbot

## Tarefas

### 1. Estrutura do Projeto
- [ ] Criar o arquivo `index.html` para a estrutura da página.
- [ ] Criar o arquivo `style.css` para a estilização.
- [ ] Criar o arquivo `script.js` para a lógica da aplicação.
- [ ] Criar o arquivo `README.md` com a descrição do projeto e instruções de uso.

### 2. HTML (`index.html`)
- [ ] Definir a estrutura básica do HTML5.
- [ ] Adicionar o título da página.
- [ ] Linkar o arquivo `style.css`.
- [ ] Criar um container principal para o chat.
- [ ] Adicionar uma área para exibir as mensagens do chat.
- [ ] Criar o formulário de entrada com um campo de texto (`input`) e um botão (`button`) para envio.
- [ ] Linkar o arquivo `script.js` antes de fechar a tag `</body>`.

### 3. CSS (`style.css`)
- [ ] Estilizar o corpo da página (fonte, cor de fundo).
- [ ] Estilizar o container principal do chat.
- [ ] Estilizar a área de mensagens (cores, bordas, rolagem).
- [ ] Criar estilos diferentes para as mensagens do usuário e as do chatbot.
- [ ] Estilizar o formulário de entrada, o campo de texto e o botão.
- [ ] Adicionar media queries para garantir a responsividade em diferentes tamanhos de tela.

### 4. JavaScript (`script.js`)
- [ ] Obter as referências para os elementos do DOM (formulário, input, área de mensagens, botão).
- [ ] Adicionar um `event listener` para o envio do formulário (`submit`).
- [ ] Implementar a função que é chamada no `submit`.
- [ ] Prevenir o comportamento padrão do formulário (recarregar a página).
- [ ] Obter o texto digitado pelo usuário.
- [ ] Criar e exibir o balão de mensagem do usuário na tela.
- [ ] Limpar o campo de texto após o envio.
- [ ] Chamar a função de interação com o Gemini.
- [ ] Criar uma função para exibir o balão de mensagem do chatbot na tela.
- [ ] Implementar a rolagem automática da área de mensagens para a última mensagem.

### 5. Integração com a API Gemini
- [ ] Definir a estrutura da chamada para a API do Gemini usando `fetch`.
- [ ] Criar a função que monta o prompt a ser enviado para o modelo, instruindo-o a identificar emoções e responder como um chatbot.
- [ ] Implementar a lógica para extrair o texto da resposta da API.
- [ ] Adicionar tratamento de erros para a chamada da API.
- [ ] Incluir um local para inserir a chave da API do Google AI, com instruções claras no `README.md` sobre como obtê-la e configurá-la.

### 6. Finalização
- [ ] Revisar e refatorar o código para clareza e boas práticas.
- [ ] Testar a aplicação exaustivamente em diferentes navegadores.
- [ ] Atualizar o `README.md` com a versão final das instruções.
