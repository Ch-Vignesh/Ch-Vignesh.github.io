document.addEventListener("DOMContentLoaded", () => {
  /* -------------------------------------------------------------------------- */
  /*                               Scroll Animations                            */
  /* -------------------------------------------------------------------------- */

  const observerOptions = {
    root: null, // Use the viewport
    rootMargin: "0px",
    threshold: 0.1, // Trigger when 10% of the element is visible
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("active");
        // Optional: Stop observing once revealed if you don't want it to re-trigger
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Select all elements to reveal
  const revealElements = document.querySelectorAll(
    ".reveal, .reveal-text, .reveal-img"
  );
  revealElements.forEach((el) => observer.observe(el));

  /* -------------------------------------------------------------------------- */
  /*                               Navbar Behavior                              */
  /* -------------------------------------------------------------------------- */

  const navbar = document.querySelector(".navbar");

  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
      navbar.classList.add("navbar-scrolled", "shadow-sm", "py-2");
      navbar.classList.remove("pt-4");
    } else {
      navbar.classList.remove("navbar-scrolled", "shadow-sm", "py-2");
      navbar.classList.add("pt-4");
    }
  });

  /* -------------------------------------------------------------------------- */
  /*                               Initial Load Sequences                       */
  /* -------------------------------------------------------------------------- */
  // Force trigger for hero elements if they are already in view (sometimes observer is lazy on load)
  setTimeout(() => {
    const heroText = document.querySelector(".reveal-text");
    const heroImg = document.querySelector(".reveal-img");
    if (heroText) heroText.classList.add("active");
    if (heroImg) heroImg.classList.add("active");
  }, 100);
});
