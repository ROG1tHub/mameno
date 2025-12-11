/* ============================================================
   script.js — versión FULL, limpia, funcional y compatible
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
    nextChallengeText.textContent = `Nuevo desafío nivel ${level.name}`;
}

/* ==============================
   Delay útil
================================ */

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/* ==============================
   Utilidades
================================ */

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateSequence(numOps, maxNum, positiveBias = true) {
  let nums = [];
  let ops = [];

  for (let i = 0; i < 8; i++) {
    nums.push(getRandomInt(1, maxNum));
  }

  let result = nums[0];

  for (let i = 1; i < nums.length; i++) {
    let forcePositive = positiveBias && Math.random() < 0.9;
    let op;

    if (forcePositive && result - nums[i] < 0) {
      op = "+";
      result += nums[i];
    } else {
      op = Math.random() < 0.5 ? "+" : "-";
      result = op === "+" ? result + nums[i] : result - nums[i];
    }

    ops.push(op);
  }

  return { nums, ops, res: result };
}

/* ==============================
   START Challenge
================================ */

async function startChallenge() {
  if (showingSequence) return;
  startBtn.disabled = true;

  const level = levels[currentLevelIndex];
  const numOps = 8;
  const maxNum = level.limit ? level.limit : level.maxNum;

  const seq = generateSequence(numOps, maxNum, true);

  sequenceNumbers = seq.nums;
  sequenceOperators = seq.ops;
  correctAnswer = seq.res;

  await showSequence(sequenceNumbers, sequenceOperators);

  startBtn.disabled = false;
}

/* ==============================
   Mostrar secuencia
================================ */

async function showSequence(nums, ops){
  showingSequence = true;
  abortSequence = false;

  resultText.textContent = "";
  expressionDisplay.textContent = "";
  userAnswerInput.value = "";
  sequenceDisplay.textContent = "";
  document.getElementById("answer-input").style.display = "none";

  for (let i = 0; i < nums.length; i++) {
    if (abortSequence) break;

    sequenceDisplay.textContent = nums[i];
    await delay(1500);

    if (i < ops.length) {
      sequenceDisplay.textContent = ops[i];
      await delay(700);
    }
  }

  if (!abortSequence) {
    sequenceDisplay.textContent = "";
    document.getElementById("answer-input").style.display = "block";
    userAnswerInput.focus();
  }

  showingSequence = false;
}

/* ==============================
   Construir expresión final
================================ */

function buildExpression(nums, ops) {
  let expr = "";
  for (let i = 0; i < nums.length; i++) {
    expr += nums[i];
    if (i < ops.length) expr += " " + ops[i] + " ";
  }
  return expr;
}

/* ==============================
   Enviar respuesta
================================ */

submitAnswerBtn.addEventListener("click", () => {
  const value = parseInt(userAnswerInput.value);
  if (isNaN(value)) return;

  const expr = buildExpression(sequenceNumbers, sequenceOperators);
  expressionDisplay.textContent = expr + " = " + correctAnswer;

  if (value === correctAnswer) {
    resultText.textContent = "¡Correcto!";
    resultText.style.color = "lime";

    progress++;
    localStorage.setItem("mamenoProgress", progress);

    updateLevel();
    updateProgressUI();

  } else {
    resultText.textContent = "Incorrecto";
    resultText.style.color = "red";
  }
});

/* ==============================
   Botón VOLVER
================================ */

backBtn.addEventListener("click", () => {
  abortSequence = true;
  trainingScreen.style.display = "none";
  welcomeScreen.style.display = "flex";
});

/* ==============================
   Botón COMENZAR
================================ */

startBtn.addEventListener("click", () => {
  welcomeScreen.style.display = "none";
  trainingScreen.style.display = "block";
  startChallenge();
});
