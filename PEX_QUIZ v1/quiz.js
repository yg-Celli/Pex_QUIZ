const questions = [
    {
        question: "Qual é a capital do Brasil?",
        options: ["Rio de Janeiro", "Brasília", "São Paulo", "Salvador"],
        correct: 1
    },
    {
        question: "Quanto é 2 + 2?",
        options: ["3", "4", "5", "6"],
        correct: 1
    }
];

let currentQuestion = 0;
let score = 0;

function showQuestion() {
    const q = questions[currentQuestion];
    document.getElementById('pergunta').textContent = q.question;
    
    const optionsDiv = document.getElementById('opcoes');
    optionsDiv.innerHTML = '';
    
    q.options.forEach((option, index) => {
        const button = document.createElement('button');
        button.textContent = option;
        button.onclick = () => checkAnswer(index);
        optionsDiv.appendChild(button);
    });
    
    document.getElementById('pontos').textContent = score;
    document.getElementById('total').textContent = questions.length;
}

function checkAnswer(selectedIndex) {
    if (selectedIndex === questions[currentQuestion].correct) {
        score++;
    }
    nextQuestion();
}

function nextQuestion() {
    currentQuestion++;
    if (currentQuestion < questions.length) {
        showQuestion();
    } else {
        alert(`Quiz completo! Seu score: ${score}/${questions.length}`);
    }
}

// Inicia o quiz
showQuestion();
