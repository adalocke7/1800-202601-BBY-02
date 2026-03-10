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