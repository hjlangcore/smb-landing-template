/* Front-end preview only. Nothing is sent to a server.
   Replace the submit handler when you connect Formspree,
   a Cloudflare Worker, or another form backend. */

const year = document.querySelector("#year");
if (year) {
  year.textContent = String(new Date().getFullYear());
}

const form = document.querySelector("#contact-form");
const status = document.querySelector("#form-status");

if (form && status) {
  form.addEventListener("invalid", () => {
    form.classList.add("was-validated");
  }, true);

  form.addEventListener("input", () => {
    status.hidden = true;
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    form.classList.add("was-validated");

    if (!form.checkValidity()) {
      form.reportValidity();
      const firstInvalid = form.querySelector(":invalid");
      if (firstInvalid instanceof HTMLElement) {
        firstInvalid.focus();
      }
      status.hidden = true;
      return;
    }

    status.hidden = false;
    status.textContent =
      "Nothing was sent. This preview only checks the form in your browser. Connect Formspree, a Cloudflare Worker, or another form service before launch — or use the email link. Please don't submit real personal details.";
    form.reset();
    form.classList.remove("was-validated");
    status.focus();
  });
}
