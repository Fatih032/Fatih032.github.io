const energySources = [
    { id: "solar", name: "Güneş", color: "#f3ba68" },
    { id: "wind", name: "Rüzgar", color: "#82aaff" },
    { id: "hydro", name: "Hidroelektrik", color: "#67b7e1" },
    { id: "natural-gas", name: "Doğalgaz", color: "#d68be8" },
    { id: "coal", name: "Kömür", color: "#a9b8bf" },
];

const initialLocations = [
    {
        id: "merkez",
        name: "Ankara Merkez",
        description: "Şehir merkezi ve çevresindeki örnek enerji dengesi.",
        sources: {
            solar: [8000, 7000], wind: [2000, 2000], hydro: [0, 0],
            "natural-gas": [10000, 14000], coal: [8000, 18000],
        },
    },
    {
        id: "kizilcahamam",
        name: "Kızılcahamam",
        description: "Kuzey ilçeleri için örnek yenilenebilir üretim senaryosu.",
        sources: {
            solar: [3000, 1000], wind: [4000, 1000], hydro: [8000, 3000],
            "natural-gas": [3000, 3000], coal: [1000, 3000],
        },
    },
    {
        id: "beypazari",
        name: "Beypazarı",
        description: "Batı ilçeleri için örnek rüzgâr ve hidroelektrik senaryosu.",
        sources: {
            solar: [6000, 1000], wind: [8000, 1000], hydro: [5000, 2000],
            "natural-gas": [4000, 3000], coal: [2000, 4000],
        },
    },
    {
        id: "polatli",
        name: "Polatlı",
        description: "Güneybatı ilçeleri için örnek güneş ve rüzgâr senaryosu.",
        sources: {
            solar: [12000, 2000], wind: [7000, 2000], hydro: [1000, 1000],
            "natural-gas": [4000, 4000], coal: [3000, 5000],
        },
    },
    {
        id: "sereflikochisar",
        name: "Şereflikoçhisar",
        description: "Güney ilçeleri için örnek üretim ve tüketim senaryosu.",
        sources: {
            solar: [13000, 7000], wind: [7000, 6000], hydro: [2000, 4000],
            "natural-gas": [15000, 28000], coal: [8000, 18000],
        },
    },
];

const locations = initialLocations.map((location) => ({
    ...location,
    sources: Object.fromEntries(
        Object.entries(location.sources).map(([sourceId, values]) => [
            sourceId,
            { production: values[0], consumption: values[1] },
        ]),
    ),
}));
const numberFormat = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 });
const rows = document.querySelector("#location-sources");
const errorMessage = document.querySelector("#input-error");
const totalProduction = document.querySelector("#total-production");
const totalConsumption = document.querySelector("#total-consumption");
const energyBalance = document.querySelector("#energy-balance");
const balanceLabel = document.querySelector("#balance-label");
const coverageRate = document.querySelector("#coverage-rate");
const productionBar = document.querySelector("#production-bar");
const consumptionBar = document.querySelector("#consumption-bar");
const productionChartValue = document.querySelector("#production-chart-value");
const consumptionChartValue = document.querySelector("#consumption-chart-value");
const balanceCard = document.querySelector(".balance-card");
const selectedLocationName = document.querySelector("#selected-location-name");
const locationDescription = document.querySelector("#location-description");
const locationProduction = document.querySelector("#location-production");
const locationConsumption = document.querySelector("#location-consumption");
const solarChart = document.querySelector("#solar-chart");
const solarArea = document.querySelector("#solar-area");
const solarLine = document.querySelector("#solar-line");
const selectedHourLine = document.querySelector("#selected-hour-line");
const selectedHourPoint = document.querySelector("#selected-hour-point");
const hourInput = document.querySelector("#simulation-hour");
const capacityInput = document.querySelector("#solar-capacity");
const irradianceInput = document.querySelector("#solar-irradiance");
const demandInput = document.querySelector("#hourly-demand");
const solarOutputFormat = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 1 });
let selectedLocationId = "merkez";

