// core/choose_table_scripts.js

document.addEventListener("DOMContentLoaded", function() {
    const reservationData = JSON.parse(localStorage.getItem('reservationData'));
    if (!reservationData) {
        alert('Reservation data is missing. Please go back and select date, time, and pax.');
        window.location.href = "/reservation/";
        return;
    }

    const tables = [
        { id: 'L_Couch', name: 'L Couch', price: 6000, seats: 8 },
        { id: 'Green_Couch_1', name: 'Green Couch 1', price: 3000, seats: 4 },
        { id: 'Green_Couch_2', name: 'Green Couch 2', price: 3000, seats: 4 },
        { id: 'Green_Couch_3', name: 'Green Couch 3', price: 5000, seats: 6 },
        { id: 'High_Table_1', name: 'High Table 1', price: 2500, seats: 4 },
        { id: 'High_Table_2', name: 'High Table 2', price: 2500, seats: 4 },
        { id: 'High_Table_3', name: 'High Table 3', price: 2500, seats: 4 }
    ];

    const filteredTables = tables.filter(table => table.seats >= reservationData.pax);

    const floorPlan = document.getElementById('floorPlan');
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
            return sum + table.price;
        }, 0);
        document.getElementById('totalAmount').textContent = `Total: PHP ${total}`;
    }

    document.getElementById('proceedToPaymentBtn').addEventListener('click', function() {
        if (selectedTables.length === 0) {
            alert('Please select at least one table.');
            return;
        }

        const total = selectedTables.reduce((sum, id) => {
            const table = filteredTables.find(table => table.id === id);
            return sum + table.price;
        }, 0);

        // Trigger payment API and redirect to confirmation page...
        // (Payment API integration code here)
    });
});
