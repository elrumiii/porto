/* ============================================================
   Shared interactions
   ============================================================ */
(function () {
  "use strict";

  /* ---- Mobile nav toggle ---- */
  const toggle = document.querySelector(".nav__toggle");
  const links = document.querySelector(".nav__links");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      links.classList.toggle("open");
      const open = links.classList.contains("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    // close menu when a real link is tapped
    links.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        if (window.innerWidth <= 900) links.classList.remove("open");
      });
    });
  }

  /* ---- Flip cards: tap to flip on touch devices ---- */
  const isTouch = window.matchMedia("(hover: none)").matches;
  document.querySelectorAll(".flip").forEach(function (card) {
    // click / tap toggles flip (works on desktop too as a bonus)
    card.addEventListener("click", function (e) {
      // don't hijack links inside a card
      if (e.target.closest("a")) return;
      card.classList.toggle("is-flipped");
    });
    // keyboard accessibility
    card.setAttribute("tabindex", "0");
    card.setAttribute("role", "button");
    card.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        card.classList.toggle("is-flipped");
      }
    });
  });

  /* ---- Photo sliders (swipeable, multiple photos) ---- */
  document.querySelectorAll("[data-slider]").forEach(function (slider) {
    const track = slider.querySelector(".slider__track");
    if (!track) return;
    const slides = Array.prototype.slice.call(track.children);
    const prev = slider.querySelector(".slider__btn--prev");
    const next = slider.querySelector(".slider__btn--next");
    const dotsWrap = slider.querySelector(".slider__dots");
    const viewport = slider.querySelector(".slider__viewport") || track;
    let index = 0;

    // Build dots
    const dots = [];
    if (dotsWrap) {
      slides.forEach(function (_, i) {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = "slider__dot" + (i === 0 ? " active" : "");
        dot.setAttribute("aria-label", "Foto " + (i + 1));
        dot.addEventListener("click", function () { go(i); });
        dotsWrap.appendChild(dot);
        dots.push(dot);
      });
    }

    // Only one photo: hide all controls
    if (slides.length <= 1) {
      if (prev) prev.style.display = "none";
      if (next) next.style.display = "none";
      if (dotsWrap) dotsWrap.style.display = "none";
      return;
    }

    function update() {
      track.style.transform = "translateX(" + (-index * 100) + "%)";
      dots.forEach(function (d, i) { d.classList.toggle("active", i === index); });
      if (prev) prev.disabled = index === 0;
      if (next) next.disabled = index === slides.length - 1;
    }
    function go(i) {
      index = Math.max(0, Math.min(slides.length - 1, i));
      update();
    }
    if (prev) prev.addEventListener("click", function () { go(index - 1); });
    if (next) next.addEventListener("click", function () { go(index + 1); });

    // Swipe / drag with pointer events
    let startX = 0, dragging = false;
    viewport.addEventListener("pointerdown", function (e) {
      dragging = true;
      startX = e.clientX;
    });
    window.addEventListener("pointerup", function (e) {
      if (!dragging) return;
      dragging = false;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
    });
    // prevent accidental image drag
    viewport.addEventListener("dragstart", function (e) { e.preventDefault(); });

    // Keyboard support
    slider.setAttribute("tabindex", "0");
    slider.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") { e.preventDefault(); go(index - 1); }
      if (e.key === "ArrowRight") { e.preventDefault(); go(index + 1); }
    });

    update();
  });

  /* ---- Scroll reveal ---- */
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && reveals.length) {
    const io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    reveals.forEach(function (el) {
      io.observe(el);
    });
  } else {
    reveals.forEach(function (el) {
      el.classList.add("in");
    });
  }

  /* ---- Animate skill bars when visible ---- */
  const fills = document.querySelectorAll(".skill__fill");
  if ("IntersectionObserver" in window && fills.length) {
    const sio = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            const el = entry.target;
            el.style.width = (el.dataset.level || "0") + "%";
            sio.unobserve(el);
          }
        });
      },
      { threshold: 0.4 }
    );
    fills.forEach(function (el) {
      sio.observe(el);
    });
  }

  /* ---- Active nav link based on filename ---- */
  const path = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav__link[data-page]").forEach(function (link) {
    if (link.dataset.page === path) link.classList.add("active");
  });
})();
