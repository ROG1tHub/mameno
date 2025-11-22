const levels = [
  { name: "Principiante I", range: "1-10", maxNum: 20, sessionsRequired: 10 },
  { name: "Principiante II", range: "1-20", maxNum: 20, sessionsRequired: 10 },
  { name: "Intermedio I",  range: "1-30", maxNum: 40, sessionsRequired: 20 },
  { name: "Intermedio II", range: "1-40", maxNum: 40, sessionsRequired: 20 },
  { name: "Avanzado",      range: "1-50", maxNum: 50, sessionsRequired: 20 },
  { name: "Experto",       range: "1-70", maxNum: 70, sessionsRequired: 20 },
  { name: "Maestro",       range: "1-99", maxNum: 99, sessionsRequired: 20 },
];

let progress = parseInt(localStorage.getItem("mamenoProgress")) || 0;
let currentLevelIndex = 0;
let correctAnswer = 0;
let sequenceNumbers = [];
let sequenceOperators = [];
let showingSequence = false;

const levelCurrentEl = document.getElementById("level-current");
const levelRangeEl = document.getElementById("level-range");
const sessionsCompletedEl = document.getElementById("sessions-completed");
const progressBarFill = document.getElementById("progress-bar-fill");
const nextChallengeText = document.getElementById("next-challenge-text");
const startBtn = document.getElementById("start-btn");
const langSelector = document.getElementById("lang-selector");
const welcomeScreen = document.getElementById("welcome-screen");
const trainingScreen = document.getElementById("training-screen");
const sequenceDisplay = document.getElementById("sequence-display");
const expressionDisplay = document.getElementById("expression-display");
const answerInput = document.getElementById("answer-input");
const userAnswerInput = document.getElementById("user-answer");
const submitAnswerBtn = document.getElementById("submit-answer");
const resultText = document.getElementById("result-text");
const backBtn = document.getElementById("back-btn");

function updateLevel() {
  let sumSessions = 0;
  for(let i=0; i < levels.length; i++) {
    sumSessions += levels[i].sessionsRequired;
    if(progress < sumSessions) {
      currentLevelIndex = i;
      return;
    }
  }
  currentLevelIndex = levels.length - 1;
}

function calculateLevelProgress() {
  let prevSum = 0;
  for(let i=0; i < currentLevelIndex; i++) prevSum += levels[i].sessionsRequired;
  let levelSessions = levels[currentLevelIndex].sessionsRequired;
  let progressLevel = progress - prevSum;
  return Math.min(100, (progressLevel / levelSessions)*100);
}

function updateProgressUI() {
  updateLevel();
  let level = levels[currentLevelIndex];
  levelCurrentEl.textContent = level.name;
  levelRangeEl.textContent = level.range;
  sessionsCompletedEl.textContent = progress;
  progressBarFill.style.width = calculateLevelProgress() + "%";

  if(currentLevelIndex < levels.length - 1) {
    let sumNeeded = 0;
    for(let i=0; i<=currentLevelIndex; i++) sumNeeded += levels[i].sessionsRequired;
    let toNext = sumNeeded - progress;
    nextChallengeText.textContent = `Alcanza ${toNext} sesión${toNext > 1 ? "es" : ""} para desbloquear el rango ${levels[currentLevelIndex + 1].range}.`;
  } else {
    nextChallengeText.textContent = "¡Has alcanzado el nivel máximo! Sigue practicando para mantener la maestría.";
  }
}

function saveProgress() {
  localStorage.setItem("mamenoProgress", progress);
}

function getRandomInt(min,max){
  return Math.floor(Math.random()*(max-min+1)) + min;
}

function generateSequence(numOps, maxNum) {
  let nums = [getRandomInt(1,maxNum)];
  let ops = [];
  let res = nums[0];

  for(let i=0; i < numOps; i++) {
    let op = Math.random() < 0.5 ? '+' : '-';
    let num = getRandomInt(1,maxNum);
    if(op === '-' && res - num < 0 && Math.random() < 0.8) {
      op = '+';
    }
    ops.push(op);
    nums.push(num);
    res = op === '+' ? res + num : res - num;
  }
  return {nums, ops, res};
}

function playBeep() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = 'sine';
  o.frequency.value = 800;
  g.gain.value = 0.1;
  o.connect(g);
  g.connect(ctx.destination);
  o.start(0);
  o.stop(ctx.currentTime + 0.15);
  o.onended = () => ctx.close();
}

async function showSequence(nums, ops){
  showingSequence = true;
  answerInput.style.display = "none";
  resultText.textContent = "";
  expressionDisplay.textContent = "";
  userAnswerInput.value = "";
  sequenceDisplay.textContent = "";

  for(let i=0; i < nums.length; i++) {
    sequenceDisplay.textContent = nums[i];
    playBeep();
    await delay(1000);
    if(i < ops.length){
      sequenceDisplay.textContent = ops[i];
      await delay(1000);
    }
  }
  sequenceDisplay.textContent = "";
  answerInput.style.display = "block";
  userAnswerInput.focus();
  showingSequence = false;
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function startChallenge() {
  if(showingSequence) return;
  startBtn.disabled = true;
  let numOps = Math.random() < 0.5 ? 8 : 10;
  let maxNum = levels[currentLevelIndex].maxNum;

  let seq = generateSequence(numOps, maxNum);
  sequenceNumbers = seq.nums;
  sequenceOperators = seq.ops;
  correctAnswer = seq.res;

  await showSequence(sequenceNumbers, sequenceOperators);

  startBtn.disabled = false;
}

function buildExpression(nums, ops) {
  let expr = "";
  for(let i=0; i < nums.length; i++){
    expr += nums[i];
    if(i < ops.length) expr += " " + ops[i] + " ";
  }
  return expr;
}

function checkAnswer() {
  let val = userAnswerInput.value.trim();
  if(val === "") {
    resultText.style.color = "red";
    resultText.textContent = "Por favor ingresa un número.";
    return;
  }
  let userVal = Number(val);
  if(userVal === correctAnswer){
    resultText.style.color = "green";
    resultText.textContent = "¡Correcto! Bien hecho.";
    progress++;
    saveProgress();
    updateProgressUI();
    expressionDisplay.textContent = "";
  } else {
    resultText.style.color = "red";
    expressionDisplay.textContent = buildExpression(sequenceNumbers, sequenceOperators) + " = " + correctAnswer;
    resultText.textContent = "Respuesta incorrecta.";
  }
  answerInput.style.display = "none";
}

function goBack() {
  trainingScreen.style.display = "none";
  welcomeScreen.style.display = "block";
  userAnswerInput.value = "";
  sequenceDisplay.textContent = "";
  expressionDisplay.textContent = "";
  resultText.textContent = "";
  answerInput.style.display = "none";
}

startBtn.onclick = () => {
  welcomeScreen.style.display = "none";
  trainingScreen.style.display = "block";
  startChallenge();
};

submitAnswerBtn.onclick = checkAnswer;

userAnswerInput.addEventListener("keydown", function(e){
  if(e.key === "Enter") {
    checkAnswer();
  }
});

backBtn.onclick = goBack;

langSelector.onclick = () => {
  if(langSelector.textContent.trim() === "🌐 EN") {
    langSelector.textContent = "🌐 ES";
    alert("Cambio de idioma no implementado. Por ahora solo Español.");
  } else {
    langSelector.textContent = "🌐 EN";
    alert("Idioma principal Español. Cambio no activo.");
  }
};

updateProgressUI();
