/* SGR Hospital: send every Elementor form (page + popup) to a Google Sheet.
   Paste your Google Apps Script Web App URL below (ends in /exec). */
var SGR_SHEET_URL = "PASTE_YOUR_APPS_SCRIPT_URL_HERE";

(function () {
  var NAMES = { field_724fc34: "Treatment", field_d9aeacf: "Mobile number" };
  function labelFor(form, el) {
    var key = el.name.replace(/^form_fields\[|\]$/g, "");
    if (NAMES[key]) return NAMES[key];
    if (el.tagName === "SELECT" && /^field_/.test(key)) return "Treatment";
    var lab = el.id && form.querySelector('label[for="' + el.id + '"]');
    var t = (lab && lab.textContent.trim()) || el.getAttribute("placeholder") || el.name;
    t = t.replace(/^form_fields\[|\]$/g, "").trim();
    return t.charAt(0).toUpperCase() + t.slice(1);
  }
  function message(form, ok, text) {
    var old = form.querySelector(".sgr-form-msg"); if (old) old.remove();
    var d = document.createElement("div");
    d.className = "sgr-form-msg elementor-message " + (ok ? "elementor-message-success" : "elementor-message-danger");
    d.setAttribute("role", "alert");
    d.textContent = text;
    form.appendChild(d);
  }
  document.addEventListener("submit", function (ev) {
    var form = ev.target;
    if (!form.classList || !form.classList.contains("elementor-form")) return;
    ev.preventDefault(); ev.stopImmediatePropagation();
    if (form.reportValidity && !form.reportValidity()) return;
    if (!/^https:\/\/script\.google\.com\//.test(SGR_SHEET_URL) && !/^http:\/\/127\.0\.0\.1/.test(SGR_SHEET_URL)) {
      message(form, false, "Form not connected yet. Please call us instead."); console.warn("SGR_SHEET_URL is not set in sheets-form.js"); return;
    }
    var data = new URLSearchParams();
    form.querySelectorAll("input, select, textarea").forEach(function (el) {
      if (!el.name || el.type === "hidden" || el.type === "submit") return;
      if ((el.type === "checkbox" || el.type === "radio") && !el.checked) return;
      data.append(labelFor(form, el), el.value);
    });
    data.append("Form", form.closest(".elementor-location-popup") ? "Popup - " + (form.getAttribute("name") || "") : (form.getAttribute("name") || "Form"));
    data.append("Page", document.title);
    data.append("URL", location.href);
    var btn = form.querySelector('[type="submit"]'); if (btn) btn.disabled = true;
    fetch(SGR_SHEET_URL, { method: "POST", mode: "no-cors", body: data })
      .then(function () { form.reset(); message(form, true, "Thank you! We will call you back shortly."); })
      .catch(function () { message(form, false, "Sorry, something went wrong. Please try again or call us."); })
      .finally(function () { if (btn) btn.disabled = false; });
  }, true);
})();
