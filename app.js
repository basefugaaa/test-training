// app.js

let current = 0;
let answers = [];
let examQuestions = [];
let examAnswers = [];
let examTimer = null;
let timeRemaining = 720;
let lockedAnswers = [];

if (!window.questions || !Array.isArray(window.questions)) {
  console.error('Ошибка: вопросы не загружены!');
  document.getElementById('question-text').textContent = 'Ошибка загрузки вопросов';
} else {
  document.addEventListener('DOMContentLoaded', function () {
    showTraining();
  });
}

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

let shuffledQuestions = [];
function startTrainingMode() {
  shuffledQuestions = window.questions.sort(() => Math.random() - 0.5);
  current = 0;
  answers = Array(shuffledQuestions.length).fill(null);
  lockedAnswers = Array(shuffledQuestions.length).fill(false);

  const grid = document.getElementById('question-grid');
  const nextBtn = document.getElementById('next-btn');

  grid.innerHTML = '';
  shuffledQuestions.forEach((_, index) => {
    const btn = document.createElement('button');
    btn.textContent = index + 1;
    btn.onclick = () => {
      current = index;
      const saved = localStorage.getItem('trainingProgress');
if (saved) {
  try {
    const parsed = JSON.parse(saved);
    if (Array.isArray(parsed.answers) && Array.isArray(parsed.lockedAnswers)) {
      answers = parsed.answers;
      lockedAnswers = parsed.lockedAnswers;
      current = parsed.current || 0;
    }
  } catch (e) {
    console.warn("Не удалось восстановить прогресс.");
  }
}
      showTrainingQuestion();
    };
    grid.appendChild(btn);
    localStorage.removeItem('trainingProgress');
  });

  // Кнопка досрочного завершения тренировки
  if (!document.getElementById('finish-training')) {
    const finishBtn = document.createElement('button');
    finishBtn.id = 'finish-training';
    finishBtn.textContent = 'Завершить тренировку';
    finishBtn.style.marginTop = '15px';
    finishBtn.onclick = finishTraining;
    document.getElementById('quiz').appendChild(finishBtn);
  }

  nextBtn.onclick = nextQuestion;
  showTrainingQuestion();
}

function showTrainingQuestion() {
  const question = shuffledQuestions[current];
  document.getElementById('question-text').textContent = question.question;
  const optionsContainer = document.getElementById('options');
  optionsContainer.innerHTML = '';
  document.getElementById('result').textContent = '';

  question.options.forEach((option, optionIndex) => {
    const optionBtn = document.createElement('button');
    optionBtn.textContent = option;
    optionBtn.disabled = lockedAnswers[current];
    optionBtn.onclick = () => {
      if (lockedAnswers[current]) return;
      const isCorrect = optionIndex === question.correct;
      const resultElement = document.getElementById('result');
      resultElement.textContent = isCorrect ? "✅ Правильно!" : "❌ Неправильно!";
      resultElement.className = "result " + (isCorrect ? "correct-answer" : "incorrect-answer");
      answers[current] = isCorrect ? 'correct' : 'incorrect';
      lockedAnswers[current] = true;
      localStorage.setItem('trainingProgress', JSON.stringify({
  current,
  answers,
  lockedAnswers
  localStorage.removeItem('trainingProgress');
}));
      const gridButton = document.getElementById('question-grid').children[current];
      gridButton.className = isCorrect ? 'correct' : 'incorrect';
      updateTrainingSummary();

      // Блокировка всех кнопок после ответа
      document.querySelectorAll('#options button').forEach(b => b.disabled = true);
    };

    if (lockedAnswers[current]) {
      optionBtn.disabled = true;
      if (optionIndex === question.correct) {
        optionBtn.style.backgroundColor = '#b8f3c1';
      } else if (answers[current] === 'incorrect') {
        optionBtn.style.opacity = '0.6';
      }
    }

    optionsContainer.appendChild(optionBtn);
  });
}

