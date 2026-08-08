/* Pure spaced-repetition functions: no storage or DOM dependencies. */
const SM2 = (() => {
  function formatDate(date) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`; }
  function today() { return formatDate(new Date()); }
  function addDays(dateString, days) { const date = new Date(`${dateString}T00:00:00`); date.setDate(date.getDate() + days); return formatDate(date); }
  function recalculate(question, correct, timeTaken, attemptDate = today()) {
    const oldEase = Number(question.easeFactor) || 2.5;
    const oldInterval = Number(question.interval) || 0;
    const easeFactor = Math.round(Math.max(1.3, oldEase + (correct ? 0.1 : -0.2)) * 100) / 100;
    const interval = correct ? (oldInterval === 0 ? 1 : Math.round(oldInterval * easeFactor)) : 1;
    return { ...question, easeFactor, interval, nextReviewDate: addDays(attemptDate, interval), history: [...(Array.isArray(question.history) ? question.history : []), { date: attemptDate, correct: Boolean(correct), timeTaken: Number(timeTaken) }] };
  }
  function newQuestion({ id, topic, difficulty, correct, timeTaken, date = today() }) { return recalculate({ id, topic, difficulty, easeFactor: 2.5, interval: 0, nextReviewDate: date, history: [] }, correct, timeTaken, date); }
  return { today, addDays, recalculate, newQuestion };
})();
