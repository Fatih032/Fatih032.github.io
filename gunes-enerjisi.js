const menuToggle = document.querySelector(".menu-toggle");
const primaryNav = document.querySelector("#primary-nav");

menuToggle.addEventListener("click", () => {
    const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isExpanded));
    primaryNav.classList.toggle("is-open", !isExpanded);
});

primaryNav.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
        menuToggle.setAttribute("aria-expanded", "false");
        primaryNav.classList.remove("is-open");
    }
});

const calculator = document.querySelector("#solar-calculator");
const systemSize = document.querySelector("#system-size");
const panelCount = document.querySelector("#panel-count");

calculator.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!calculator.reportValidity()) {
        return;
    }

    const monthlyUsage = Number(calculator.elements.monthlyUsage.value);
    const sunHours = Number(calculator.elements.sunHours.value);
    const panelPower = Number(calculator.elements.panelPower.value);
    const estimatedKw = monthlyUsage / (30 * sunHours * 0.8);
    const estimatedPanels = Math.ceil(estimatedKw * 1000 / panelPower);

    if (![monthlyUsage, sunHours, panelPower, estimatedKw, estimatedPanels].every(Number.isFinite) ||
        monthlyUsage <= 0 || sunHours <= 0 || panelPower <= 0) {
        return;
    }

    systemSize.innerHTML = `${estimatedKw.toLocaleString("tr-TR", { maximumFractionDigits: 2 })} <span>kWp</span>`;
    panelCount.innerHTML = `${estimatedPanels.toLocaleString("tr-TR")} <span>panel</span>`;
});

const quoteForm = document.querySelector("#quote-form");
const formStatus = document.querySelector("#form-status");

quoteForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!quoteForm.reportValidity()) {
        return;
    }

    const formData = new FormData(quoteForm);
    const subject = `Güneş enerjisi proje talebi - ${formData.get("city")}`;
    const body = [
        `Ad: ${formData.get("name")}`,
        `İletişim: ${formData.get("contact")}`,
        `Şehir: ${formData.get("city")}`,
        `Proje türü: ${formData.get("projectType")}`,
        "",
        "Proje detayları:",
        formData.get("details"),
    ].join("\n");
    const mailto = `mailto:fatih03uyanik@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    formStatus.textContent = "E-posta taslağı açılıyor. Açılmazsa yukarıdaki e-posta adresini kullanabilirsiniz.";
    window.location.href = mailto;
});
