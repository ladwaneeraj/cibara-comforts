let slideIndex = 0;
showSlides();

function showSlides() {
  const slides = document.getElementsByClassName("carousel-slide");
  for (let i = 0; i < slides.length; i++) {
    slides[i].style.opacity = "0"; // Hide all slides
  }
  slideIndex++;
  if (slideIndex > slides.length) {
    slideIndex = 1;
  } // Reset to first slide
  slides[slideIndex - 1].style.opacity = "1"; // Show current slide
  setTimeout(showSlides, 6000); // Change slide every 6 seconds for a slow effect
}

// Image Slider Logic
document.querySelectorAll(".image-slider").forEach((slider) => {
  let currentImage = 0;
  const images = slider.querySelectorAll("img");

  setInterval(() => {
    images[currentImage].classList.remove("active");
    currentImage = (currentImage + 1) % images.length;
    images[currentImage].classList.add("active");
  }, 3000); // Change image every 3 seconds
});

const hamburger = document.getElementById("hamburger");
const navLinks = document.querySelector("nav ul");

hamburger.addEventListener("click", () => {
  navLinks.classList.toggle("active");
});
