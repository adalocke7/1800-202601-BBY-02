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

document.addEventListener('DOMContentLoaded', function() {
  const monthYearEl = document.getElementById('month-year');
  const daysEl = document.getElementById('days');
  const prevMonthBtn = document.getElementById('prev-month');
  const nextMonthBtn = document.getElementById('next-month');
  const todayBtn = document.getElementById('today-btn');
  const eventDateEl = document.getElementById('event-date');
  const eventListEl = document.getElementById('event-list');
  const collectionBtn = document.getElementById('btn-collection');
  
  let currentDate = new Date();
  let selectedDate = null;
  let events = {}; // This will be populated from Firebase

  // FETCH DATA FROM FIREBASE
  async function fetchEvents() {
    try {
      const querySnapshot = await getDocs(collection(db, "events"));
      events = {}; // Reset
      querySnapshot.forEach((doc) => {
        // We expect each document ID to be a date like "2026-6-13"
        // and the data to have a "matches" array.
        events[doc.id] = doc.data().matches;
      });
      renderCalendar();
    } catch (error) {
      console.error("Firebase fetch error:", error);
    }
  }

    function renderCalendar() {
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const prevLastDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
    const firstDayIndex = firstDay.getDay();
    const lastDayIndex = lastDay.getDay();
    const nextDays = 7 - lastDayIndex - 1;
    
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    monthYearEl.innerHTML = `${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    
    let days = "";

    // Prev month days
    for (let x = firstDayIndex; x > 0; x--) {
      days += `<div class="day other-month">${prevLastDay.getDate() - x + 1}</div>`;
    }

    // Current month days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const dateKey = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${i}`;
      const hasEvent = events[dateKey] !== undefined;
      let dayClass = 'day' + (hasEvent ? ' has-events' : '');

      const isToday = i === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear();
      if (isToday) dayClass += ' today';
      
      const isSelected = selectedDate && i === selectedDate.getDate() && currentDate.getMonth() === selectedDate.getMonth();
      if (isSelected) dayClass += ' selected';

      days += `<div class="${dayClass}" data-date="${dateKey}">${i}</div>`;
    }

    // Next month days
    for (let j = 1; j <= nextDays; j++) {
      days += `<div class="day other-month">${j}</div>`;
    }
    
    daysEl.innerHTML = days;

    // Click event for days
    document.querySelectorAll('.day:not(.other-month)').forEach(day => {
      day.addEventListener('click', () => {
        const dateStr = day.getAttribute('data-date');
        const [y, m, d] = dateStr.split('-').map(Number);
        selectedDate = new Date(y, m - 1, d);
        renderCalendar();
        showEvents(dateStr);
      });
    });
  }

async function showEvents(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dateObj = new Date(y, m - 1, d);
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  eventDateEl.textContent = `${months[dateObj.getMonth()]} ${d}, ${y}`;
  
  eventListEl.innerHTML = '';
  
  if (events[dateStr]) {
    // We use a regular for loop or forEach to handle the async status check
    events[dateStr].forEach(async (match) => {
      const item = document.createElement('div');
      item.className = 'event-item';

      // 1. Create a unique ID for this match to track it in Firebase
      const eventId = `${dateStr}-${match.text.replace(/\s+/g, '-')}`;
      const docRef = doc(db, "saved_events", eventId);

      item.innerHTML = `
        <div class="event-color"></div>
        <div class="event-time">${match.time}</div>
        <div class="event-details">
          <div class="event-text"><strong>${match.text}</strong></div>
          <div class="event-location" style="font-size: 0.8rem; color: #636e72;">
            <i class="fas fa-map-marker-alt"></i> ${match.location}
            <div><button class="save-button" id="btn-${eventId}" type="button"><b>Save</b></button></div>
         </div>
        </div>
      `;
      eventListEl.appendChild(item);

      // 2. Reference the button we just created
      const saveBtn = item.querySelector('.save-button');

      // 3. Check Firebase: Is this already saved?
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        saveBtn.innerHTML = "<b>Saved!</b>";
        saveBtn.style.background = "#28a745"; // Success Green
        saveBtn.style.color = "white";
      }

      // 4. Add the Toggle Click Event
      saveBtn.onclick = async () => {
        const currentSnap = await getDoc(docRef);
        
        if (currentSnap.exists()) {
          // If already saved, REMOVE it
          await deleteDoc(docRef);
          saveBtn.innerHTML = "<b>Save</b>";
          saveBtn.style.background = ""; // Back to default
          saveBtn.style.color = "";
          console.log("Unsaved!");
        } else {
          // If not saved, ADD it
          await setDoc(docRef, {
            date: dateStr,
            text: match.text,
            time: match.time,
            location: match.location,
            group: match.group
          });
          saveBtn.innerHTML = "<b>Saved!</b>";
          saveBtn.style.background = "#28a745";
          saveBtn.style.color = "white";
          console.log("Saved!");
        }
      };
    });
  } else {
    eventListEl.innerHTML = '<div class="no-events">No events scheduled.</div>';
  }
}

  async function toggleSaveEvent(dateStr, matchText, matchTime, button) {
  // Create a unique ID for this specific match (e.g., "2026-6-18-Canada-vs-Qatar")
  const eventId = `${dateStr}-${matchText.replace(/\s+/g, '-')}`;
  const docRef = db.collection("saved_events").doc(eventId);

  try {
    const doc = await docRef.get();

    if (doc.exists) {
      // 1. If it exists, REMOVE it
      await docRef.delete();
      button.innerHTML = "⭐ Save Event";
      button.style.background = "#007bff";
      console.log("Removed from favorites");
    } else {
      // 2. If it doesn't exist, SAVE it
      await docRef.set({
        date: dateStr,
        text: matchText,
        time: matchTime,
        savedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      button.innerHTML = "🌟 Saved!";
      button.style.background = "#28a745";
      console.log("Saved to favorites!");
    }
  } catch (error) {
    console.error("Error toggling save:", error);
  }
  }
  
  // Nav Handlers
  prevMonthBtn.onclick = () => { currentDate.setMonth(currentDate.getMonth() - 1); renderCalendar(); };
  nextMonthBtn.onclick = () => { currentDate.setMonth(currentDate.getMonth() + 1); renderCalendar(); };
  todayBtn.onclick = () => { currentDate = new Date(); selectedDate = new Date(); fetchEvents(); };

  if (collectionBtn) {
    collectionBtn.onclick = () => {
      window.location.href = "favorite.html";
    }
  }

  // Initial load
  fetchEvents();
});
