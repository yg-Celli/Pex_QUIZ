// script.js - Código Completo para o Quiz de Segurança

/* ========== CONFIGURAÇÕES INICIAIS ========== */
const config = {
    caminhoJSON: './dados/perguntas.json'  // Caminho relativo ao arquivo JSON
};

/* ========== ELEMENTOS DA PÁGINA ========== */
const elementos = {
    categoria: document.getElementById('categoriaAtual'),
    container: document.getElementById('perguntaContainer'),
    feedback: document.getElementById('feedback'),
    btnProximo: document.getElementById('proximaPergunta'),
    contador: document.getElementById('contador'),
    progresso: document.getElementById('progresso')
};

/* ========== ESTADO DO QUIZ ========== */
let quiz = {
    perguntas: [],
    atual: 0,
    acertos: 0,
    dificuldade: new URLSearchParams(window.location.search).get('dificuldade') || 'facil'
};

/* ========== FUNÇÃO PRINCIPAL ========== */
async function iniciarQuiz() {
    try {
        // Verifica se está rodando localmente
        if (window.location.protocol === 'file:') {
            mostrarErro(`
                <h3><i class="fas fa-exclamation-triangle"></i> Execução Local Detectada</h3>
                <p>Para o quiz funcionar corretamente:</p>
                <ol>
                    <li>Instale a extensão <strong>Live Server</strong> no VS Code</li>
                    <li>Clique com o direito no arquivo <em>quiz.html</em></li>
                    <li>Selecione <strong>"Open with Live Server"</strong></li>
                </ol>
                <a href="https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer" 
                   target="_blank" class="botao-iniciar">
                    <i class="fas fa-download"></i> Instalar Live Server
                </a>
            `);
            return;
        }

        // Mostra carregamento
        mostrarCarregamento();

        // Carrega as perguntas
        const resposta = await fetch(config.caminhoJSON);
        if (!resposta.ok) throw new Error(`Erro: ${resposta.status} - ${resposta.statusText}`);
        
        const dados = await resposta.json();
        if (!Array.isArray(dados)) throw new Error("O arquivo JSON não contém uma lista de perguntas");

        // Filtra perguntas pela dificuldade
        quiz.perguntas = dados.filter(p => p.dificuldade === quiz.dificuldade);
        if (quiz.perguntas.length === 0) throw new Error(`Nenhuma pergunta encontrada para: ${quiz.dificuldade}`);

        // Mostra a primeira pergunta
        mostrarPergunta();

    } catch (erro) {
        console.error("Erro no quiz:", erro);
        mostrarErro(`
            <h3><i class="fas fa-times-circle"></i> Erro ao Carregar</h3>
            <p><strong>Motivo:</strong> ${erro.message}</p>
            
            <div class="dicas">
                <p>🛠️ Por favor verifique:</p>
                <ul>
                    <li>Se o arquivo <code>perguntas.json</code> existe na pasta <code>/dados</code></li>
                    <li>Se está usando <strong>Live Server</strong> (não abra direto o arquivo)</li>
                    <li>Se o JSON está formatado corretamente (sem vírgulas extras)</li>
                </ul>
            </div>
            
            <div class="botoes-acao">
                <button onclick="window.location.href='dificuldade.html'" class="botao-iniciar">
                    <i class="fas fa-arrow-left"></i> Voltar
                </button>
                <button onclick="window.location.reload()" class="botao-iniciar">
                    <i class="fas fa-sync-alt"></i> Recarregar
                </button>
            </div>
        `);
    }
}

/* ========== FUNÇÕES AUXILIARES ========== */
function mostrarCarregamento() {
    elementos.container.innerHTML = `
        <div class="carregando">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Preparando seu desafio de segurança...</p>
        </div>
    `;
}

function mostrarErro(mensagem) {
    elementos.container.innerHTML = `
        <div class="erro-quiz">
            ${mensagem}
        </div>
    `;
}

