(function () {
    "use strict";

    const K = window.ISOW_KNOWLEDGE || {};
    const U = window.ISOWUtils;

    function escapeRegExp(value) {
        return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }

    function normalizeLocation(text) {
        let value = U.normalize(text);
        const aliases = K.locationAliases || {};

        const entries = Object.entries(aliases)
            .sort((a, b) => b[0].length - a[0].length);

        for (const [alias, canonical] of entries) {
            const normalizedAlias = U.normalize(alias);
            if (!normalizedAlias) {
                continue;
            }

            const pattern = new RegExp(`\\b${escapeRegExp(normalizedAlias)}\\b`, "gi");
            value = value.replace(pattern, canonical);
        }

        return value.replace(/\s+/g, " ").trim();
    }

    function extractArea(query) {
        const text = U.normalize(query);
        let acres = null;
        let grounds = null;
        let sqft = null;

        let match = text.match(/(\d+(?:\.\d+)?)\s*(?:acre|acres|acr|ac)\b/i);
        if (match) {
            acres = Number(match[1]);
        }

        match = text.match(/(\d+(?:\.\d+)?)\s*(?:ground|grounds)\b/i);
        if (match) {
            grounds = Number(match[1]);
        }

        match = text.match(/(\d+(?:\.\d+)?)\s*(?:sq\s*ft|sqft|square\s*feet|square\s*foot|sft)\b/i);
        if (match) {
            sqft = Number(match[1]);
        }

        if (acres === null && grounds === null && sqft === null) {
            return null;
        }

        return { acres, grounds, sqft };
    }

    function extractBudget(query) {
        const text = U.normalize(query);

        if (/no budget|open budget|budget open|no limit|flexible budget|price flexible/i.test(text)) {
            return {
                open: true,
                minCrore: null,
                maxCrore: null,
                unit: "crore"
            };
        }

        let maxCrore = null;
        let minCrore = null;

        let match = text.match(/(?:under|below|less than|maximum|max|upto|up to|within|not more than)\s*₹?\s*(\d+(?:\.\d+)?)\s*(crore|crores|cr)\b/i);
        if (match) {
            maxCrore = Number(match[1]);
        }

        if (maxCrore === null) {
            match = text.match(/(?:under|below|less than|maximum|max|upto|up to|within|not more than)\s*₹?\s*(\d+(?:\.\d+)?)\s*(lakh|lakhs|lac|lacs)\b/i);
            if (match) {
                maxCrore = Number(match[1]) / 100;
            }
        }

        match = text.match(/(?:above|over|more than|minimum|min|at least|not less than)\s*₹?\s*(\d+(?:\.\d+)?)\s*(crore|crores|cr)\b/i);
        if (match) {
            minCrore = Number(match[1]);
        }

        if (minCrore === null) {
            match = text.match(/(?:above|over|more than|minimum|min|at least|not less than)\s*₹?\s*(\d+(?:\.\d+)?)\s*(lakh|lakhs|lac|lacs)\b/i);
            if (match) {
                minCrore = Number(match[1]) / 100;
            }
        }

        if (maxCrore === null && minCrore === null) {
            match = text.match(/₹?\s*(\d+(?:\.\d+)?)\s*(crore|crores|cr)\b/i);
            if (match) {
                maxCrore = Number(match[1]);
            }
        }

        if (maxCrore === null && minCrore === null) {
            match = text.match(/₹?\s*(\d+(?:\.\d+)?)\s*(lakh|lakhs|lac|lacs)\b/i);
            if (match) {
                maxCrore = Number(match[1]) / 100;
            }
        }

        if (maxCrore === null && minCrore === null) {
            return null;
        }

        return {
            open: false,
            minCrore,
            maxCrore,
            unit: "crore",
            basis: /total|overall|project/i.test(text) ? "total" : "per-acre"
        };
    }

    function extractPurpose(query) {
        const text = U.normalize(query);
        const matches = [];

        for (const [purpose, keywords] of Object.entries(K.purposes || {})) {
            for (const keyword of keywords) {
                const normalizedKeyword = U.normalize(keyword);
                if (normalizedKeyword && text.includes(normalizedKeyword)) {
                    matches.push({
                        value: purpose,
                        matchedKeyword: normalizedKeyword
                    });
                }
            }
        }

        if (!matches.length) {
            return null;
        }

        matches.sort((a, b) => b.matchedKeyword.length - a.matchedKeyword.length);
        return matches[0];
    }

    function getDatabase() {
        if (window.ISOW_DATABASE && Array.isArray(window.ISOW_DATABASE.properties)) {
            return window.ISOW_DATABASE.properties;
        }

        if (window.ISOW_SEARCH && Array.isArray(window.ISOW_SEARCH.database)) {
            return window.ISOW_SEARCH.database;
        }

        return [];
    }

    function addCandidate(candidates, value, type, matched, source) {
        const normalizedValue = normalizeLocation(value);
        const normalizedMatched = normalizeLocation(matched || value);

        if (!normalizedValue || normalizedMatched.length < 2) {
            return;
        }

        candidates.push({
            value: normalizedValue,
            displayName: U.titleCase(normalizedValue),
            type,
            matched: normalizedMatched,
            source: source || "rule"
        });
    }

    function extractLocation(query) {
        const normalized = normalizeLocation(query);
        const candidates = [];

        for (const [canonical, aliases] of Object.entries(K.states || {})) {
            for (const alias of aliases) {
                const normalizedAlias = normalizeLocation(alias);
                if (normalizedAlias && normalized.includes(normalizedAlias)) {
                    addCandidate(candidates, canonical, "state", normalizedAlias, "state");
                }
            }
        }

        for (const [canonical, aliases] of Object.entries(K.knownLocations || {})) {
            const allNames = [canonical, ...aliases];
            for (const alias of allNames) {
                const normalizedAlias = normalizeLocation(alias);
                if (normalizedAlias && normalized.includes(normalizedAlias)) {
                    addCandidate(candidates, canonical, "known", normalizedAlias, "knowledge");
                }
            }
        }

        const database = getDatabase();

        for (const property of database) {
            const fields = [
                { value: property?.village, type: "village" },
                { value: property?.locality, type: "locality" },
                { value: property?.taluk, type: "taluk" },
                { value: property?.city, type: "city" },
                { value: property?.district, type: "district" },
                { value: property?.state, type: "state" }
            ];

            for (const field of fields) {
                if (!field.value) {
                    continue;
                }

                const canonical = normalizeLocation(field.value);
                if (canonical.length >= 3 && normalized.includes(canonical)) {
                    addCandidate(candidates, canonical, field.type, canonical, "database");
                }
            }

            const aliases = U.asArray(property?.ai?.aliases);
            for (const alias of aliases) {
                const normalizedAlias = normalizeLocation(alias);
                if (normalizedAlias.length >= 3 && normalized.includes(normalizedAlias)) {
                    const canonicalValue = fieldValueForAlias(property, alias);
                    addCandidate(candidates, canonicalValue, "alias", normalizedAlias, "property-alias");
                }
            }
        }

        if (!candidates.length) {
            return null;
        }

        const priority = {
            village: 8,
            locality: 7,
            taluk: 6,
            city: 6,
            known: 5,
            district: 4,
            alias: 4,
            state: 2
        };

        const deduped = [];
        const seen = new Set();

        for (const candidate of candidates) {
            const key = `${candidate.type}|${candidate.value}`;
            if (!seen.has(key)) {
                seen.add(key);
                deduped.push(candidate);
            }
        }

        deduped.sort((a, b) => {
            const priorityDifference = (priority[b.type] || 1) - (priority[a.type] || 1);
            if (priorityDifference !== 0) {
                return priorityDifference;
            }
            return String(b.matched).length - String(a.matched).length;
        });

        return deduped[0];
    }

    function extractConnectivity(query) {
        const text = U.normalize(query);
        const result = {
            highway: false,
            airport: false,
            railway: false,
            port: false,
            metro: false,
            sipcot: false,
            industrialPark: false
        };

        for (const [key, keywords] of Object.entries(K.connectivity || {})) {
            if (U.containsAny(text, keywords)) {
                result[key] = true;
            }
        }

        return result;
    }

    function extractRadius(query) {
        const text = U.normalize(query);
        const match = text.match(/(?:within|inside|under|radius\s*of|within\s+a\s+radius\s+of)\s*(\d+(?:\.\d+)?)\s*km\b/i);
        return match ? Number(match[1]) : null;
    }

    function isNearbyRequest(query) {
        return U.containsAny(query, K.queryWords?.nearby || []);
    }

    function requestsCurrentLocation(query) {
        const text = U.normalize(query);
        return /near me|my location|current location|around me|close to me|use my location/i.test(text);
    }

    function detectAreaMode(query) {
        const text = U.normalize(query);

        if (U.containsAny(text, K.queryWords?.minimum || [])) {
            return "minimum";
        }

        if (U.containsAny(text, K.queryWords?.maximum || [])) {
            return "maximum";
        }

        return "exact";
    }

    function fieldValueForAlias(property, alias) {
        const normalizedAlias = normalizeLocation(alias);
        const possibleFields = [
            property?.village,
            property?.locality,
            property?.taluk,
            property?.district,
            property?.city,
            property?.state,
            property?.name
        ];

        for (const value of possibleFields) {
            if (!value) {
                continue;
            }

            const normalizedValue = normalizeLocation(value);
            if (normalizedValue.includes(normalizedAlias) || normalizedAlias.includes(normalizedValue)) {
                return value;
            }
        }

        return alias;
    }

    function extractRequirements(query) {
        const original = String(query || "").trim();
        const normalized = normalizeLocation(original);
        const area = extractArea(original);
        const budget = extractBudget(original);
        const purpose = extractPurpose(original);
        const location = extractLocation(original);
        const connectivity = extractConnectivity(original);
        const radiusKm = extractRadius(original);
        const nearby = isNearbyRequest(original);
        const currentLocation = requestsCurrentLocation(original);
        const areaMode = detectAreaMode(original);

        return {
            originalQuery: original,
            normalizedQuery: normalized,
            location,
            locationName: location?.value || null,
            locationDisplayName: location?.displayName || null,
            locationType: location?.type || null,
            purpose: purpose?.value || null,
            purposeKeyword: purpose?.matchedKeyword || null,
            area,
            areaMode,
            budget,
            connectivity,
            radiusKm,
            nearby,
            currentLocation
        };
    }

    window.ISOWExtractor = {
        normalizeLocation,
        extractArea,
        extractBudget,
        extractPurpose,
        extractLocation,
        extractConnectivity,
        extractRadius,
        isNearbyRequest,
        requestsCurrentLocation,
        detectAreaMode,
        extractRequirements
    };
})();
