/* =========================================================
   Invitación Rafael & Juana — lógica
   ========================================================= */
(function () {
  "use strict";

  // ---------- Configuración ----------
  var WEDDING_DATE = new Date("2026-12-31T12:00:00");
  var PHOTOS = [
    { src: "assets/img/couple-1.jpg", alt: "Pareja en la ciudad" },
    { src: "assets/img/couple-2.jpg", alt: "Pareja abrazándose" },
    { src: "assets/img/couple-3.jpg", alt: "Pareja romántica" },
    { src: "assets/img/couple-hero.jpg", alt: "Boda" },
    { src: "assets/img/prueba.jpg", alt: "Prueba" }
  ];
  var SONG_MESSAGE = "¡Hola! Me gustaría tener el honor de sugerir una canción para amenizar tan especial celebración:";

  // Colores alternados de las secciones
  var MAIN = "hsl(36 40% 88%)"; // beige claro
  var ALT = "hsl(88 13% 40%)";  // verde salvia oscuro

  var $ = function (sel) { return document.querySelector(sel); };
  var params = new URLSearchParams(window.location.search);

  // ---------- Plantillas (esquinas y divisores) ----------
  var cornersTpl = $("#cornersTpl");
  document.querySelectorAll(".corners").forEach(function (el) {
    el.appendChild(cornersTpl.content.cloneNode(true));
  });
  var dividerTpl = $("#goldDividerTpl");
  document.querySelectorAll(".gold-divider").forEach(function (el) {
    el.appendChild(dividerTpl.content.cloneNode(true));
  });

  // ---------- Invitados por enlace (?nombres=Ana,Luis&acompanantes=1) ----------
  var nombresParam = params.get("nombres");
  var hasGuests = !!nombresParam;
  if (hasGuests) {
    var nombres = nombresParam.split(",").map(function (n) { return n.trim().replace(/\+/g, " "); }).filter(Boolean);
    var acompanantes = parseInt(params.get("acompanantes") || "0", 10) || 0;
    $("#guestsTotal").textContent = nombres.length + acompanantes;
    if (acompanantes > 0) {
      var comp = $("#guestsCompanions");
      comp.textContent = "(" + acompanantes + " acompañante" + (acompanantes > 1 ? "s" : "") + ")";
      comp.hidden = false;
    }
    var list = $("#guestsList");
    nombres.forEach(function (nombre, i) {
      var chip = document.createElement("div");
      chip.className = "guest-chip";
      chip.textContent = nombre;
      chip.style.transitionDelay = (i * 0.1) + "s";
      list.appendChild(chip);
    });
    $('[data-section="guests"]').hidden = false;
  }

  // ---------- Colores alternados automáticos ----------
  var order = ["countdown", "guests", "events", "carousel", "gifts", "social", "footer"];
  var colors = hasGuests
    ? [ALT, MAIN, ALT, MAIN, ALT, MAIN, ALT]
    : [ALT, MAIN, MAIN, ALT, MAIN, ALT, MAIN];
  order.forEach(function (name, i) {
    var el = document.querySelector('[data-section="' + name + '"]');
    if (!el) return;
    el.style.background = colors[i];
    el.classList.toggle("tone-green", colors[i] === ALT);
  });

  // ---------- Enlace para sugerir canción ----------
  $("#songLink").href = "https://wa.me/?text=" + encodeURIComponent(SONG_MESSAGE);

  // ---------- Portada y música ----------
  var cover = $("#cover");
  var invitation = $("#invitation");
  var audio = $("#music");
  var toggle = $("#musicToggle");
  var musicOn = false;

  function setMusic(on) {
    musicOn = on;
    toggle.classList.toggle("is-playing", on);
    if (on) {
      var p = audio.play();
      if (p && p.catch) p.catch(function () {});
    } else {
      audio.pause();
    }
  }

  document.querySelectorAll("[data-enter]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var withMusic = btn.getAttribute("data-enter") === "music";
      if (withMusic) setMusic(true); // se inicia dentro del clic para que el navegador lo permita
      cover.classList.add("is-exiting");
      setTimeout(function () {
        cover.remove();
        invitation.hidden = false;
        toggle.hidden = false;
        startInvitation();
      }, 800);
    });
  });

  toggle.addEventListener("click", function () { setMusic(!musicOn); });

  document.addEventListener("visibilitychange", function () {
    if (invitation.hidden) return;
    if (document.hidden) {
      audio.pause();
    } else if (musicOn) {
      var p = audio.play();
      if (p && p.catch) p.catch(function () {});
    }
  });

  // ---------- Todo lo que arranca al entrar ----------
  function startInvitation() {
    setupReveal();
    setupParallax();
    startCountdown();
    setupCarousel();
  }

  // Aparición suave al hacer scroll
  function setupReveal() {
    var items = document.querySelectorAll("[data-anim]");
    if (!("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    items.forEach(function (el) { io.observe(el); });
  }

  // Efecto parallax de la foto principal
  function setupParallax() {
    var hero = $("#hero");
    var bg = $("#heroBg");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    var ticking = false;
    function update() {
      var rect = hero.getBoundingClientRect();
      var progress = Math.min(Math.max(-rect.top / rect.height, 0), 1);
      bg.style.transform = "translate3d(0," + (progress * 30) + "%,0)";
      ticking = false;
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();
  }

  // Cuenta regresiva
  function startCountdown() {
    var els = {
      days: $("#cd-days"), hours: $("#cd-hours"),
      minutes: $("#cd-minutes"), seconds: $("#cd-seconds")
    };
    function pad(n) { return String(n).padStart(2, "0"); }
    function tick() {
      var diff = WEDDING_DATE.getTime() - Date.now();
      if (diff < 0) diff = 0;
      els.days.textContent = pad(Math.floor(diff / 86400000));
      els.hours.textContent = pad(Math.floor(diff / 3600000) % 24);
      els.minutes.textContent = pad(Math.floor(diff / 60000) % 60);
      els.seconds.textContent = pad(Math.floor(diff / 1000) % 60);
    }
    tick();
    setInterval(tick, 1000);
  }

  // Carrusel de fotos
  function setupCarousel() {
    var mobile = $("#carouselMobile");
    var desktop = $("#carouselDesktop");
    var dots = $("#carouselDots");
    var total = PHOTOS.length;
    var current = 0;
    var timer;

    PHOTOS.forEach(function (_, i) {
      var b = document.createElement("button");
      b.setAttribute("aria-label", "Ver foto " + (i + 1));
      b.addEventListener("click", function () { go(i); });
      dots.appendChild(b);
    });

    function photo(img, extraClass) {
      var div = document.createElement("div");
      div.className = "photo" + (extraClass ? " " + extraClass : "");
      var el = document.createElement("img");
      el.src = img.src;
      el.alt = img.alt;
      div.appendChild(el);
      return div;
    }

    function render() {
      mobile.innerHTML = "";
      mobile.appendChild(photo(PHOTOS[current]));

      desktop.innerHTML = "";
      desktop.appendChild(photo(PHOTOS[(current - 1 + total) % total]));
      desktop.appendChild(photo(PHOTOS[current], "is-center"));
      desktop.appendChild(photo(PHOTOS[(current + 1) % total]));

      Array.prototype.forEach.call(dots.children, function (d, i) {
        d.classList.toggle("is-active", i === current);
      });
    }

    function restart() {
      clearInterval(timer);
      timer = setInterval(function () { go(current + 1, true); }, 4000);
    }

    function go(i, auto) {
      current = (i + total) % total;
      render();
      if (!auto) restart();
    }

    $("#carouselPrev").addEventListener("click", function () { go(current - 1); });
    $("#carouselNext").addEventListener("click", function () { go(current + 1); });

    render();
    restart();
  }
})();
