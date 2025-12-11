/* ============================
    CONFIGURACIÓN DE NIVELES
============================= */

const levels = [
  { name: "Principiante I",   range: "1-10", maxNum: 9,  sessionsRequired: 10, forceVisual: true },
  { name: "Principiante II",  range: "1-20", maxNum: 15, sessionsRequired: 10, forceVisual: true },
  { name: "Principiante III", range: "1-30", maxNum: 22, sessionsRequired: 10, forceVisual: true },

  { name: "Intermedio I",   range: "1-40", maxNum: 40, sessionsRequired: 20, forceVisual: false },
  { name: "Intermedio II",  range: "1-50", maxNum: 50, sessionsRequired: 20, forceVisual: false },
  { name: "Avanzado",       range: "1-60", maxNum: 60, sessionsRequired: 20, forceVisual: false },
  { name: "Experto",        range: "1-80", maxNum: 80, sessionsRequired: 20, forceVisual: false },
  { name: "Maestro",        range: "1-99", maxNum: 99, sessionsRequired: 20, forceVisual: false }
];

let progress = parseInt(localStorage.getItem("mamenoProgress")) || 0;
let currentLevelIndex = 0;

let correctAnswer = 0;
let sequenceNumbers = [];
let sequenceOperators = [];
let showingSequence = false;
let abortSequence = false;

/* ============================
    ELEMENTOS DEL DOM
============================= */

const levelCurrentEl = document.getElementById("level-current");
const levelRangeEl = document.getElementById("level-range");
const sessionsCompletedEl = document.getElementById("sessions-completed");
const progressBarFill = document.getElementById("progress-bar-fill");
const nextChallengeText = document.getElementById("next-challenge");

const startBtn = document.getElementById("start-btn");
const welcomeScreen = document.getElementById("welcome-screen");
const trainingScreen = document.getElementById("training-screen");

const sequenceDisplay = document.getElementById("sequence-display");
const expressionDisplay = document.getElementById("expression-display");

const answerInput = document.getElementById("answer-input");
const userAnswerInput = document.getElementById("user-answer");
const submitAnswerBtn = document.getElementById("submit-answer");
const resultText = document.getElementById("result-text");
const backBtn = document.getElementById("back-btn");

const visualAidContainer = document.getElementById("visual-aid-container");
const visualAidToggle = document.getElementById("visual-aid-toggle");

/* ============================
      ACTUALIZAR NIVEL
============================= */

function updateLevel() {
  let sum = 0;

  for (let i = 0; i < levels.length; i++) {
    sum += levels[i].sessionsRequired;

    if (progress < sum) {
      currentLevelIndex = i;
      break;
    }
  }

  let lvl = levels[currentLevelIndex];

  levelCurrentEl.textContent = lvl.name;
  levelRangeEl.textContent = lvl.range;
  sessionsCompletedEl.textContent = progress;

  let prevTotal = sum - lvl.sessionsRequired;
  let pct = ((progress - prevTotal) / lvl.sessionsRequired) * 100;
  progressBarFill.style.width = pct + "%";

  nextChallengeText.textContent =
    currentLevelIndex < levels.length - 1
      ? `Completa ${lvl.sessionsRequired - (progress - prevTotal)} sesiones para avanzar.`
      : "Has alcanzado el nivel máximo.";
}

updateLevel();

/* ============================
    GENERAR SECUENCIA
============================= */

function generateSequence(numOps, maxNum) {
  let nums = [Math.floor(Math.random() * maxNum) + 1];
  let ops = [];
  let res = nums[0];

  for (let i = 0; i < numOps; i++) {
    let op = Math.random() < 0.5 ? "+" : "-";
    let n = Math.floor(Math.random() * maxNum) + 1;

    if (op === "-" && res - n < 0 && Math.random() < 0.9) {
      op = "+";
    }

    ops.push(op);
    nums.push(n);
    res = op === "+" ? res + n : res - n;
  }

  return { nums, ops, res };
}