function mostrarPergunta() {
    // Verifica se acabaram as perguntas
    if (quiz.atual >= quiz.perguntas.length) {
        finalizarQuiz();
        return;
    }

    const pergunta = quiz.perguntas[quiz.atual];

    // Atualiza cabeçalho
    elementos.categoria.textContent = pergunta.categoria;
    elementos.contador.textContent = `${quiz.atual + 1}/${quiz.perguntas.length}`;
    elementos.progresso.style.width = `${((quiz.atual + 1) / quiz.perguntas.length) * 100}%`;

    // Monta a pergunta
    let html = `<h3>${pergunta.pergunta}</h3>`;
    
    // Adiciona opções conforme o tipo
    if (pergunta.tipo === "verdadeiro_falso") {
        html += `
            <div class="opcoes-vf">
                <button class="btn-opcao" data-resposta="true">Verdadeiro</button>
                <button class="btn-opcao" data-resposta="false">Falso</button>
            </div>
        `;
    } 
    else if (pergunta.tipo === "escala") {
        html += `
            <div class="opcoes-escala">
                ${[1, 2, 3, 4, 5].map(num => `
                    <button class="btn-opcao" data-resposta="${num}">${num}</button>
                `).join('')}
                <div class="legenda-escala">
                    <span>1 (Nada seguro)</span>
                    <span>5 (Muito seguro)</span>
                </div>
            </div>
        `;
    } 
    else {
        // Padrão: múltipla escolha
        html += pergunta.opcoes.map((opcao, i) => `
            <button class="btn-opcao" data-resposta="${i}">${opcao}</button>
        `).join('');
    }

    elementos.container.innerHTML = html;
    elementos.feedback.innerHTML = '';
    elementos.btnProximo.classList.add('escondido');

    // Adiciona eventos aos botões
    document.querySelectorAll('.btn-opcao').forEach(botao => {
        botao.addEventListener('click', () => verificarResposta(botao, pergunta));
    });
}

function verificarResposta(botao, pergunta) {
    const respostaUsuario = botao.dataset.resposta;
    let respostaCorreta;

    // Determina a resposta correta conforme o tipo
    if (pergunta.tipo === "verdadeiro_falso") {
        respostaCorreta = pergunta.respostaCorreta.toString();
    } 
    else if (pergunta.tipo === "escala") {
        respostaCorreta = pergunta.respostaCorreta;
    } 
    else {
        respostaCorreta = pergunta.respostaCorreta.toString();
    }

    // Verifica se acertou
    const acertou = respostaUsuario === respostaCorreta.toString();

    // Atualiza interface
    if (acertou) {
        quiz.acertos++;
        botao.classList.add('correta');
        elementos.feedback.innerHTML = `
            <div class="feedback-positivo">
                <i class="fas fa-check-circle"></i>
                <p>Correto! ${pergunta.explicacao}</p>
            </div>
        `;
    } else {
        botao.classList.add('incorreta');
        elementos.feedback.innerHTML = `
            <div class="feedback-negativo">
                <i class="fas fa-times-circle"></i>
                <p>Incorreto. ${pergunta.explicacao}</p>
            </div>
        `;
    }

    // Destaca resposta correta e desabilita botões
    document.querySelectorAll('.btn-opcao').forEach(b => {
        b.disabled = true;
        if (b.dataset.resposta === respostaCorreta.toString()) {
            b.classList.add('correta');
        }
    });

    elementos.btnProximo.classList.remove('escondido');
}

function finalizarQuiz() {
    const percentual = Math.round((quiz.acertos / quiz.perguntas.length) * 100);
    let mensagem, icone;

    if (percentual >= 80) {
        mensagem = "Parabéns! Você é um expert em segurança digital!";
        icone = "fas fa-trophy";
    } 
    else if (percentual >= 50) {
        mensagem = "Bom trabalho! Continue aprendendo sobre segurança.";
        icone = "fas fa-thumbs-up";
    } 
    else {
        mensagem = "Continue praticando! A segurança digital é essencial.";
        icone = "fas fa-book";
    }

    elementos.container.innerHTML = `
        <div class="tela-resultado">
            <div class="cabecalho-resultado">
                <i class="${icone}"></i>
                <h3>Quiz Concluído!</h3>
            </div>
            
            <div class="pontuacao-final">
                <span class="acertos">${quiz.acertos}/${quiz.perguntas.length}</span>
                <span class="porcentagem">${percentual}% de acerto</span>
            </div>
            
            <p class="mensagem-final">${mensagem}</p>
            
            <div class="botoes-reinicio">
                <a href="dificuldade.html" class="botao-iniciar">
                    <i class="fas fa-redo"></i> Novo Quiz
                </a>
                <a href="index.html" class="botao-iniciar">
                    <i class="fas fa-home"></i> Página Inicial
                </a>
            </div>
        </div>
    `;
}

/* ========== EVENTO DE PRÓXIMA PERGUNTA ========== */
elementos.btnProximo.addEventListener('click', () => {
    quiz.atual++;
    mostrarPergunta();
});

/* ========== INICIA O QUIZ QUANDO A PÁGINA CARREGAR ========== */
document.addEventListener('DOMContentLoaded', iniciarQuiz);