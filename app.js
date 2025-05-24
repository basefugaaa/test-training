// app.js

let current = 0;
let answers = [];
let examQuestions = [];
let examAnswers = [];
let examTimer = null;
let timeRemaining = 720;

// Проверка загрузки вопросов
if (!window.questions || !Array.isArray(window.questions)) {
  console.error('Ошибка: вопросы не загружены!');
  document.getElementById('question-text').textContent = 'Ошибка загрузки вопросов';
} else {
  document.addEventListener('DOMContentLoaded', function() {
    showTraining();
  });
}

// === ПЕРЕКЛЮЧЕНИЕ РЕЖИМОВ ===
function showTraining() {
  document.getElementById("training-mode").style.display = "block";
  document.getElementById("exam-mode").style.display = "none";
  document.getElementById("page-title").textContent = "Режим тренировки";
  startTrainingMode();
}

function showExam() {
  document.getElementById("training-mode").style.display = "none";
  document.getElementById("exam-mode").style.display = "block";
  document.getElementById("page-title").textContent = "Экзаменационный режим";
  startExamMode();
}

// === ТРЕНИРОВОЧНЫЙ РЕЖИМ ===
function startTrainingMode() {
  const shuffledQuestions = window.questions.sort(() => Math.random() - 0.5);
  current = 0;
  answers = Array(window.questions.length).fill(null);

  const grid = document.getElementById('question-grid');
  const nextBtn = document.getElementById('next-btn');

  grid.innerHTML = '';
  shuffledQuestions.forEach((_, index) => {
    const btn = document.createElement('button');
    btn.textContent = index + 1;
    btn.onclick = () => {
      current = index;
      showTrainingQuestion(shuffledQuestions);
    };
    grid.appendChild(btn);
  });

  nextBtn.onclick = () => {
    current = (current + 1) % shuffledQuestions.length;
    showTrainingQuestion(shuffledQuestions);
  };

  showTrainingQuestion(shuffledQuestions);
}

function showTrainingQuestion(shuffledQuestions) {
  const question = shuffledQuestions[current];
  document.getElementById('question-text').textContent = question.question;
  const optionsContainer = document.getElementById('options');
  optionsContainer.innerHTML = '';
  document.getElementById('result').textContent = '';

  question.options.forEach((option, optionIndex) => {
    const optionBtn = document.createElement('button');
    optionBtn.textContent = option;
    optionBtn.onclick = () => {
      const isCorrect = optionIndex === question.correct;
      const resultElement = document.getElementById('result');
      resultElement.textContent = isCorrect ? "✅ Правильно!" : "❌ Неправильно!";
      resultElement.className = "result " + (isCorrect ? "correct-answer" : "incorrect-answer");
      answers[current] = isCorrect ? 'correct' : 'incorrect';
      const gridButton = document.getElementById('question-grid').children[current];
      gridButton.className = isCorrect ? 'correct' : 'incorrect';
      updateTrainingSummary();
    };
    optionsContainer.appendChild(optionBtn);
  });
}

function updateTrainingSummary() {
  const correct = answers.filter(a => a === 'correct').length;
  const incorrect = answers.filter(a => a === 'incorrect').length;
  document.getElementById('summary').textContent = `Правильно: ${correct} | Неправильно: ${incorrect}`;
}

// === ЭКЗАМЕНАЦИОННЫЙ РЕЖИМ ===
function startExamMode() {
  examQuestions = window.questions.sort(() => Math.random() - 0.5).slice(0, 20);
  examAnswers = Array(20).fill(null);
  current = 0;
  timeRemaining = 720;
  renderExamQuestion();
  updateExamTimer();
  if (examTimer) clearInterval(examTimer);
  examTimer = setInterval(() => {
    timeRemaining--;
    updateExamTimer();
    if (timeRemaining <= 0) {
      clearInterval(examTimer);
      submitExam();
    }
  }, 1000);
}

function updateExamTimer() {
  const min = Math.floor(timeRemaining / 60).toString().padStart(2, '0');
  const sec = (timeRemaining % 60).toString().padStart(2, '0');
  document.getElementById("exam-timer").textContent = `Осталось: ${min}:${sec}`;
}

function renderExamQuestion() {
  const q = examQuestions[current];
  document.getElementById('exam-question').textContent = q.question;
  const options = document.getElementById('exam-options');
  options.innerHTML = '';

  q.options.forEach((opt, idx) => {
    const btn = document.createElement('button');
    btn.textContent = opt;
    btn.disabled = examAnswers[current] !== null;
    btn.onclick = () => {
      if (examAnswers[current] === null) {
        examAnswers[current] = idx === q.correct ? 'correct' : 'incorrect';
        renderExamQuestion();
      }
    };
    if (examAnswers[current] !== null) {
      if (idx === q.correct) btn.style.backgroundColor = '#b8f3c1';
      else if (examAnswers[current] === 'incorrect' && idx === q.correct) btn.style.backgroundColor = '#f8bcbc';
      btn.disabled = true;
    }
    options.appendChild(btn);
  });
}

function submitExam() {
  clearInterval(examTimer);
  const correct = examAnswers.filter(a => a === 'correct').length;
  const incorrect = examAnswers.filter(a => a === 'incorrect').length;
  document.getElementById("exam-summary").innerHTML = `
    <p>✅ Правильных: ${correct}</p>
    <p>❌ Неправильных: ${incorrect}</p>
    <button onclick=\"showExam()\">Пройти ещё раз</button>
  `;
  document.getElementById('exam-options').innerHTML = '';
  document.getElementById('exam-question').textContent = 'Экзамен завершён.';
  document.getElementById('submit-exam').style.display = 'none';
}
