// Import functions from firebase and firebaseConfig.js
import { db, auth } from "../src/firebaseConfig.js";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";

// Wait until the HTML page is fully loaded
document.addEventListener("DOMContentLoaded", async () => {
  // Get the container where favorite events will be displayed
  const favoriteEvent = document.getElementById("favorite-events");
  const backBtn = document.getElementById("back-button");

  // Check whether a user is logged in
  onAuthStateChanged(auth, async (user) => {
    // If no user is logged in, show message
    if (!user) {
      favoriteEvent.innerHTML =
        "<p>Please log in to view the saved events.</p>";
      return;
    }

    try {
      // FETCH SAVED EVENTS FROM FIRESTORE
      // Path: users/{uid}/saved_events
      const querySnapshot = await getDocs(
        collection(db, "users", user.uid, "saved_events"),
      );

      favoriteEvent.innerHTML = "";

      // If no saved events exist
      if (querySnapshot.empty) {
        favoriteEvent.innerHTML =
          '<div class="no-events">You haven\'t saved any events yet.</div>';
        return;
      }

      // LOOP THROUGH EACH SAVED EVENT DOCUMENT
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const eventID = docSnap.id;

        // Create event container
        const item = document.createElement("div");
        item.className = "event-item";
        // Insert event HTML structure
        item.innerHTML = `
                <div class="event-color" style="background: #fd79a8;"></div>
                <div class="event-time"><b>${data.time}</b></div>
                <div class="event-details">
                <div class="team-information">
                <div class="team">${data.text}</div>
                <div class="group">${data.group}</div>
                </div>
                <div class="event-location" style="font-size: 0.8rem; color: #636e72;">
                    ${data.date} | ${data.location || "No location set"}
                </div>
                <button class="save-button" style="background: #ff7675; margin-top: 5px;">Remove</button>
                </div>`;

        // REMOVE BUTTON FUNCTIONALITY
        const removeBtn = item.querySelector(".save-button");
        removeBtn.onclick = async () => {
          const docRef = doc(db, "users", user.uid, "saved_events", eventID);
          await deleteDoc(docRef);
          item.remove();
          // If no events remain, show message
          if (favoriteEvent.children.length === 0) {
            favoriteEvent.innerHTML =
              '<div class="no-events">You haven\'t saved any events yet.</div>';
          }
        };
        // Add event element to page
        favoriteEvent.append(item);
      });
    } catch (error) {
      // Handle errors (for example Firestore permission or network errors)
      console.error("Error loading favorites: ", error);
      favoriteEvent.innerHTML =
        '<div class="no-events">Error loading events. Please try again.</div>';
    }
  });
  if (backBtn) {
    backBtn.onclick = () => {
      window.history.back();
    };
  }
});
