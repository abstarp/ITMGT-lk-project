document.addEventListener("DOMContentLoaded", function() {
    const images = imageUrls;
    let currentImageIndex = 0;

    const sliderImage = document.getElementById("slider-image");
    const prevBtn = document.getElementById("prev-btn");
    const nextBtn = document.getElementById("next-btn");

    function updateImage() {
        sliderImage.src = images[currentImageIndex];
    }

    prevBtn.addEventListener("click", function() {
        currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
        updateImage();
    });

    nextBtn.addEventListener("click", function() {
        currentImageIndex = (currentImageIndex + 1) % images.length;
        updateImage();
    });

    updateImage();
});
