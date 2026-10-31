const pointTypes = {
    production: {
        label: "Üretim noktası",
        description: "Güneş üretimi",
        powerLabel: "Üretim gücü",
        initialPower: 5,
        icon: '<path d="M12 2.8 4.3 13h5.4l-.8 8.2L19.7 11h-5.5l.8-8.2Z"></path>',
    },
    consumption: {
        label: "Tüketim noktası",
        description: "Elektrik tüketimi",
        powerLabel: "Talep",
        initialPower: 2,
        initialCapacity: 3,
        initialLineLength: 25,
        initialConductorSection: 2.5,
        initialBreakerRating: 16,
        icon: '<path d="m3 10 9-7 9 7"></path><path d="M5.5 9v11h13V9"></path><path d="M10 20v-6h4v6"></path>',
    },
};

const points = {
    production: [{ id: 1, power: pointTypes.production.initialPower }],
    consumption: [{
        id: 1,
        power: pointTypes.consumption.initialPower,
        capacity: pointTypes.consumption.initialCapacity,
        lineLength: pointTypes.consumption.initialLineLength,
        conductorSection: pointTypes.consumption.initialConductorSection,
        breakerRating: pointTypes.consumption.initialBreakerRating,
        protectionScenario: "normal",
    }],
};

const nextIds = { production: 2, consumption: 2 };
const numberFormat = new Intl.NumberFormat("tr-TR");
const powerFormat = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 1 });
const totalProduction = document.querySelector("#flow-production");
const totalDemand = document.querySelector("#flow-demand");
const coverage = document.querySelector("#flow-coverage");
const flowStatus = document.querySelector("#flow-status");
const flowStatusLabel = document.querySelector("#flow-status-label");
const flowExplanation = document.querySelector("#flow-explanation");
const consumerBranches = document.querySelector("#consumer-branches");
const consumerBus = document.querySelector("#consumer-bus");
const consumerSource = document.querySelector("#consumer-source");
const consumerDistributionSummary = document.querySelector("#consumer-distribution-summary");
const limitsSummary = document.querySelector("#limits-summary");
const limitsSummaryLabel = document.querySelector("#limits-summary-label");
const voltageDropSummary = document.querySelector("#voltage-drop-summary");
const voltageDropSummaryLabel = document.querySelector("#voltage-drop-summary-label");
const protectionSummary = document.querySelector("#protection-summary");
const protectionSummaryLabel = document.querySelector("#protection-summary-label");
const voltageModel = {
    nominalVoltage: 230,
    powerFactor: 0.95,
    copperResistivity: 0.0175,
};
const equipmentLimits = {
    transformer: {
        capacity: 8,
        input: document.querySelector("#transformer-capacity"),
        card: document.querySelector("#transformer-capacity-card"),
        status: document.querySelector("#transformer-capacity-status"),
        meter: document.querySelector("#transformer-capacity-meter"),
        reading: document.querySelector("#transformer-capacity-reading"),
    },
    panel: {
        capacity: 6,
        input: document.querySelector("#panel-capacity"),
        card: document.querySelector("#panel-capacity-card"),
        status: document.querySelector("#panel-capacity-status"),
        meter: document.querySelector("#panel-capacity-meter"),
        reading: document.querySelector("#panel-capacity-reading"),
    },
};

