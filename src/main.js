import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "./firebaseConfig.js";
import {
  doc,
  orderBy,
  updateDoc,
  query,
  onSnapshot,
  collection,
  deleteDoc,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

//--------------------------------------------------------------
// If you have custom global styles, import them as well:
//--------------------------------------------------------------
import "./styles/style.css";

//--------------------------------------------------------------
// Custom global JS code (shared with all pages)can go here.
//--------------------------------------------------------------

// auth.js - one single source of truth
function initAuth() {
  const auth = getAuth();

  const unsubscribe = onAuthStateChanged(auth, (user) => {
    unsubscribe(); // only run once

    if (!user) {
      if (window.location.pathname.endsWith("main.html")) {
        window.location.href = "index.html";
        window.alert(
          "You are not logged in. Please log in to access the site.",
        );
      }
      return;
    }

    // Update any name elements that exist on the current page
    const name = user.displayName || user.email;

    const nameElement = document.getElementById("name-goes-here");
    if (nameElement) nameElement.textContent = `${name}!`;

    const welcomeMessage = document.getElementById("welcomeMessage");
    if (welcomeMessage) welcomeMessage.textContent = `Hello, ${name}!`;

    displayCardsDynamically(user.uid);
    displayQuizScores(user.uid);
  });
}

initAuth();

//--------------------------------------------------------------
// Feedback Form Handler
//--------------------------------------------------------------
function initFeedbackForm() {
  const feedbackForm = document.getElementById("feedbackForm");
  if (!feedbackForm) return; // Form not on this page

  const auth = getAuth();

  feedbackForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Get current user
    const user = auth.currentUser;
    if (!user) {
      showFeedbackMessage(
        "Error: You must be logged in to submit feedback.",
        "danger",
      );
      return;
    }

    // Get form values
    const email = document.getElementById("feedbackEmail").value.trim();
    const subject = document.getElementById("feedbackSubject").value.trim();
    const rating = document.getElementById("feedbackRating").value;
    const feedbackText = document.getElementById("feedbackText").value.trim();

    // Validate
    if (!email || !subject || !rating || !feedbackText) {
      showFeedbackMessage("Please fill in all required fields.", "warning");
      return;
    }

    // Disable submit button during submission
    const submitBtn = feedbackForm.querySelector("button[type='submit']");
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting...";

    try {
      // Add feedback to Firestore
      const feedbackRef = collection(db, "feedback");
      await addDoc(feedbackRef, {
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName || "Anonymous",
        customerEmail: email,
        subject: subject,
        rating: parseInt(rating),
        feedback: feedbackText,
        timestamp: serverTimestamp(),
        status: "new",
      });

      // Success message
      showFeedbackMessage(
        "Thank you! Your feedback has been submitted successfully.",
        "success",
      );
      feedbackForm.reset();
    } catch (error) {
      console.error("Error submitting feedback:", error);
      showFeedbackMessage(
        "Error submitting feedback. Please try again.",
        "danger",
      );
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });
}

function showFeedbackMessage(message, type) {
  const messageDiv = document.getElementById("feedbackMessage");
  if (!messageDiv) return;

  messageDiv.className = `alert alert-${type} alert-dismissible fade show`;
  messageDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;

  // Auto-dismiss after 5 seconds
  setTimeout(() => {
    messageDiv.classList.remove("show");
  }, 5000);
}

// Reads and displays the daily quote from Firestore
function readQuote(day) {
  // Reference to the quote document for the specific day
  const quoteDocRef = doc(db, "quotes", day);

  // Listen for real-time updates to the quote document
  onSnapshot(
    quoteDocRef,
    (docSnap) => {
      // Check if the document exists
      if (docSnap.exists()) {
        // Get the HTML element where the quote will be displayed
        const quotes = document.getElementById("quotes");
        try {
          // Insert the quote text into the HTML element
          quotes.innerHTML = docSnap.data().quote;
        } catch (error) {
          console.log();
        }
      } else {
        console.log("No such document");
      }
    },
    // Error handler for snapshot listener
    (error) => {
      console.error("Error listening to document: ", error);
    },
  );
}

