const eventTime = new Date("2026-09-11T00:00:00+06:00").getTime();
const video = document.querySelector(".video-main");
const gate = document.querySelector(".gate");
const ninja = document.querySelector(".ninja-pass");
const soundButton = document.querySelector(".sound-control");

function updateCountdown() {
  const remaining = Math.max(0, eventTime - Date.now());
  const values = {
    days: Math.floor(remaining / 86400000),
    hours: Math.floor((remaining % 86400000) / 3600000),
    minutes: Math.floor((remaining % 3600000) / 60000),
    seconds: Math.floor((remaining % 60000) / 1000),
  };
  Object.entries(values).forEach(([key, value]) => {
    const target = document.querySelector(`[data-countdown="${key}"]`);
    if (target) target.textContent = String(value).padStart(2, "0");
  });
}

async function enterSite(muted) {
  video.currentTime = 0;
  video.muted = muted;
  video.volume = 0.3;
  try { await video.play(); } catch { video.muted = true; }
  gate.classList.add("is-leaving");
  setTimeout(() => gate.remove(), 720);
  if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
    setTimeout(() => ninja.classList.add("is-running"), 360);
  }
  updateSoundLabel();
}

function updateSoundLabel() {
  const enabled = !video.muted;
  soundButton.classList.toggle("is-on", enabled);
  soundButton.setAttribute("aria-pressed", String(enabled));
  soundButton.textContent = enabled ? "Sound on" : "Sound off";
}

document.querySelector("[data-enter-sound]").addEventListener("click", () => enterSite(false));
document.querySelector("[data-enter-muted]").addEventListener("click", () => enterSite(true));
soundButton.addEventListener("click", async () => {
  video.muted = !video.muted;
  video.volume = 0.3;
  if (!video.muted) try { await video.play(); } catch { video.muted = true; }
  updateSoundLabel();
});

const form = document.querySelector("#invitation-form");

function submitViaHiddenIframe(endpoint, params) {
  const iframeName = "cityscape-form-target";
  let iframe = document.getElementById(iframeName);
  if (!iframe) {
    iframe = document.createElement("iframe");
    iframe.id = iframeName;
    iframe.name = iframeName;
    iframe.style.display = "none";
    iframe.setAttribute("aria-hidden", "true");
    document.body.appendChild(iframe);
  }

  const hiddenForm = document.createElement("form");
  hiddenForm.method = "POST";
  hiddenForm.action = endpoint;
  hiddenForm.target = iframeName;
  hiddenForm.style.display = "none";

  for (const [key, value] of params.entries()) {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = key;
    input.value = value;
    hiddenForm.appendChild(input);
  }

  document.body.appendChild(hiddenForm);
  hiddenForm.submit();
  hiddenForm.remove();
}

function showSuccessState(reference) {
  document.querySelector(".form-card").innerHTML = `<div class="success-state" role="status"><span class="success-kicker">Application received</span><h3>You're on the radar.</h3><p>Keep this private reference:</p><strong>${reference}</strong><p>Our team will contact selected guests using the details submitted.</p></div>`;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const error = document.querySelector(".form-error");
  const submit = form.querySelector("button[type=submit]");
  error.hidden = true;
  submit.disabled = true;
  submit.textContent = "Sending…";
  const data = Object.fromEntries(new FormData(form));
  const endpoint = window.CITYSCAPE_FORM_ENDPOINT;
  const reference = `CITY-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  const payload = new URLSearchParams({ ...data, reference });

  try {
    if (!endpoint) throw new Error("Registration is not configured yet. Please try again later.");

    try {
      await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
        body: payload,
      });
      showSuccessState(reference);
      return;
    } catch (fetchError) {
      submitViaHiddenIframe(endpoint, payload);
      setTimeout(() => showSuccessState(reference), 1200);
      return;
    }
  } catch (reason) {
    error.textContent = reason instanceof Error ? reason.message : "We could not save your application. Please try again.";
    error.hidden = false;
    submit.disabled = false;
    submit.textContent = "Submit application";
  }
});

updateCountdown();
setInterval(updateCountdown, 1000);