const chart = { left: 58, right: 730, top: 35, bottom: 255, hours: 24 };
const sunrise = 6;
const sunset = 19;

function solarFactor(hour) {
    if (hour < sunrise || hour > sunset) {
        return 0;
    }

    const daylightProgress = (hour - sunrise) / (sunset - sunrise);
    return 4 * daylightProgress * (1 - daylightProgress);
}

function solarPower(hour, capacity, irradiance) {
    return capacity * (irradiance / 100) * solarFactor(hour);
}

function formatHour(hour) {
    return `${String(hour).padStart(2, "0")}:00`;
}

function updateSolarSimulation() {
    const capacity = Number(capacityInput.value);
    const irradiance = Number(irradianceInput.value);
    const demand = Number(demandInput.value);
    const selectedHour = Number(hourInput.value);
    const effectivePeak = capacity * irradiance / 100;
    const axisMaximum = Math.max(10, Math.ceil(effectivePeak / 10) * 10);
    const xForHour = (hour) => chart.left + (hour / chart.hours) * (chart.right - chart.left);
    const yForPower = (power) => chart.bottom - (power / axisMaximum) * (chart.bottom - chart.top);
    const points = [];

    for (let hour = 0; hour <= chart.hours; hour += 0.25) {
        points.push([xForHour(hour), yForPower(solarPower(hour, capacity, irradiance))]);
    }

    const linePath = points
        .map(([x, y], index) => `${index === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`)
        .join(" ");
    solarLine.setAttribute("d", linePath);
    solarArea.setAttribute(
        "d",
        `${linePath} L${chart.right} ${chart.bottom} L${chart.left} ${chart.bottom} Z`,
    );

    for (const [percent, labelId] of [
        [1, "y-label-100"],
        [0.75, "y-label-75"],
        [0.5, "y-label-50"],
        [0.25, "y-label-25"],
    ]) {
        document.querySelector(`#${labelId}`).textContent =
            `${solarOutputFormat.format(axisMaximum * percent)} MW`;
    }

    const intervalStart = selectedHour;
    const intervalEnd = selectedHour + 1;
    const intervalSamples = 20;
    let hourlySolarEnergy = 0;
    for (let sample = 0; sample < intervalSamples; sample += 1) {
        const hour = intervalStart + (sample + 0.5) / intervalSamples;
        hourlySolarEnergy += solarPower(hour, capacity, irradiance) / intervalSamples;
    }

    let dailySolarEnergy = 0;
    const dailySamples = 480;
    for (let sample = 0; sample < dailySamples; sample += 1) {
        const hour = (sample + 0.5) / 20;
        dailySolarEnergy += solarPower(hour, capacity, irradiance) / 20;
    }

    const markerHour = selectedHour + 0.5;
    const markerX = xForHour(markerHour);
    const markerY = yForPower(solarPower(markerHour, capacity, irradiance));
    selectedHourLine.setAttribute("x1", markerX);
    selectedHourLine.setAttribute("x2", markerX);
    selectedHourPoint.setAttribute("cx", markerX);
    selectedHourPoint.setAttribute("cy", markerY);
    solarChart.setAttribute(
        "aria-label",
        `Gün doğumu 06:00, gün batımı 19:00. Seçili saat ${formatHour(selectedHour)}. Bu saatte güneş üretimi ${solarOutputFormat.format(hourlySolarEnergy)} MWh.`,
    );

    const gridImport = Math.max(demand - hourlySolarEnergy, 0);
    const gridExport = Math.max(hourlySolarEnergy - demand, 0);
    const intervalLabel = `${formatHour(selectedHour)}–${formatHour((selectedHour + 1) % 24)}`;
    const solarShare = demand === 0 ? 0 : Math.min(hourlySolarEnergy / demand, 1) * 100;
    document.querySelector("#solar-chart-peak").textContent =
        `${solarOutputFormat.format(effectivePeak)} MW`;
    document.querySelector("#daily-solar-energy").textContent =
        solarOutputFormat.format(dailySolarEnergy);
    document.querySelector("#solar-capacity-label").textContent = `${capacity} MW`;
    document.querySelector("#solar-irradiance-label").textContent = `%${irradiance}`;
    document.querySelector("#hourly-demand-label").textContent = `${demand} MWh`;
    document.querySelector("#simulation-hour-label").textContent = intervalLabel;
    document.querySelector("#hourly-result-time").textContent = intervalLabel;
    document.querySelector("#hourly-solar-energy").textContent =
        `${solarOutputFormat.format(hourlySolarEnergy)} MWh`;
    document.querySelector("#hourly-consumption").textContent = `${demand} MWh`;

    const flowLabel = document.querySelector("#grid-flow-label");
    const flowValue = document.querySelector("#grid-flow-value");
    const status = document.querySelector("#hourly-status");
    if (gridImport > 0) {
        flowLabel.textContent = "Şebekeden alınan";
        flowValue.textContent = `${solarOutputFormat.format(gridImport)} MWh`;
        status.textContent = hourlySolarEnergy === 0
            ? "Güneş üretimi yok; tüketimin tamamı şebekeden karşılanıyor."
            : `Güneş tüketimin %${solarOutputFormat.format(solarShare)} kadarını karşılıyor; kalan enerji şebekeden alınıyor.`;
        status.classList.remove("is-surplus");
        status.classList.add("is-deficit");
    } else {
        flowLabel.textContent = "Şebekeye aktarılan";
        flowValue.textContent = `${solarOutputFormat.format(gridExport)} MWh`;
        status.textContent = gridExport === 0
            ? "Güneş üretimi bu saatte tüketimi tam karşılıyor."
            : "Üretim tüketimi aşıyor; fazla enerji şebekeye aktarılıyor.";
        status.classList.toggle("is-surplus", gridExport > 0);
        status.classList.remove("is-deficit");
    }

    for (const preset of document.querySelectorAll("[data-irradiance]")) {
        preset.setAttribute(
            "aria-pressed",
            String(Number(preset.dataset.irradiance) === irradiance),
        );
    }
}

