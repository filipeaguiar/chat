# Emotion Chatbot

A aplicação é um chatbot que tem por objetivo auxiliar a identificar
emoções de acordo com descrições de sentimentos. O chatbot utiliza o modelo
Gemini da Google para gerar respostas e identificar emoções. O usuário pode
interagir com o chatbot através de mensagens de texto, e o chatbot irá responder
com base nas emoções identificadas.

## Como usar

1.  **Obtenha uma chave de API do Google AI:**
    *   Acesse o [Google AI Studio](https://aistudio.google.com/).
    *   Clique em "Get API key" e siga as instruções para criar uma nova chave de API.
2.  **Configure a chave de API:**
    *   Abra o arquivo `script.js` em um editor de texto.
    *   Encontre a linha `const apiKey = 'YOUR_API_KEY';`.
    *   Substitua `'YOUR_API_KEY'` pela sua chave de API real.
3.  **Abra a aplicação:**
    *   Abra o arquivo `index.html` em seu navegador.
4.  **Interaja com o chatbot:**
    *   Digite uma mensagem no campo de texto e clique em "Enviar".
    *   O chatbot irá responder na tela.

**Aviso de Segurança:** Não compartilhe sua chave de API publicamente. Manter a chave no código-fonte não é uma prática recomendada para aplicações em produção.
