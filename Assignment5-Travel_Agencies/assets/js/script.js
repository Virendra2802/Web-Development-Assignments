'use strict';

/**
 * navbar toggle
 */

const navToggleBtn = document.querySelector("[data-nav-toggle-btn]");
const header = document.querySelector("[data-header]");

navToggleBtn.addEventListener("click", function () {
  this.classList.toggle("active");
  header.classList.toggle("active");
});

/**
 * show go top btn when scroll window to 500px
 */

const goTopBtn = document.querySelector("[data-go-top]");

window.addEventListener("scroll", function () {
  window.scrollY >= 500 ? goTopBtn.classList.add("active")
    : goTopBtn.classList.remove("active");
});

/**
 * Reveal on Scroll Animation
 */
const revealElements = document.querySelectorAll("[data-reveal]");

const revealElementOnScroll = function () {
  for (let i = 0, len = revealElements.length; i < len; i++) {
    const isElementInsideWindow = revealElements[i].getBoundingClientRect().top < window.innerHeight / 1.15;

    if (isElementInsideWindow) {
      revealElements[i].classList.add("revealed");
    }
  }
}

window.addEventListener("scroll", revealElementOnScroll);
window.addEventListener("load", revealElementOnScroll);

/**
 * Newsletter Form Submission
 */
const newsletterForm = document.querySelector(".newsletter-form");
if(newsletterForm) {
  newsletterForm.addEventListener("submit", async function(e) {
    e.preventDefault();
    const emailInput = document.querySelector(".newsletter-input").value;
    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: emailInput })
      });
      const data = await response.json();
      
      Toastify({
        text: data.message,
        duration: 3000,
        gravity: "bottom",
        position: "center",
        backgroundColor: response.ok ? "linear-gradient(to right, #00b09b, #96c93d)" : "linear-gradient(to right, #ff5f6d, #ffc371)",
      }).showToast();
      
      if(response.ok) {
        newsletterForm.reset();
      }
    } catch(err) {
      console.error(err);
      Toastify({
        text: "Error subscribing. Try again later.",
        duration: 3000,
        gravity: "bottom",
        position: "center",
        backgroundColor: "linear-gradient(to right, #ff5f6d, #ffc371)",
      }).showToast();
    }
  });
}

/**
 * Booking Handling Form (Delegate)
 */
const bookingBtns = document.querySelectorAll(".btn-primary, .btn-secondary");
bookingBtns.forEach(btn => {
  if (btn.innerText.includes("Booking") || btn.innerText.includes("Contact")) {
    btn.addEventListener("click", (e) => {
      if(!btn.closest("form")) {
        e.preventDefault();
        Toastify({
          text: "Booking modal coming soon! (Backend route /api/book prepared)",
          duration: 3000,
          gravity: "bottom",
          position: "center",
          backgroundColor: "#viridian-green",
        }).showToast();
      }
    });
  }
});
