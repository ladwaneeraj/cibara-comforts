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
  setTimeout(showSlides, 3000); // Change slide every 3 seconds for a slow effect
}

// Image Slider Logic
document.querySelectorAll(".image-slider").forEach((slider) => {
  let currentImage = 0;
  const images = slider.querySelectorAll("img");

  setInterval(() => {
    images[currentImage].classList.remove("active");
    currentImage = (currentImage + 1) % images.length;
    images[currentImage].classList.add("active");
  }, 5000); // Change image every 3 seconds
});

// Room image and amenities data
const roomImages = {
  premium: [
    "rooms/premium1.jpeg",
    "rooms/premium2.jpeg",
    "rooms/premium3.jpeg",
    "rooms/premium4.jpeg",
  ],
  double: ["rooms/double1.jpeg", "rooms/double2.jpeg", "rooms/double3.jpeg"],
  single: ["rooms/single1.jpg", "rooms/single2.jpg", "rooms/single3.jpg"],
  dorms: ["rooms/dorm1.jpg", "rooms/dorm4.jpg", "rooms/dorm3.jpg"],
};

const roomAmenities = {
  premium: [
    "Free WiFi",
    "Free Toiletries",
    "Flat-screen TV",
    "Ceiling Fan",
    "House Keeping",
    "Bedside Lamp",
    "Linen",
  ],
  double: [
    "Free WiFi",
    "Room Service",
    "Free Toiletries",
    "Ceiling Fan",
    "House Keeping",
  ],
  single: ["Free WiFi", "Room Service", "Free Toiletries", "House Keeping"],
  dorms: ["Free WiFi", "Private Rooms", "Hot water", "Drinking Water"],
};

// Modal variables
let currentImageIndex = 0;
let currentRoomType = "";

// Function to open modal
function openRoomModal(roomType) {
  const modal = document.getElementById("roomModal");
  const modalImage = document.getElementById("modalImage");
  const amenitiesList = document.getElementById("amenitiesList");

  currentRoomType = roomType; // Store the current room type
  currentImageIndex = 0; // Start with the first image

  // Update the first image
  modalImage.src = roomImages[currentRoomType][currentImageIndex];

  // Populate amenities
  amenitiesList.innerHTML = roomAmenities[currentRoomType]
    .map((amenity) => `<li>${amenity}</li>`)
    .join("");

  // Display modal
  modal.style.display = "flex";
}

// Function to close modal
function closeRoomModal() {
  const modal = document.getElementById("roomModal");
  modal.style.display = "none";
}

// Function to change images using arrows
function changeImage(direction) {
  const modalImage = document.getElementById("modalImage");

  // Update the current image index
  currentImageIndex =
    (currentImageIndex + direction + roomImages[currentRoomType].length) %
    roomImages[currentRoomType].length;

  // Update the modal image source
  modalImage.src = roomImages[currentRoomType][currentImageIndex];
}

// Add click event listeners to room cards
document.querySelectorAll(".room-card").forEach((card) => {
  card.addEventListener("click", () => {
    const roomType = card.getAttribute("data-room-type");
    openRoomModal(roomType);
  });
});

// Close modal when clicking outside
window.addEventListener("click", (e) => {
  const modal = document.getElementById("roomModal");
  if (e.target === modal) {
    closeRoomModal();
  }
});

//hamburger
const hamburger = document.getElementById("hamburger");
const navLinks = document.querySelector("nav ul");

hamburger.addEventListener("click", () => {
  navLinks.classList.toggle("active");
});

//Testimonials
document.addEventListener("DOMContentLoaded", () => {
  const testimonials = document.querySelectorAll(".testimonial");
  let currentIndex = 0;

  setInterval(() => {
    // Hide the current testimonial
    testimonials[currentIndex].classList.remove("active");

    // Move to the next testimonial
    currentIndex = (currentIndex + 1) % testimonials.length;

    // Show the next testimonial
    testimonials[currentIndex].classList.add("active");
  }, 5000); // Change testimonial every 5 seconds
});