function getLocation(locationId) {
    return locations.find((location) => location.id === locationId);
}

function renderLocation() {
    const location = getLocation(selectedLocationId);
    selectedLocationName.textContent = location.name;
    locationDescription.textContent = location.description;
    rows.replaceChildren();

    for (const source of energySources) {
        const values = location.sources[source.id];
        const row = document.createElement("div");
        row.className = "source-row";
        row.innerHTML = `
            <div class="source-row-name">
                <i class="energy-dot" style="background-color: ${source.color}" aria-hidden="true"></i>
                <span>${source.name}</span>
            </div>
            <label>
                <span>Üretim</span>
                <input class="energy-input" id="${location.id}-${source.id}-production" data-location="${location.id}" data-source="${source.id}" data-kind="production" type="number" min="0" max="100000" step="100" value="${values.production}" inputmode="numeric" aria-label="${location.name} ${source.name} üretimi, MWh">
            </label>
            <label>
                <span>Tüketim</span>
                <input class="energy-input" id="${location.id}-${source.id}-consumption" data-location="${location.id}" data-source="${source.id}" data-kind="consumption" type="number" min="0" max="100000" step="100" value="${values.consumption}" inputmode="numeric" aria-label="${location.name} ${source.name} tüketimi, MWh">
            </label>
        `;
        rows.append(row);
    }

    updateSimulation();
}

