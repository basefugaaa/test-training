if (!window.questions || !Array.isArray(window.questions)) {
  console.error('Ошибка: вопросы не загружены!');
  document.getElementById('question-text').textContent = 'Ошибка загрузки вопросов';
} else {
  console.log('Вопросы успешно загружены:', window.questions.length);
  
  document.addEventListener('DOMContentLoaded', function() {
    const shuffledQuestions = window.questions.sort(() => Math.random() - 0.5);
    let current = 0;
    let answers = Array(window.questions.length).fill(null);

    const grid = document.getElementById('question-grid');
    const nextBtn = document.getElementById('next-btn');

    shuffledQuestions.forEach((_, index) => {
      const btn = document.createElement('button');
      btn.textContent = index + 1;
      btn.onclick = () => {
        current = index;
        showQuestion();
      };
      grid.appendChild(btn);
    });

    function updateSummary() {
      const correct = answers.filter(a => a === 'correct').length;
      const incorrect = answers.filter(a => a === 'incorrect').length;
      document.getElementById('summary').textContent = 
        `Правильно: ${correct} | Неправильно: ${incorrect}`;
    }

    function showQuestion() {
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
          
          resultElement.textContent = isCorrect 
            ? "✅ Правильно!" 
            : "❌ Неправильно!";
          
          resultElement.className = "result " + 
            (isCorrect ? "correct-answer" : "incorrect-answer");
          
          answers[current] = isCorrect ? 'correct' : 'incorrect';
          
          const gridButton = grid.children[current];
          gridButton.className = isCorrect ? 'correct' : 'incorrect';
          
          updateSummary();
        };
        
        optionsContainer.appendChild(optionBtn);
      });
    }

    nextBtn.addEventListener('click', () => {
      current = (current + 1) % shuffledQuestions.length;
      showQuestion();
    });

    showQuestion();
  });
}