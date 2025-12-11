/* ============================================================
   script.js — versión FULL, limpia, funcional
============================================================ */

const levels = [
  { name: "Principiante I",  range: "1-10", maxNum: 9,   limit: 9,   sessionsRequired: 10 },
  { name: "Principiante II", range: "1-20", maxNum: 15,  limit: 15,  sessionsRequired: 10 },
  { name: "Principiante III",range: "1-30", maxNum: 22,  limit: 22,  sessionsRequired: 10 },

  { name: "Intermedio I",  range: "1-40", maxNum: 40, sessionsRequired: 20 },
  { name: "Intermedio II", range: "1-50", maxNum: 40, sessionsRequired: 20 },
  { name: "Avanzado",      range: "1-60", maxNum: 50, sessionsRequired: 20 },
  { name: "Experto",       range: "1-80", maxNum: 70, sessionsRequired: 20 },
  { name: "Maestro",       range: "1-99", maxNum: 99, sessionsRequired: 20 },
];

let progress = parseInt(localStorage.getItem("mamenoProgress")) || 0;
let currentLevelIndex = 0;
let correctAnswer = 0;
let sequenceNumbers = [];
let sequenceOperators = [];
let showingSequence = false;
let abortSequence = false;


/* ==============================
   DOM ELEMENTS
================================ */

const levelCurrentEl       = document.getElementById("level-current");
const levelRangeEl         = document.getElementById("level-range");
const sessionsCompletedEl  = document.getElementById("sessions-completed");
const progressBarFill      = document.getElementById("progress-bar-fill");
const nextChallengeText    = document.getElementById("next-challenge-text");

const startBtn             = document.getElementById("start-btn");
const backBtn              = document.getElementById("back-btn");
const submitAnswerBtn      = document.getElementById("submit-answer");

const welcomeScreen        = document.getElementById("welcome-screen");
const trainingScreen       = document.getElementById("training-screen");

const sequenceDisplay      = document.getElementById("sequence-display");
const expressionDisplay    = document.getElementById("expression-display");

const answerInput          = document.getElementById("answer-input");
const userAnswerInput      = document.getElementById("user-answer");

const resultText           = document.getElementById("result-text");


/* ==============================
   Inicialización
================================ */

updateLevel();
updateProgressUI();


/* ==============================
   Función para actualizar nivel
================================ */

function updateLevel() {
    let sumSessions = 0;

    for (let i = 0; i < levels.length; i++) {
        sumSessions += levels[i].sessionsRequired;

        if (progress < sumSessions) {
            currentLevelIndex = i;
            break;
        }
    }

    const level = levels[currentLevelIndex];

    levelCurrentEl.textContent  = level.name;
    levelRangeEl.textContent    = level.range;

    const previousTotal = sumSessions - level.sessionsRequired;
    const currentProgress = progress - previousTotal;
    const percent = (currentProgress / level.sessionsRequired) * 100;

    progressBarFill.style.width = percent + "%";
}


/* ==============================
   Actualiza UI de progreso
================================ */

function updateProgressUI() {
    const level = levels[currentLevelIndex];
    sessionsCompletedEl.textContent = progress;
    nextChallengeText.textContent = `
