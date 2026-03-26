// fifaterm.js

import { db } from "../src/firebaseConfig.js";
import { collection, getDocs } from "firebase/firestore";

const termsContainer = document.getElementById("termsContainer");
const searchInput = document.getElementById("searchInput");

let allTerms = [];

document.addEventListener("DOMContentLoaded", () => {
  const backBtn = document.getElementById("backBtn");

  backBtn.addEventListener("mouseenter", () => {
    backBtn.src = "../images/back.gif";
  });

  backBtn.addEventListener("mouseleave", () => {
    backBtn.src = "../images/back-static.png";
  });
});

// Load terminology from Firestore
async function loadTerms() {
  try {
    allTerms = []; // reset to avoid duplicates

    const querySnapshot = await getDocs(collection(db, "Fifa Terminology"));

    querySnapshot.forEach((doc) => {
      allTerms.push({
        name: doc.id,
        definition: doc.data().definition
      });
    });

    displayTerms(allTerms);

  } catch (error) {
    console.error("Error loading terms:", error);
    termsContainer.innerHTML = "<p>Error loading data</p>";
  }
}

// Display cards
function displayTerms(terms) {
  termsContainer.innerHTML = "";

  // If no results
  if (terms.length === 0) {
    termsContainer.innerHTML = "<p>No results found</p>";
    return;
  }

  terms.forEach((term) => {
    const card = document.createElement("div");
    card.className = "term-card";

    card.innerHTML = `
      <h2>${term.name}</h2>
      <p>${term.definition}</p>
    `;

    termsContainer.appendChild(card);
  });
}

// Search filter
searchInput.addEventListener("input", () => {
  const text = searchInput.value.toLowerCase();

  const filtered = allTerms.filter((term) =>
    term.name.toLowerCase().includes(text) ||
    term.definition.toLowerCase().includes(text)
  );

  displayTerms(filtered);
});

// Ensure DOM is loaded before running
document.addEventListener("DOMContentLoaded", loadTerms);