/*
Calendar UI adapted from an open-source project by WingsBRStudio.
Source: https://github.com/WingsBRStudio/java...
*/

// Import functions from firebase and firebaseConfig.js
import { auth, db } from "../src/firebaseConfig.js";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

// Wait until the HTML page is fully loaded before running the script
document.addEventListener("DOMContentLoaded", function () {
  // Get references to HTML elements used in the calendar
  const monthYearEl = document.getElementById("month-year");
  const daysEl = document.getElementById("days");
  const prevMonthBtn = document.getElementById("prev-month");
  const nextMonthBtn = document.getElementById("next-month");
  const todayBtn = document.getElementById("today-btn");
  const eventDateEl = document.getElementById("event-date");
  const eventListEl = document.getElementById("event-list");
  const collectionBtn = document.getElementById("btn-collection");
  const backBtn = document.getElementById("back-button");

  // Variables used for user session and calendar state
  let currentUser = null;
  let currentDate = new Date();
  let selectedDate = null;
  let events = {}; // This will be populated from Firebase

  // Fetch events from firebase
  async function fetchEvents() {
    try {
      // Get all documents from the "events" collection
      const querySnapshot = await getDocs(collection(db, "events"));
      events = {}; // Reset events object

      // Loop through each document
      querySnapshot.forEach((doc) => {
        // Each document ID is expected to be a date (ex: "2026-6-13")
        // The document contains an array of matches
        events[doc.id] = doc.data().matches;
      });

      // Re-render the calendar after loading events
      renderCalendar();
    } catch (error) {
      console.error("Firebase fetch error:", error);
    }
  }
  // Render calendar
  function renderCalendar() {
    // Determine first and last day of the current month
    const firstDay = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1,
    );
    const lastDay = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0,
    );

    // Last day of previous month
    const prevLastDay = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      0,
    );

    // Day index positions
    const firstDayIndex = firstDay.getDay();
    const lastDayIndex = lastDay.getDay();

    // Calculate number of days to show from next month
    const nextDays = 7 - lastDayIndex - 1;

    // Month names
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    // Display month and year at the top of calendar
    monthYearEl.innerHTML = `${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`;

    let days = "";

    // Prev month days (for calendar layout)
    for (let x = firstDayIndex; x > 0; x--) {
      days += `<div class="day other-month">${prevLastDay.getDate() - x + 1}</div>`;
    }

    // Current month days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      // Create date key used in Firebase
      const dateKey = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${i}`;

      // Check if events exist on this date
      const hasEvent = events[dateKey] !== undefined;

      // Assign CSS class
      let dayClass = "day" + (hasEvent ? " has-events" : "");

      // Check if today
      const isToday =
        i === new Date().getDate() &&
        currentDate.getMonth() === new Date().getMonth() &&
        currentDate.getFullYear() === new Date().getFullYear();
      if (isToday) dayClass += " today";

      // Check if selected
      const isSelected =
        selectedDate &&
        i === selectedDate.getDate() &&
        currentDate.getMonth() === selectedDate.getMonth();
      if (isSelected) dayClass += " selected";

      // Add day element
      days += `<div class="${dayClass}" data-date="${dateKey}">${i}</div>`;
    }

    // Next month days
    for (let j = 1; j <= nextDays; j++) {
      days += `<div class="day other-month">${j}</div>`;
    }

    // Insert generated calendar days into HTML
    daysEl.innerHTML = days;

    // Add click event to each day
    document.querySelectorAll(".day:not(.other-month)").forEach((day) => {
      day.addEventListener("click", () => {
        // Get date stored in HTML
        const dateStr = day.getAttribute("data-date");

        // Convert string to Date object
        const [y, m, d] = dateStr.split("-").map(Number);
        selectedDate = new Date(y, m - 1, d);

        // Re-render calendar and show events
        renderCalendar();
        showEvents(dateStr);
      });
    });
  }

  // Check user login state
  onAuthStateChanged(auth, (user) => {
    if (user) {
      currentUser = user; // Save logged-in user
      fetchEvents(); // Load events from Firebase
    } else {
      console.log("No user logged in.");
    }
  });

  async function showEvents(dateStr) {
    // Convert string date to Date object
    const [y, m, d] = dateStr.split("-").map(Number);
    const dateObj = new Date(y, m - 1, d);
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    // Display date title
    eventDateEl.textContent = `${months[dateObj.getMonth()]} ${d}, ${y}`;

    // Ensure user is logged in
    if (!currentUser) return alert("Please log in to save events!");

    // Clear previous event list
    eventListEl.innerHTML = "";

    if (events[dateStr]) {
      // Loop through matches
      events[dateStr].forEach(async (match) => {
        const item = document.createElement("div");
        item.className = "event-item";

        // Unique ID for each match event
        const eventId = dateStr;

        // Firebase path for saved events
        const docRef = doc(
          db,
          "users",
          currentUser.uid,
          "saved_events",
          eventId,
        );

        // Create event HTML
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

        // Add event to list
        eventListEl.appendChild(item);

        const saveBtn = item.querySelector(".save-button");

        // Check if event already saved
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          saveBtn.innerHTML = "<b>Saved!</b>";
          saveBtn.style.background = "#28a745"; // Success Green
          saveBtn.style.color = "white";
        }

        // Save / unsave event
        saveBtn.onclick = async () => {
          const currentSnap = await getDoc(docRef);

          if (currentSnap.exists()) {
            // Remove saved event
            await deleteDoc(docRef);
            saveBtn.innerHTML = "<b>Save</b>";
            saveBtn.style.background = ""; // Back to default
            saveBtn.style.color = "";
            console.log("Unsaved!");
          } else {
            // Save event
            await setDoc(docRef, {
              image: match.image,
              date: dateStr,
              text: match.text,
              time: match.time,
              location: match.location,
              group: match.group,
              isPinned: match.isPinned,
              createdAt: serverTimestamp(),
            });

            try {
              const source = collection(db, "events", dateStr, "information");
              const info = await getDocs(source);

              const destination = collection(
                db,
                "users",
                currentUser.uid,
                "saved_events",
                eventId,
                "information",
              );

              info.forEach(async (infoDoc) => {
                const data = infoDoc.data();
                const infoID = infoDoc.id;

                const newDocRef = doc(destination, infoID);

                await setDoc(newDocRef, {
                  nickname: data.nickname,
                  appearance: data.appearance,
                  confederation: data.confederation,
                  best: data.best,
                  content: data.content,
                  title: data.title,
                });
              });
            } catch (error) {
              console.error("Error copying document: ", error);
            }
            saveBtn.innerHTML = "<b>Saved!</b>";
            saveBtn.style.background = "#28a745";
            saveBtn.style.color = "white";
            console.log("Saved!");
          }
        };
      });
    } else {
      // Show message if no events exist
      eventListEl.innerHTML =
        '<div class="no-events">No events scheduled.</div>';
    }
  }

  // Navigation buttons
  prevMonthBtn.onclick = () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
  };
  nextMonthBtn.onclick = () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
  };
  todayBtn.onclick = () => {
    currentDate = new Date();
    selectedDate = new Date();
    fetchEvents();
  };

  // Open saved events page
  if (collectionBtn) {
    collectionBtn.onclick = () => {
      window.location.href = "/favorite.html";
    };
  }

  if (backBtn) {
    backBtn.onclick = () => {
      window.history.back();
    };
  }

  // Initial load
  fetchEvents();
});
