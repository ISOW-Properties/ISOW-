(function () {
    "use strict";

    function normalize(value) {
        return String(value ?? "")
            .toLowerCase()
            .normalize("NFKD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^\w\s./₹-]/g, " ")
            .replace(/\s+/g, " ")
            .trim();
    }

    function escapeHTML(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function asArray(value) {
        return Array.isArray(value) ? value : [];
    }

    function numeric(value) {
        if (value === null || value === undefined || value === "") {
            return null;
        }

        const cleaned = String(value)
            .replace(/,/g, "")
            .replace(/[₹\s]/g, "")
            .trim();

        const result = Number(cleaned);
        return Number.isFinite(result) ? result : null;
    }

    function unique(values) {
        return [...new Set(
            asArray(values)
                .filter(Boolean)
                .map(normalize)
                .filter(Boolean)
        )];
    }

    function containsAny(text, words) {
        const normalized = normalize(text);
        return asArray(words).some(word => {
            const value = normalize(word);
            return value && normalized.includes(value);
        });
    }

    function titleCase(value) {
        return String(value ?? "")
            .toLowerCase()
            .replace(/\b\w/g, letter => letter.toUpperCase());
    }

    function propertySearchText(property) {
        const ai = property?.ai || {};

        return normalize([
            property?.id,
            property?.name,
            property?.landType,
            property?.category,
            property?.village,
            property?.locality,
            property?.taluk,
            property?.district,
            property?.city,
            property?.state,
            property?.country,
            property?.roadType,
            property?.zoning,
            property?.terrain,
            property?.landClass,
            property?.facing,
            property?.note,
            ...asArray(property?.usage),
            ...asArray(ai.searchKeywords),
            ...asArray(ai.aliases),
            ...asArray(ai.strengths),
            ...asArray(ai.bestFor)
        ].join(" "));
    }

    function propertyLocationFields(property) {
        const ai = property?.ai || {};

        return unique([
            property?.name,
            property?.village,
            property?.locality,
            property?.taluk,
            property?.district,
            property?.city,
            property?.state,
            property?.country,
            ...asArray(ai.aliases)
        ]);
    }

    function propertyLocationText(property) {
        return [
            property?.village,
            property?.locality,
            property?.city,
            property?.district,
            property?.state
        ]
            .filter(Boolean)
            .join(", ");
    }

    function propertyAreaInAcres(property) {
        const acres = numeric(property?.acres);
        if (acres !== null) {
            return acres;
        }

        const grounds = numeric(property?.grounds);
        if (grounds !== null) {
            return grounds / 18.15;
        }

        const sqft = numeric(property?.sqft);
        if (sqft !== null) {
            return sqft / 43560;
        }

        return null;
    }

    function requestedAreaInAcres(area) {
        if (!area) {
            return null;
        }

        if (area.acres !== null && area.acres !== undefined) {
            return numeric(area.acres);
        }

        if (area.grounds !== null && area.grounds !== undefined) {
            const value = numeric(area.grounds);
            return value === null ? null : value / 18.15;
        }

        if (area.sqft !== null && area.sqft !== undefined) {
            const value = numeric(area.sqft);
            return value === null ? null : value / 43560;
        }

        return null;
    }

    function rateCrorePerAcre(property) {
        const rate = numeric(property?.rate);
        if (rate === null) {
            return null;
        }

        const unit = normalize(property?.priceUnit || "acre");

        if (unit.includes("acre") || unit === "ac") {
            return rate;
        }

        if (unit.includes("ground")) {
            return rate * 18.15;
        }

        if (unit.includes("sqft") || unit.includes("sq ft") || unit.includes("square")) {
            return rate * 43560 / 10000000;
        }

        return rate;
    }

    function hasAnyTrue(object) {
        return Object.values(object || {}).some(Boolean);
    }

    window.ISOWUtils = {
        normalize,
        escapeHTML,
        asArray,
        numeric,
        unique,
        containsAny,
        titleCase,
        propertySearchText,
        propertyLocationFields,
        propertyLocationText,
        propertyAreaInAcres,
        requestedAreaInAcres,
        rateCrorePerAcre,
        hasAnyTrue
    };
})();
