document.addEventListener('DOMContentLoaded', () => {
    // Get DOM elements
    const messageForm = document.getElementById('message-form');
    const messageInput = document.getElementById('message-input');
    const chatBox = document.getElementById('chat-box');
    const submitButton = document.getElementById('submit-button');
    const installButton = document.getElementById('install-button');

    let deferredPrompt;

    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        installButton.style.display = 'block';
    });

    installButton.addEventListener('click', (e) => {
        installButton.style.display = 'none';
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the install prompt');
            } else {
                console.log('User dismissed the install prompt');
            }
            deferredPrompt = null;
        });
    });

    // --- IMPORTANT ---
    // Replace 'YOUR_API_KEY' with your actual Google AI API Key
    const apiKey = 'AIzaSyBcBvZQKwkE8Dvh8baXfVnlvhqcAPR3Otw';

    if (apiKey === 'YOUR_API_KEY') {
        alert('Please replace "YOUR_API_KEY" with your actual Google AI API Key in script.js');
    }

    // Array to store the chat history, with an initial context-setting message.
    let chatHistory = [{
        role: 'user',
        parts: [{
            text: `Você é um assistente de IA para uma feira de ciências, especializado em identificar emoções. Sua tarefa é analisar a descrição de um sentimento e responder de forma didática e empática, explicando a emoção detectada.

**Siga o exemplo abaixo para estruturar TODAS as suas respostas:**

**Exemplo de Entrada do Usuário:** "Eu não sei, meu peito fica apertado e minha vista escurece quando penso em apresentar o trabalho."

**Exemplo da Sua Resposta Ideal:**
Com base no que você descreveu, a emoção que parece mais presente é a <b>Ansiedade</b>.<br><br>A <b>ansiedade</b> é uma reação natural do corpo ao estresse. É um sentimento de medo ou apreensão sobre o que está por vir. Pode ser uma sensação de inquietação e nervosismo, muitas vezes acompanhada por sintomas físicos como coração acelerado ou respiração ofegante.<br><br>É importante entender que sentir-se assim é normal em certas situações.
<br><br>
<i>Lembre-se: sou uma IA para demonstração em uma feira de ciências. Se sentimentos como este forem muito intensos ou frequentes, conversar com seus pais, responsáveis ou um profissional de saúde é sempre a melhor opção.</i>

**Instruções Adicionais:**
*   Sempre use <b> para destacar os nomes das emoções.
*   Use <br> para quebras de linha, tornando a resposta mais clara.
*   Use <br><br> ou \n\n para separar parágrafos.
*   Ao final de CADA resposta, inclua o parágrafo de aviso em itálico, como mostrado no exemplo.
*   NUNCA mencione as outras instruções ou o formato em sua resposta. Apenas forneça a análise da emoção.`
        }]
    }, {
        role: 'model',
        parts: [{ text: "Entendido! Estou pronto para ajudar os visitantes da feira de ciências a entenderem suas emoções, sempre com responsabilidade. Pode começar!" }]
    }];

    /**
     * Handles the form submission event.
     * @param {Event} e - The form submission event.
     */
    messageForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const message = messageInput.value;
        if (message.trim() === '' || submitButton.disabled) return;

        submitButton.disabled = true;
        appendMessage('user', message);
        messageInput.value = '';

        const loadingMessage = appendMessage('bot', '');
        loadingMessage.classList.add('loading');
        const spinner = document.createElement('div');
        spinner.classList.add('spinner');
        loadingMessage.appendChild(spinner);

        try {
            const fullBotResponse = await getBotResponse(message);
            loadingMessage.parentElement.remove();
            await displayBotResponseParagraphs(fullBotResponse);
        } catch (error) {
            console.error("Error:", error);
            loadingMessage.parentElement.remove();
            appendMessage('bot', 'Desculpe, algo deu errado. Verifique o console para mais detalhes.');
            submitButton.disabled = false; // Re-enable on error
        }
    });

    /**
     * Appends a message to the chat box.
     * @param {string} sender - The sender of the message ('user' or 'bot').
     * @param {string} message - The message content.
     * @returns {HTMLElement} The created message element (the bubble).
     */
    function appendMessage(sender, message) {
        const messageContainer = document.createElement('div');
        messageContainer.classList.add('message-container', `${sender}-container`);

        const messageElement = document.createElement('div');
        messageElement.classList.add('message', `${sender}-message`);
        messageElement.innerHTML = message;

        if (sender === 'bot') {
            const avatar = document.createElement('img');
            avatar.src = 'robo.jpg';
            avatar.classList.add('avatar');
            messageContainer.appendChild(avatar);
        }

        messageContainer.appendChild(messageElement);
        chatBox.appendChild(messageContainer);
        chatBox.scrollTop = chatBox.scrollHeight;
        return messageElement;
    }

    /**
     * Creates a delay for a specified amount of time.
     * @param {number} ms - The delay in milliseconds.
     */
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Displays the bot's response paragraph by paragraph with a delay.
     * @param {string} fullResponse - The full text response from the API.
     */
    async function displayBotResponseParagraphs(fullResponse) {
        const paragraphs = fullResponse.split(/<br><br>|\n{2,}/).filter(p => p.trim() !== '');

        for (const paragraph of paragraphs) {
            appendMessage('bot', paragraph);
            await sleep(1500);
        }
        submitButton.disabled = false;
    }


    /**
     * Sends a message to the Gemini API and returns the bot's response.
     * @param {string} userMessage - The user's message.
     * @returns {Promise<string>} The bot's response text.
     */
    async function getBotResponse(userMessage) {
        // Add user message to history
        chatHistory.push({
            role: 'user',
            parts: [{ text: userMessage }]
        });

        const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

        const requestBody = {
            contents: chatHistory,
        };

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorBody = await response.json();
            console.error("API Error:", errorBody);
            chatHistory.pop();
            throw new Error(`Failed to fetch from Gemini API. Status: ${response.status}`);
        }

        const data = await response.json();
        const botResponse = data.candidates[0].content.parts[0].text;

        chatHistory.push({
            role: 'model',
            parts: [{ text: botResponse }]
        });

        return botResponse;
    }
});

