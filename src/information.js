// Import Bootstrap styles and JavaScript for UI components
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap";

// Import Firebase authentication functions
import { getAuth, onAuthStateChanged } from "firebase/auth";

// Import Firestore database instance
import { db } from "./firebaseConfig.js";

// Import Firestore methods used in this file
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

// Wait until the HTML page has fully loaded
document.addEventListener("DOMContentLoaded", () => {
  // Retrieve URL parameters from the page
  const params = new URLSearchParams(window.location.search);

  // Extract event ID and user UID from the URL
  const eventID = params.get("eventID");
  const userUID = params.get("userUID");

  // If both parameters exist, load event information
  if (eventID && userUID) {
    loadEventDetails(userUID, eventID);
  } else {
    console.error("Missing ID or user in URL");
  }
});

// Loads detailed information about a selected event
async function loadEventDetails(userUID, eventID) {
  try {
    // Reference the "information" subcollection for the selected event
    const docRef = collection(
      db,
      "users",
      userUID,
      "saved_events",
      eventID,
      "information",
    );
    // Retrieve all documents inside the subcollection
    const querySnapshot = await getDocs(docRef);

    // Get the container element where information will be displayed
    const container = document.getElementById("information");

    // Clear any existing content
    container.innerHTML = "";

    // Loop through each document containing team/event details
    querySnapshot.forEach((docSnap) => {
      // Extract document data
      const data = docSnap.data();

      // Create HTML layout for displaying the information
      const infoHtml = `
                <div class="team-title"><h2><u>${data.title}</u><h2><br></div>
                <img class="team-photo" src="../images/${data.image}">
                <div class="team-nickname"><p><b><i class="fa-solid fa-tag"></i>Nickname: </b>${data.nickname}</p></div>
                <div class="team-confederation"><p><b><i class="fa-solid fa-earth-americas"></i>Confederation: </b>${data.confederation}</p></div>
                <div class="team-appearance"><p><b><i class="fa-solid fa-futbol"></i>World Cup Appearances: </b>${data.appearance}</p></div>
                <div class="team-best"><p><b><i class="fa-solid fa-medal"></i>Best Result: </b>${data.best}</p></div>
                <div class="key-players"><p><b><i class="fa-solid fa-star"></i>Key Players: </b>${data.keyplayers}</p></div>
                <div class="team-content"><p>${data.content}</p></div>
                <hr>
            `;

      // Insert the generated HTML into the page
      container.insertAdjacentHTML("beforeend", infoHtml);
    });
  } catch (error) {
    // Handle errors during Firestore retrieval
    console.error("Error loading details: ", error);
  }
}
