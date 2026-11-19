/* ============================================================
   Seishiro Nagi — Portafolio
   JavaScript puro · sin dependencias
   ============================================================ */

(() => {
  "use strict";

  const $ = (selector, context = document) => context.querySelector(selector);
  const $$ = (selector, context = document) => Array.from(context.querySelectorAll(selector));

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const mobileQuery = window.matchMedia("(max-width: 900px)");

  const getNavHeight = () => {
    const value = getComputedStyle(document.documentElement).getPropertyValue("--nav-h");
    return parseFloat(value) || 74;
  };

  const scrollBehavior = () => (reduceMotion.matches ? "auto" : "smooth");

  /* ---------- Año del footer ---------- */
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- Header + scroll spy + botón subir ---------- */
  const header = $("#site-header");
  const toTopButton = $("#to-top");
  const navLinks = $$(".nav-link");
  const pageSections = $$("main section[id]");

  const updateActiveNav = () => {
    if (!pageSections.length) return;

    const probe = window.scrollY + getNavHeight() + Math.min(window.innerHeight * 0.28, 200);
    let current = "";

    pageSections.forEach((section) => {
      if (section.offsetTop <= probe) current = section.id;
    });

    const atBottom =
      window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
    if (atBottom) current = pageSections[pageSections.length - 1].id;

    navLinks.forEach((link) => {
      const isActive = link.getAttribute("href") === `#${current}`;
      link.classList.toggle("is-active", isActive);
      if (isActive) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  };

  const updateScrollUI = () => {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 12);
    if (toTopButton) toTopButton.classList.toggle("is-visible", window.scrollY > 620);
    updateActiveNav();
  };

  let scrollTicking = false;
  window.addEventListener(
    "scroll",
    () => {
      if (scrollTicking) return;
      scrollTicking = true;
      window.requestAnimationFrame(() => {
        updateScrollUI();
        scrollTicking = false;
      });
    },
    { passive: true }
  );
  updateScrollUI();

  /* ---------- Menú móvil ---------- */
  const navToggle = $("#nav-toggle");
  const siteNav = $("#site-nav");
  let menuOpen = false;

  const setMenu = (open, returnFocus = false) => {
    if (!navToggle || !siteNav) return;
    menuOpen = open;

    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute(
      "aria-label",
      open ? "Cerrar menú de navegación" : "Abrir menú de navegación"
    );
    siteNav.classList.toggle("is-open", open);
    document.body.classList.toggle("nav-open", open && mobileQuery.matches);

    if (!open && returnFocus) navToggle.focus();
  };

  if (navToggle && siteNav) {
    navToggle.addEventListener("click", () => setMenu(!menuOpen));

    siteNav.addEventListener("click", (event) => {
      if (event.target.closest("a")) setMenu(false);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && menuOpen) setMenu(false, true);
    });

    document.addEventListener("pointerdown", (event) => {
      if (!menuOpen || !mobileQuery.matches) return;
      if (siteNav.contains(event.target) || navToggle.contains(event.target)) return;
      setMenu(false);
    });

    const handleViewportChange = () => {
      if (!mobileQuery.matches && menuOpen) setMenu(false);
    };

    if (typeof mobileQuery.addEventListener === "function") {
      mobileQuery.addEventListener("change", handleViewportChange);
    } else if (typeof mobileQuery.addListener === "function") {
      mobileQuery.addListener(handleViewportChange);
    }
  }

  /* ---------- Smooth scroll con offset del navbar ---------- */
  $$('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");
      if (!href || href === "#") return;

      const target = document.getElementById(href.slice(1));
      if (!target) return;

      event.preventDefault();
      setMenu(false);

      const top =
        target.id === "inicio"
          ? 0
          : target.getBoundingClientRect().top + window.scrollY - getNavHeight() - 8;

      window.scrollTo({ top: Math.max(0, top), behavior: scrollBehavior() });

      try {
        history.replaceState(null, "", href);
      } catch (error) {
        /* file:// y algunos entornos no permiten replaceState */
      }

      target.setAttribute("tabindex", "-1");
      window.setTimeout(
        () => target.focus({ preventScroll: true }),
        reduceMotion.matches ? 0 : 420
      );
    });
  });

  if (toTopButton) {
    toTopButton.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: scrollBehavior() });
      const hero = document.getElementById("inicio");
      if (hero) {
        hero.setAttribute("tabindex", "-1");
        window.setTimeout(
          () => hero.focus({ preventScroll: true }),
          reduceMotion.matches ? 0 : 420
        );
      }
    });
  }

  /* ---------- Animaciones de aparición ---------- */
  $$("[data-reveal-group]").forEach((group) => {
    $$(":scope > [data-reveal]", group).forEach((element, index) => {
      element.style.setProperty("--delay", `${Math.min(index * 70, 280)}ms`);
    });
  });

  const revealElements = $$("[data-reveal]");
  const canAnimateReveals = "IntersectionObserver" in window && !reduceMotion.matches;

  if (canAnimateReveals) {
    document.documentElement.classList.add("reveal-ready");
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -48px 0px" }
    );

    revealElements.forEach((element) => revealObserver.observe(element));
  } else {
    revealElements.forEach((element) => element.classList.add("is-visible"));
  }

  /* ---------- Filtros de proyectos ---------- */
  const filterButtons = $$(".filter-btn");
  const projectCards = $$(".project-card");
  const filterResult = $("#filter-result");

  if (filterButtons.length && projectCards.length) {
    filterButtons.forEach((button) => {
      const filter = button.dataset.filter;
      const count =
        filter === "all"
          ? projectCards.length
          : projectCards.filter((card) => card.dataset.category === filter).length;
      const countEl = button.querySelector(".filter-count");
      if (countEl) countEl.textContent = String(count);
    });

    filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const filter = button.dataset.filter;

        filterButtons.forEach((item) => {
          const isActive = item === button;
          item.classList.toggle("is-active", isActive);
          item.setAttribute("aria-pressed", String(isActive));
        });

        let visibleCount = 0;

        projectCards.forEach((card, index) => {
          const matches = filter === "all" || card.dataset.category === filter;
          card.hidden = !matches;

          if (!matches) return;

          visibleCount += 1;
          card.classList.add("is-visible");

          if (!reduceMotion.matches && typeof card.animate === "function") {
            card.animate(
              [
                { opacity: 0, transform: "translateY(16px) scale(0.985)" },
                { opacity: 1, transform: "translateY(0) scale(1)" },
              ],
              {
                duration: 420,
                delay: Math.min(index * 45, 180),
                easing: "cubic-bezier(0.22, 1, 0.36, 1)",
                fill: "both",
              }
            );
          }
        });

        if (filterResult) {
          filterResult.textContent = `${visibleCount} proyecto${
            visibleCount === 1 ? "" : "s"
          } visible${visibleCount === 1 ? "" : "s"}`;
        }
      });
    });
  }

  /* ---------- Copiar email + toast ---------- */
  const toast = $("#toast");
  const toastMessage = $("#toast-message");
  let toastTimer = null;

  const showToast = (message) => {
    if (!toast || !toastMessage) return;
    toastMessage.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 3400);
  };

  const copyText = async (text) => {
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (error) {
        /* seguimos con el fallback */
      }
    }

    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.cssText = "position:fixed;top:0;left:-9999px;opacity:0;";
    document.body.appendChild(textarea);
    textarea.select();
    textarea.setSelectionRange(0, textarea.value.length);

    let copied = false;
    try {
      copied = document.execCommand("copy");
    } catch (error) {
      copied = false;
    }

    textarea.remove();
    return copied;
  };

  const copyButton = $("#copy-email");
  if (copyButton) {
    const email = copyButton.dataset.email || "seishiro.nagi.dev@gmail.com";
    let resetTimer = null;

    copyButton.addEventListener("click", async () => {
      const copied = await copyText(email);

      if (copied) {
        copyButton.classList.add("is-copied");
        copyButton.setAttribute("aria-label", `${email} copiado al portapapeles`);
        showToast("Correo copiado al portapapeles");

        window.clearTimeout(resetTimer);
        resetTimer = window.setTimeout(() => {
          copyButton.classList.remove("is-copied");
          copyButton.setAttribute("aria-label", `Copiar mi correo: ${email}`);
        }, 2600);
      } else {
        showToast(`No se pudo copiar. Escríbeme a ${email}`);
      }
    });
  }
})();
