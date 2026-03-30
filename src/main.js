import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "./firebaseConfig.js";
import { doc, onSnapshot, collection, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
 
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

        displayCardsDynamically(user.uid);
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

function readQuote(day) {
    const quoteDocRef = doc(db, "quotes", day);

    onSnapshot(quoteDocRef, docSnap => {
        if (docSnap.exists()) {
            document.getElementById("quotes").innerHTML = docSnap.data().quote;
        } else {
            console.log("No such document");
        }
    }, (error) => {
        console.error("Error listening to document: ", error);
    });
}

async function displayCardsDynamically(userUID) {
    const container = document.getElementById("matches-go-here");
    const template = document.getElementById("matchesCardTemplate");
    
    // 1. Safety check: does the container exist on this page?
    if (!container || !template) return;

    try {
        const querySnapshot = await getDocs(collection(db, "users", userUID, "saved_events"));
        
        // 2. Clear container so we don't double-up cards
        container.innerHTML = "";

        // 3. If no documents exist, just exit (shows nothing)
        if (querySnapshot.empty) return;

        document.getElementById("card-title").innerHTML = "<b><u>Your Saved Matches</u></b>";

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            
            // 4. Clone the template content
            const clone = template.content.cloneNode(true);

            // 5. Use querySelector on the CLONE, not the document
            // This prevents "null" errors because it looks inside the new card
            if (data.text) clone.querySelector(".title").textContent = data.text;
            if (data.group) clone.querySelector(".group").innerHTML = `<b>Group: </b>${data.group}`;
            if (data.date)  clone.querySelector(".date").textContent = data.date;
            if (data.time)  clone.querySelector(".time").textContent = data.time;
            if (data.location) clone.querySelector(".location").textContent = data.location;
            
            // Handle image if it exists
            const img = clone.querySelector(".card-img-top");
            if (data.image) {
                img.src = `./images/${data.image}.png`;
            } else {
                img.style.display = 'none'; // Hide image if source is missing
            }

            const card = clone.querySelector(".card");
            card.style.cursor = "pointer";
            card.onclick = () => {
            // Redirect to information.html with the ID in the URL
            window.location.href = "information.html";
};

            // 6. Append the finished card to the page
            container.appendChild(clone);
        });

    } catch (error) {
        console.error("Error getting documents: ", error);
    }
}

const date = new Date();
const day = date.getDate().toString();
readQuote(day);
initFeedbackForm();