function updateFlow() {
    const production = points.production.reduce((total, point) => total + point.power, 0);
    const demand = points.consumption.reduce((total, point) => total + point.power, 0);
    const branchFlow = updateConsumerBranches(production);
    const deliveredPower = branchFlow.deliveredPower;
    const coverageRatio = demand === 0 ? 1 : deliveredPower / demand;
    const hasFlow = deliveredPower > 0;
    const hasShortage = deliveredPower < demand;

    totalProduction.textContent = powerFormat.format(production);
    totalDemand.textContent = powerFormat.format(demand);
    coverage.textContent = demand === 0
        ? "Yük yok"
        : `${powerFormat.format(coverageRatio * 100)}%`;
    flowStatus.dataset.state = demand === 0 ? "idle" : hasShortage ? "shortage" : "supplied";

    if (demand === 0) {
        flowStatusLabel.textContent = "Talep yok";
        flowExplanation.textContent = "Akışı görmek için en az bir tüketim noktasına güç değeri gir.";
    } else if (hasShortage && branchFlow.overcurrentTrips > 0) {
        flowStatusLabel.textContent = "Koruma şalteri açtı";
        flowExplanation.textContent = `${numberFormat.format(branchFlow.overcurrentTrips)} dal aşırı akım nedeniyle devre dışı. Kalan dallara ${powerFormat.format(deliveredPower)} kW ulaşıyor; toplam talebin %${powerFormat.format(coverageRatio * 100)}'i karşılanıyor.`;
    } else if (hasShortage && branchFlow.outages > 0) {
        flowStatusLabel.textContent = "Dal kesintisi";
        flowExplanation.textContent = `${numberFormat.format(branchFlow.outages)} dal kesinti testinde açık. Kalan dallara ${powerFormat.format(deliveredPower)} kW ulaşıyor; toplam talebin %${powerFormat.format(coverageRatio * 100)}'i karşılanıyor.`;
    } else if (hasShortage) {
        flowStatusLabel.textContent = production === 0 ? "Üretim yok" : "Üretim yetersiz";
        flowExplanation.textContent = `Toplam ${powerFormat.format(demand)} kW talepten ${powerFormat.format(deliveredPower)} kW karşılanıyor; ${powerFormat.format(demand - deliveredPower)} kW açık var.`;
    } else {
        flowStatusLabel.textContent = "Talep karşılanıyor";
        flowExplanation.textContent = `Bağlı tüketim dallarına toplam ${powerFormat.format(deliveredPower)} kW güç ulaşıyor.`;
    }

    for (const connector of document.querySelectorAll(".flow-connector")) {
        connector.classList.toggle("has-flow", hasFlow);
        connector.classList.toggle("flow-limited", hasFlow && hasShortage);
    }

    for (const connector of document.querySelectorAll(".chain-connector .connector-line")) {
        connector.classList.toggle("has-flow", hasFlow);
        connector.classList.toggle("flow-limited", hasFlow && hasShortage);
    }

    consumerSource.classList.toggle("has-flow", hasFlow);
    consumerSource.classList.toggle("flow-limited", hasFlow && hasShortage);
    consumerSource.dataset.state = !hasFlow ? "idle" : hasShortage ? "limited" : "supplied";
    consumerBus.classList.toggle("has-flow", hasFlow);
    updateEquipmentLimit(
        equipmentLimits.transformer,
        deliveredPower,
        equipmentLimits.transformer.capacity,
    );
    updateEquipmentLimit(
        equipmentLimits.panel,
        deliveredPower,
        equipmentLimits.panel.capacity,
    );
    consumerDistributionSummary.textContent = points.consumption.length === 0
        ? "Henüz tüketim noktası yok. Yeni bir tüketim noktası ekleyerek ilk dalı oluştur."
        : hasFlow
            ? `Şebeke, ${numberFormat.format(points.consumption.length)} tüketim noktasından bağlı dallara toplam ${powerFormat.format(deliveredPower)} kW güç iletiyor${branchFlow.trippedBranches > 0 ? `; ${numberFormat.format(branchFlow.trippedBranches)} dal koruma nedeniyle devre dışı` : ""}.`
            : demand === 0
                ? "Tüketim noktalarının güç değeri 0 kW; bu dallarda yük akışı yok."
                : branchFlow.trippedBranches > 0
                    ? "Tüm tüketim dallarının koruması açık; dallara güç ulaşmıyor."
                    : "Üretim gücü 0 kW; tüketim noktaları enerji bekliyor.";

    const monitoredLimits = [
        ...Object.values(equipmentLimits).map((limit) => limit.card),
        ...consumerBranches.querySelectorAll(".consumer-branch"),
    ];
    const overloadedEquipment = monitoredLimits.filter((item) => item.dataset.state === "overload").length;
    const nearLimitEquipment = monitoredLimits.filter((item) => item.dataset.state === "near-limit").length;
    limitsSummary.dataset.state = overloadedEquipment > 0
        ? "overload"
        : nearLimitEquipment > 0
            ? "near-limit"
            : "normal";
    limitsSummaryLabel.textContent = overloadedEquipment > 0
        ? `${numberFormat.format(overloadedEquipment)} kapasite sınırı aşıldı`
        : nearLimitEquipment > 0
            ? `${numberFormat.format(nearLimitEquipment)} bileşende kapasite sınırına yaklaşıldı`
            : "Tüm sınırlar normal";

    updateProtectionSummary(branchFlow);
}

