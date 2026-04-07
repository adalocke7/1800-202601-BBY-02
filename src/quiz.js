import { getAuth } from "firebase/auth";
import { db } from "../src/firebaseConfig.js";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getDocs, query, orderBy, deleteDoc } from "firebase/firestore";
// ===========================
// 30-question pool (random 10 per attempt)
// ===========================
const QUESTION_POOL = [
  { text: "Which country has won the most FIFA World Cups?", options: ["Brazil", "Germany", "Argentina", "France"], correctIndex: 0 },
  { text: "How long is a standard match (without extra time)?", options: ["80", "90", "100", "120"], correctIndex: 1 },
  { text: "What does VAR stand for?", options: ["Video Assistant Referee", "Visual Action Replay", "Verified Attack Review", "Virtual Assistant Rulebook"], correctIndex: 0 },
  { text: "How many players on the field per team?", options: ["9", "10", "11", "12"], correctIndex: 2 },
  { text: "A hat-trick means a player scores…", options: ["2", "3", "4", "5"], correctIndex: 1 },
  { text: "Which card sends a player off immediately?", options: ["Green", "Yellow", "Red", "Blue"], correctIndex: 2 },
  { text: "The FIFA World Cup is held every…", options: ["2 years", "3 years", "4 years", "5 years"], correctIndex: 2 },
  { text: "Offside is judged when…", options: ["Attacker is behind goalkeeper", "Ball is in the air", "Attacker is nearer goal line than 2nd-last defender when ball is played", "Attacker is in the box"], correctIndex: 2 },
  { text: "A penalty kick is taken from…", options: ["9 yards", "10 yards", "11 meters", "15 meters"], correctIndex: 2 },
  { text: "How many minutes in one half?", options: ["40", "45", "50", "60"], correctIndex: 1 },

  { text: "Which part of the body is not allowed to touch the ball (outfield player)?", options: ["Head", "Chest", "Hand/arm", "Thigh"], correctIndex: 2 },
  { text: "A match begins with a…", options: ["Throw-in", "Corner", "Kick-off", "Goal kick"], correctIndex: 2 },
  { text: "A corner kick is awarded when the ball crosses the goal line last touched by…", options: ["Attacker", "Defender", "Referee", "Goalkeeper only"], correctIndex: 1 },
  { text: "A throw-in is awarded when the ball crosses the…", options: ["Goal line", "Touchline", "Penalty spot", "Center circle"], correctIndex: 1 },
  { text: "How many substitutions are commonly allowed in many competitions today?", options: ["1", "3", "5", "10"], correctIndex: 2 },

  { text: "The player who can use hands inside the penalty area is the…", options: ["Captain", "Striker", "Goalkeeper", "Sweeper"], correctIndex: 2 },
  { text: "A direct free kick can result in…", options: ["A goal directly", "Only a pass", "Only a cross", "A corner only"], correctIndex: 0 },
  { text: "A yellow card usually means…", options: ["Warning/caution", "Sent off", "Goal counts double", "Free substitution"], correctIndex: 0 },
  { text: "Two yellow cards in one match lead to…", options: ["No effect", "One more warning", "Red card (send off)", "Penalty"], correctIndex: 2 },
  { text: "Extra time is usually…", options: ["2x10 minutes", "2x15 minutes", "1x30 minutes", "2x20 minutes"], correctIndex: 1 },

  { text: "A goal counts when the ball fully crosses the…", options: ["Penalty box line", "Goal line between posts and under crossbar", "Six-yard box line", "Center line"], correctIndex: 1 },
  { text: "The referee can add time at the end of each half called…", options: ["Timeout", "Stoppage time", "Replay time", "VAR time only"], correctIndex: 1 },
  { text: "A goalkeeper cannot pick up the ball from a teammate’s…", options: ["Header", "Chest pass", "Deliberate back-pass with foot", "Deflection"], correctIndex: 2 },
  { text: "A match is typically played on…", options: ["Round pitch", "Rectangular pitch", "Triangle pitch", "Any shape"], correctIndex: 1 },
  { text: "A ‘clean sheet’ means…", options: ["No fouls", "No goals conceded", "No corners", "No offsides"], correctIndex: 1 },

  { text: "The center circle radius is…", options: ["9.15 m (10 yards)", "11 m", "18 m", "5 m"], correctIndex: 0 },
  { text: "FIFA stands for…", options: ["Federation of International Football Associations", "International Football Federation Association", "Fédération Internationale de Football Association", "Football International Federation Alliance"], correctIndex: 2 },
  { text: "The Ballon d'Or is generally awarded to…", options: ["Best goalkeeper", "Best player", "Best coach", "Top referee"], correctIndex: 1 },
  { text: "The Champions League is a top club competition in…", options: ["Asia", "Europe", "Africa", "Oceania"], correctIndex: 1 },
  { text: "A ‘derby’ is typically a match between…", options: ["National teams", "Local rivals", "New teams only", "Teams in different sports"], correctIndex: 1 },
];

