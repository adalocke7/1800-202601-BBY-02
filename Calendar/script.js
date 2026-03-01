const btn = document.getElementById("calendarBtn");
const calendar = document.getElementById("calendarContainer");

btn.addEventListener("click", function () {
  if (calendar.style.display === "none") {
    calendar.style.display = "block";
  } else {
    calendar.style.display = "none";
  }
});
