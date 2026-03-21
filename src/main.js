import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "./firebaseConfig.js";
import { doc, onSnapshot } from "firebase/firestore";
import { collection, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
 
//--------------------------------------------------------------
// If you have custom global styles, import them as well:
//--------------------------------------------------------------
import './styles/style.css';



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
                window.alert("You are not logged in. Please log in to access the site.");
            }
            return;
        }

        // Update any name elements that exist on the current page
        const name = user.displayName || user.email;
        
        const nameElement = document.getElementById("name-goes-here");
        if (nameElement) nameElement.textContent = `${name}!`;

        const welcomeMessage = document.getElementById("welcomeMessage");
        if (welcomeMessage) welcomeMessage.textContent = `Hello, ${name}!`;
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
            showFeedbackMessage("Error: You must be logged in to submit feedback.", "danger");
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
                status: "new"
            });

            // Success message
            showFeedbackMessage("Thank you! Your feedback has been submitted successfully.", "success");
            feedbackForm.reset();

        } catch (error) {
            console.error("Error submitting feedback:", error);
            showFeedbackMessage("Error submitting feedback. Please try again.", "danger");
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

initFeedbackForm();