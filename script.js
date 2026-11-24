document.addEventListener('DOMContentLoaded', () => {
  // To increment the version, change the value of the appVersion constant.
  const appVersion = '1.1.1';
  console.log(`BioChat Version: ${appVersion}`);

  // Get DOM elements
  const messageForm = document.getElementById('message-form');
  const messageInput = document.getElementById('message-input');
  const chatBox = document.getElementById('chat-box');
  const submitButton = document.getElementById('submit-button');
  const installButton = document.getElementById('install-button');

  // Keep layout aligned with the visible viewport when the mobile keyboard opens
  const syncViewportLayout = () => {
    if (window.visualViewport) {
      const { height, offsetTop } = window.visualViewport;
      document.documentElement.style.setProperty('--app-height', `${height}px`);
      document.documentElement.style.setProperty('--app-offset-top', `${offsetTop}px`);
    } else {
      document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`);
      document.documentElement.style.setProperty('--app-offset-top', '0px');
    }

    if (document.activeElement === messageInput) {
      chatBox.scrollTop = chatBox.scrollHeight;
    }
  };

  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', syncViewportLayout);
    window.visualViewport.addEventListener('scroll', syncViewportLayout);
  }
  window.addEventListener('resize', syncViewportLayout);
  syncViewportLayout();

  messageInput.addEventListener('focus', () => {
    setTimeout(() => {
      syncViewportLayout();
      chatBox.scrollTop = chatBox.scrollHeight;
    }, 300);
  });

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
  // The API key is no longer stored here. It is securely stored in the Cloudflare Worker.

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
    messageElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
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
   * Converts Markdown bold/italic/bullets to HTML so raw asterisks never appear.
   * @param {string} text - Raw paragraph text from the model.
   * @returns {string} HTML-formatted text.
   */
  function formatBotMessage(text) {
    return text
      .trim()
      .replace(/^\s*[-*]\s+/gm, '• ')
      .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
      .replace(/(^|[^*])\*([^*\n]+?)\*(?!\*)/g, '$1<i>$2</i>')
      .replace(/\n/g, '<br>');
  }

  /**
   * Displays the bot's response paragraph by paragraph with a delay.
   * @param {string} fullResponse - The full text response from the API.
   */
  async function displayBotResponseParagraphs(fullResponse) {
    const paragraphs = fullResponse.split(/(?:<br\s*\/?>\s*){2,}|\n{2,}/i).filter(p => p.trim() !== '');

    for (const paragraph of paragraphs) {
      const loadingMessage = appendMessage('bot', '');
      loadingMessage.classList.add('loading');
      const spinner = document.createElement('div');
      spinner.classList.add('spinner');
      loadingMessage.appendChild(spinner);

      await sleep(1500);

      loadingMessage.classList.remove('loading');
      loadingMessage.innerHTML = formatBotMessage(paragraph);
      loadingMessage.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
    submitButton.disabled = false;
    messageInput.focus();
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

    // !!! IMPORTANT: PASTE YOUR CLOUDFLARE WORKER URL HERE !!!
    const WORKER_URL = 'https://emotion-bot-worker.filipe-aguiar-cavalcanti.workers.dev';

    if (WORKER_URL.includes('YOUR_WORKER_URL')) {
      alert('Please replace "YOUR_WORKER_URL" with your actual Cloudflare Worker URL in script.js');
    }

    const requestBody = {
      contents: chatHistory,
    };

    const response = await fetch(WORKER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error:", errorText);
      chatHistory.pop(); // Remove the user message from history on failure
      throw new Error(`Failed to fetch from API proxy. Status: ${response.status}`);
    }

    const data = await response.json();
    const botResponse = data.candidates[0].content.parts[0].text;

    // Add the bot's response to the history
    chatHistory.push({
      role: 'model',
      parts: [{ text: botResponse }]
    });

    return botResponse;
  }
});

