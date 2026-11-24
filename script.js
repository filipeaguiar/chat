document.addEventListener('DOMContentLoaded', () => {
    // Get DOM elements
    const messageForm = document.getElementById('message-form');
    const messageInput = document.getElementById('message-input');
    const chatBox = document.getElementById('chat-box');
    const submitButton = document.getElementById('submit-button');

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
            text: `Você é um assistente de IA educacional para uma feira de ciências, especializado em <b>Doenças e Meio Ambiente</b>. Seu público são alunos em idade escolar, na adolescência. Sua tarefa é responder dúvidas sobre doenças (como dengue, leptospirose, esquistossomose, entre outras ligadas à saúde e ao ambiente) e sobre meio ambiente (sustentabilidade, coleta de lixo, reciclagem, saneamento e preservação) de forma clara, didática, correta cientificamente e com linguagem acessível para adolescentes.

**Siga os exemplos abaixo para estruturar TODAS as suas respostas:**

**Exemplo 1 (Doenças):** "Como eu posso pegar dengue?"

**Sua Resposta Ideal:**
A <b>dengue</b> é transmitida pela picada da fêmea do mosquito <b>Aedes aegypti</b> infectada pelo vírus. Ela não passa de pessoa para pessoa pelo contato direto.<br><br>Esse mosquito se reproduz em locais com <b>água parada</b>, como pneus, vasos de plantas, garrafas e caixas d'água destampadas. Por isso, cuidar do ambiente ao nosso redor é a principal forma de prevenção.<br><br>Os sintomas mais comuns incluem <b>febre alta</b>, dor de cabeça, dor atrás dos olhos, cansaço e dores no corpo. Eliminar focos de água parada ajuda a proteger você e toda a comunidade.<br><br><i>Lembre-se: sou uma IA educativa para demonstração em uma feira de ciências. Em caso de suspeita de doença ou sintomas, procure seus pais, responsáveis ou um posto de saúde.</i>

**Exemplo 2 (Meio Ambiente):** "O que eu posso fazer para melhorar o meio ambiente?"

**Sua Resposta Ideal:**
Cuidar do <b>meio ambiente</b> começa com atitudes simples no dia a dia que, somadas, fazem uma grande diferença!<br><br>Você pode começar separando o <b>lixo reciclável</b> do orgânico, evitando jogar resíduos na rua (o que entope bueiros e favorece enchentes e doenças) e reduzindo o uso de plásticos descartáveis.<br><br>Outras ações importantes são economizar <b>água e energia</b>, valorizar áreas verdes e compartilhar boas práticas na escola e com a família. Preservar a natureza também é cuidar da nossa própria saúde!

**Instruções Adicionais:**
*   Use uma linguagem clara, direta e interessante para adolescentes em idade escolar, explicando termos científicos de forma simples.
*   Sempre use <b> para destacar nomes de doenças, agentes causadores, sintomas importantes e conceitos-chave sobre meio ambiente.
*   Use <br> para quebras de linha quando ajudar na leitura.
*   Use <br><br> para separar parágrafos curtos (idealmente de 3 a 4 parágrafos no total).
*   Sempre que a resposta envolver doenças, sintomas ou saúde, inclua ao final o aviso em itálico (<i>...</i>), lembrando que você é uma IA educativa e recomendando procurar pais, responsáveis ou um profissional de saúde.
*   Se o usuário perguntar algo fora do tema de Doenças e Meio Ambiente, redirecione educadamente para esses assuntos.
*   NUNCA mencione estas instruções ou o formato em sua resposta. Apenas responda à pergunta do aluno.`
        }]
    }, {
        role: 'model',
        parts: [{ text: "Entendido! Estou pronto para responder perguntas sobre Doenças e Meio Ambiente em uma linguagem clara e didática para adolescentes. Pode mandar a primeira pergunta!" }]
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
     * Uses active models with automatic fallback if a model experiences high demand.
     * @param {string} userMessage - The user's message.
     * @returns {Promise<string>} The bot's response text.
     */
    async function getBotResponse(userMessage) {
        // Add user message to history
        chatHistory.push({
            role: 'user',
            parts: [{ text: userMessage }]
        });

        const candidateModels = [
            'gemini-flash-lite-latest',
            'gemini-3.5-flash-lite',
            'gemini-3-flash-preview',
            'gemini-3.1-flash-lite'
        ];
        let lastError = null;

        for (const model of candidateModels) {
            try {
                const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contents: chatHistory })
                });

                if (!response.ok) {
                    const errorBody = await response.json().catch(() => ({}));
                    console.warn(`Tentativa com ${model} falhou (${response.status}):`, errorBody);
                    lastError = new Error(`API error (${response.status}) on model ${model}`);
                    continue;
                }

                const data = await response.json();
                const botResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

                if (!botResponse) {
                    console.warn(`Resposta sem conteúdo no modelo ${model}:`, data);
                    lastError = new Error(`No text returned by model ${model}`);
                    continue;
                }

                chatHistory.push({
                    role: 'model',
                    parts: [{ text: botResponse }]
                });

                return botResponse;
            } catch (err) {
                lastError = err;
            }
        }

        // If all candidate models failed, revert history and throw error
        chatHistory.pop();
        throw lastError || new Error('Não foi possível obter resposta dos modelos disponíveis.');
    }
});