function updateEquipmentLimit(equipment, load, capacity) {
    const ratio = load / capacity;
    const percentage = ratio * 100;
    const state = ratio > 1 ? "overload" : ratio >= 0.8 ? "near-limit" : "normal";

    equipment.card.dataset.state = state;
    equipment.status.textContent = state === "overload"
        ? "Sınır aşıldı"
        : state === "near-limit"
            ? "Sınıra yakın"
            : "Normal";
    equipment.meter.style.width = `${Math.min(percentage, 100)}%`;
    equipment.meter.closest(".capacity-meter").setAttribute(
        "aria-valuenow",
        String(Math.round(Math.min(percentage, 100))),
    );
    equipment.meter.closest(".capacity-meter").setAttribute(
        "aria-valuetext",
        `${powerFormat.format(load)} kW, ${powerFormat.format(capacity)} kW sınırın %${powerFormat.format(percentage)}'i`,
    );
    equipment.reading.textContent = `${powerFormat.format(load)} / ${powerFormat.format(capacity)} kW · %${powerFormat.format(percentage)} yük`;
}

function updateConsumerBranches(production) {
    const activeBranches = [];

    for (const branch of consumerBranches.querySelectorAll(".consumer-branch")) {
        const pointId = Number(branch.dataset.consumerId);
        const point = points.consumption.find((item) => item.id === pointId);
        if (!point) {
            continue;
        }

        const protection = updateBranchProtection(point, branch);
        activeBranches.push({ point, branch, protection });
    }

    const activeDemand = activeBranches.reduce(
        (total, item) => total + (item.protection.tripped ? 0 : item.point.power),
        0,
    );
    const coverageRatio = activeDemand === 0 ? 0 : Math.min(production / activeDemand, 1);
    let deliveredPower = 0;

    for (const { point, branch, protection } of activeBranches) {
        const hasDemand = point.power > 0;
        const supplied = hasDemand && !protection.tripped
            ? point.power * coverageRatio
            : 0;
        const capacityRatio = supplied / point.capacity;
        const state = protection.tripped
            ? "tripped"
            : capacityRatio > 1
                ? "overload"
                : capacityRatio >= 0.8 && hasDemand && coverageRatio >= 1
                    ? "near-limit"
                    : !hasDemand
                        ? "no-demand"
                        : supplied === 0
                            ? "unpowered"
                            : coverageRatio < 1
                                ? "partial"
                                : "supplied";

        deliveredPower += supplied;
        branch.dataset.state = state;
        branch.setAttribute(
            "aria-label",
            `${pointTypes.consumption.label} ${point.id}: ${powerFormat.format(supplied)} kW besleniyor, ${powerFormat.format(point.power)} kW talep, ${protection.tripped ? "koruma açık" : state}`,
        );
        branch.querySelector(".consumer-branch-line").classList.toggle("has-flow", supplied > 0);
        branch.querySelector(".consumer-branch-line").classList.toggle(
            "flow-limited",
            state === "partial" || state === "overload" || state === "tripped",
        );
        branch.querySelector(".consumer-branch-line").classList.toggle("capacity-overload", state === "overload");
        branch.querySelector(".branch-demand").textContent = `${powerFormat.format(point.power)} kW`;
        branch.querySelector(".branch-supplied").textContent = `${powerFormat.format(supplied)} kW`;
        branch.querySelector(".branch-coverage").textContent = hasDemand
            ? `${powerFormat.format(supplied / point.power * 100)}%`
            : "—";
        branch.querySelector(".branch-capacity").textContent = `${powerFormat.format(point.capacity)} kW`;
        branch.querySelector(".branch-capacity-reading").textContent = `%${powerFormat.format(capacityRatio * 100)} kapasite kullanımı`;
        branch.querySelector(".branch-status").textContent = protection.tripped
            ? protection.reason === "outage" ? "Kesinti testi" : "Şalter açtı"
            : state === "supplied"
                ? "Tam besleniyor"
                : state === "partial"
                    ? "Kısmi besleniyor"
                    : state === "overload"
                        ? "Kapasite aşıldı"
                        : state === "near-limit"
                            ? "Sınıra yakın"
                            : state === "no-demand"
                                ? "Talep yok"
                                : "Enerji yok";

        const meter = branch.querySelector(".branch-capacity-meter");
        meter.style.width = `${Math.min(capacityRatio * 100, 100)}%`;
        meter.closest(".capacity-meter").setAttribute(
            "aria-valuenow",
            String(Math.round(Math.min(capacityRatio * 100, 100))),
        );
        meter.closest(".capacity-meter").setAttribute(
            "aria-valuetext",
            `${powerFormat.format(supplied)} kW, ${powerFormat.format(point.capacity)} kW sınırın %${powerFormat.format(capacityRatio * 100)}'i`,
        );
        updateBranchVoltageDrop(point, branch, supplied > 0);
    }

    const overloadedBranches = consumerBranches.querySelectorAll('.consumer-branch[data-state="overload"]').length;
    consumerBus.dataset.overloadedBranches = String(overloadedBranches);
    updateVoltageDropSummary();

    return {
        deliveredPower,
        trippedBranches: activeBranches.filter((item) => item.protection.tripped).length,
        overcurrentTrips: activeBranches.filter((item) => item.protection.reason === "overcurrent").length,
        outages: activeBranches.filter((item) => item.protection.reason === "outage").length,
    };
}

