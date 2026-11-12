(() => {
  "use strict";

  const opening = document.getElementById("invitation-opening");
  const invitation = document.getElementById("invitation");
  const envelope = document.getElementById("opening-envelope");
  const openButton = document.getElementById("opening-open");
  const skipButton = document.getElementById("opening-skip");
  const music = document.getElementById("background-music");
  const storageKey = "wedding-invitation-opened-v1";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!opening || !invitation || !envelope || !openButton || !skipButton) return;

  let alreadyOpened = false;
  try {
    alreadyOpened = window.sessionStorage.getItem(storageKey) === "yes";
  } catch (error) {
    alreadyOpened = false;
  }
  if (alreadyOpened) {
    opening.remove();
    return;
  }

  invitation.inert = true;
  invitation.setAttribute("aria-hidden", "true");
  document.body.classList.add("opening-locked");
  openButton.focus({ preventScroll: true });

  let state = "closed";
  const startMusicFromGesture = () => {
    if (!music) return;
    music.play().catch((error) => {
      if (error.name !== "NotAllowedError") {
        console.error("No se pudo reproducir la canción configurada.", error);
      }
    });
  };
  const rememberVisit = () => {
    try {
      window.sessionStorage.setItem(storageKey, "yes");
    } catch (error) {
      // The overlay is removed in this page session even when storage is unavailable.
    }
  };

  const restoreInvitation = () => {
    if (state === "done") return;
    state = "done";
    invitation.inert = false;
    invitation.removeAttribute("aria-hidden");
    document.body.classList.remove("opening-locked");
    opening.remove();
    const firstLink = invitation.querySelector(".wordmark");
    if (firstLink) firstLink.focus({ preventScroll: true });
  };

  const closeOpening = () => {
    if (state === "done" || state === "closing") return;
    rememberVisit();
    state = "closing";
    opening.classList.add("is-closing");
    window.setTimeout(restoreInvitation, 720);
  };

  const startOpening = () => {
    if (state !== "closed") return;
    rememberVisit();
    state = "opening";
    envelope.classList.add("is-opening");
    window.setTimeout(closeOpening, reduceMotion ? 180 : 2380);
  };

  openButton.addEventListener("click", startMusicFromGesture);
  openButton.addEventListener("click", startOpening);
  skipButton.addEventListener("click", startMusicFromGesture);
  skipButton.addEventListener("click", closeOpening);

  opening.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      closeOpening();
      return;
    }
    if (event.key !== "Tab") return;
    const focusable = [...opening.querySelectorAll("button:not(:disabled)")];
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
})();