// Dynamically loads and displays saved event cards for a user
async function displayCardsDynamically(userUID) {
  // Container where cards will be inserted
  const container = document.getElementById("matches-go-here");
  // HTML template used to generate each card
  const template = document.getElementById("matchesCardTemplate");

  // Safety check: stop execution if elements don't exist
  if (!container || !template) return;

  try {
    const matches = document.getElementById("matches-go-here");
    // Query Firestore for saved events
    // Events are ordered by pinned status first, then by creation time
    const q = query(
      collection(db, "users", userUID, "saved_events"),
      orderBy("isPinned", "desc"),
      orderBy("createdAt", "desc"),
    );
    const querySnapshot = await getDocs(q);

    // Clear container before inserting new cards
    container.innerHTML = "";

    // If user has no saved events, show a message
    if (querySnapshot.empty) {
      matches.innerHTML = `
                <div class="col-12 text-center py-5 px-3">
                <p class="mb-4" style="font-size: 1.1rem; color: #4b5563;">
                    You haven't saved any matches yet!
                </p>
                <a href="calendar.html" class="btn btn-primary btn-lg px-4 shadow-sm">
                    Find Upcoming Events
                </a>
                </div>
            `;
      return;
    }

    // Loop through each saved event document
    querySnapshot.forEach((docSnap) => {
      // Event data
      const data = docSnap.data();
      // Document ID
      const eventID = docSnap.id;

      const isPinned = data.isPinned || false;
      const createdAt = data.createdAt;

      // Clone the card template
      const clone = template.content.cloneNode(true);

      // Populate card fields with event data
      if (data.text) clone.querySelector(".title").innerHTML = data.text;
      if (data.group)
        clone.querySelector(".group").innerHTML = `<b>Group: </b>${data.group}`;
      if (data.date)
        clone.querySelector(".date").innerHTML = `<b>Date: </b>${data.date}`;
      if (data.time)
        clone.querySelector(".time").innerHTML = `<b>Time: </b>${data.time}`;
      if (data.location)
        clone.querySelector(".location").innerHTML =
          `<b>Location: </b>${data.location}`;

      // Handle card image
      const img = clone.querySelector(".card-img-top");
      if (data.image) {
        img.src = `./src/images/${data.image}.png`;
      } else {
        img.style.display = "none"; // Hide image if none exists
      }

      // Select important card elements
      const card = clone.querySelector(".card");
      const removeBtn = clone.querySelector(".remove-btn");
      const pinBtn = clone.querySelector("#pin-btn");

      // Make the card clickable → open event information page
      card.style.cursor = "pointer";
      card.onclick = () => {
        // Redirect to information.html with the ID in the URL
        window.location.href = `information.html?eventID=${eventID}&userUID=${userUID}`;
      };
      // Remove button functionality
      removeBtn.onclick = async (e) => {
        // Prevent click from triggering card navigation
        e.preventDefault();
        e.stopPropagation();

        try {
          // Reference to the main saved event document
          const docRef1 = doc(db, "users", userUID, "saved_events", eventID);
          // Reference to the information subcollection
          const docRef2 = collection(
            db,
            "users",
            userUID,
            "saved_events",
            eventID,
            "information",
          );
          // Delete all documents inside the information subcollection
          const docSnapshot = await getDocs(docRef2);
          for (const subDoc of docSnapshot.docs) {
            await deleteDoc(subDoc.ref);
          }
          // Delete the main event document
          await deleteDoc(docRef1);

          // Remove the card from the UI
          const cardElement = e.target.closest(".col-6");
          if (cardElement) {
            cardElement.remove();
            // Show empty message if no cards remain
            if (matches.children.length === 0) {
              matches.innerHTML = `
                                <div class="col-12 text-center py-5 px-3">
                                <p class="mb-4" style="font-size: 1.1rem; color: #4b5563;">
                                You haven't saved any matches yet!
                                </p>
                                <a href="calendar.html" class="btn btn-primary btn-lg px-4 shadow-sm">
                                Find Upcoming Events
                                </a>
                                </div>
                        `;
            }
          }
        } catch (error) {
          console.error("Error deleting document: ", error);
        }
      };

      // Apply visual state for pinned events
      if (isPinned) {
        pinBtn.classList.add("active");
      } else {
        pinBtn.classList.remove("active");
      }

      // Toggle pin status when button is clicked
      pinBtn.onclick = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        try {
          const docRef = doc(db, "users", userUID, "saved_events", eventID);

          // Update pinned status and timestamp
          await updateDoc(docRef, {
            isPinned: !isPinned,
            createdAt: serverTimestamp(),
          });

          // Reload cards to reflect new order
          displayCardsDynamically(userUID);
        } catch (error) {
          console.error("Error toggling pin: ", error);
        }
      };

      // Add the generated card to the container
      container.appendChild(clone);
    });
  } catch (error) {
    console.error("Error getting documents: ", error);
  }
}
const feedbackBtn = document.getElementById("openFeedbackBtn");
const feedbackBox = document.querySelector(".feedback-container");

if (feedbackBtn && feedbackBox) {
  feedbackBtn.addEventListener("click", () => {
    feedbackBox.classList.toggle("hidden");
  });
}
document.getElementById("closeFeedback")?.addEventListener("click", () => {
  feedbackBox.classList.add("hidden");
});

const date = new Date();
const day = date.getDate().toString();
readQuote(day);
initFeedbackForm();
async function displayQuizScores(userUID) {
  const container = document.getElementById("quiz-scores-go-here");

  // safety check
  if (!container) return;

  try {
    const q = query(
      collection(db, "users", userUID, "quizScores"),
      orderBy("date", "desc"),
    );

    const snapshot = await getDocs(q);

    container.innerHTML = "";

    if (snapshot.empty) {
      container.innerHTML = `
                <p style="text-align:center; color:#94a3b8;">
                    No quiz attempts yet ⚽
                </p>
            `;
      return;
    }

    const docs = snapshot.docs.slice(0, 3); // only latest 3

    const wrapper = document.createElement("div");
    wrapper.className = "quiz-history-box";

    docs.forEach((docSnap, index) => {
      const data = docSnap.data();

      const card = document.createElement("div");
      card.className = "quiz-card fade-up";

      // ⏱ animation delay (stagger effect)
      card.style.animationDelay = `${index * 0.2}s`;

      card.innerHTML = `
    <div class="quiz-header">
      <span>⚽ Quiz Match</span>
      <span class="percentage">${data.percentage}%</span>
    </div>

    <div class="quiz-score">
      <span class="team">YOU</span>
      <span class="score">${data.score} - ${data.total}</span>
      <span class="team">QUIZ</span>
    </div>

    <div class="quiz-result ${data.percentage >= 70 ? "win" : "lose"}">
      ${data.percentage >= 70 ? "🏆 WIN" : "❌ LOSS"}
    </div>
  `;

      wrapper.appendChild(card);

      // trigger animation AFTER render
      setTimeout(
        () => {
          card.classList.add("show");
        },
        50 + index * 150,
      );
    });

    container.innerHTML = "";
    container.appendChild(wrapper);
  } catch (error) {
    console.error("Error loading quiz scores:", error);
  }
}