function updateBranchProtection(point, branch) {
    const calculatedCurrent = point.power * 1000 / (voltageModel.nominalVoltage * voltageModel.powerFactor);
    const isOvercurrentTest = point.protectionScenario === "overcurrent-test";
    const isOutageTest = point.protectionScenario === "outage-test";
    const current = isOvercurrentTest ? point.breakerRating * 1.5 : calculatedCurrent;
    const tripped = isOutageTest || isOvercurrentTest || current > point.breakerRating;
    const reason = isOutageTest ? "outage" : tripped ? "overcurrent" : "none";
    const status = branch.querySelector(".branch-protection-status");
    const reading = branch.querySelector(".branch-protection-reading");

    branch.dataset.protectionState = tripped ? "open" : "closed";
    branch.dataset.tripReason = reason;
    status.textContent = isOutageTest
        ? "Açık · kesinti testi"
        : tripped
            ? "Açtı · aşırı akım"
            : "Kapalı · normal";
    reading.textContent = isOutageTest
        ? `Hat kesintisi · ${powerFormat.format(point.breakerRating)} A şalter`
        : `Akım ${powerFormat.format(current)} A / ${powerFormat.format(point.breakerRating)} A`;
    branch.querySelector(".branch-protection-switch").setAttribute(
        "aria-label",
        `Tüketim noktası ${point.id} şalteri ${tripped ? "açık" : "kapalı"}`,
    );

    return { tripped, reason };
}

function updateProtectionSummary(branchFlow) {
    const state = branchFlow.trippedBranches > 0
        ? "tripped"
        : points.consumption.length === 0
            ? "idle"
            : "normal";

    protectionSummary.dataset.state = state;
    protectionSummaryLabel.textContent = branchFlow.overcurrentTrips > 0
        ? `${numberFormat.format(branchFlow.overcurrentTrips)} şalter aşırı akımda açtı`
        : branchFlow.outages > 0
            ? `${numberFormat.format(branchFlow.outages)} dal kesinti testinde açık`
            : points.consumption.length === 0
                ? "Koruma senaryosu bekleniyor"
                : "Tüm dal şalterleri kapalı";
}

