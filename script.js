/* script.js — completo y con logs para debugging */

console.log("script.js cargado");

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

/* sanity check: ver si los elementos clave existen */
console.log("startBtn:", startBtn);
console.log("sequenceDisplay:", sequenceDisplay);
console.log("userAnswerInput:", userAnswerInput);

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
  if (levelCurrentEl) levelCurrentEl.textContent = level.name;
  if (levelRangeEl) levelRangeEl.textContent = level.range;
  const previousTotal = sumSessions - level.sessionsRequired;
  const currentProgress = progress - previousTotal;
  const percent = (currentProgress / level.sessionsRequired) * 100;
  if (progressBarFill) progressBarFill.style.width = percent + "%";
}

function updateProgressUI() {
  const level = levels[currentLevelIndex];
  if (sessionsCompletedEl) sessionsCompletedEl.textContent = progress;
  if (nextChallengeText) nextChallengeText.textContent = `Nuevo desafío nivel ${level.name}`;
}

function delay(ms) { return new Promise(res => setTimeout(res, ms)); }
function getRandomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function generateSequence(numOps, maxNum, positiveBias = true) {
  let nums = [];
  let ops = [];
  for (let i = 0; i < 8; i++) nums.push(getRandomInt(1, maxNum));
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

async function showSequence(nums, ops) {
  showingSequence = true;
  abortSequence = false;
  if (resultText) resultText.textContent = "";
  if (expressionDisplay) expressionDisplay.textContent = "";
  if (userAnswerInput) userAnswerInput.value = "";
  if (sequenceDisplay) sequenceDisplay.textContent = "";
  const answerInputDiv = document.getElementById("answer-input");
  if (answerInputDiv) answerInputDiv.style.display = "none";

  for (let i = 0; i < nums.length; i++) {
    if (abortSequence) break;
    if (sequenceDisplay) sequenceDisplay.textContent = nums[i];
    await delay(1500);
    if (i < ops.length) {
      if (sequenceDisplay) sequenceDisplay.textContent = ops[i];
      await delay(700);
    }
  }

  if (!abortSequence) {
    if (sequenceDisplay) sequenceDisplay.textContent = "";
    if (answerInputDiv) answerInputDiv.style.display = "block";
    if (userAnswerInput) userAnswerInput.focus();
  }
  showingSequence = false;
}

function buildExpression(nums, ops) {
  let expr = "";
  for (let i = 0; i < nums.length; i++) {
    expr += nums[i];
    if (i < ops.length) expr += " " + ops[i] + " ";
  }
  return expr;
}

async function startChallenge() {
  if (showingSequence) return;
  if (startBtn) startBtn.disabled = true;

  updateLevel();
  updateProgressUI();

  const level = levels[currentLevelIndex];
  const maxNum = level.limit ? level.limit : level.maxNum;
  const seq = generateSequence(8, maxNum, true);
  sequenceNumbers = seq.nums;
  sequenceOperators = seq.ops;
  correctAnswer = seq.res;

  await showSequence(sequenceNumbers, sequenceOperators);

  if (startBtn) startBtn.disabled = false;
}

/* listeners con protección (evitan errores si elemento es nulo) */
if (submitAnswerBtn) {
  submitAnswerBtn.addEventListener("click", () => {
    const value = parseInt(userAnswerInput.value);
    if (isNaN(value)) return;
    const expr = buildExpression(sequenceNumbers, sequenceOperators);
    if (expressionDisplay) expressionDisplay.textContent = expr + " = " + correctAnswer;
    if (value === correctAnswer) {
      if (resultText) { resultText.textContent = "¡Correcto!"; resultText.style.color = "green"; }
      progress++;
      localStorage.setItem("mamenoProgress", progress);
      updateLevel();
      updateProgressUI();
    } else {
      if (resultText) { resultText.textContent = "Incorrecto"; resultText.style.color = "red"; }
    }
  });
} else {
  console.warn("submitAnswerBtn no encontrado");
}

if (backBtn) {
  backBtn.addEventListener("click", () => {
    abortSequence = true;
    if (trainingScreen) trainingScreen.style.display = "none";
    if (welcomeScreen) welcomeScreen.style.display = "flex";
  });
} else {
  console.warn("backBtn no encontrado");
}

/* start button */
if (startBtn) {
  startBtn.addEventListener("click", () => {
    if (welcomeScreen) welcomeScreen.style.display = "none";
    if (trainingScreen) trainingScreen.style.display = "block";
    startChallenge();
  });
} else {
  console.error("startBtn no encontrado — revisá el HTML");
}

updateLevel();
updateProgressUI();
