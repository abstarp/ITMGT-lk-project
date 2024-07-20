// static/core/calendar.js

document.addEventListener("DOMContentLoaded", function () {
    const monthNames = ["January", "February", "March", "April", "May", "June", 
                        "July", "August", "September", "October", "November", "December"];

    let currentDate = new Date();
    let currentMonth = currentDate.getMonth();
    let currentYear = currentDate.getFullYear();

    const monthNameElement = document.getElementById("month-name");
    const dayNumbersElement = document.getElementById("day-numbers");

    function updateCalendar() {
        monthNameElement.textContent = `${monthNames[currentMonth]} ${currentYear}`;
        dayNumbersElement.innerHTML = "";

        const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

        for (let i = 0; i < firstDayOfMonth; i++) {
            const emptySpan = document.createElement("span");
            dayNumbersElement.appendChild(emptySpan);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const daySpan = document.createElement("span");
            daySpan.textContent = day;
            daySpan.addEventListener("click", function () {
                document.querySelectorAll(".day-numbers span").forEach(span => span.classList.remove("active"));
                daySpan.classList.add("active");
                alert(`You selected ${monthNames[currentMonth]} ${day}, ${currentYear}`);
            });
            dayNumbersElement.appendChild(daySpan);
        }
    }

    document.getElementById("prev-month").addEventListener("click", function () {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        updateCalendar();
    });

    document.getElementById("next-month").addEventListener("click", function () {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        updateCalendar();
    });

    updateCalendar();
});