function nextQuestion() {
  current = (current + 1) % shuffledQuestions.length;
  showTrainingQuestion();

  if (!answers.includes(null)) {
    const summary = document.getElementById('summary');
    if (!document.getElementById('retry-errors')) {
      const btn = document.createElement('button');
      btn.id = 'retry-errors';
      btn.textContent = 'Повторить ошибки';
      btn.style.marginTop = '20px';
      btn.onclick = retryIncorrectQuestions;
      summary.appendChild(btn);
    }
  }
}

function finishTraining() {
  const correct = answers.filter(a => a === 'correct').length;
  const incorrect = answers.filter(a => a === 'incorrect').length;
  const unanswered = answers.filter(a => a === null).length;

  const summary = document.getElementById('summary');
  summary.innerHTML = `
    ✅ Правильных: ${correct}<br>
    ❌ Неправильных: ${incorrect}<br>
    ❓ Без ответа: ${unanswered}<br>
  `;

  if (!document.getElementById('retry-errors')) {
    const retryBtn = document.createElement('button');
    retryBtn.id = 'retry-errors';
    retryBtn.textContent = 'Повторить ошибки';
    retryBtn.style.marginTop = '20px';
    retryBtn.onclick = retryIncorrectQuestions;
    summary.appendChild(retryBtn);
  }
}

function updateTrainingSummary() {
  const correct = answers.filter(a => a === 'correct').length;
  const incorrect = answers.filter(a => a === 'incorrect').length;
  document.getElementById('summary').textContent = `Правильно: ${correct} | Неправильно: ${incorrect}`;
}

function retryIncorrectQuestions() {
  const incorrectIndices = answers
    .map((val, idx) => (val === 'incorrect' ? idx : null))
    .filter(idx => idx !== null);

  shuffledQuestions = incorrectIndices.map(idx => shuffledQuestions[idx]);
  answers = Array(shuffledQuestions.length).fill(null);
  lockedAnswers = Array(shuffledQuestions.length).fill(false);
  current = 0;

  const grid = document.getElementById('question-grid');
  grid.innerHTML = '';
  shuffledQuestions.forEach((_, index) => {
    const btn = document.createElement('button');
    btn.textContent = index + 1;
    btn.onclick = () => {
      current = index;
      showTrainingQuestion();
    };
    grid.appendChild(btn);
  });

  document.getElementById('summary').textContent = '';
  const retryBtn = document.getElementById('retry-errors');
  if (retryBtn) retryBtn.remove();

  showTrainingQuestion();
}

// --- Экзамен ---

function startExamMode() {
  examQuestions = window.questions.sort(() => Math.random() - 0.5).slice(0, 20);
  examAnswers = Array(20).fill(null);
  current = 0;
  timeRemaining = 720;
  document.getElementById('submit-exam').style.display = 'block';
  document.getElementById("exam-summary").innerHTML = '';
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
  document.getElementById('exam-question').innerHTML = `<strong>Вопрос ${current + 1} из 20:</strong><br>${q.question}`;
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

  if (examAnswers[current] !== null && current < examQuestions.length - 1) {
    const nextBtn = document.createElement('button');
    nextBtn.textContent = "Следующий вопрос";
    nextBtn.style.marginTop = '15px';
    nextBtn.onclick = () => {
      current++;
      renderExamQuestion();
    };
    options.appendChild(nextBtn);
  }
}

function submitExam() {
  clearInterval(examTimer);
  const correct = examAnswers.filter(a => a === 'correct').length;
  const incorrect = examAnswers.filter(a => a === 'incorrect').length;
  document.getElementById("exam-summary").innerHTML = `
    <p>✅ Правильных: ${correct}</p>
    <p>❌ Неправильных: ${incorrect}</p>
    <button onclick="restartExam()">Пройти ещё раз</button>
  `;
  document.getElementById('exam-options').innerHTML = '';
  document.getElementById('exam-question').textContent = 'Экзамен завершён.';
  document.getElementById('submit-exam').style.display = 'none';
}

function restartExam() {
  clearInterval(examTimer);
  examTimer = null;
  startExamMode();
}
