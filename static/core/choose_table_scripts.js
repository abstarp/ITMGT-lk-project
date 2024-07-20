document.addEventListener("DOMContentLoaded", function() {
    console.log('JavaScript file loaded');

    // Function to get the current user ID
    function getCurrentUserId() {
        return fetch('/api/get_user_id/')
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    console.log('User ID:', data.user_id);
                    return data.user_id;
                } else {
                    throw new Error('User ID not found. Please log in.');
                }
            })
            .catch(error => {
                console.error('Error fetching user ID:', error);
                alert('Failed to fetch user ID.');
                return null;
            });
    }

    // Function to fetch pre-reservation data
    function fetchPreReservationData(date) {
        console.log(`Fetching pre-reservation data for date: ${date}`);
        return fetch(`/api/pre_reservations/${date}/`)
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    console.log('Pre-Reservation Data:', data.pre_reservations);
                    return data.pre_reservations;
                } else {
                    throw new Error('Failed to fetch pre-reservation data.');
                }
            })
            .catch(error => {
                console.error('Error fetching pre-reservation data:', error);
                alert('Failed to fetch pre-reservation data.');
                window.location.href = "/reservation/";
                return [];
            });
    }

    // Function to fetch table data
    function fetchTableData() {
        return fetch('/api/tables/')
            .then(response => response.json())
            .then(data => {
                if (Array.isArray(data)) {
                    return data;
                } else {
                    throw new Error('Failed to fetch tables data.');
                }
            })
            .catch(error => {
                console.error('Error fetching tables data:', error);
                alert('Failed to fetch tables data.');
                return [];
            });
    }

    // Function to handle reservation cancellation
    function cancelPreReservation(preReservationId) {
        return fetch(`/api/cancel_pre_reservation/${preReservationId}/`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken'),
            },
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                alert('Pre-reservation canceled successfully!');
                window.location.href = "/reservation/";
            } else {
                throw new Error('Cancellation failed: ' + data.error);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Cancellation failed. ' + error.message);
        });
    }

    // Function to get a CSRF token from cookies
    function getCookie(name) {
        const cookieValue = document.cookie.split('; ').find(row => row.startsWith(name + '='));
        return cookieValue ? cookieValue.split('=')[1] : null;
    }

    // Initialize the process
    getCurrentUserId().then(userId => {
        if (userId === null) return;

        const selectedDate = getFormattedDate(); // Example date
        fetchPreReservationData(selectedDate).then(preReservations => {
            if (preReservations.length === 0) {
                alert('Pre-reservation data is missing. Please go back and select date, time, and pax.');
                window.location.href = "/reservation/";
                return;
            }

            const preReservationData = preReservations[0]; // Assuming you want the first pre-reservation

            fetchTableData().then(tables => {
                const filteredTables = tables.filter(table => table.seats >= preReservationData.pax);

                const floorPlan = document.getElementById('floorPlan');
                floorPlan.innerHTML = ''; // Clear existing content

                filteredTables.forEach(table => {
                    const tableElement = document.createElement('div');
                    tableElement.classList.add('table');
                    tableElement.textContent = `${table.name} (${table.seats} pax) - PHP ${table.price}`;
                    tableElement.dataset.price = table.price;
                    tableElement.dataset.id = table.id;
                    floorPlan.appendChild(tableElement);
                });

                let selectedTables = [];
                const maxSelection = 2;

                floorPlan.addEventListener('click', function(e) {
                    const target = e.target;
                    if (target.classList.contains('table')) {
                        if (selectedTables.includes(target.dataset.id)) {
                            selectedTables = selectedTables.filter(id => id !== target.dataset.id);
                            target.classList.remove('selected');
                        } else if (selectedTables.length < maxSelection) {
                            selectedTables.push(target.dataset.id);
                            target.classList.add('selected');
                        } else {
                            alert('You can select up to 2 tables.');
                        }
                        updateTotalAmount();
                    }
                });

                function updateTotalAmount() {
                    const total = selectedTables.reduce((sum, id) => {
                        const table = filteredTables.find(table => table.id === id);
                        return table ? sum + parseFloat(table.price) : sum;
                    }, 0);
                    document.getElementById('totalAmount').textContent = `Total: PHP ${total.toFixed(2)}`;
                }

                document.getElementById('confirmBtn').addEventListener('click', function() {
                    if (selectedTables.length === 0) {
                        alert('Please select at least one table.');
                        return;
                    }

                    // Gather reservation data
                    const confirmationData = {
                        tables: selectedTables,
                        pre_reservation: {
                            ...preReservationData,
                            user_id: userId
                        }
                    };

                    // Send confirmation request
                    fetch('/api/confirm_reservation/', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRFToken': getCookie('csrftoken'),
                        },
                        body: JSON.stringify(confirmationData),
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.status === 'success') {
                            alert('Reservation confirmed!');
                            window.location.href = "/home/";
                        } else {
                            alert('Confirmation failed: ' + data.error);
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        alert('Confirmation failed. ' + error.message);
                    });
                });

                // Event listener for cancel button
                document.getElementById('cancelBtn').addEventListener('click', function() {
                    const preReservationId = preReservationData.id; // Assuming preReservationData contains the ID
                    if (preReservationId) {
                        if (confirm('Are you sure you want to cancel this reservation?')) {
                            cancelPreReservation(preReservationId);
                        }
                    } else {
                        alert('No pre-reservation ID found.');
                    }
                });
            });
        });
    });

    function getFormattedDate() {
        // Convert preReservationDate to a Date object
        const date = new Date(preReservationDate);

        // Check if the Date object is valid
        if (isNaN(date.getTime())) {
            throw new Error('Invalid Date object');
        }

        // Format the date as YYYY-MM-DD
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
        const day = String(date.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    }
});
