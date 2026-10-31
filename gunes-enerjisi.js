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
const dailyUsage = document.querySelector("#daily-usage");
const systemSize = document.querySelector("#system-size");
const installedCapacity = document.querySelector("#installed-capacity");
const panelCount = document.querySelector("#panel-count");
const arrayLayout = document.querySelector("#array-layout");

calculator.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!calculator.reportValidity()) {
        return;
    }

    const monthlyUsage = Number(calculator.elements.monthlyUsage.value);
    const panelPower = Number(calculator.elements.panelPower.value);
    const estimatedDailyUsage = monthlyUsage / 30;
    const estimatedKw = estimatedDailyUsage / 2;
    const requiredPanels = Math.ceil(estimatedKw * 1000 / panelPower);
    const estimatedPanels = Math.ceil(requiredPanels / 2) * 2;
    const panelsPerArray = estimatedPanels / 2;
    const actualInstalledKw = estimatedPanels * panelPower / 1000;

    if (![monthlyUsage, panelPower, estimatedDailyUsage, estimatedKw, estimatedPanels, actualInstalledKw].every(Number.isFinite) ||
        monthlyUsage <= 0 || panelPower <= 0) {
        return;
    }

    dailyUsage.innerHTML = `${estimatedDailyUsage.toLocaleString("tr-TR", { maximumFractionDigits: 2 })} <span>kWh/gün</span>`;
    systemSize.innerHTML = `${estimatedKw.toLocaleString("tr-TR", { maximumFractionDigits: 2 })} <span>kWp</span>`;
    installedCapacity.innerHTML = `${actualInstalledKw.toLocaleString("tr-TR", { maximumFractionDigits: 2 })} <span>kWp</span>`;
    panelCount.innerHTML = `${estimatedPanels.toLocaleString("tr-TR")} <span>panel</span>`;
    arrayLayout.textContent = `Dizi düzeni: 2 × ${panelsPerArray.toLocaleString("tr-TR")} panel`;
});

const quoteForm = document.querySelector("#quote-form");
const formStatus = document.querySelector("#form-status");

document.querySelector("#package-quote-link").addEventListener("click", () => {
    quoteForm.elements.projectType.value = "Konut hibrit paketi (6,2 kW / 6 kWp / 5 kWh)";
});

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
