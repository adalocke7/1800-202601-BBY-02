import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "./firebaseConfig.js";
import { doc, orderBy, updateDoc, query, onSnapshot, collection, deleteDoc, getDocs, addDoc, serverTimestamp } from "firebase/firestore";

document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const eventID = params.get("eventID");
    const userUID = params.get("userUID");

    if (eventID && userUID) {
        loadEventDetails(userUID, eventID);
    } else {
        console.error("Missing ID or user in URL");
    }


});

async function loadEventDetails(userUID, eventID) {
    try {
        const docRef = collection(db, "users", userUID, "saved_events", eventID, "information");
        const querySnapshot = await getDocs(docRef);

        const container = document.getElementById("information");
        container.innerHTML = "";

        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            
            const infoHtml = `
                <div class="team-title"><h2><u>${data.title}</u><h2><br></div>
                <div class="team-nickname"<p><b>Nickname: </b>${data.nickname}</p></div>
                <div class="team-confederation"><p><b>Confederation: </b>${data.confederation}</p></div>
                <div class="team-appearance"><p><b>World Cup Appearances: </b>${data.appearance}</p></div>
                <div class="team-best"><p><b>Best Result: </b>${data.best}</p></div>
                <div class="team-content"><p>${data.content}</p></div>
                <hr>
            `;

            container.insertAdjacentHTML("beforeend", infoHtml);
        })
    } catch (error) {
        console.error("Error loading details: ", error);
    }
}