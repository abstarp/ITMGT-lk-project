document.addEventListener("DOMContentLoaded", function() {
    const calendarBody = document.getElementById("calendarBody");
    const monthYear = document.getElementById("monthYear");
    const prevMonthBtn = document.getElementById("prevMonthBtn");
    const nextMonthBtn = document.getElementById("nextMonthBtn");
    const timeSelection = document.getElementById("timeSelection");
    const paxSelection = document.getElementById("paxSelection");
    const savePreReservationBtn = document.getElementById("saveReservationBtn");
    let selectedDate = null;
    let selectedTime = null;

    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    const renderCalendar = (year, month) => {
        const date = new Date(year, month);
        monthYear.textContent = date.toLocaleString('default', { month: 'long', year: 'numeric' });

        calendarBody.innerHTML = '';
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDayOfMonth = new Date(year, month, 1).getDay();

        let row = document.createElement('tr');
        for (let i = 0; i < firstDayOfMonth; i++) {
            row.appendChild(document.createElement('td'));
        }

        const today = new Date();
        for (let day = 1; day <= daysInMonth; day++) {
            const cell = document.createElement('td');
            const cellDate = new Date(year, month, day);
            cell.textContent = day;
            cell.classList.add('calendar-day');
            cell.dataset.date = cellDate.toLocaleDateString('en-CA'); // Format date as YYYY-MM-DD

            if (cellDate < today || cellDate.getDay() === 0) { // Disable past dates and Sundays
                cell.classList.add('disabled-day');
            } else {
                cell.addEventListener('click', function() {
                    selectedDate = cell.dataset.date; // Update selectedDate to format as YYYY-MM-DD
                    console.log("Selected Date:", selectedDate);  // Debugging statement
                    document.querySelectorAll('.calendar-day').forEach(day => day.classList.remove('selected-day'));
                    cell.classList.add('selected-day');
                    timeSelection.classList.remove('hidden');
                    paxSelection.classList.add('hidden');
                });
            }

            row.appendChild(cell);
            if ((firstDayOfMonth + day) % 7 === 0) {
                calendarBody.appendChild(row);
                row = document.createElement('tr');
            }
        }
        calendarBody.appendChild(row);
    };

    const handleMonthChange = (direction) => {
        const [month, year] = monthYear.textContent.split(' ');
        const monthIndex = new Date(Date.parse(month + " 1, 2023")).getMonth(); // Extract month index from month name
        let newMonth = monthIndex + direction;
        let newYear = parseInt(year, 10);

        if (newMonth < 0) {
            newMonth = 11;
            newYear--;
        } else if (newMonth > 11) {
            newMonth = 0;
            newYear++;
        }

        renderCalendar(newYear, newMonth);
    };

    prevMonthBtn.addEventListener('click', () => handleMonthChange(-1));
    nextMonthBtn.addEventListener('click', () => handleMonthChange(1));

    document.querySelectorAll('.time-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            selectedTime = btn.getAttribute('data-time');
            console.log("Selected Time:", selectedTime);  // Debugging statement
            document.querySelectorAll('.time-btn').forEach(btn => btn.classList.remove('selected-time'));
            btn.classList.add('selected-time');
            paxSelection.classList.remove('hidden');
        });
    });

    savePreReservationBtn.addEventListener('click', function(event) {
        event.preventDefault(); // Prevent the default link behavior
        const pax = document.getElementById('paxInput').value;
        if (selectedDate && selectedTime && pax) {
            const payload = JSON.stringify({
                date: selectedDate, // Use selectedDate directly
                time: selectedTime,
                pax: pax,
            });
            console.log("Payload:", payload);  // Debugging statement
            console.log("Request URL:", savePreReservationUrl);

            fetch(savePreReservationUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken'),
                },
                body: payload,
            })
            .then(response => {
                console.log("Response Status:", response.status);  // Debugging statement
                if (!response.ok) {
                    throw new Error('Network response was not ok ' + response.statusText);
                }
                return response.json();
            })
            .then(data => {
                console.log("Response Data:", data);  // Debugging statement
                if (data.status === 'success') {
                    alert('Pre-reservation saved successfully.');

                    // Redirect to the available tables page with the pre_reservation_id
                    const redirectUrl = chooseTableUrl.replace('0', data.pre_reservation_id);
                    console.log("Redirecting to:", redirectUrl);  // Debugging statement
                    window.location.href = redirectUrl;
                } else {
                    alert('Failed to save pre-reservation: ' + data.error);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Failed to save pre-reservation. ' + error.message);
            });
        } else {
            alert('Please select date, time, and number of people.');
        }
    });

    renderCalendar(new Date().getFullYear(), new Date().getMonth());
});