function updateBranchVoltageDrop(point, branch, energized) {
    const current = point.power * 1000 / (voltageModel.nominalVoltage * voltageModel.powerFactor);
    const dropVolts = energized
        ? 2 * point.lineLength * current * voltageModel.copperResistivity / point.conductorSection
        : 0;
    const dropPercentage = dropVolts / voltageModel.nominalVoltage * 100;
    const endVoltage = voltageModel.nominalVoltage - dropVolts;
    const state = !energized
        ? "idle"
        : dropPercentage > 5
            ? "high"
            : dropPercentage > 3
                ? "near-limit"
                : "normal";
    const meter = branch.querySelector(".branch-voltage-meter");
    const meterTrack = meter.closest(".voltage-drop-meter");

    branch.dataset.voltageDropState = state;
    branch.querySelector(".branch-voltage-status").textContent = state === "high"
        ? "Yüksek düşüm"
        : state === "near-limit"
            ? "Sınıra yakın"
            : state === "idle"
                ? "Yük yok"
                : "Normal";
    branch.querySelector(".branch-voltage-reading").textContent = !energized
        ? branch.dataset.protectionState === "open"
            ? "Koruma açık · hat enerjisiz"
            : "Yük yok · düşüm hesaplanmadı"
        : point.power === 0
        ? "Yük yok · düşüm hesaplanmadı"
        : endVoltage > 0
            ? `ΔV ${powerFormat.format(dropVolts)} V · %${powerFormat.format(dropPercentage)} · uç ${powerFormat.format(endVoltage)} V`
            : `ΔV ${powerFormat.format(dropVolts)} V · %${powerFormat.format(dropPercentage)} · hesap aralığı aşıldı`;
    meter.style.width = `${Math.min(dropPercentage / 10 * 100, 100)}%`;
    meterTrack.setAttribute("aria-valuenow", String(Math.round(Math.min(dropPercentage / 10 * 100, 100))));
    meterTrack.setAttribute(
        "aria-valuetext",
        !energized
            ? branch.dataset.protectionState === "open" ? "Koruma açık" : "Yük yok"
            : `Gerilim düşümü %${powerFormat.format(dropPercentage)}, tüketici ucunda ${endVoltage > 0 ? `${powerFormat.format(endVoltage)} volt` : "hesap aralığı aşıldı"}`,
    );
}

function updateVoltageDropSummary() {
    const activeBranchIds = new Set(
        [...consumerBranches.querySelectorAll('.consumer-branch[data-voltage-drop-state]:not([data-voltage-drop-state="idle"])')]
            .map((branch) => Number(branch.dataset.consumerId)),
    );
    const loadedBranches = points.consumption
        .filter((point) => point.power > 0 && activeBranchIds.has(point.id))
        .map((point) => {
            const current = point.power * 1000 / (voltageModel.nominalVoltage * voltageModel.powerFactor);
            return 2 * point.lineLength * current * voltageModel.copperResistivity
                / point.conductorSection
                / voltageModel.nominalVoltage * 100;
        });
    const maximumDrop = Math.max(0, ...loadedBranches);
    const state = loadedBranches.length === 0
        ? "idle"
        : maximumDrop > 5
            ? "high"
            : maximumDrop > 3
                ? "near-limit"
                : "normal";

    voltageDropSummary.dataset.state = state;
    voltageDropSummaryLabel.textContent = state === "high"
        ? `En yüksek düşüm %${powerFormat.format(maximumDrop)}`
        : state === "near-limit"
            ? `En yüksek düşüm %${powerFormat.format(maximumDrop)} · sınıra yakın`
            : state === "idle"
                ? "Yük hesaplaması bekleniyor"
                : `En yüksek düşüm %${powerFormat.format(maximumDrop)} · normal`;
}

