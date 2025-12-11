<script>
const levels = [...JSON.parse(`[{"name":"Principiante I","range":"1-10","maxNum":20,"sessionsRequired":10},{"name":"Principiante II","range":"1-20","maxNum":20,"sessionsRequired":10},{"name":"Intermedio I","range":"1-30","maxNum":40,"sessionsRequired":20},{"name":"Intermedio II","range":"1-40","maxNum":40,"sessionsRequired":20},{"name":"Avanzado","range":"1-50","maxNum":50,"sessionsRequired":20},{"name":"Experto","range":"1-70","maxNum":70,"sessionsRequired":20},{"name":"Maestro","range":"1-99","maxNum":99,"sessionsRequired":20}]`)]
;


let progress = parseInt(localStorage.getItem("mamenoProgress")) || 0;
let currentLevelIndex = 0;
let correctAnswer = 0;
let sequenceNumbers = [];
let sequenceOperators = [];
let showingSequence = false;
let abortSequence = false;
let userName = localStorage.getItem("mamenoUserName") || null;


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
const welcomeTitle = document.querySelector("h1");


function updateLevel() {
let sumSessions = 0;
for(let i=0; i < levels.length; i++) {
sumSessions += levels[i].sessionsRequired;
if(progress < sumSessions) {
};

updateProgressUI();

