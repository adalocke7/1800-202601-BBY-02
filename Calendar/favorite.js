import { db } from '../src/firebaseConfig.js';
import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  serverTimestamp 
} from "firebase/firestore";

document.addEventListener('DOMContentLoaded', async () => {
    const favoriteEvent = document.getElementById("favorite-events");

    try {
        const querySnapshot = await getDocs(collection(db, "saved_events"));

        favoriteEvent.innerHTML = "";

        if (querySnapshot.empty) {
            favoriteEvent.innerHTML = '<div class="no-events">You haven\'t saved any events yet.</div>';
            return;
        }

        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const eventID = docSnap.id;

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
                const docRef = doc(db, "saved_events", eventID);
                await deleteDoc(docRef);
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