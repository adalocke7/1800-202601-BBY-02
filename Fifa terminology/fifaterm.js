import { db } from "./firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

const termsContainer = document.getElementById("termsContainer");
const searchInput = document.getElementById("searchInput");

let allTerms = [];

// Load terminology
async function loadTerms() {

  const querySnapshot = await getDocs(collection(db, "Fifa Terminology"));

  querySnapshot.forEach((doc) => {

    allTerms.push({
      name: doc.id,
      definition: doc.data().definition
    });

  });

  displayTerms(allTerms);
}

// Display cards
function displayTerms(terms) {

  termsContainer.innerHTML = "";

  terms.forEach(term => {

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

  const filtered = allTerms.filter(term =>
    term.name.toLowerCase().includes(text) ||
    term.definition.toLowerCase().includes(text)
  );

  displayTerms(filtered);

});

loadTerms();