// ===========================
const QUESTIONS_PER_ATTEMPT = 10;

// ===========================
// ===========================
// Quiz state variables
// ===========================
let questions = [];
let currentIndex = 0;
let userAnswers = [];

// ===========================
const progressText = document.getElementById("progressText");
const scoreMini = document.getElementById("scoreMini");
const barFill = document.getElementById("barFill");

const quizArea = document.getElementById("quizArea");
const questionText = document.getElementById("questionText");
const optionsArea = document.getElementById("optionsArea");
const feedback = document.getElementById("feedback");

const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const newAttemptBtn = document.getElementById("newAttemptBtn");

const resultsArea = document.getElementById("resultsArea");
const resultTitle = document.getElementById("resultTitle");
const resultSummary = document.getElementById("resultSummary");
const reviewArea = document.getElementById("reviewArea");
const restartBtn = document.getElementById("restartBtn");

const goalSound = document.getElementById("goalSound");
const failSound = document.getElementById("failSound");

// ===========================
// Quiz state variables
// ===========================
function playSound(audioEl) {
  if (!audioEl) return;
  try {
    audioEl.currentTime = 0;
    audioEl.play().catch(() => {});
  } catch {}
}

// ===========================
// Shuffles questions
function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

// ===========================
// Plays sound safely
// ===========================

function startNewAttempt() {
  questions = shuffle([...QUESTION_POOL]).slice(0, QUESTIONS_PER_ATTEMPT);
  currentIndex = 0;
  userAnswers = Array(questions.length).fill(null);

  resultsArea.classList.add("hidden");
  quizArea.classList.remove("hidden");

  barFill.style.width = "0%";
  renderQuestion();
}

// ===========================
// Calculates score
// ===========================
function getScore() {
  let score = 0;
  for (let i = 0; i < questions.length; i++) {
    if (userAnswers[i] === questions[i].correctIndex) score++;
  }
  return score;
}

// ===========================
// Updates progress bar + text
// ===========================
function updateProgress() {
  progressText.textContent = `Question ${currentIndex + 1} of ${questions.length}`;
  scoreMini.textContent = `Score: ${getScore()}`;
  const pct = Math.round(((currentIndex + 1) / questions.length) * 100);
  barFill.style.width = `${pct}%`;
}

/// ===========================
// Updates progress bar + text
// ===========================
function setFeedback(message, type) {
  feedback.textContent = message;
  feedback.className = `feedback ${type}`;
}

// ===========================
// Shows feedback message
// ===========================
function updateButtons() {
  prevBtn.disabled = currentIndex === 0;
  nextBtn.textContent = currentIndex === questions.length - 1 ? "Finish" : "Next";
  nextBtn.disabled = userAnswers[currentIndex] === null;
}