function updateSimulation() {
    const inputs = [...document.querySelectorAll(".energy-input")];
    const invalidInput = inputs.find((input) => !input.validity.valid || input.value === "");

    if (invalidInput) {
        errorMessage.textContent = "Değerler 0 ile 100.000 MWh arasında olmalı.";
        invalidInput.setAttribute("aria-invalid", "true");
        return;
    }

    errorMessage.textContent = "";
    inputs.forEach((input) => input.removeAttribute("aria-invalid"));

    let production = 0;
    let consumption = 0;

    for (const location of locations) {
        let localProduction = 0;
        let localConsumption = 0;

        for (const source of energySources) {
            const values = location.sources[source.id];
            localProduction += values.production;
            localConsumption += values.consumption;
        }

        production += localProduction;
        consumption += localConsumption;
        const marker = document.querySelector(`[data-location="${location.id}"].map-marker`);
        marker.setAttribute(
            "aria-label",
            `${location.name}: üretim ${numberFormat.format(localProduction)} MWh, tüketim ${numberFormat.format(localConsumption)} MWh. Bölgeyi seç.`,
        );
        marker.querySelector(".marker-halo").setAttribute(
            "r",
            `${14 + Math.round(localProduction / 1000 / 3)}`,
        );
    }

    const selectedLocation = getLocation(selectedLocationId);
    const selectedTotals = Object.values(selectedLocation.sources).reduce(
        (totals, values) => ({
            production: totals.production + values.production,
            consumption: totals.consumption + values.consumption,
        }),
        { production: 0, consumption: 0 },
    );
    const balance = production - consumption;
    const scale = Math.max(production, consumption, 1);
    totalProduction.textContent = numberFormat.format(production);
    totalConsumption.textContent = numberFormat.format(consumption);
    energyBalance.textContent = `${balance > 0 ? "+" : ""}${numberFormat.format(balance)}`;
    balanceLabel.textContent = `MWh ${balance > 0 ? "fazla" : balance < 0 ? "açık" : "denge"}`;
    coverageRate.textContent = consumption === 0
        ? "—"
        : `${(production / consumption * 100).toLocaleString("tr-TR", { maximumFractionDigits: 1 })}%`;
    productionChartValue.textContent = `${numberFormat.format(production)} MWh`;
    consumptionChartValue.textContent = `${numberFormat.format(consumption)} MWh`;
    productionBar.style.width = `${production / scale * 100}%`;
    consumptionBar.style.width = `${consumption / scale * 100}%`;
    balanceCard.classList.toggle("is-surplus", balance >= 0);
    balanceCard.classList.toggle("is-deficit", balance < 0);
    locationProduction.textContent = numberFormat.format(selectedTotals.production);
    locationConsumption.textContent = numberFormat.format(selectedTotals.consumption);

    for (const marker of document.querySelectorAll(".map-marker")) {
        const isSelected = marker.dataset.location === selectedLocationId;
        marker.classList.toggle("is-selected", isSelected);
        marker.setAttribute("aria-pressed", String(isSelected));
    }
}

function selectLocation(locationId) {
    if (locationId === selectedLocationId) {
        return;
    }
    selectedLocationId = locationId;
    renderLocation();
}

document.querySelectorAll(".map-marker").forEach((marker) => {
    marker.addEventListener("click", () => selectLocation(marker.dataset.location));
    marker.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            selectLocation(marker.dataset.location);
        }
    });
});

rows.addEventListener("input", (event) => {
    const input = event.target.closest(".energy-input");
    if (!input) {
        return;
    }
    if (!input.validity.valid || input.value === "") {
        input.setAttribute("aria-invalid", "true");
        errorMessage.textContent = "Değerler 0 ile 100.000 MWh arasında olmalı.";
        return;
    }

    input.removeAttribute("aria-invalid");
    const location = getLocation(input.dataset.location);
    location.sources[input.dataset.source][input.dataset.kind] = Number(input.value);
    updateSimulation();
});

document.querySelector("#reset-simulation").addEventListener("click", () => {
    for (const location of locations) {
        const initialLocation = initialLocations.find((item) => item.id === location.id);
        for (const source of energySources) {
            const values = initialLocation.sources[source.id];
            location.sources[source.id] = { production: values[0], consumption: values[1] };
        }
    }
    renderLocation();
});

for (const input of [hourInput, capacityInput, irradianceInput, demandInput]) {
    input.addEventListener("input", updateSolarSimulation);
}

document.querySelectorAll("[data-irradiance]").forEach((preset) => {
    preset.addEventListener("click", () => {
        irradianceInput.value = preset.dataset.irradiance;
        updateSolarSimulation();
    });
});

renderLocation();
updateSolarSimulation();
