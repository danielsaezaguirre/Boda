(() => {
  "use strict";

  const config = window.WEDDING_CONFIG;
  const byId = (id) => document.getElementById(id);
  const text = (selector, value) => {
    document.querySelectorAll(selector).forEach((element) => {
      element.textContent = value;
    });
  };
  const weddingDate = new Date(config.date);
  const dateOptions = { day: "numeric", month: "long", year: "numeric" };
  const shortDate = new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(weddingDate).replaceAll("/", " · ");

  text("[data-couple-first]", config.couple.first);
  text("[data-couple-second]", config.couple.second);
  text("[data-couple-short]", `${config.couple.first} & ${config.couple.second}`);
  text("[data-date-long]", new Intl.DateTimeFormat("es-ES", dateOptions).format(weddingDate));
  text("[data-date-short]", shortDate);
  text("[data-venue]", config.venue);
  text("[data-address]", config.address);
  text("[data-rsvp-deadline]", new Intl.DateTimeFormat("es-ES", dateOptions).format(new Date(`${config.rsvpDeadline}T12:00:00`)));
  document.title = `${config.couple.first} & ${config.couple.second} · Nos casamos`;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const countdownVideo = byId("countdown-video");
  if (countdownVideo && reduceMotion) {
    countdownVideo.removeAttribute("autoplay");
    countdownVideo.pause();
  }
  const storyGallery = byId("story-gallery");
  if (storyGallery) {
    const storySlides = [...storyGallery.querySelectorAll(".story-photo")];
    const storyCounter = byId("story-counter");
    const storyPrev = byId("story-prev");
    const storyNext = byId("story-next");
    let activeStoryIndex = 0;
    let pointerStartX = null;
    let dragged = false;
    const renderStoryAlbum = (animate = false) => {
      const slideWidth = storySlides[0].getBoundingClientRect().width;
      const gap = parseFloat(getComputedStyle(storyGallery).columnGap) || 24;
      storySlides.forEach((slide, index) => {
        const distance = index - activeStoryIndex;
        slide.style.setProperty("--slide-x", `${distance * (slideWidth + gap)}px`);
        slide.classList.toggle("is-active", distance === 0);
        slide.classList.toggle("is-neighbor", Math.abs(distance) === 1);
        slide.setAttribute("aria-pressed", String(distance === 0));
        if (distance === 0 && animate && !reduceMotion) {
          slide.classList.remove("is-flipping");
          void slide.offsetWidth;
          slide.classList.add("is-flipping");
        } else {
          slide.classList.remove("is-flipping");
        }
      });
      storyCounter.textContent = `${String(activeStoryIndex + 1).padStart(2, "0")} / ${String(storySlides.length).padStart(2, "0")}`;
      storyPrev.disabled = activeStoryIndex === 0;
      storyNext.disabled = activeStoryIndex === storySlides.length - 1;
    };
    const selectStorySlide = (index) => {
      const nextIndex = Math.max(0, Math.min(storySlides.length - 1, index));
      if (nextIndex === activeStoryIndex) return;
      activeStoryIndex = nextIndex;
      renderStoryAlbum(true);
    };
    const goToStorySlide = (direction) => selectStorySlide(activeStoryIndex + direction);
    storySlides.forEach((slide, index) => {
      slide.setAttribute("role", "button");
      slide.setAttribute("tabindex", "0");
      slide.addEventListener("click", () => {
        if (!dragged) selectStorySlide(index);
      });
      slide.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          selectStorySlide(index);
        }
      });
    });
    storyPrev.addEventListener("click", () => goToStorySlide(-1));
    storyNext.addEventListener("click", () => goToStorySlide(1));
    storyGallery.addEventListener("pointerdown", (event) => {
      pointerStartX = event.clientX;
      dragged = false;
    });
    storyGallery.addEventListener("pointerup", (event) => {
      if (pointerStartX === null) return;
      const swipeDistance = event.clientX - pointerStartX;
      dragged = Math.abs(swipeDistance) > 10;
      if (Math.abs(swipeDistance) > 45) goToStorySlide(swipeDistance < 0 ? 1 : -1);
      pointerStartX = null;
      window.setTimeout(() => { dragged = false; }, 0);
    });
    storyGallery.addEventListener("pointercancel", () => { pointerStartX = null; });
    storyGallery.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        goToStorySlide(event.key === "ArrowRight" ? 1 : -1);
      }
    });
    window.addEventListener("resize", () => renderStoryAlbum());
    renderStoryAlbum();
  }

  const botanicalSections = [...document.querySelectorAll(".countdown-section, .quote-section")];
  botanicalSections.forEach((section, index) => {
    section.classList.add("botanical-section");
    const corners = index % 2
      ? [["sprig-bottom-right", "sprig-primary"]]
      : [["sprig-top-left", "sprig-primary"], ["sprig-bottom-right", "sprig-opposite"]];
    corners.forEach(([corner, role]) => {
      const sprig = document.createElement("img");
      sprig.className = `section-sprig ${corner} ${role}`;
      sprig.src = "assets/golden-leaf-sprig.svg";
      sprig.alt = "";
      sprig.setAttribute("aria-hidden", "true");
      sprig.draggable = false;
      section.prepend(sprig);
    });
  });
  if (reduceMotion || !("IntersectionObserver" in window)) {
    botanicalSections.forEach((section) => section.classList.add("is-flowering"));
  } else {
    const botanicalObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => entry.target.classList.toggle("is-flowering", entry.isIntersecting));
    }, { threshold: 0.01, rootMargin: "-12% 0px -12% 0px" });
    botanicalSections.forEach((section) => botanicalObserver.observe(section));
  }

  const quote = document.querySelector(".quote-card blockquote");
  if (quote) {
    const phrase = quote.textContent.trim();
    quote.setAttribute("aria-label", phrase);
    quote.replaceChildren();
    phrase.split(/\s+/).forEach((word, index, words) => {
      const token = document.createElement("span");
      token.className = "quote-word";
      token.setAttribute("aria-hidden", "true");
      token.style.setProperty("--word-index", index);
      token.textContent = word;
      quote.append(token);
      if (index < words.length - 1) quote.append(document.createTextNode(" "));
    });
  }

  document.querySelectorAll(".section-heading, .celebration-copy, .celebration-map, .timeline, .rsvp-intro, .rsvp-form, .photos-copy, .qr-card, .quote-card").forEach((item, index) => {
    item.classList.add("reveal");
    item.style.setProperty("--reveal-delay", `${(index % 4) * 75}ms`);
  });
  const revealItems = document.querySelectorAll(".reveal");
  const celebrationSection = byId("celebracion");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
    celebrationSection?.classList.add("is-visible");
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -35px 0px" });
    revealItems.forEach((item) => revealObserver.observe(item));
    if (celebrationSection) {
      const celebrationObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.16 });
      celebrationObserver.observe(celebrationSection);
    }

    const parallaxItems = [...document.querySelectorAll("[data-parallax]")];
    let scrollPending = false;
    const updateParallax = () => {
      const viewportCenter = window.innerHeight / 2;
      parallaxItems.forEach((item) => {
        const bounds = item.getBoundingClientRect();
        const speed = Number(item.dataset.parallax) || 0.05;
        const offset = Math.max(-56, Math.min(56, (bounds.top + bounds.height / 2 - viewportCenter) * speed));
        item.style.setProperty("--parallax-y", `${offset}px`);
      });
      scrollPending = false;
    };
    window.addEventListener("scroll", () => {
      if (!scrollPending) {
        window.requestAnimationFrame(updateParallax);
        scrollPending = true;
      }
    }, { passive: true });
    updateParallax();
  }

  const cover = document.querySelector(".hero-image");
  if (config.coverImage) {
    cover.style.backgroundImage = `linear-gradient(90deg, #20352be6, #20352b80 54%, #20352bd1), url("${config.coverImage}"), radial-gradient(ellipse at 50% 0%, #3b4b3a, #20352b 68%)`;
  }

  const addressQuery = encodeURIComponent(`${config.venue}, ${config.address}`);
  byId("map-link").href = `https://www.google.com/maps/search/?api=1&query=${addressQuery}`;
  byId("venue-map").src = `https://maps.google.com/maps?q=${addressQuery}&output=embed`;

  const timeline = byId("timeline");
  const timelineSection = byId("programa");
  if (timelineSection) {
    if (reduceMotion || !("IntersectionObserver" in window)) {
      timelineSection.classList.add("is-open");
    } else {
      const curtainObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            timelineSection.classList.add("is-open");
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.18 });
      curtainObserver.observe(timelineSection);
    }
  }
  config.schedule.forEach((item, index) => {
    const entry = document.createElement("article");
    entry.className = "timeline-item";
    entry.setAttribute("role", "listitem");
    entry.style.setProperty("--timeline-delay", `${Math.min(index, 3) * 145}ms`);
    const time = document.createElement("time");
    time.dateTime = item.time;
    time.textContent = item.time;
    const dot = document.createElement("span");
    dot.className = "timeline-dot";
    dot.setAttribute("aria-hidden", "true");
    const title = document.createElement("h3");
    title.textContent = item.title;
    const copy = document.createElement("div");
    copy.className = "timeline-copy";
    copy.append(time, title);
    entry.append(dot, copy);
    if (item.description) {
      const description = document.createElement("p");
      description.textContent = item.description;
      copy.append(description);
    }
    timeline.append(entry);
  });

  const timelineItems = [...timeline.querySelectorAll(".timeline-item")];
  if (reduceMotion || !("IntersectionObserver" in window)) {
    timelineItems.forEach((item) => item.classList.add("is-visible"));
  } else {
    const timelineObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.42, rootMargin: "0px 0px -30% 0px" });
    timelineItems.forEach((item) => timelineObserver.observe(item));
  }

  if (!reduceMotion && timelineItems.length) {
    let timelineParallaxQueued = false;
    const updateTimelineParallax = () => {
      const viewportCenter = window.innerHeight / 2;
      timelineItems.forEach((item) => {
        const copy = item.querySelector(".timeline-copy");
        if (!copy) return;
        const bounds = item.getBoundingClientRect();
        const offset = Math.max(-18, Math.min(18, (bounds.top + bounds.height / 2 - viewportCenter) * 0.035));
        copy.style.setProperty("--timeline-parallax-y", `${offset}px`);
      });
      timelineParallaxQueued = false;
    };
    window.addEventListener("scroll", () => {
      if (!timelineParallaxQueued) {
        window.requestAnimationFrame(updateTimelineParallax);
        timelineParallaxQueued = true;
      }
    }, { passive: true });
    window.addEventListener("resize", updateTimelineParallax);
    updateTimelineParallax();
  }

  const updateCountdown = () => {
    const remaining = weddingDate.getTime() - Date.now();
    if (remaining <= 0) {
      byId("count-days").textContent = "000";
      byId("count-hours").textContent = "00";
      byId("count-minutes").textContent = "00";
      byId("count-seconds").textContent = "00";
      byId("countdown-caption").textContent = "¡Hoy es el gran día!";
      return;
    }
    const seconds = Math.floor(remaining / 1000);
    byId("count-days").textContent = String(Math.floor(seconds / 86400)).padStart(3, "0");
    byId("count-hours").textContent = String(Math.floor((seconds % 86400) / 3600)).padStart(2, "0");
    byId("count-minutes").textContent = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const secondsElement = byId("count-seconds");
    const nextSeconds = String(seconds % 60).padStart(2, "0");
    if (secondsElement.textContent !== nextSeconds) {
      secondsElement.textContent = nextSeconds;
      if (!reduceMotion) {
        secondsElement.classList.remove("countdown-tick");
        void secondsElement.offsetWidth;
        secondsElement.classList.add("countdown-tick");
      }
    }
  };
  updateCountdown();
  window.setInterval(updateCountdown, 1000);

  const music = byId("background-music");
  const musicButton = byId("music-toggle");
  const musicLabel = byId("music-label");
  const musicStatus = byId("music-status");
  const showMusicError = () => {
    musicButton.setAttribute("aria-pressed", "false");
    musicLabel.textContent = "Audio no disponible";
    musicStatus.textContent = `No se pudo reproducir ${config.musicFile}. Comprueba que el archivo exista y que sea un MP3 válido.`;
  };
  const handleMusicPlaybackError = (error) => {
    if (error.name === "NotAllowedError") {
      musicButton.setAttribute("aria-pressed", "false");
      musicLabel.textContent = "Toca para escuchar";
      musicStatus.textContent = "Tu navegador bloquea la reproducción automática. Pulsa el botón para escuchar la canción.";
      return;
    }
    showMusicError();
    console.error("No se pudo reproducir la canción configurada.", error);
  };
  const startMusic = () => {
    music.play().catch(handleMusicPlaybackError);
  };
  music.src = config.musicFile;
  music.addEventListener("error", () => {
    showMusicError();
    console.error(`No se pudo cargar el archivo de audio: ${config.musicFile}.`, music.error);
  });
  music.addEventListener("play", () => {
    musicButton.setAttribute("aria-pressed", "true");
    musicLabel.textContent = "Pausar música";
    musicStatus.textContent = "";
  });
  music.addEventListener("pause", () => {
    musicButton.setAttribute("aria-pressed", "false");
    musicLabel.textContent = "Nuestra canción";
  });
  musicButton.addEventListener("click", () => {
    if (music.paused) {
      startMusic();
    } else {
      music.pause();
    }
  });
  music.addEventListener("ended", () => {
    musicButton.setAttribute("aria-pressed", "false");
    musicLabel.textContent = "Nuestra canción";
    musicStatus.textContent = "";
  });
  startMusic();

  if (config.galleryUrl) {
    const qr = byId("gallery-qr");
    qr.src = config.galleryQrImage;
    byId("gallery-link").href = config.galleryUrl;
    byId("gallery-link").hidden = false;
    qr.hidden = false;
    byId("qr-placeholder").hidden = true;
    byId("gallery-status").textContent = "Escanea el código para abrir la carpeta de fotos";
  }

  byId("rsvp-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const whatsappNumber = String(config.whatsappNumber || "").replace(/\D/g, "");
    if (!/^\d{8,15}$/.test(whatsappNumber)) {
      byId("rsvp-message").textContent = "El número de WhatsApp no está configurado correctamente. Contacta con la pareja.";
      return;
    }
    const guestName = String(form.get("guestName") || "").trim();
    const attendance = String(form.get("attendance") || "");
    const bus = String(form.get("bus") || "");
    const notes = String(form.get("notes") || "").trim() || "Sin comentarios";
    const message = [
      `Confirmación para la boda de ${config.couple.first} y ${config.couple.second}`,
      `Nombre: ${guestName}`,
      `Asistencia: ${attendance}`,
      `Autobús: ${bus}`,
      `Mensaje: ${notes}`
    ].join("\n");
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    byId("rsvp-message").textContent = "Revisa el mensaje en WhatsApp y pulsa «Enviar» para confirmar.";
    const whatsappWindow = window.open(whatsappUrl, "_blank");
    if (whatsappWindow) whatsappWindow.opener = null;
    else window.location.href = whatsappUrl;
  });

})();