function renderConsumerBranches() {
    consumerBranches.replaceChildren();

    if (points.consumption.length === 0) {
        const emptyState = document.createElement("p");
        emptyState.className = "consumer-branches-empty";
        emptyState.textContent = "Tüketim noktası bulunmuyor. İlk dal için tüketim noktası ekle.";
        consumerBranches.append(emptyState);
        return;
    }

    for (const point of points.consumption) {
        const branch = document.createElement("article");
        branch.className = "consumer-branch";
        branch.dataset.consumerId = String(point.id);
        branch.dataset.state = "unpowered";
        branch.setAttribute("role", "listitem");

        const branchLine = document.createElement("span");
        branchLine.className = "consumer-branch-line";
        branchLine.setAttribute("aria-hidden", "true");

        const card = document.createElement("div");
        card.className = "consumer-branch-card";

        const header = document.createElement("div");
        header.className = "consumer-branch-header";

        const icon = document.createElement("span");
        icon.className = "consumer-branch-icon";
        icon.setAttribute("aria-hidden", "true");
        icon.innerHTML = `<svg viewBox="0 0 24 24">${pointTypes.consumption.icon}</svg>`;

        const name = document.createElement("strong");
        name.textContent = `Tüketim noktası ${point.id}`;

        const branchStatus = document.createElement("span");
        branchStatus.className = "branch-status";

        const metrics = document.createElement("div");
        metrics.className = "consumer-branch-metrics";

        for (const [label, className] of [
            ["Talep", "branch-demand"],
            ["Beslenen", "branch-supplied"],
            ["Karşılama", "branch-coverage"],
            ["Sınır", "branch-capacity"],
        ]) {
            const metric = document.createElement("span");
            metric.className = "consumer-branch-metric";

            const metricLabel = document.createElement("small");
            metricLabel.textContent = label;

            const metricValue = document.createElement("strong");
            metricValue.className = className;

            metric.append(metricLabel, metricValue);
            metrics.append(metric);
        }

        const capacityMeter = document.createElement("div");
        capacityMeter.className = "capacity-meter branch-capacity-meter-wrap";
        capacityMeter.setAttribute("role", "progressbar");
        capacityMeter.setAttribute("aria-label", `Tüketim noktası ${point.id} kol yükü`);
        capacityMeter.setAttribute("aria-valuemin", "0");
        capacityMeter.setAttribute("aria-valuemax", "100");
        capacityMeter.setAttribute("aria-valuenow", "0");
        capacityMeter.setAttribute("aria-valuetext", "0 kW");

        const capacityMeterFill = document.createElement("span");
        capacityMeterFill.className = "branch-capacity-meter";
        capacityMeter.append(capacityMeterFill);

        const capacityReading = document.createElement("span");
        capacityReading.className = "branch-capacity-reading";

        const capacityInputLabel = document.createElement("label");
        capacityInputLabel.className = "branch-capacity-control";
        capacityInputLabel.textContent = "Dal kapasite sınırı";

        const capacityInputWrap = document.createElement("span");
        capacityInputWrap.className = "capacity-input-wrap";

        const capacityInput = document.createElement("input");
        capacityInput.type = "number";
        capacityInput.min = "0.1";
        capacityInput.max = "1000";
        capacityInput.step = "0.1";
        capacityInput.value = String(point.capacity);
        capacityInput.inputMode = "decimal";
        capacityInput.setAttribute("aria-label", `Tüketim noktası ${point.id} dal kapasite sınırı, kW`);
        capacityInput.addEventListener("input", () => {
            const value = Number(capacityInput.value);
            const isValid = capacityInput.value !== ""
                && capacityInput.validity.valid
                && Number.isFinite(value)
                && value > 0
                && value <= 1000;

            capacityInput.setAttribute("aria-invalid", String(!isValid));
            if (!isValid) {
                return;
            }

            point.capacity = value;
            updateFlow();
        });
        capacityInputWrap.append(capacityInput, document.createTextNode("kW"));
        capacityInputLabel.append(capacityInputWrap);

        const protectionPanel = document.createElement("section");
        protectionPanel.className = "branch-protection";
        protectionPanel.setAttribute("aria-label", `Tüketim noktası ${point.id} koruma şalteri`);

        const protectionHeading = document.createElement("div");
        protectionHeading.className = "branch-protection-heading";

        const protectionTitle = document.createElement("strong");
        protectionTitle.textContent = "Dal koruma şalteri";

        const protectionStatus = document.createElement("span");
        protectionStatus.className = "branch-protection-status";

        const protectionSwitch = document.createElement("span");
        protectionSwitch.className = "branch-protection-switch";
        protectionSwitch.setAttribute("aria-hidden", "true");

        protectionHeading.append(protectionTitle, protectionStatus, protectionSwitch);

        const protectionControls = document.createElement("div");
        protectionControls.className = "branch-protection-controls";

        const breakerLabel = document.createElement("label");
        breakerLabel.className = "branch-protection-control";
        breakerLabel.textContent = "Örnek şalter sınırı";

        const breakerInputWrap = document.createElement("span");
        breakerInputWrap.className = "capacity-input-wrap";

        const breakerInput = document.createElement("input");
        breakerInput.type = "number";
        breakerInput.min = "1";
        breakerInput.max = "1000";
        breakerInput.step = "1";
        breakerInput.value = String(point.breakerRating);
        breakerInput.inputMode = "numeric";
        breakerInput.setAttribute("aria-label", `Tüketim noktası ${point.id} şalter akım sınırı, amper`);
        breakerInput.addEventListener("input", () => {
            const value = Number(breakerInput.value);
            const isValid = breakerInput.value !== ""
                && breakerInput.validity.valid
                && Number.isFinite(value)
                && value >= 1
                && value <= 1000;

            breakerInput.setAttribute("aria-invalid", String(!isValid));
            if (!isValid) {
                return;
            }

            point.breakerRating = value;
            updateFlow();
        });
        breakerInputWrap.append(breakerInput, document.createTextNode("A"));
        breakerLabel.append(breakerInputWrap);

        const scenarioLabel = document.createElement("label");
        scenarioLabel.className = "branch-protection-control";
        scenarioLabel.textContent = "Senaryo";

        const scenarioSelect = document.createElement("select");
        scenarioSelect.setAttribute("aria-label", `Tüketim noktası ${point.id} koruma senaryosu`);
        for (const [value, label] of [
            ["normal", "Normal çalışma"],
            ["overcurrent-test", "Aşırı akım testi"],
            ["outage-test", "Hat kesintisi testi"],
        ]) {
            const option = document.createElement("option");
            option.value = value;
            option.textContent = label;
            scenarioSelect.append(option);
        }
        scenarioSelect.value = point.protectionScenario;
        scenarioSelect.addEventListener("change", () => {
            point.protectionScenario = scenarioSelect.value;
            updateFlow();
        });
        scenarioLabel.append(scenarioSelect);
        protectionControls.append(breakerLabel, scenarioLabel);

        const protectionReading = document.createElement("p");
        protectionReading.className = "branch-protection-reading";
        protectionPanel.append(protectionHeading, protectionControls, protectionReading);

        const voltageControls = document.createElement("div");
        voltageControls.className = "branch-voltage-controls";

        for (const [property, label, unit, min, max, step] of [
            ["lineLength", "Hat uzunluğu", "m", "1", "500", "1"],
            ["conductorSection", "Bakır kesit", "mm²", "0.5", "240", "0.5"],
        ]) {
            const control = document.createElement("label");
            control.className = "branch-voltage-control";

            const controlLabel = document.createElement("span");
            controlLabel.textContent = label;

            const inputWrap = document.createElement("span");
            inputWrap.className = "capacity-input-wrap";

            const input = document.createElement("input");
            input.type = "number";
            input.min = min;
            input.max = max;
            input.step = step;
            input.value = String(point[property]);
            input.inputMode = "decimal";
            input.setAttribute("aria-label", `Tüketim noktası ${point.id} ${label.toLocaleLowerCase("tr-TR")}, ${unit}`);
            input.addEventListener("input", () => {
                const value = Number(input.value);
                const isValid = input.value !== ""
                    && input.validity.valid
                    && Number.isFinite(value)
                    && value >= Number(min)
                    && value <= Number(max);

                input.setAttribute("aria-invalid", String(!isValid));
                if (!isValid) {
                    return;
                }

                point[property] = value;
                updateFlow();
            });

            inputWrap.append(input, document.createTextNode(unit));
            control.append(controlLabel, inputWrap);
            voltageControls.append(control);
        }

        const voltageMeter = document.createElement("div");
        voltageMeter.className = "voltage-drop-meter";
        voltageMeter.setAttribute("role", "progressbar");
        voltageMeter.setAttribute("aria-label", `Tüketim noktası ${point.id} gerilim düşümü, ölçek 0 ile yüzde 10 arası`);
        voltageMeter.setAttribute("aria-valuemin", "0");
        voltageMeter.setAttribute("aria-valuemax", "100");
        voltageMeter.setAttribute("aria-valuenow", "0");
        voltageMeter.setAttribute("aria-valuetext", "Yük yok");

        const voltageMeterFill = document.createElement("span");
        voltageMeterFill.className = "branch-voltage-meter";
        voltageMeter.append(voltageMeterFill);

        const voltageResults = document.createElement("div");
        voltageResults.className = "branch-voltage-results";

        const voltageStatus = document.createElement("span");
        voltageStatus.className = "branch-voltage-status";

        const voltageReading = document.createElement("span");
        voltageReading.className = "branch-voltage-reading";
        voltageResults.append(voltageStatus, voltageReading);

        const cardTop = document.createElement("div");
        cardTop.className = "consumer-branch-title";
        cardTop.append(icon, name);
        header.append(cardTop, branchStatus);
        card.append(
            header,
            metrics,
            capacityMeter,
            capacityReading,
            capacityInputLabel,
            protectionPanel,
            voltageControls,
            voltageMeter,
            voltageResults,
        );
        branch.append(branchLine, card);
        consumerBranches.append(branch);
    }
}

