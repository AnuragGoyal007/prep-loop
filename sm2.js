// ============================================================
// Spaced Repetition (SM-2 Algorithm) Helper Functions
// ============================================================

const SM2 = (function () {
  // Format date to YYYY-MM-DD
  function formatDate(date) {
    let year = date.getFullYear();
    let month = String(date.getMonth() + 1).padStart(2, "0");
    let day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  // Get today's date in YYYY-MM-DD format
  function today() {
    return formatDate(new Date());
  }

  // Add days to a given YYYY-MM-DD date string
  function addDays(dateString, days) {
    let date = new Date(dateString + "T00:00:00");
    date.setDate(date.getDate() + days);
    return formatDate(date);
  }

  // Recalculate ease factor, interval, and next review date for a question
  function recalculate(question, correct, timeTaken, attemptDate) {
    if (!attemptDate) {
      attemptDate = today();
    }

    let oldEase = Number(question.easeFactor) || 2.5;
    let oldInterval = Number(question.interval) || 0;

    // Adjust ease factor
    let newEase = oldEase + (correct ? 0.1 : -0.2);
    if (newEase < 1.3) {
      newEase = 1.3;
    }
    let easeFactor = Math.round(newEase * 100) / 100;

    // Calculate new interval in days
    let interval = 1;
    if (correct) {
      if (oldInterval === 0) {
        interval = 1;
      } else {
        interval = Math.round(oldInterval * easeFactor);
      }
    } else {
      interval = 1;
    }

    let nextReviewDate = addDays(attemptDate, interval);

    let history = Array.isArray(question.history) ? [...question.history] : [];
    history.push({
      date: attemptDate,
      correct: Boolean(correct),
      timeTaken: Number(timeTaken)
    });

    return {
      id: question.id,
      topic: question.topic,
      difficulty: question.difficulty,
      easeFactor: easeFactor,
      interval: interval,
      nextReviewDate: nextReviewDate,
      history: history
    };
  }

  // Create a new question object
  function newQuestion(params) {
    let date = params.date || today();
    let initialQuestion = {
      id: params.id,
      topic: params.topic,
      difficulty: params.difficulty,
      easeFactor: 2.5,
      interval: 0,
      nextReviewDate: date,
      history: []
    };

    return recalculate(initialQuestion, params.correct, params.timeTaken, date);
  }

  return {
    today: today,
    addDays: addDays,
    recalculate: recalculate,
    newQuestion: newQuestion
  };
})();
