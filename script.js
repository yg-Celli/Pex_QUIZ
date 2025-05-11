// script.js - Código Atualizado e Simplificado

/* ========== CONFIGURAÇÕES ========== */
const config = {
    caminhoJSON: './dados/perguntas.json' // Caminho correto do JSON
};

/* ========== ELEMENTOS HTML ========== */
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
        elementos.container.innerHTML = `
            <div class="carregando">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Carregando perguntas...</p>
            </div>
        `;

        const resposta = await fetch(config.caminhoJSON);
        if (!resposta.ok) throw new Error('Falha ao carregar perguntas');
        
        const dados = await resposta.json();
        if (!Array.isArray(dados)) throw new Error("Formato de arquivo inválido");

        // Filtra perguntas pela dificuldade escolhida
        quiz.perguntas = dados.filter(p => p.dificuldade === quiz.dificuldade);
        if (quiz.perguntas.length === 0) throw new Error('Nenhuma pergunta encontrada');

        mostrarPergunta();

    } catch (erro) {
        elementos.container.innerHTML = `
            <div class="erro-quiz">
                <h3><i class="fas fa-exclamation-triangle"></i> Erro</h3>
                <p>${erro.message}</p>
                <button onclick="window.location.href='dificuldade.html'" class="botao-iniciar">
                    <i class="fas fa-arrow-left"></i> Voltar
                </button>
            </div>
        `;
    }
}

/* ========== FUNÇÕES AUXILIARES ========== */
function mostrarPergunta() {
    if (quiz.atual >= quiz.perguntas.length) return finalizarQuiz();

    const pergunta = quiz.perguntas[quiz.atual];
    
    // Atualiza interface
    elementos.categoria.textContent = pergunta.categoria;
    elementos.contador.textContent = `${quiz.atual + 1}/${quiz.perguntas.length}`;
    elementos.progresso.style.width = `${((quiz.atual + 1)/quiz.perguntas.length)*100}%`;

    // Monta HTML da pergunta
    let html = `<h3>${pergunta.pergunta}</h3>`;
    
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
                ${[1,2,3,4,5].map(n => `<button class="btn-opcao" data-resposta="${n}">${n}</button>`).join('')}
                <div class="legenda-escala">
                    <span>1 (Nada seguro)</span>
                    <span>5 (Muito seguro)</span>
                </div>
            </div>
        `;
    } 
    else {
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
    const respostaCorreta = pergunta.respostaCorreta.toString();
    const acertou = respostaUsuario === respostaCorreta;

    // Atualiza estado
    if (acertou) quiz.acertos++;

    // Feedback visual
    document.querySelectorAll('.btn-opcao').forEach(b => {
        b.disabled = true;
        b.classList.add(b.dataset.resposta === respostaCorreta ? 'correta' : 'incorreta');
    });

    elementos.feedback.innerHTML = `
        <div class="feedback-${acertou ? 'positivo' : 'negativo'}">
            <i class="fas fa-${acertou ? 'check' : 'times'}-circle"></i>
            <p>${pergunta.explicacao}</p>
        </div>
    `;

    elementos.btnProximo.classList.remove('escondido');
}

function finalizarQuiz() {
    const percentual = Math.round((quiz.acertos / quiz.perguntas.length) * 100);
    
    elementos.container.innerHTML = `
        <div class="resultado-final">
            <h2><i class="fas fa-trophy"></i> Quiz Concluído!</h2>
            <p>Você acertou ${quiz.acertos} de ${quiz.perguntas.length}</p>
            <p class="destaque">${percentual}% de acerto</p>
            <div class="botoes-reinicio">
                <button onclick="window.location.href='dificuldade.html'" class="botao-iniciar">
                    <i class="fas fa-redo"></i> Tentar Novamente
                </button>
                <button onclick="window.location.href='index.html'" class="botao-iniciar">
                    <i class="fas fa-home"></i> Página Inicial
                </button>
            </div>
        </div>
    `;
}

/* ========== EVENTOS ========== */
elementos.btnProximo.addEventListener('click', () => {
    quiz.atual++;
    mostrarPergunta();
});

document.addEventListener('DOMContentLoaded', iniciarQuiz);