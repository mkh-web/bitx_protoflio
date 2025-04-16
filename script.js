document.addEventListener("DOMContentLoaded", () => {
  const langButtons = document.querySelectorAll(
    ".lang-switcher-slider .lang-option"
  );
  const translatableElements = document.querySelectorAll("[data-lang-en]");
  const htmlElement = document.documentElement;
  const yearSpan = document.getElementById("current-year");
  const menuToggle = document.querySelector(".menu-toggle");
  const navUl = document.querySelector(".site-nav-links");
  const preloader = document.getElementById("preloader");
  const header = document.querySelector(".site-header");
  const body = document.body;

  window.addEventListener("load", () => {
    if (preloader) {
      setTimeout(() => {
        preloader.classList.add("loaded");
      }, 600);
    }
  });

  if (yearSpan) yearSpan.textContent = new Date().getFullYear();

  const setLanguage = (lang) => {
    htmlElement.setAttribute("lang", lang);
    htmlElement.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
    translatableElements.forEach((el) => {
      const k = lang === "en" ? "data-lang-en" : "data-lang-ar";
      const t = el.getAttribute(k);
      const p = lang === "en" ? "data-placeholder-en" : "data-placeholder-ar";
      if (el.hasAttribute(p)) {
        el.placeholder = el.getAttribute(p);
      } else if (t !== null && !["INPUT", "TEXTAREA"].includes(el.tagName)) {
        el.textContent = t;
      } else if (el.tagName === "TITLE" && t) {
        document.title = t;
      }
    });
    langButtons.forEach((btn) => {
      const btnLang = btn.getAttribute("data-set-lang");
      const isActive = btnLang === lang;
      btn.classList.toggle("active", isActive);
      btn.setAttribute("aria-checked", String(isActive));
    });
    try {
      localStorage.setItem("preferredLang", lang);
    } catch (e) {
      console.warn("LocalStorage error (lang set):", e);
    }
  };

  langButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const clickedLang = button.getAttribute("data-set-lang");
      if (clickedLang) {
        setLanguage(clickedLang);
        if (navUl?.classList.contains("active")) {
          navUl.classList.remove("active");
          menuToggle.textContent = "☰";
          menuToggle.setAttribute("aria-expanded", "false");
        }
      }
    });
  });

  let preferredLang = "en";
  try {
    preferredLang = localStorage.getItem("preferredLang") || "en";
  } catch (e) {
    console.warn("LocalStorage error (lang get):", e);
  }
  setLanguage(preferredLang);

  if (menuToggle && navUl) {
    menuToggle.addEventListener("click", () => {
      const i = navUl.classList.toggle("active");
      menuToggle.setAttribute("aria-expanded", i);
      menuToggle.textContent = i ? "✕" : "☰";
    });
    navUl.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        if (navUl.classList.contains("active")) {
          navUl.classList.remove("active");
          menuToggle.textContent = "☰";
          menuToggle.setAttribute("aria-expanded", "false");
        }
      });
    });
    document.addEventListener("click", (e) => {
      if (
        window.innerWidth <= 850 &&
        navUl.classList.contains("active") &&
        !navUl.contains(e.target) &&
        !menuToggle.contains(e.target)
      ) {
        navUl.classList.remove("active");
        menuToggle.textContent = "☰";
        menuToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  const sections = document.querySelectorAll("main section[id]");
  const navLinks = document.querySelectorAll(".site-nav-links a");
  const headerHeight = header ? header.offsetHeight : 70;
  function changeNavOnScroll() {
    let currentSectionId = "";
    const scrollPosition = window.scrollY + headerHeight + 60;
    sections.forEach((section) => {
      if (section.id && section.offsetTop) {
        const sTop = section.offsetTop;
        const sHeight = section.offsetHeight;
        if (scrollPosition >= sTop && scrollPosition < sTop + sHeight) {
          currentSectionId = section.id;
        }
      }
    });
    if (window.scrollY < (sections[0]?.offsetTop || headerHeight) * 0.7) {
      currentSectionId = "hero";
    } else if (
      window.innerHeight + window.scrollY >=
      document.body.offsetHeight - 100
    ) {
      currentSectionId =
        sections.length > 0
          ? sections[sections.length - 1]?.id
          : currentSectionId;
    }
    navLinks.forEach((link) => {
      if (link) {
        link.classList.remove("active");
        if (link.getAttribute("href") === `#${currentSectionId}`) {
          link.classList.add("active");
        }
      }
    });
  }
  let scrollTimeout;
  window.addEventListener(
    "scroll",
    () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(changeNavOnScroll, 60);
    },
    { passive: true }
  );
  changeNavOnScroll();

  if (typeof AOS !== "undefined") {
    AOS.init({
      duration: 800,
      offset: 100,
      once: true,
      easing: "ease-out-cubic",
    });
  } else {
    console.warn("AOS library not found.");
  }

  const heroContentWrapper = document.querySelector(".hero-content-wrapper");
  if (heroContentWrapper) {
    let lScrollY = window.scrollY;
    let ticking = false;
    function updateParallax() {
      const sY = window.scrollY;
      const pOff = sY * 0.25;
      window.requestAnimationFrame(() => {
        heroContentWrapper.style.transform = `translateY(${pOff}px)`;
      });
      ticking = false;
    }
    window.addEventListener(
      "scroll",
      () => {
        lScrollY = window.scrollY;
        if (!ticking) {
          window.requestAnimationFrame(updateParallax);
          ticking = true;
        }
      },
      { passive: true }
    );
    updateParallax();
  }

  const serviceCards = document.querySelectorAll(".service-card");
  const pRM = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const iTD = "ontouchstart" in window || navigator.maxTouchPoints > 0;
  if (
    serviceCards.length > 0 &&
    !pRM &&
    !iTD &&
    window.matchMedia("(min-width: 992px)").matches
  ) {
    const maxTilt = 6;
    serviceCards.forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const cR = card.getBoundingClientRect();
        const mX = e.clientX - cR.left - cR.width / 2;
        const mY = e.clientY - cR.top - cR.height / 2;
        const tX = (mY / (cR.height / 2)) * -maxTilt;
        const tY = (mX / (cR.width / 2)) * maxTilt;
        window.requestAnimationFrame(() => {
          card.style.transform = `rotateX(${tX}deg) rotateY(${tY}deg) scale(1.03)`;
          card.style.transition = "transform .05s linear";
        });
      });
      card.addEventListener("mouseleave", () => {
        window.requestAnimationFrame(() => {
          card.style.transform = "rotateX(0deg) rotateY(0deg) scale(1)";
          card.style.transition =
            "transform var(--transition-speed-med) var(--ease-out-cubic)";
        });
      });
    });
  }
});
