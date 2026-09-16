(function () {
    "use strict";

    const U = window.ISOWUtils;
    const K = window.ISOW_KNOWLEDGE || {};
    const Extractor = window.ISOWExtractor;
    const Engine = window.ISOWEngine;
    const Response = window.ISOWResponse;

    const CONFIG = {
        whatsappNumber: "918593076501",
        defaultRadiusKm: 25,
        maxResults: 8
    };

    let input;
    let sendButton;
    let messages;
    let locationButton;
    let isProcessing = false;
    let awaitingField = null;

    const memory = createEmptyMemory();

    function createEmptyMemory() {
        return {
            originalQuery: "",
            normalizedQuery: "",
            location: null,
            locationName: null,
            locationDisplayName: null,
            locationType: null,
            purpose: null,
            purposeKeyword: null,
            area: null,
            areaMode: "exact",
            budget: null,
            connectivity: {
                highway: false,
                airport: false,
                railway: false,
                port: false,
                metro: false,
                sipcot: false,
                industrialPark: false
            },
            radiusKm: null,
            nearby: false,
            currentLocation: false,
            currentLocationCoords: null,
            skippedArea: false,
            skippedBudget: false
        };
    }

    function resetMemory() {
        const fresh = createEmptyMemory();
        Object.keys(memory).forEach(key => delete memory[key]);
        Object.assign(memory, fresh);
        awaitingField = null;
    }

    function mergeRequirement(requirement) {
        if (!requirement) {
            return;
        }

        memory.originalQuery = [memory.originalQuery, requirement.originalQuery]
            .filter(Boolean)
            .join(" ")
            .trim();

        memory.normalizedQuery = [memory.normalizedQuery, requirement.normalizedQuery]
            .filter(Boolean)
            .join(" ")
            .trim();

        if (requirement.locationName) {
            memory.location = requirement.location;
            memory.locationName = requirement.locationName;
            memory.locationDisplayName = requirement.locationDisplayName;
            memory.locationType = requirement.locationType;
        }

        if (requirement.purpose) {
            memory.purpose = requirement.purpose;
            memory.purposeKeyword = requirement.purposeKeyword;
        }

        if (requirement.area) {
            memory.area = requirement.area;
            memory.areaMode = requirement.areaMode || "exact";
            memory.skippedArea = false;
        }

        if (requirement.budget) {
            memory.budget = requirement.budget;
            memory.skippedBudget = false;
        }

        if (requirement.connectivity) {
            Object.assign(memory.connectivity, requirement.connectivity);
        }

        if (requirement.radiusKm) {
            memory.radiusKm = requirement.radiusKm;
        }

        if (requirement.nearby) {
            memory.nearby = true;
        }

        if (requirement.currentLocation) {
            memory.currentLocation = true;
        }
    }

    function resetRequested(query) {
        const text = U.normalize(query);
        return U.containsAny(text, K.queryWords?.reset || []);
    }

    function searchNowRequested(query) {
        const text = U.normalize(query);
        return U.containsAny(text, K.queryWords?.searchNow || []);
    }

    function handleSkip(query) {
        const text = U.normalize(query);
        const skip = /^(skip|any|anything|no preference|search|show|show results|search now)$/i.test(text);

        if (!skip) {
            return;
        }

        if (awaitingField === "area") {
            memory.skippedArea = true;
        }

        if (awaitingField === "budget") {
            memory.skippedBudget = true;
        }
    }

    function hasEnoughInformation() {
        if (memory.currentLocationCoords || memory.currentLocation) {
            return Boolean(memory.purpose || memory.area || memory.budget || U.hasAnyTrue(memory.connectivity));
        }

        if (memory.locationName && memory.purpose) {
            return true;
        }

        if (memory.locationName && memory.area) {
            return true;
        }

        if (memory.locationName && memory.budget) {
            return true;
        }

        if (memory.purpose && memory.area) {
            return true;
        }

        return false;
    }

    function nextQuestion(forceSearch) {
        if (forceSearch && hasEnoughInformation()) {
            return null;
        }

        if (!memory.locationName && !memory.currentLocationCoords && !memory.currentLocation) {
            return {
                field: "location",
                title: "Location",
                text: "Which location are you interested in?",
                hint: "You can type Chennai, Oragadam, Sriperumbudur, Bengaluru, or use your current location.",
                chips: [
                    "Chennai",
                    "Oragadam",
                    "Sriperumbudur",
                    "Bengaluru",
                    "Use my current location"
                ]
            };
        }

        if (!memory.purpose) {
            return {
                field: "purpose",
                title: "Land Purpose",
                text: "What type of land do you need?",
                hint: "Choose the closest purpose. You can also type your own requirement.",
                chips: [
                    "Industrial land",
                    "Warehouse land",
                    "Logistics land",
                    "Commercial land",
                    "Investment land",
                    "Resort land"
                ]
            };
        }

        if (!memory.area && !memory.skippedArea) {
            return {
                field: "area",
                title: "Land Size",
                text: "How much land do you need?",
                hint: "Examples: 5 acres, 20 acres, 100 grounds. Type skip to search without area.",
                chips: [
                    "5 acres",
                    "10 acres",
                    "20 acres",
                    "50 acres",
                    "Skip"
                ]
            };
        }

        return null;
    }

    function scrollMessages() {
        if (!messages) {
            return;
        }
        messages.scrollTop = messages.scrollHeight;
    }

    function addUserMessage(query) {
        if (!messages) {
            return;
        }

        messages.insertAdjacentHTML("beforeend", `
            <div class="msg user">
                <div class="user-bubble">
                    ${U.escapeHTML(query).replace(/\n/g, "<br>")}
                </div>
            </div>
        `);

        scrollMessages();
    }

    function addAIMessage(html) {
        if (!messages) {
            return;
        }

        messages.insertAdjacentHTML("beforeend", `
            <div class="msg ai">
                ${html}
            </div>
        `);

        scrollMessages();
    }

    function addThinkingMessage() {
        if (!messages) {
            return null;
        }

        const id = "isow-thinking-" + Date.now();

        messages.insertAdjacentHTML("beforeend", `
            <div class="msg ai" id="${id}">
                <div class="typing">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `);

        scrollMessages();
        return id;
    }

    function removeThinking(id) {
        if (!id) {
            return;
        }

        const element = document.getElementById(id);
        if (element) {
            element.remove();
        }
    }

    function renderQuestion(question) {
        awaitingField = question.field;

        const chips = question.chips
            .map(chip => `
                <button type="button" class="prompt-chip" data-prompt="${U.escapeHTML(chip)}">
                    ${U.escapeHTML(chip)}
                </button>
            `)
            .join("");

        addAIMessage(`
            <div class="ai-welcome ai-question-card">
                <div class="eyebrow">${U.escapeHTML(question.title)}</div>
                <h3>${U.escapeHTML(question.text)}</h3>
                <p>${U.escapeHTML(question.hint)}</p>
                <div class="example-prompts">${chips}</div>
            </div>
        `);
    }

    function renderResponse(response) {
        const cards = response.cards.join("");
        const statusClass = response.success ? "success" : "warning";

        addAIMessage(`
            <div class="ai-response">
                <div class="status ${statusClass}">${U.escapeHTML(response.title)}</div>
                <p class="ai-response-text">${response.message}</p>
                ${cards ? `<div class="ai-results">${cards}</div>` : ""}
                ${response.success ? `<p class="ai-input-hint">Tip: Click WhatsApp on any property to send a direct enquiry to ISOW.</p>` : ""}
            </div>
        `);
    }

    function requestUserLocation() {
        return new Promise(resolve => {
            if (!navigator.geolocation) {
                resolve(null);
                return;
            }

            navigator.geolocation.getCurrentPosition(
                position => {
                    const coords = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    };
                    memory.currentLocation = true;
                    memory.currentLocationCoords = coords;
                    resolve(coords);
                },
                () => resolve(null),
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 300000
                }
            );
        });
    }

    function distanceKm(lat1, lng1, lat2, lng2) {
        const earthRadius = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;

        const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1 * Math.PI / 180) *
            Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng / 2) ** 2;

        return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    function applyCurrentLocationRanking(result) {
        if (!memory.currentLocationCoords || !Array.isArray(result.ranked)) {
            return result;
        }

        const radius = memory.radiusKm || CONFIG.defaultRadiusKm;

        const ranked = result.ranked
            .map(item => {
                const lat = U.numeric(item.property?.latitude);
                const lng = U.numeric(item.property?.longitude);

                if (lat === null || lng === null) {
                    return item;
                }

                const distance = distanceKm(
                    memory.currentLocationCoords.latitude,
                    memory.currentLocationCoords.longitude,
                    lat,
                    lng
                );

                const distanceBoost = distance <= radius ? 12 : 0;

                return {
                    ...item,
                    distanceKm: distance,
                    score: Math.min(99, item.score + distanceBoost)
                };
            })
            .filter(item => {
                if (!item.distanceKm) {
                    return true;
                }
                return item.distanceKm <= radius || !memory.currentLocation;
            })
            .sort((a, b) => b.score - a.score);

        return {
            ...result,
            ranked
        };
    }

    async function handleSend() {
        if (!input || isProcessing) {
            return;
        }

        const query = input.value.trim();
        if (!query) {
            return;
        }

        input.value = "";
        input.style.height = "auto";
        addUserMessage(query);

        if (resetRequested(query)) {
            resetMemory();
            addAIMessage(`
                <div class="ai-response">
                    <div class="status success">Fresh Search Started</div>
                    <p class="ai-response-text">Done. Tell me the location or type of land you're looking for.</p>
                </div>
            `);
            return;
        }

        const thinkingId = addThinkingMessage();
        isProcessing = true;

        try {
            const requirement = Extractor.extractRequirements(query);
            mergeRequirement(requirement);
            handleSkip(query);

            if (requirement.currentLocation || /use my current location/i.test(query)) {
                await requestUserLocation();
                if (locationButton) {
                    locationButton.classList.add("active");
                    locationButton.title = "Current location enabled";
                }
            }

            const forceSearch = searchNowRequested(query);
            const question = nextQuestion(forceSearch);

            removeThinking(thinkingId);

            if (question && !forceSearch) {
                renderQuestion(question);
                return;
            }

            const result = applyCurrentLocationRanking(
                Engine.searchRequirement({ ...memory })
            );

            const response = Response.generateResponse(result);
            renderResponse(response);
            awaitingField = null;
        }
        catch (error) {
            console.error("ISOW AI error:", error);
            removeThinking(thinkingId);
            addAIMessage(`
                <div class="ai-response">
                    <div class="status warning">AI Error</div>
                    <p class="ai-response-text">Something went wrong while reading your request. Please try again with a simpler sentence.</p>
                </div>
            `);
        }
        finally {
            isProcessing = false;
        }
    }

    function openWhatsApp(property) {
        const message = [
            "ISOW PROPERTY ENQUIRY",
            "",
            "Property: " + (property?.name || ""),
            "Property ID: " + (property?.id || ""),
            "Land Type: " + (property?.landType || property?.category || ""),
            "Location: " + Response.formatLocation(property),
            "Area: " + Response.formatArea(property),
            "Price: " + Response.formatPrice(property),
            "",
            "I would like more information about this property."
        ].join("\n");

        const url = "https://wa.me/" + CONFIG.whatsappNumber + "?text=" + encodeURIComponent(message);
        window.open(url, "_blank");
    }

    function bindEvents() {
        if (sendButton) {
            sendButton.addEventListener("click", handleSend);
        }

        if (input) {
            input.addEventListener("keydown", event => {
                if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    handleSend();
                }
            });

            input.addEventListener("input", () => {
                input.style.height = "auto";
                input.style.height = Math.min(input.scrollHeight, 160) + "px";
            });
        }

        document.addEventListener("click", event => {
           const chip = event.target.closest("[data-prompt]");

if (chip && input) {
    input.value = chip.dataset.prompt;
    input.focus();
    handleSend();
    return;
}

            const whatsappButton = event.target.closest("[data-whatsapp-property]");
            if (whatsappButton) {
                const propertyId = decodeURIComponent(whatsappButton.dataset.whatsappProperty || "");
                const property = Engine.database().find(item => String(item.id) === String(propertyId));
                if (property) {
                    openWhatsApp(property);
                }
            }
        });

        if (locationButton) {
            locationButton.addEventListener("click", async () => {
                const thinkingId = addThinkingMessage();
                const location = await requestUserLocation();
                removeThinking(thinkingId);

                if (location) {
                    locationButton.classList.add("active");
                    renderQuestion({
                        field: "purpose",
                        title: "Location Enabled",
                        text: "Great. What type of land do you want near your current location?",
                        hint: "Choose a purpose or type your own requirement.",
                        chips: ["Industrial land", "Warehouse land", "Commercial land", "Investment land"]
                    });
                }
                else {
                    addAIMessage(`
                        <div class="ai-response">
                            <div class="status warning">Location Not Available</div>
                            <p class="ai-response-text">I couldn't access your current location. You can still type a location like Chennai or Oragadam.</p>
                        </div>
                    `);
                }
            });
        }
    }

    function init() {
        if (!U || !Extractor || !Engine || !Response) {
            console.error("ISOW AI: Required AI modules are missing. Check script loading order.");
            return;
        }

        input = document.getElementById("aiInput") || document.querySelector("[data-ai-input]");
        sendButton = document.getElementById("aiSend") || document.querySelector("[data-ai-send]");
        messages = document.getElementById("aiMessages") || document.querySelector("[data-ai-messages]");
        locationButton = document.getElementById("useLocation") || document.querySelector("[data-use-location]");

        bindEvents();

        if (!Engine.database().length) {
            console.warn("ISOW AI: No properties found. Make sure data/properties.js loads before AI scripts.");
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    }
    else {
        init();
    }

    window.ISOW_AI = {
        memory,
        reset: resetMemory,
        search: query => Engine.search(query),
        searchCurrent: () => Engine.searchRequirement({ ...memory }),
        extract: query => Extractor.extractRequirements(query),
        send: handleSend,
        requestUserLocation
    };
})();