function renderPoints(type) {
    const container = document.querySelector(`#${type}-points`);
    const count = document.querySelector(`#${type}-count`);
    const pointType = pointTypes[type];

    container.replaceChildren();
    count.textContent = `${numberFormat.format(points[type].length)} nokta`;

    if (points[type].length === 0) {
        const emptyState = document.createElement("p");
        emptyState.className = "empty-points";
        emptyState.textContent = "Henüz nokta eklenmedi.";
        container.append(emptyState);
        return;
    }

    for (const point of points[type]) {
        const card = document.createElement("article");
        card.className = "energy-point";
        card.setAttribute("aria-label", `${pointType.label} ${point.id}`);

        const icon = document.createElement("span");
        icon.className = "point-icon";
        icon.setAttribute("aria-hidden", "true");
        icon.innerHTML = `<svg viewBox="0 0 24 24">${pointType.icon}</svg>`;

        const details = document.createElement("span");
        details.className = "point-details";

        const name = document.createElement("strong");
        name.textContent = `${pointType.label} ${point.id}`;

        const description = document.createElement("span");
        description.textContent = pointType.description;

        const powerControl = document.createElement("label");
        powerControl.className = "point-power-control";

        const powerLabel = document.createElement("span");
        powerLabel.textContent = pointType.powerLabel;

        const powerInput = document.createElement("input");
        powerInput.type = "number";
        powerInput.min = "0";
        powerInput.max = "1000";
        powerInput.step = "0.1";
        powerInput.value = String(point.power);
        powerInput.inputMode = "decimal";
        powerInput.setAttribute("aria-label", `${pointType.label} ${point.id} ${pointType.powerLabel}, kW`);
        powerInput.addEventListener("input", () => {
            const value = Number(powerInput.value);
            const isValid = powerInput.value !== ""
                && powerInput.validity.valid
                && Number.isFinite(value)
                && value >= 0
                && value <= 1000;

            powerInput.setAttribute("aria-invalid", String(!isValid));
            if (!isValid) {
                return;
            }

            point.power = value;
            updateFlow();
        });

        const remove = document.createElement("button");
        remove.className = "remove-point";
        remove.type = "button";
        remove.textContent = "×";
        remove.setAttribute("aria-label", `${pointType.label} ${point.id} noktasını kaldır`);
        remove.addEventListener("click", () => {
            points[type] = points[type].filter((item) => item.id !== point.id);
            renderPoints(type);
            if (type === "consumption") {
                renderConsumerBranches();
            }
            updateFlow();
        });

        details.append(name, description);
        powerControl.append(powerLabel, powerInput, document.createTextNode("kW"));
        card.append(icon, details, powerControl, remove);
        container.append(card);
    }
}

