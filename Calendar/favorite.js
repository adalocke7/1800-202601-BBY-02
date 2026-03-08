// 1. AT THE VERY TOP: Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDTYgM4NO4rchkgRqqhoDSfsLPu681uTaw",
  authDomain: "fifa-web-app-1fb5d.firebaseapp.com",
  projectId: "fifa-web-app-1fb5d",
  storageBucket: "fifa-web-app-1fb5d.firebasestorage.app",
  messagingSenderId: "520690644603",
  appId: "1:520690644603:web:e6ee073e0ff3034610d4de",
  measurementId: "G-J2GL22VQB6"
};

// Initialize Firebase and define 'db' FIRST
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore(); 

document.addEventListener('DOMContentLoaded', async () => {
    const favoriteEvent = document.getElementById("favorite-events");

    try {
        const querySnapshot = await db.collection("saved_events").get();

        favoriteEvent.innerHTML = "";

        if (querySnapshot.empty) {
            favoriteEvent.innerHTML = '<div class="no-events">You haven\'t saved any events yet.</div>';
            return;
        }

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const eventID = doc.id;

            const item = document.createElement("div");
            item.className = "event-item";
            item.innerHTML = `
                <div class="event-color" style="background: #fd79a8;"></div>
                <div class="event-time">${data.time}</div>
                <div class="event-details">
                <div class="team-information">
                <div class="team">${data.text}</div>
                <div class="group">${data.group}</div>
                </div>
                <div class="event-location" style="font-size: 0.8rem; color: #636e72;">
                    ${data.date} | ${data.location || 'No location set'}
                </div>
                <button class="save-button" style="background: #ff7675; margin-top: 5px;">Remove</button>
                </div>`;
            
            const removeBtn = item.querySelector(".save-button");
            removeBtn.onclick = async () => {
                await db.collection("saved_events").doc(eventID).delete();
                item.remove();
                if (favoriteEvent.children.length === 0) {
                    favoriteEvent.innerHTML = '<div class="no-events">You haven\'t saved any events yet.</div>';
                }
            };
            favoriteEvent.append(item);
        });
    } catch (error) {
        console.error("Error loading favorites: ", error);
        favoriteEvent.innerHTML = '<div class="no-events">Error loading events. Please try again.</div>';
    }
    
});