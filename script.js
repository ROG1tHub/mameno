const levels = [
  { name: "Principiante I", range: "1-10", maxNum: 9, sessionsRequired: 10, forceVisual: true },
  { name: "Principiante II", range: "1-20", maxNum: 15, sessionsRequired: 10, forceVisual: true },
  { name: "Principiante III", range: "1-30", maxNum: 22, sessionsRequired: 10, forceVisual: true },

  { name: "Intermedio I",  range: "1-40", maxNum: 40, sessionsRequired: 20, forceVisual: false },
  { name: "Intermedio II", range: "1-50", maxNum: 40, sessionsRequired: 20, forceVisual: false },
  { name: "Avanzado",      range: "1-60", maxNum: 50, sessionsRequired: 20, forceVisual: false },
  { name: "Experto",       range: "1-80", maxNum: 70, sessionsRequired: 20, forceVisual: false },
  { name: "Maestro",       range: "1-99", maxNum: 99, sessionsRequired: 20, forceVisual: false }
];

let progress = parseInt(localStorage.getItem("mamenoProgress")) || 0;
let currentLevelIndex = 0;
let correctAnswer = 0;
let sequenceNumbers = [];
let sequenceOperators = [];
let showingSequence = false;
let abortSequence = false;

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

  if (currentLevelIndex < levels.length - 1) {
    nextChallengeText.textContent =
      `Completa ${lvl.sessionsRequired - (progress - prevTotal)} sesiones para avanzar.`;
  } else {
    nextChallengeText.textContent = "Máximo nivel alcanzado.";
  }
}

updateLevel();


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


function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function showSequence(nums, ops) {
  showingSequence = true;
  abortSequence = false;
  expressionDisplay.textContent = "";
  resultText.textContent = "";
  userAnswerInput.value = "";
  answerInput.style.display = "none";

  let visual = "";
  const force = levels[currentLevelIndex].forceVisual;
  const useVisualAid = force || visualAidToggle.checked;

  sequenceDisplay.textContent = "";

  for (let i = 0; i < nums.length; i++) {
    if (abortSequence) break;

    if (useVisualAid) {
      visual += nums[i] + " ";
      sequenceDisplay.textContent = visual;
    } else {
      sequenceDisplay.textContent = nums[i];
    }

    await delay(1300);

    if (i < ops.length) {
      if (abortSequence) break;

      if (useVisualAid) {
        visual += ops[i] + " ";
        sequenceDisplay.textContent = visual;
      } else {
        sequenceDisplay.textContent = ops[i];
      }

      await delay(800);
    }
  }

  sequenceDisplay.textContent = "";
  answerInput.style.display = "block";
  userAnswerInput.focus();

  showingSequence = false;
}


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


function buildExpression(nums, ops) {
  let exp = "";
  for (let i = 0; i < nums.length; i++) {
    exp += nums[i];
    if (i < ops.length) exp += ` ${ops[i]} `;
  }
  return exp;
}


function checkAnswer() {
  if (userAnswerInput.value.trim() === "") return;

  let val = Number(userAnswerInput.value);
  if (val === correctAnswer) {
    resultText.style.color = "green";
    resultText.textContent = "¡Correcto!";
    progress++;
    localStorage.setItem("mamenoProgress", progress);
    updateLevel();
    expressionDisplay.textContent = "";
  } else {
    resultText.style.color = "red";
    expressionDisplay.textContent =
      buildExpression(sequenceNumbers, sequenceOperators) + " = " + correctAnswer;
    resultText.textContent = "Incorrecto.";
  }

  answerInput.style.display = "none";
}

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
