// signup_scripts.js

document.addEventListener('DOMContentLoaded', function() {
    const countries = [
        { name: "Philippines", code: "+63", flag: "/static/core/flags/ph.png" },
        { name: "United States", code: "+1", flag: "/static/core/flags/us.png" },
        { name: "United Kingdom", code: "+44", flag: "/static/core/flags/uk.png" },
        // Add more countries as needed
    ];

    const countrySelect = document.getElementById('country_code');
    const flagIcon = document.getElementById('flag-icon');

    // Populate the dropdown with country options
    countries.forEach(country => {
        const option = document.createElement('option');
        option.value = country.code;
        option.textContent = `${country.name} (${country.code})`;
        option.dataset.flag = country.flag; // Use dataset instead of setAttribute
        countrySelect.appendChild(option);
    });

    // Set default country (Philippines)
    countrySelect.value = "+63";
    flagIcon.src = countries.find(country => country.code === "+63").flag; // Find and use the correct flag

    // Handle change in country selection
    countrySelect.addEventListener('change', function() {
        const selectedIndex = countrySelect.selectedIndex;
        const selectedOption = countrySelect.options[selectedIndex];
        const flagSrc = selectedOption.dataset.flag; // Use dataset instead of getAttribute

        // Update flag icon
        flagIcon.src = flagSrc;
    });
});