/* ============================
          SONIDOS
============================= */

function playBeep() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.value = 800;
  gain.gain.value = 0.12;
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.15);
}

function playSuccessSound() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(600, ctx.currentTime);
  osc.frequency.setValueAtTime(900, ctx.currentTime + 0.15);
  gain.gain.setValueAtTime(0.25, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.6);
}

function playErrorSound() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(180, ctx.currentTime);
  osc.frequency.setValueAtTime(120, ctx.currentTime + 0.2);
  gain.gain.setValueAtTime(0.25, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.4);
}

/* ============================
      DELAY PROMISE
============================= */

function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

/* ============================
      MOSTRAR SECUENCIA
============================= */

async function showSequence(nums, ops) {
  showingSequence = true;
  abortSequence = false;

  const useVisualAid =
    levels[currentLevelIndex].forceVisual || visualAidToggle.checked;

  sequenceDisplay.textContent = "";
  expressionDisplay.textContent = "";
  resultText.textContent = "";
  userAnswerInput.value = "";
  answerInput.style.display = "none";

  let accumulated = "";

  for (let i = 0; i < nums.length; i++) {
    if (abortSequence) break;

    // Mostrar número arriba
    sequenceDisplay.textContent = nums[i];
    playBeep();
    await delay(1200);
    sequenceDisplay.textContent = "";
    await delay(200);

    // Mostrar abajo si la ayuda está activa
    if (useVisualAid) {
      accumulated += nums[i] + " ";
      expressionDisplay.textContent = accumulated;
    }

    if (i < ops.length) {
      if (abortSequence) break;

      sequenceDisplay.textContent = ops[i];
      playBeep();
      await delay(900);
      sequenceDisplay.textContent = "";
      await delay(200);

      if (useVisualAid) {
        accumulated += ops[i] + " ";
        expressionDisplay.textContent = accumulated;
      }
    }
  }

  sequenceDisplay.textContent = "";
  expressionDisplay.textContent = "";
  answerInput.style.display = "block";
  userAnswerInput.focus();

  showingSequence = false;
}

/* ============================
      INICIAR DESAFÍO
============================= */

async function startChallenge() {
  welcomeScreen.style.display = "none";
  trainingScreen.style.display = "block";

  let lvl = levels[currentLevelIndex];

  visualAidContainer.style.display = lvl.forceVisual ? "none" : "flex";

  let seq = generateSequence(8, lvl.maxNum);
  sequenceNumbers = seq.nums;
  sequenceOperators = seq.ops;
  correctAnswer = seq.res;

  await showSequence(seq.nums, seq.ops);
}

/* ============================
      REVISAR RESPUESTA
============================= */

function checkAnswer() {
  if (userAnswerInput.value.trim() === "") return;

  let val = Number(userAnswerInput.value);

  if (val === correctAnswer) {
    resultText.style.color = "green";
    resultText.textContent = "¡Correcto!";
    playSuccessSound();

    progress++;
    localStorage.setItem("mamenoProgress", progress);
    updateLevel();

    expressionDisplay.textContent = "";
  } else {
    resultText.style.color = "red";
    playErrorSound();

    let exp = "";
    for (let i = 0; i < sequenceNumbers.length; i++) {
      exp += sequenceNumbers[i];
      if (i < sequenceOperators.length) exp += " " + sequenceOperators[i] + " ";
    }
    expressionDisplay.textContent = exp + " = " + correctAnswer;
    resultText.textContent = "Incorrecto.";
  }

  answerInput.style.display = "none";
}

/* ============================
       EVENTOS
============================= */

submitAnswerBtn.onclick = checkAnswer;

userAnswerInput.addEventListener("keydown", e => {
  if (e.key === "Enter") checkAnswer();
});

startBtn.onclick = startChallenge;

backBtn.onclick = () => {
  abortSequence = true;
  trainingScreen.style.display = "none";
  welcomeScreen.style.display = "block";
};
