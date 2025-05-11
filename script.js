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

// Inicialização com tratamento de erro robusto
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Verificação de ambiente local
        if (window.location.href.startsWith('file://')) {
            console.warn('Executando localmente - recomendo usar Live Server');
        }

        const urlParams = new URLSearchParams(window.location.search);
        dificuldadeSelecionada = urlParams.get('dificuldade') || 'facil';
        
        // Estado de carregamento
        elements.categoria.textContent = "Carregando...";
        elements.perguntaContainer.innerHTML = `
            <div class="loading">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Preparando seu desafio de segurança...</p>
            </div>
        `;

        // Carrega perguntas
        const response = await fetch('./dados/perguntas.json');
        
        if (!response.ok) {
            throw new Error(`Erro no servidor: ${response.status}`);
        }

        const todasPerguntas = await response.json();
        
        if (!Array.isArray(todasPerguntas)) {
            throw new Error("Formato inválido: o arquivo deve conter um array de perguntas");
        }

        perguntas = todasPerguntas.filter(p => p.dificuldade === dificuldadeSelecionada);
        
        if (perguntas.length === 0) {
            throw new Error(`Nenhuma pergunta encontrada para o nível: ${dificuldadeSelecionada}`);
        }

        mostrarPergunta();
        
    } catch (error) {
        console.error("Erro no quiz:", error);
        elements.perguntaContainer.innerHTML = `
            <div class="erro">
                <h3><i class="fas fa-exclamation-triangle"></i> Ops, algo deu errado!</h3>
                <p><strong>Detalhe:</strong> ${error.message}</p>
                
                <div class="dicas">
                    <p>🔍 Verifique:</p>
                    <ul>
                        <li>Se o arquivo <strong>perguntas.json</strong> existe na pasta /dados</li>
                        <li>Se o servidor está rodando corretamente</li>
                        <li>Se o JSON está sem erros de formatação</li>
                    </ul>
                </div>

                <div class="acoes-erro">
                    <a href="dificuldade.html" class="botao-iniciar">
                        <i class="fas fa-arrow-left"></i> Voltar
                    </a>
                    <button onclick="location.reload()" class="botao-iniciar">
                        <i class="fas fa-sync-alt"></i> Tentar novamente
                    </button>
                </div>
            </div>
        `;
    }
});

// Mostra a pergunta atual
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
    
    // Renderiza conforme o tipo de pergunta
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
                ${[1, 2, 3, 4, 5].map(num => `
                    <button class="opcao-btn" data-resposta="${num}">${num}</button>
                `).join('')}
                <div class="rotulos-escala">
                    <span>1 (Nada seguro)</span>
                    <span>5 (Muito seguro)</span>
                </div>
            </div>
        `;
    } else {
        // Múltipla escolha padrão
        html += p.opcoes.map((opcao, i) => `
            <button class="opcao-btn" data-resposta="${i}">${opcao}</button>
        `).join('');
    }

    elements.perguntaContainer.innerHTML = html;
    elements.feedback.innerHTML = '';
    elements.proximoBtn.classList.add('escondido');

    // Event listeners para as opções
    document.querySelectorAll('.opcao-btn').forEach(btn => {
        btn.addEventListener('click', () => verificarResposta(btn));
    });
}

// Verifica a resposta selecionada
function verificarResposta(btnSelecionado) {
    const p = perguntas[perguntaAtual];
    const respostaUsuario = btnSelecionado.dataset.resposta;
    let respostaCorreta;

    // Determina a resposta correta conforme o tipo
    if (p.tipo === "verdadeiro_falso") {
        respostaCorreta = p.respostaCorreta.toString();
    } else if (p.tipo === "escala") {
        respostaCorreta = p.respostaCorreta;
    } else {
        respostaCorreta = p.respostaCorreta.toString();
    }

    const acertou = respostaUsuario === respostaCorreta.toString();

    // Atualiza pontuação
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

    // Destaca a resposta correta
    document.querySelectorAll('.opcao-btn').forEach(btn => {
        btn.disabled = true;
        if (btn.dataset.resposta === respostaCorreta.toString()) {
            btn.classList.add('correto');
        }
    });

    elements.proximoBtn.classList.remove('escondido');
}

// Finaliza o quiz
function finalizarQuiz() {
    const percentual = Math.round((pontuacao / perguntas.length) * 100);
    let mensagem, icone;

    if (percentual >= 80) {
        mensagem = "Excelente! Você domina segurança digital!";
        icone = "fas fa-trophy";
    } else if (percentual >= 50) {
        mensagem = "Bom trabalho! Continue aprendendo.";
        icone = "fas fa-thumbs-up";
    } else {
        mensagem = "Continue praticando! Segurança é essencial.";
        icone = "fas fa-book";
    }

    elements.perguntaContainer.innerHTML = `
        <div class="resultado-final">
            <div class="cabecalho-resultado">
                <i class="${icone}"></i>
                <h3>Quiz Concluído!</h3>
            </div>
            
            <div class="pontuacao">
                <span class="destaque">${pontuacao}/${perguntas.length}</span>
                <span class="porcentagem">${percentual}% de acertos</span>
            </div>
            
            <p class="mensagem-final">${mensagem}</p>
            
            <div class="botoes-resultado">
                <a href="dificuldade.html" class="botao-iniciar">
                    <i class="fas fa-redo"></i> Tentar novamente
                </a>
                <a href="index.html" class="botao-iniciar">
                    <i class="fas fa-home"></i> Voltar ao início
                </a>
            </div>
        </div>
    `;
}

// Evento para próxima pergunta
elements.proximoBtn.addEventListener('click', () => {
    perguntaAtual++;
    mostrarPergunta();
});