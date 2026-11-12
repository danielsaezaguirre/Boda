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

  const rosemaryLayer = byId("rosemary-layer");
  if (rosemaryLayer && !reduceMotion) {
    const cornerPairs = [
      ["corner-top-left", "corner-bottom-right"],
      ["corner-top-right", "corner-bottom-left"]
    ];
    let cornerPairIndex = 0;
    const showRosemaryCorners = () => {
      rosemaryLayer.querySelectorAll(".rosemary-scroll-sprig").forEach((sprig) => sprig.remove());
      cornerPairs[cornerPairIndex++ % cornerPairs.length].forEach((corner) => {
        const sprig = document.createElement("img");
        sprig.className = `rosemary-scroll-sprig ${corner}`;
        sprig.src = "assets/rosemary-line.svg";
        sprig.alt = "";
        sprig.draggable = false;
        sprig.addEventListener("animationend", () => sprig.remove(), { once: true });
        rosemaryLayer.append(sprig);
      });
    };
    let lastRosemaryScroll = window.scrollY;
    let rosemaryScrollQueued = false;
    window.addEventListener("scroll", () => {
      if (rosemaryScrollQueued) return;
      rosemaryScrollQueued = true;
      window.requestAnimationFrame(() => {
        const currentScroll = window.scrollY;
        const distance = currentScroll - lastRosemaryScroll;
        if (Math.abs(distance) >= 320) {
          showRosemaryCorners();
          lastRosemaryScroll = currentScroll;
        }
        rosemaryScrollQueued = false;
      });
    }, { passive: true });
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

  document.querySelectorAll(".section-heading, .celebration-copy, .celebration-map, .timeline, .menu-item, .rsvp-intro, .rsvp-form, .photos-copy, .qr-card, .quote-card").forEach((item, index) => {
    item.classList.add("reveal");
    item.style.setProperty("--reveal-delay", `${(index % 4) * 75}ms`);
  });
  const revealItems = document.querySelectorAll(".reveal");
  const celebrationSection = byId("celebracion");
  const storySection = document.querySelector(".story-section");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
    celebrationSection?.classList.add("is-visible");
    storySection?.classList.add("is-bloomed");
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
    if (storySection) {
      const flowerObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-bloomed");
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12 });
      flowerObserver.observe(storySection);
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
  const showMusicError = () => {
    musicButton.setAttribute("aria-pressed", "false");
    byId("music-label").textContent = "Audio no disponible";
    byId("music-status").textContent = `No se pudo reproducir ${config.musicFile}. Comprueba que el archivo exista y que sea un MP3 válido.`;
  };
  music.src = config.musicFile;
  music.addEventListener("error", showMusicError);
  let autoplayResumePending = false;
  const resumeAutoplayOnInteraction = (event) => {
    if (!autoplayResumePending) return;
    if (event.target instanceof Element && event.target.closest("#music-toggle")) return;
    autoplayResumePending = false;
    document.removeEventListener("pointerdown", tryResumeAutoplay, true);
    document.removeEventListener("touchstart", tryResumeAutoplay, true);
    document.removeEventListener("keydown", tryResumeAutoplay, true);
    music.play().catch(() => {});
  };
  const tryResumeAutoplay = (event) => resumeAutoplayOnInteraction(event);
  music.addEventListener("play", () => {
    musicButton.setAttribute("aria-pressed", "true");
    byId("music-label").textContent = "Pausar música";
    byId("music-status").textContent = "";
  });
  music.addEventListener("pause", () => {
    musicButton.setAttribute("aria-pressed", "false");
    byId("music-label").textContent = "Nuestra canción";
  });
  musicButton.addEventListener("click", async () => {
    autoplayResumePending = false;
    document.removeEventListener("pointerdown", tryResumeAutoplay, true);
    document.removeEventListener("touchstart", tryResumeAutoplay, true);
    document.removeEventListener("keydown", tryResumeAutoplay, true);
    if (music.paused) {
      try {
        await music.play();
        musicButton.setAttribute("aria-pressed", "true");
        byId("music-label").textContent = "Pausar música";
        byId("music-status").textContent = "";
      } catch (error) {
        showMusicError();
        console.error("No se pudo reproducir la canción configurada.", error);
      }
    } else {
      music.pause();
      musicButton.setAttribute("aria-pressed", "false");
      byId("music-label").textContent = "Nuestra canción";
      byId("music-status").textContent = "";
    }
  });
  music.addEventListener("ended", () => {
    musicButton.setAttribute("aria-pressed", "false");
    byId("music-label").textContent = "Nuestra canción";
    byId("music-status").textContent = "";
  });
  music.play().catch((error) => {
    if (error.name === "NotAllowedError") {
      autoplayResumePending = true;
      document.addEventListener("pointerdown", tryResumeAutoplay, { once: true, capture: true });
      document.addEventListener("touchstart", tryResumeAutoplay, { once: true, capture: true, passive: true });
      document.addEventListener("keydown", tryResumeAutoplay, { once: true, capture: true });
      return;
    }
    showMusicError();
  });

  if (config.galleryUrl) {
    const qr = byId("gallery-qr");
    qr.src = config.galleryQrImage;
    byId("gallery-link").href = config.galleryUrl;
    byId("gallery-link").hidden = false;
    qr.hidden = false;
    byId("qr-placeholder").hidden = true;
    byId("gallery-status").textContent = "Escanea el código para abrir la carpeta de fotos";
  }

  const supabaseConfigured = Boolean(config.supabaseUrl && config.supabaseAnonKey);
  const supabaseUrl = config.supabaseUrl.replace(/\/+$/, "");

  const companionSelect = byId("companion-select");
  const companionTrigger = byId("companion-trigger");
  const companionOptions = byId("companion-options");
  const closeCompanionOptions = () => {
    companionTrigger.setAttribute("aria-expanded", "false");
    companionOptions.classList.remove("is-open");
    window.setTimeout(() => {
      if (companionTrigger.getAttribute("aria-expanded") === "false") companionOptions.hidden = true;
    }, 180);
  };
  companionTrigger.addEventListener("click", () => {
    const isOpen = companionTrigger.getAttribute("aria-expanded") === "true";
    if (isOpen) {
      closeCompanionOptions();
      return;
    }
    companionOptions.hidden = false;
    requestAnimationFrame(() => companionOptions.classList.add("is-open"));
    companionTrigger.setAttribute("aria-expanded", "true");
  });
  companionOptions.querySelectorAll("[data-value]").forEach((option) => {
    option.addEventListener("click", () => {
      byId("guest-companions").value = option.dataset.value;
      byId("companion-value").textContent = option.textContent;
      companionOptions.querySelectorAll("[role='option']").forEach((item) => {
        item.setAttribute("aria-selected", String(item === option));
      });
      closeCompanionOptions();
      companionTrigger.focus();
    });
  });
  document.addEventListener("click", (event) => {
    if (!companionSelect.contains(event.target)) closeCompanionOptions();
  });
  companionTrigger.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeCompanionOptions();
  });
  byId("rsvp-form").addEventListener("reset", () => {
    byId("guest-companions").value = "1";
    byId("companion-value").textContent = "1 persona";
    companionOptions.querySelectorAll("[role='option']").forEach((option, index) => {
      option.setAttribute("aria-selected", String(index === 0));
    });
    closeCompanionOptions();
  });

  const supabaseRequest = async (path, { method = "GET", body, prefer } = {}) => {
    const headers = {
      apikey: config.supabaseAnonKey,
      Authorization: `Bearer ${config.supabaseAnonKey}`
    };
    if (body !== undefined) headers["Content-Type"] = "application/json";
    if (prefer) headers.Prefer = prefer;

    const response = await fetch(`${supabaseUrl}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body)
    });
    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(errorBody.message || errorBody.msg || `HTTP ${response.status}`);
    }
    if (response.status === 204) return null;
    return response.json();
  };

  byId("rsvp-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!supabaseConfigured) {
      byId("rsvp-message").textContent = "La pareja todavía tiene que configurar la lista privada de confirmaciones.";
      return;
    }
    const form = new FormData(event.currentTarget);
    const submitButton = event.currentTarget.querySelector("button[type='submit']");
    submitButton.disabled = true;
    byId("rsvp-message").textContent = "Enviando tu confirmación…";
    try {
      await supabaseRequest("/rest/v1/wedding_rsvps", {
        method: "POST",
        body: {
          guest_name: form.get("guestName"),
          guest_email: form.get("guestEmail"),
          attending: form.get("attendance") === "Sí, allí estaré",
          companions: Number(form.get("companions")),
          notes: form.get("notes") || ""
        },
        prefer: "return=minimal"
      });
      event.currentTarget.reset();
      byId("rsvp-message").textContent = "¡Gracias! Hemos recibido tu confirmación.";
    } catch (error) {
      const status = error.message.match(/^HTTP \d+/);
      byId("rsvp-message").textContent = status
        ? `No se pudo guardar la confirmación (${status[0]}). Comprueba la configuración e inténtalo de nuevo.`
        : "No se pudo guardar la confirmación. Comprueba tu conexión e inténtalo de nuevo.";
    } finally {
      submitButton.disabled = false;
    }
  });

})();
