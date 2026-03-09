import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Replace this with your own Firebase config
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const termForm = document.getElementById("termForm");
const termName = document.getElementById("termName");
const termDefinition = document.getElementById("termDefinition");
const searchInput = document.getElementById("searchInput");
const termsList = document.getElementById("termsList");

let allTerms = [];

// Render terms
function renderTerms(terms) {
  termsList.innerHTML = "";

  if (terms.length === 0) {
    termsList.innerHTML = `<div class="empty">No terms found.</div>`;
    return;
  }

  terms.forEach((item) => {
    const card = document.createElement("div");
    card.className = "term-card";
    card.innerHTML = `
      <h3>${item.name}</h3>
      <p>${item.definition}</p>
    `;
    termsList.appendChild(card);
  });
}

// Load terms in real time
const termsRef = collection(db, "terms");
const q = query(termsRef, orderBy("createdAt", "desc"));

onSnapshot(q, (snapshot) => {
  allTerms = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data()
  }));

  filterTerms();
});

// Add new term
termForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = termName.value.trim();
  const definition = termDefinition.value.trim();

  if (!name || !definition) return;

  try {
    await addDoc(collection(db, "terms"), {
      name,
      definition,
      createdAt: serverTimestamp()
    });

    termForm.reset();
  } catch (error) {
    alert("Error adding term: " + error.message);
  }
});

// Search filter
function filterTerms() {
  const keyword = searchInput.value.toLowerCase().trim();

  const filtered = allTerms.filter((item) =>
    item.name.toLowerCase().includes(keyword) ||
    item.definition.toLowerCase().includes(keyword)
  );

  renderTerms(filtered);
}

searchInput.addEventListener("input", filterTerms);