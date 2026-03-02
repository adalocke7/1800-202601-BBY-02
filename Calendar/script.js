// calendarBtn is for icon
// calendarContainer is used to display and hide the calendar
const btn = document.getElementById("calendarBtn");
const calendar = document.getElementById("calendarContainer");

// when the icon is clicked, the function works
btn.addEventListener("click", function () {
  // if it is hidden, display it
  if (calendar.style.display == "none") {
    calendar.style.display = "block";
  // if it is displayed, hide it
  } else {
    calendar.style.display = "none";
  }
});
