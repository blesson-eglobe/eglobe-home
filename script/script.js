// eGlobe IT Solutions - Interactive Features (Vanilla JS)

document.addEventListener("DOMContentLoaded", () => {
  // ----------------------------------------------------
  // 1. FOOTER: Current Year
  // ----------------------------------------------------
  const yearEl = document.getElementById("current-year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // ----------------------------------------------------
  // 2. SCROLL SYSTEM: Progress Indicator & Sticky Header
  // ----------------------------------------------------
  const progressBar = document.getElementById("scroll-progress");
  const headerNav = document.getElementById("header-pill-nav");

  const handleScroll = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    
    // Update scroll progress bar
    if (progressBar && docHeight > 0) {
      const percentage = scrollTop / docHeight;
      progressBar.style.transform = `scaleX(${percentage})`;
    }

    // Toggle header scrolled state
    if (headerNav) {
      if (scrollTop > 12) {
        headerNav.classList.add("scrolled");
      } else {
        headerNav.classList.remove("scrolled");
      }
    }
  };

  window.addEventListener("scroll", handleScroll, { passive: true });
  handleScroll(); // Initial call

  // ----------------------------------------------------
  // 3. MENU: Smooth Navigation Highlight & Underline Indicator
  // ----------------------------------------------------
  const navContainer = document.getElementById("site-menu");
  const navItems = document.querySelectorAll(".header-nav .nav-item");
  const indicator = document.getElementById("nav-indicator");
  const mobileMenuBtn = document.getElementById("mobile-menu-btn");

  if (mobileMenuBtn && navContainer) {
    mobileMenuBtn.addEventListener("click", () => {
      const isExpanded = mobileMenuBtn.getAttribute("aria-expanded") === "true";
      mobileMenuBtn.setAttribute("aria-expanded", !isExpanded);
      mobileMenuBtn.classList.toggle("is-active");
      navContainer.classList.toggle("is-open");
    });
  }

  const moveIndicator = (element) => {
    if (!element || !indicator || !navContainer) return;
    const rect = element.getBoundingClientRect();
    const navRect = navContainer.getBoundingClientRect();
    indicator.style.left = `${rect.left - navRect.left}px`;
    indicator.style.width = `${rect.width}px`;
    indicator.style.opacity = "1";
  };

  const resetIndicator = () => {
    if (!indicator) return;
    const activeItem = document.querySelector(".header-nav .nav-item.active");
    if (activeItem) {
      moveIndicator(activeItem);
    } else {
      indicator.style.opacity = "0";
    }
  };

  navItems.forEach((item) => {
    // Hover interactions
    item.addEventListener("mouseenter", () => moveIndicator(item));
    item.addEventListener("mouseleave", resetIndicator);

    // Click navigation interaction
    item.addEventListener("click", (e) => {
      e.preventDefault();
      
      // Close mobile menu if open
      if (navContainer.classList.contains("is-open")) {
        mobileMenuBtn.setAttribute("aria-expanded", "false");
        mobileMenuBtn.classList.remove("is-active");
        navContainer.classList.remove("is-open");
      }

      const targetSelector = item.getAttribute("href");
      const targetElement = document.querySelector(targetSelector);
      
      if (targetElement) {
        // Smooth scroll to target
        const offsetTop = targetElement.getBoundingClientRect().top + window.scrollY - 90;
        window.scrollTo({
          top: offsetTop,
          behavior: "smooth"
        });
      }
    });
  });

  // Also close menu when mobile CTA is clicked
  const mobileCta = document.querySelector(".mobile-cta");
  if (mobileCta) {
    mobileCta.addEventListener("click", () => {
      if (navContainer.classList.contains("is-open")) {
        mobileMenuBtn.setAttribute("aria-expanded", "false");
        mobileMenuBtn.classList.remove("is-active");
        navContainer.classList.remove("is-open");
      }
    });
  }

  // Track active sections via IntersectionObserver
  const sections = document.querySelectorAll("section[id]");
  const activeSectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute("id");
        navItems.forEach((item) => {
          if (item.getAttribute("href") === `#${id}`) {
            item.classList.add("active");
            moveIndicator(item);
          } else {
            item.classList.remove("active");
          }
        });
      }
    });
  }, {
    rootMargin: "-20% 0px -60% 0px" // Triggers when section occupies the active reading area
  });

  sections.forEach((sec) => activeSectionObserver.observe(sec));

  // Initialize indicator geometry once fonts/styles load
  window.addEventListener("load", resetIndicator);
  window.addEventListener("resize", resetIndicator);

  // ----------------------------------------------------
  // 4. ANIMATION: IntersectionObserver Scroll Reveal
  // ----------------------------------------------------
  const revealElements = document.querySelectorAll("[data-reveal]");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!reducedMotion) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("data-reveal-visible");
          entry.target.setAttribute("data-reveal-visible", "");
          revealObserver.unobserve(entry.target); // Reveal once
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px"
    });

    revealElements.forEach((el, index) => {
      // Stagger child elements in groups if needed
      const parent = el.parentElement;
      const siblings = Array.from(parent.querySelectorAll("[data-reveal]"));
      const siblingIndex = siblings.indexOf(el);
      
      if (siblingIndex !== -1) {
        el.style.setProperty("--reveal-i", siblingIndex);
      }
      revealObserver.observe(el);
    });
  } else {
    // Accessibility fallback: immediately visible
    revealElements.forEach((el) => {
      el.classList.add("data-reveal-visible");
      el.setAttribute("data-reveal-visible", "");
    });
  }

  // ----------------------------------------------------
  // 5. COUNTERS: Stats Strip Count-up Animation
  // ----------------------------------------------------
  const counters = document.querySelectorAll("[data-count-target]");

  const runCountUp = (el) => {
    const target = parseInt(el.getAttribute("data-count-target"), 10);
    const suffix = el.getAttribute("data-count-suffix") || "%";
    const duration = 1400; // ms
    const startTime = performance.now();

    const updateValue = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const val = Math.round(target * eased);

      el.textContent = val + suffix;

      if (progress < 1) {
        requestAnimationFrame(updateValue);
      }
    };

    requestAnimationFrame(updateValue);
  };

  if (!reducedMotion) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          runCountUp(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.5
    });

    counters.forEach((c) => counterObserver.observe(c));
  } else {
    // Accessibility fallback: show end numbers immediately
    counters.forEach((c) => {
      const target = c.getAttribute("data-count-target");
      const suffix = c.getAttribute("data-count-suffix") || "%";
      c.textContent = target + suffix;
    });
  }

  // ----------------------------------------------------
  // 6. ACCORDION: FAQ Panel Toggle
  // ----------------------------------------------------
  const faqItems = document.querySelectorAll(".faq-item");

  faqItems.forEach((item) => {
    const trigger = item.querySelector(".faq-trigger-btn");
    const content = item.querySelector(".faq-content-pane");

    trigger.addEventListener("click", () => {
      const isOpen = item.classList.contains("open");

      // Close all other panels
      faqItems.forEach((otherItem) => {
        if (otherItem !== item && otherItem.classList.contains("open")) {
          otherItem.classList.remove("open");
          otherItem.querySelector(".faq-trigger-btn").setAttribute("aria-expanded", "false");
        }
      });

      // Toggle current panel
      if (isOpen) {
        item.classList.remove("open");
        trigger.setAttribute("aria-expanded", "false");
      } else {
        item.classList.add("open");
        trigger.setAttribute("aria-expanded", "true");
      }
    });
  });

  // ----------------------------------------------------
  // 7. SCROLL EFFECT: Challenges Stacking Card Deck
  // ----------------------------------------------------
  const challengesSection = document.getElementById("challenges-scroll-container");
  const deckWrapper = document.getElementById("deck-cards-wrapper");
  const cards = document.querySelectorAll(".challenge-card");

  if (challengesSection && deckWrapper && cards.length > 0 && !reducedMotion) {
    const N = cards.length;
    const PEEK = 16;
    const SCALE_STEP = 0.045;
    const MAX_STACK = 3;
    const PEEK_AREA = MAX_STACK * PEEK; // 48px

    // Setup section and wrapper heights
    challengesSection.style.height = `calc(${N + 1} * 100vh)`;
    deckWrapper.style.height = `${PEEK_AREA + 360}px`;


    const updateCardStack = () => {
      const { top, height } = challengesSection.getBoundingClientRect();
      const vh = window.innerHeight;
      const scrollable = height - vh;
      if (scrollable <= 0) return;

      const progress = Math.min(N, Math.max(0, (-top / scrollable) * N));

      // Cards enter from the very bottom of the viewport and slide up to their rest position.
      // ENTER_DIST = how far below the card starts (bottom of viewport relative to card rest pos).
      const ENTER_DIST = vh - PEEK_AREA;

      const getCardStyle = (cardPos) => {
        // Z-INDEX HIERARCHY (highest = renders on top):
        //   entering (50) > active (40) > transitioning (38) > stacked (35, 30, 25...)
        // This ensures every new card slides visually OVER all previous cards.

        // 1. Not yet reached — parked below the viewport, invisible
        if (cardPos < -0.5) {
          return { opacity: 0, ty: ENTER_DIST, scale: 0.9, zIndex: 0 };
        }

        // 2. Entering from below — HIGHEST z-index so it slides over everything
        if (cardPos < 0) {
          const t = (cardPos + 0.5) / 0.5;        // 0 → 1 over the entry window
          const eased = 1 - Math.pow(1 - t, 3);   // easeOutCubic: fast rise, smooth landing
          return {
            opacity: eased,
            ty: ENTER_DIST * (1 - eased),          // starts at bottom, arrives at 0
            scale: 0.9 + 0.10 * eased,
            zIndex: 50                             // top of the stack — overlaps everything
          };
        }

        // 3. Fully active — sits on top of all stacked cards
        if (cardPos < 0.75) {
          return { opacity: 1, ty: 0, scale: 1, zIndex: 40 };
        }

        // 4. Transitioning into the stack (pushing up and shrinking)
        if (cardPos < 1) {
          const t = (cardPos - 0.75) / 0.25;
          const eased = t * t * t;                 // easeInCubic: slow start, fast push
          return {
            opacity: 1,
            ty: -(PEEK * eased),
            scale: 1 - SCALE_STEP * eased,
            zIndex: 38
          };
        }

        // 5. Sitting in the stacked pile above
        //    depth=0 → z=35, depth=1 → z=30, depth=2 → z=25 ...
        //    All lower than the entering card (50) so new cards always overlap.
        const depth = cardPos - 1;
        if (depth > MAX_STACK + 0.5) {
          return { opacity: 0, ty: -(PEEK * (MAX_STACK + 1)), scale: 0.7, zIndex: 0 };
        }
        const fade = Math.max(0, (depth - (MAX_STACK - 0.5)) / 0.6);
        return {
          opacity: Math.max(0, 1 - fade),
          ty: -(PEEK * (depth + 1)),
          scale: Math.max(0.7, 1 - SCALE_STEP * (depth + 1)),
          zIndex: Math.round(35 - depth * 5)       // decreases with depth
        };
      };

      cards.forEach((card, i) => {
        const style = getCardStyle(progress - i);

        card.style.position = "absolute";
        card.style.top = `${PEEK_AREA}px`;
        card.style.left = "0";
        card.style.right = "0";
        card.style.transform = `translateY(${style.ty}px) scale(${style.scale})`;
        card.style.transformOrigin = "top center";
        card.style.opacity = style.opacity;
        card.style.zIndex = style.zIndex;
        card.style.willChange = "transform, opacity";
        card.style.pointerEvents = style.opacity < 0.1 ? "none" : "auto";

        if (style.opacity < 0.05) {
          card.setAttribute("aria-hidden", "true");
        } else {
          card.removeAttribute("aria-hidden");
        }
      });
    };

    // Listen to scroll + resize events
    window.addEventListener("scroll", updateCardStack, { passive: true });
    window.addEventListener("resize", updateCardStack, { passive: true });
    updateCardStack(); // Initial layout update
  } else {
    // Accessibility fallback / Mobile disabled motion
    cards.forEach((card, index) => {
      card.style.position = "relative";
      card.style.top = "auto";
      card.style.left = "auto";
      card.style.right = "auto";
      card.style.transform = "none";
      card.style.opacity = "1";
      card.style.zIndex = "1";
      card.removeAttribute("aria-hidden");
      card.style.pointerEvents = "auto";
      card.style.marginBottom = "1rem";
    });
    
    if (deckWrapper) {
      deckWrapper.style.height = "auto";
    }
    if (challengesSection) {
      challengesSection.style.height = "auto";
    }
  }
});
