const termsContainer = document.getElementById("termsContainer");
const searchInput = document.getElementById("searchInput");

//  DATA (you can add more easily)
const terms = [
  { name: "Offside", definition: "A player is ahead of defenders when the ball is played." },
  { name: "Penalty", definition: "A direct free kick from the penalty spot." },
  { name: "Corner Kick", definition: "Awarded when ball crosses goal line last touched by defender." },
  { name: "Free Kick", definition: "Kick awarded after a foul." },
  { name: "Yellow Card", definition: "Warning given by referee." },
  { name: "Red Card", definition: "Player is sent off." },
  { name: "Assist", definition: "Pass leading directly to a goal." },
  { name: "Hat Trick", definition: "Scoring 3 goals in one game." }
];

// DISPLAY ALL TERMS
function displayTerms(list) {
  termsContainer.innerHTML = "";

  list.forEach(term => {
    const card = document.createElement("div");
    card.className = "term-card";

    card.innerHTML = `
      <h2>${term.name}</h2>
      <p>${term.definition}</p>
    `;

    termsContainer.appendChild(card);
  });
}

// SEARCH FUNCTION
searchInput.addEventListener("input", () => {
  const value = searchInput.value.toLowerCase();

  const filtered = terms.filter(term =>
    term.name.toLowerCase().includes(value) ||
    term.definition.toLowerCase().includes(value)
  );

  displayTerms(filtered);
});

// LOAD PAGE
displayTerms(terms);