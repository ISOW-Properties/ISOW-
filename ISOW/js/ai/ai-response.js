(function () {
    "use strict";

    const U = window.ISOWUtils;
    const Score = window.ISOWScore;

    function formatArea(property) {
        const acres = U.numeric(property?.acres);
        const grounds = U.numeric(property?.grounds);
        const sqft = U.numeric(property?.sqft);

        if (acres !== null) {
            return acres + (acres === 1 ? " Acre" : " Acres");
        }

        if (grounds !== null) {
            return grounds + (grounds === 1 ? " Ground" : " Grounds");
        }

        if (sqft !== null) {
            return sqft.toLocaleString("en-IN") + " Sq.ft";
        }

        return "On Request";
    }

    function formatPrice(property) {
        const rate = U.numeric(property?.rate);
        if (rate === null) {
            return "Price on Request";
        }

        const unit = property?.priceUnit || "Acre";
        const normalizedUnit = U.normalize(unit);
        const currency = U.normalize(property?.currency || "inr");

        if (currency === "inr") {
            if (normalizedUnit.includes("acre") || normalizedUnit === "ac") {
                if (rate < 1) {
                    return "₹" + Math.round(rate * 100) + " Lakhs / Acre";
                }
                return "₹" + Number(rate.toFixed(2)) + " Cr / Acre";
            }

            if (normalizedUnit.includes("ground")) {
                return "₹" + Number(rate.toFixed(2)) + " Cr / Ground";
            }

            return "₹" + rate.toLocaleString("en-IN") + " " + unit;
        }

        return rate.toLocaleString("en-IN") + " " + unit;
    }

    function formatLocation(property) {
        return U.propertyLocationText(property) || "Location on Request";
    }

    function matchLabel(score) {
        return Score?.label ? Score.label(score) : "Match";
    }

    function stars(score) {
        return Score?.stars ? Score.stars(score) : "★★★";
    }

    function createResultCard(item) {
        const property = item.property || {};
        const id = encodeURIComponent(property.id || "");
        const name = U.escapeHTML(property.name || "ISOW Property");
        const landType = U.escapeHTML(property.landType || property.category || "Land");
        const location = U.escapeHTML(formatLocation(property));
        const area = U.escapeHTML(formatArea(property));
        const price = U.escapeHTML(formatPrice(property));
        const score = Math.round(item.score || 0);
        const rating = stars(score);
        const label = matchLabel(score);
        const reasons = U.asArray(item.reasons).slice(0, 3);

        const usage = U.asArray(property.usage).slice(0, 3);
        const tags = [...usage, ...reasons]
            .slice(0, 5)
            .map(value => `<span>${U.escapeHTML(value)}</span>`)
            .join("");

        const mapButton = property.googleMaps
            ? `
                <a href="${U.escapeHTML(property.googleMaps)}" target="_blank" rel="noopener" class="btn">
                    <i class="fa-solid fa-location-dot"></i>
                    Map
                </a>
            `
            : "";

        return `
            <article class="ai-result-card glass">
                <div class="ai-result-top">
                    <div>
                        <div class="eyebrow">${landType}</div>
                        <h3>${name}</h3>
                        <p>
                            <i class="fa-solid fa-location-dot"></i>
                            ${location}
                        </p>
                    </div>

                  
                </div>

                <div class="ai-match-label">${label}</div>

                <div class="ai-result-meta">
                    <div>
                        <small>AREA</small>
                        <strong>${area}</strong>
                    </div>
                    <div>
                        <small>PRICE</small>
                        <strong>${price}</strong>
                    </div>
                </div>

                ${tags ? `<div class="ai-result-tags">${tags}</div>` : ""}

                <div class="ai-result-actions">
                    <a href="property.html?id=${id}" class="btn primary">View Property</a>
                    ${mapButton}
                    <button type="button" class="btn" data-whatsapp-property="${id}">WhatsApp</button>
                </div>
            </article>
        `;
    }

    function createIntroduction(requirement, results) {
        const count = results.length;
        const location = requirement.locationDisplayName || requirement.locationName;
        const purpose = requirement.purpose;
        const requestedAcres = U.requestedAreaInAcres(requirement.area);
        const budget = requirement.budget?.maxCrore;

        if (location && purpose && requestedAcres) {
            return `I found ${count} property${count === 1 ? "" : "ies"} matching your requirement for around ${Number(requestedAcres.toFixed(2))} acres of ${purpose} land near ${U.escapeHTML(location)}.`;
        }

        if (location && purpose) {
            return `I found ${count} property${count === 1 ? "" : "ies"} matching your ${purpose} requirement near ${U.escapeHTML(location)}.`;
        }

        if (location) {
            return `I found ${count} property${count === 1 ? "" : "ies"} near ${U.escapeHTML(location)} that may suit your requirement.`;
        }

        if (purpose && budget) {
            return `I found ${count} property${count === 1 ? "" : "ies"} matching your ${purpose} requirement within your budget range.`;
        }

        if (purpose) {
            return `I found ${count} property${count === 1 ? "" : "ies"} suitable for ${purpose}.`;
        }

        return `I found ${count} property${count === 1 ? "" : "ies"} that may match your requirement.`;
    }

    function generateResponse(result) {
        if (!result || !Array.isArray(result.ranked) || result.ranked.length === 0) {
            return createEmptyResponse(result?.requirement || {});
        }

        const cards = result.ranked
            .slice(0, 8)
            .map(createResultCard);

        return {
            success: true,
            title: "Recommended Properties",
            message: createIntroduction(result.requirement, result.ranked),
            cards
        };
    }

    function createEmptyResponse(requirement) {
        let suggestion = "I couldn't find a property matching your current requirements. Try a broader location, different acreage, or a wider budget.";

        if (requirement?.locationDisplayName || requirement?.locationName) {
            const location = requirement.locationDisplayName || requirement.locationName;
            suggestion = `I couldn't find a matching property in ${U.escapeHTML(location)}. Try a nearby location, remove the strict location, or broaden the area/budget.`;
        }

        return {
            success: false,
            title: "No Matching Property",
            message: suggestion,
            cards: []
        };
    }

    window.ISOWResponse = {
        formatArea,
        formatPrice,
        formatLocation,
        matchLabel,
        stars,
        createResultCard,
        createIntroduction,
        generateResponse,
        createEmptyResponse
    };
})();
