(function () {
  "use strict";
  document.documentElement.classList.add("js");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasGSAP = typeof window.gsap !== "undefined";
  if (hasGSAP && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  /* ---------- Smooth scroll (Lenis) ---------- */
  var lenis = null;
  if (!reduceMotion && typeof window.Lenis !== "undefined") {
    lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    lenis.on("scroll", hasGSAP && window.ScrollTrigger ? ScrollTrigger.update : function () {});
    function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
    if (hasGSAP) {
      gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
      gsap.ticker.lagSmoothing(0);
    }
  }

  /* ---------- Announcement bar dismiss ---------- */
  var announce = document.querySelector("[data-announce]");
  var announceClose = document.querySelector("[data-announce-close]");
  if (announce && announceClose) {
    var dismissed = false;
    try { dismissed = sessionStorage.getItem("tsl_announce_dismissed") === "1"; } catch (e) {}
    if (dismissed) announce.hidden = true;
    announceClose.addEventListener("click", function () {
      announce.hidden = true;
      try { sessionStorage.setItem("tsl_announce_dismissed", "1"); } catch (e) {}
      if (hasGSAP && window.ScrollTrigger) ScrollTrigger.refresh();
    });
  }

  /* ---------- Header scroll state ---------- */
  var header = document.querySelector(".site-header");
  function onScrollHeader() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  }
  window.addEventListener("scroll", onScrollHeader, { passive: true });
  onScrollHeader();

  /* ---------- Mobile menu ---------- */
  var menuToggle = document.querySelector("[data-menu-toggle]");
  var mobileMenu = document.querySelector("[data-mobile-menu]");
  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener("click", function () {
      var open = menuToggle.getAttribute("aria-expanded") === "true";
      menuToggle.setAttribute("aria-expanded", String(!open));
      mobileMenu.classList.toggle("is-open", !open);
      mobileMenu.hidden = open;
      document.body.style.overflow = open ? "" : "hidden";
      if (!open && lenis) lenis.stop(); else if (lenis) lenis.start();
    });
    mobileMenu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        menuToggle.setAttribute("aria-expanded", "false");
        mobileMenu.classList.remove("is-open");
        mobileMenu.hidden = true;
        document.body.style.overflow = "";
        if (lenis) lenis.start();
      });
    });
  }

  /* ---------- Word-splitting for blur reveal ---------- */
  function splitWords(el) {
    if (el.dataset.split === "1") return;
    el.dataset.split = "1";
    var text = el.textContent;
    var words = text.split(/(\s+)/).filter(function (w) { return w.length > 0; });
    el.innerHTML = "";
    words.forEach(function (w) {
      if (/^\s+$/.test(w)) { el.appendChild(document.createTextNode(w)); return; }
      var span = document.createElement("span");
      span.className = "reveal-word";
      span.textContent = w;
      el.appendChild(span);
    });
  }

  var revealTargets = document.querySelectorAll("[data-reveal]");
  revealTargets.forEach(function (el) { splitWords(el); el.classList.add("reveal-init"); });

  if (!reduceMotion && hasGSAP && window.ScrollTrigger) {
    revealTargets.forEach(function (el) {
      var words = el.querySelectorAll(".reveal-word");
      gsap.to(words, {
        filter: "blur(0px)",
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: "power3.out",
        stagger: 0.035,
        scrollTrigger: { trigger: el, start: "top 85%" }
      });
    });
  } else {
    revealTargets.forEach(function (el) { el.classList.remove("reveal-init"); });
  }

  /* ---------- Hero dot -> line draw ---------- */
  var heroLine = document.querySelector("[data-hero-line]");
  var heroDot = document.querySelector("[data-hero-dot]");
  if (heroLine && hasGSAP) {
    var len = heroLine.getTotalLength();
    gsap.set(heroLine, { strokeDasharray: len, strokeDashoffset: reduceMotion ? 0 : len });
    if (!reduceMotion) {
      var tl = gsap.timeline({ delay: 0.3 });
      tl.to(heroDot, { scale: 1, opacity: 1, duration: 0.5, ease: "power3.out", transformOrigin: "center" })
        .to(heroLine, { strokeDashoffset: 0, duration: 1.4, ease: "power2.inOut" }, "-=0.1")
        .to(heroLine, { opacity: 0.35, duration: 0.6, ease: "power1.out" }, "+=0.2");
    } else {
      gsap.set(heroDot, { scale: 1, opacity: 1 });
      gsap.set(heroLine, { opacity: 0.35 });
    }
  }

  /* ---------- Process line scrub ---------- */
  var processSvg = document.querySelector("[data-process-svg]");
  if (processSvg && hasGSAP && window.ScrollTrigger) {
    var fillPath = processSvg.querySelector("[data-process-fill]");
    var dots = processSvg.querySelectorAll("[data-process-dot]");
    if (fillPath) {
      var flen = fillPath.getTotalLength();
      gsap.set(fillPath, { strokeDasharray: flen, strokeDashoffset: reduceMotion ? 0 : flen });
      if (!reduceMotion) {
        gsap.to(fillPath, {
          strokeDashoffset: 0,
          ease: "none",
          scrollTrigger: { trigger: processSvg, start: "top 75%", end: "bottom 60%", scrub: 0.6 }
        });
        dots.forEach(function (dot, i) {
          ScrollTrigger.create({
            trigger: processSvg,
            start: "top " + (75 - i * 15) + "%",
            onEnter: function () { dot.classList.add("is-active"); },
            onLeaveBack: function () { dot.classList.remove("is-active"); }
          });
        });
      } else {
        dots.forEach(function (dot) { dot.classList.add("is-active"); });
      }
    }
  }

  /* ---------- Service row line draw (hover handled by CSS; add focus/keyboard parity already via :focus-within) ---------- */

  /* ---------- Work: scroll-driven horizontal gallery (desktop pin) ---------- */
  var workPin = document.querySelector("[data-work-pin]");
  var workTrack = document.querySelector("[data-work-track]");
  var workViewport = workPin && workPin.querySelector(".work-pin-viewport");

  if (workPin && workTrack && workViewport) {
    if (!reduceMotion && hasGSAP && window.ScrollTrigger) {
      var mm = gsap.matchMedia();
      mm.add("(min-width: 900px)", function () {
        // Desktop pin layout is applied for the whole breakpoint lifetime so
        // there's no layout jump when the pin toggles on/off mid-scroll.
        workViewport.setAttribute("data-pinned", "");

        // How far the track must travel so the last card's right edge lands at
        // the viewport's right edge: full track width minus one viewport width.
        var distance = function () {
          return Math.max(0, workTrack.scrollWidth - workViewport.clientWidth);
        };

        var tween = gsap.to(workTrack, {
          x: function () { return -distance(); },
          ease: "none",
          scrollTrigger: {
            trigger: workPin,
            start: "top top",
            end: function () { return "+=" + distance(); },
            pin: true,
            scrub: 0.8,
            anticipatePin: 1,
            invalidateOnRefresh: true
          }
        });

        return function () {
          if (tween.scrollTrigger) tween.scrollTrigger.kill();
          tween.kill();
          gsap.set(workTrack, { clearProps: "transform" });
          workViewport.removeAttribute("data-pinned");
        };
      });
    } else {
      // No-JS-motion / mobile: native horizontal swipe with snap, no scroll hijack.
      workViewport.style.scrollSnapType = "x proximity";
    }
  }

  /* ---------- Contact form ---------- */
  var form = document.querySelector("[data-contact-form]");
  if (form) {
    var statusEl = form.querySelector("[data-form-status]");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var valid = true;
      var fields = form.querySelectorAll("[required]");
      fields.forEach(function (field) {
        var row = field.closest(".form-row");
        var isValid = field.checkValidity();
        if (field.type === "email") isValid = isValid && /\S+@\S+\.\S+/.test(field.value);
        row.classList.toggle("has-error", !isValid);
        if (!isValid) valid = false;
      });
      if (!valid) {
        statusEl.textContent = "Please fix the highlighted fields and try again.";
        statusEl.className = "form-status is-visible is-error";
        statusEl.setAttribute("role", "alert");
        return;
      }

      var data = {};
      new FormData(form).forEach(function (v, k) { data[k] = v; });
      var endpoint = window.TSL_CONTENT && window.TSL_CONTENT.formEndpoint;

      if (endpoint) {
        fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        }).then(function (res) {
          if (res.ok) {
            showSuccess();
          } else {
            showError();
          }
        }).catch(showError);
      } else {
        var email = (window.TSL_CONTENT && window.TSL_CONTENT.contactEmail) || "hello@tensenlab.com";
        var subject = encodeURIComponent("New project enquiry — " + (data.name || ""));
        var body = encodeURIComponent(
          "Name: " + (data.name || "") + "\n" +
          "Email: " + (data.email || "") + "\n" +
          "Building: " + (data.service || "") + "\n\n" +
          (data.message || "")
        );
        window.location.href = "mailto:" + email + "?subject=" + subject + "&body=" + body;
        showSuccess(true);
      }

      function showSuccess(viaMail) {
        statusEl.textContent = viaMail
          ? "Opening your email app to send this. If nothing happens, email us directly."
          : "Thanks — we'll get back to you shortly.";
        statusEl.className = "form-status is-visible is-success";
        statusEl.setAttribute("role", "status");
        if (!viaMail) form.reset();
      }
      function showError() {
        statusEl.textContent = "Something went wrong sending this. Please email us directly.";
        statusEl.className = "form-status is-visible is-error";
        statusEl.setAttribute("role", "alert");
      }
    });
  }
})();