for (const type of Object.keys(pointTypes)) {
    document.querySelector(`#add-${type}`).addEventListener("click", () => {
        const newPoint = {
            id: nextIds[type],
            power: pointTypes[type].initialPower,
        };
        if (type === "consumption") {
            newPoint.capacity = pointTypes.consumption.initialCapacity;
            newPoint.lineLength = pointTypes.consumption.initialLineLength;
            newPoint.conductorSection = pointTypes.consumption.initialConductorSection;
            newPoint.breakerRating = pointTypes.consumption.initialBreakerRating;
            newPoint.protectionScenario = "normal";
        }
        points[type].push(newPoint);
        nextIds[type] += 1;
        renderPoints(type);
        if (type === "consumption") {
            renderConsumerBranches();
        }
        updateFlow();
    });

    renderPoints(type);
}

for (const equipment of Object.values(equipmentLimits)) {
    equipment.input.addEventListener("input", () => {
        const value = Number(equipment.input.value);
        const isValid = equipment.input.value !== ""
            && equipment.input.validity.valid
            && Number.isFinite(value)
            && value > 0
            && value <= 1000;

        equipment.input.setAttribute("aria-invalid", String(!isValid));
        if (isValid) {
            equipment.capacity = value;
            updateFlow();
        }
    });
}

renderConsumerBranches();
updateFlow();