// ===========================
// Enables/disables buttons
// ===========================
function renderQuestion() {
  const q = questions[currentIndex];
  questionText.textContent = q.text;
  optionsArea.innerHTML = "";
  setFeedback("", "neutral");

  q.options.forEach((optText, idx) => {
    const label = document.createElement("label");
    label.className = "opt";

    const input = document.createElement("input");
    input.type = "radio";
    input.name = "quizOption";

    if (userAnswers[currentIndex] === idx) input.checked = true;

    input.addEventListener("change", () => {
      userAnswers[currentIndex] = idx;

      const allOptions = document.querySelectorAll(".opt");

      allOptions.forEach((opt, i) => {
        const inp = opt.querySelector("input");
        inp.disabled = true;

        if (i === q.correctIndex) opt.classList.add("correct");
        if (i === idx && idx !== q.correctIndex) opt.classList.add("wrong");
      });

      if (idx === q.correctIndex) {
        setFeedback(" ✅ Correct!", "good");
        playSound(goalSound);
      } else {
        setFeedback(`❌ Wrong! Correct: ${q.options[q.correctIndex]}`, "bad");
        playSound(failSound);
      }

      updateButtons();
      scoreMini.textContent = `Score: ${getScore()}`;

      
    });

    const span = document.createElement("span");
    span.textContent = optText;

    label.appendChild(input);
    label.appendChild(span);
    optionsArea.appendChild(label);
  });

  updateProgress();
  updateButtons();
}

// Show results
async function showResults() {
  quizArea.classList.add("hidden");
  resultsArea.classList.remove("hidden");

  const score = getScore();
  const total = questions.length;
  const percent = Math.round((score / total) * 100);

  resultTitle.textContent = "🏁 Quiz Finished!";
  resultSummary.textContent = `You scored ${score}/${total} (${percent}%)`;

  reviewArea.innerHTML = "";

  // ✅ SAVE SCORE UNDER USER
  try {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      await addDoc(collection(db, "users", user.uid, "quizScores"), {
        score: score,
        total: total,
        percentage: percent,
        date: serverTimestamp()
      });
      const scoresRef = collection(db, "users", user.uid, "quizScores");

// get all scores ordered by newest
const q = query(scoresRef, orderBy("date", "desc"));
const snapshot = await getDocs(q);

// delete extra (keep only 3)
if (snapshot.docs.length > 3) {
  const extraDocs = snapshot.docs.slice(3);

  for (const docSnap of extraDocs) {
    await deleteDoc(docSnap.ref);
  }
}
      console.log("Score saved!");
    } else {
      console.log("No user logged in, score not saved.");
    }

  } catch (error) {
    console.error("Error saving score:", error);
  }

  // ===========================
  // REVIEW CARDS
  // ===========================
  questions.forEach((q, i) => {
    const card = document.createElement("div");
    card.className = "review-card";

    const correct = q.correctIndex;
    const userAns = userAnswers[i];
    const ok = userAns === correct;

    card.innerHTML = `
      <h3>${i + 1}) ${q.text}</h3>
      <span class="badge ${ok ? "good" : "bad"}">${ok ? "Correct" : "Wrong"}</span>
      <p><strong>Your answer:</strong> ${userAns !== null ? q.options[userAns] : "None"}</p>
      <p><strong>Correct answer:</strong> ${q.options[correct]}</p>
    `;

    reviewArea.appendChild(card);
  });
}
//Return to the previous page
prevBtn.onclick = () => {
  if (currentIndex > 0) {
    currentIndex--;
    renderQuestion();
  }
};
//Goes to the next Page
nextBtn.onclick = () => {
  if (currentIndex === questions.length - 1) {
    showResults();
  } else {
    currentIndex++;
    renderQuestion();
  }
  window.scrollTo({ top: 0, behavior: "smooth" });
};

restartBtn.onclick = startNewAttempt;
newAttemptBtn.onclick = startNewAttempt;


startNewAttempt();