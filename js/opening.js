(() => {
  "use strict";

  const opening = document.getElementById("invitation-opening");
  const invitation = document.getElementById("invitation");
  const envelope = document.getElementById("opening-envelope");
  const withMusicButton = document.getElementById("opening-with-music");
  const withoutMusicButton = document.getElementById("opening-without-music");
  const musicStatus = document.getElementById("opening-music-status");
  const music = document.getElementById("background-music");
  const storageKey = "wedding-invitation-opened-v2";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!opening || !invitation || !envelope || !withMusicButton || !withoutMusicButton) return;

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
  withMusicButton.focus({ preventScroll: true });

  let state = "closed";
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

  const startOpening = (withMusic) => {
    if (state !== "closed") return;
    if (withMusic && music) {
      music.play().catch((error) => {
        if (error.name === "NotAllowedError") {
          if (musicStatus) {
            musicStatus.textContent = "El navegador no ha permitido reproducir la música. Puedes activarla con el botón de música al entrar.";
          }
          return;
        }
        console.error("No se pudo reproducir la canción configurada.", error);
      });
    } else if (music) {
      music.pause();
    }
    rememberVisit();
    state = "opening";
    envelope.classList.add("is-opening");
    window.setTimeout(closeOpening, reduceMotion ? 180 : 2380);
  };

  withMusicButton.addEventListener("click", () => startOpening(true));
  withoutMusicButton.addEventListener("click", () => startOpening(false));

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
