// Variáveis globais
let perguntas = [];
let perguntaAtual = 0;
let pontuacao = 0;
let dificuldadeSelecionada;

// Elementos DOM
const elements = {
    categoria: document.getElementById('categoriaAtual'),
    perguntaContainer: document.getElementById('perguntaContainer'),
    feedback: document.getElementById('feedback'),
    proximoBtn: document.getElementById('proximaPergunta'),
    contador: document.getElementById('contador'),
    progresso: document.getElementById('progresso')
};

// Inicialização
document.addEventListener('DOMContentLoaded', async () => {
    // 1. Capturar dificuldade da URL
    const urlParams = new URLSearchParams(window.location.search);
    dificuldadeSelecionada = urlParams.get('dificuldade') || 'facil';

    // 2. Carregar perguntas do JSON
    try {
        const response = await fetch('dados/perguntas.json');
        const todasPerguntas = await response.json();
        perguntas = todasPerguntas.filter(p => p.dificuldade === dificuldadeSelecionada);
        mostrarPergunta();
    } catch (error) {
        console.error("Erro ao carregar perguntas:", error);
        elements.perguntaContainer.innerHTML = `
            <div class="erro">
                <p>Ocorreu um erro ao carregar o quiz. Por favor, tente novamente.</p>
                <a href="dificuldade.html" class="botao-iniciar">Voltar</a>
            </div>
        `;
    }
});

// Mostrar pergunta atual
function mostrarPergunta() {
    if (perguntaAtual >= perguntas.length) {
        finalizarQuiz();
        return;
    }

    const p = perguntas[perguntaAtual];
    elements.categoria.textContent = p.categoria;
    elements.contador.textContent = `${perguntaAtual + 1}/${perguntas.length}`;
    elements.progresso.style.width = `${((perguntaAtual + 1) / perguntas.length) * 100}%`;

    let html = `<h3>${p.pergunta}</h3>`;
    
    if (p.tipo === "verdadeiro_falso") {
        html += `
            <div class="opcoes-verdadeiro-falso">
                <button class="opcao-btn" data-resposta="true">Verdadeiro</button>
                <button class="opcao-btn" data-resposta="false">Falso</button>
            </div>
        `;
    } else if (p.tipo === "escala") {
        html += `
            <div class="opcoes-escala">
                ${Array.from({length: 5}, (_, i) => 
                    `<button class="opcao-btn" data-resposta="${i + 1}">${i + 1}</button>`
                ).join('')}
                <div class="rotulos-escala">
                    <span>1 (Nada seguro)</span>
                    <span>5 (Muito seguro)</span>
                </div>
            </div>
        `;
    } else {
        // Padrão: múltipla escolha
        html += p.opcoes.map((opcao, i) => `
            <button class="opcao-btn" data-resposta="${i}">${opcao}</button>
        `).join('');
    }

    elements.perguntaContainer.innerHTML = html;
    elements.feedback.innerHTML = '';
    elements.proximoBtn.classList.add('escondido');

    // Adicionar event listeners aos botões
    document.querySelectorAll('.opcao-btn').forEach(btn => {
        btn.addEventListener('click', () => verificarResposta(btn));
    });
}

// Verificar resposta selecionada
function verificarResposta(btnSelecionado) {
    const p = perguntas[perguntaAtual];
    const respostaUsuario = btnSelecionado.dataset.resposta;
    let correta;

    if (p.tipo === "verdadeiro_falso") {
        correta = p.respostaCorreta.toString();
    } else if (p.tipo === "escala") {
        correta = p.respostaCorreta;
    } else {
        correta = p.respostaCorreta.toString();
    }

    const acertou = respostaUsuario === correta.toString();

    // Feedback visual
    if (acertou) {
        pontuacao++;
        btnSelecionado.classList.add('correto');
        elements.feedback.innerHTML = `
            <div class="feedback-correto">
                <i class="fas fa-check-circle"></i>
                <p>Correto! ${p.explicacao}</p>
            </div>
        `;
    } else {
        btnSelecionado.classList.add('incorreto');
        elements.feedback.innerHTML = `
            <div class="feedback-incorreto">
                <i class="fas fa-times-circle"></i>
                <p>Incorreto. ${p.explicacao}</p>
            </div>
        `;
    }

    // Desabilitar outras opções
    document.querySelectorAll('.opcao-btn').forEach(btn => {
        btn.disabled = true;
    });

    elements.proximoBtn.classList.remove('escondido');
}

// Finalizar quiz
function finalizarQuiz() {
    const percentual = Math.round((pontuacao / perguntas.length) * 100);
    let mensagem;

    if (percentual >= 80) {
        mensagem = "Excelente! Você é um expert em segurança digital!";
    } else if (percentual >= 50) {
        mensagem = "Bom trabalho! Mas ainda há espaço para melhorar.";
    } else {
        mensagem = "Continue estudando! Segurança digital é essencial.";
    }

    elements.perguntaContainer.innerHTML = `
        <div class="resultado-final">
            <h3>Quiz Concluído!</h3>
            <div class="pontuacao">
                <span class="destaque">${pontuacao}/${perguntas.length}</span>
                <span>(${percentual}% de acertos)</span>
            </div>
            <p>${mensagem}</p>
            <div class="botoes-resultado">
                <a href="dificuldade.html" class="botao-iniciar">Tentar Novamente</a>
                <a href="index.html" class="botao-iniciar">Voltar ao Início</a>
            </div>
        </div>
    `;
}

// Event listener para próxima pergunta
elements.proximoBtn.addEventListener('click', () => {
    perguntaAtual++;
    mostrarPergunta();
});