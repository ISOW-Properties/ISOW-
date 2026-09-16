(function () {
    "use strict";

    const K = window.ISOW_KNOWLEDGE || {};
    const U = window.ISOWUtils;
    const E = window.ISOWExtractor;

    function wantedLocation(requirement) {
        return E.normalizeLocation(requirement?.locationName || "");
    }

    function propertyFields(property) {
        return U.propertyLocationFields(property)
            .map(value => E.normalizeLocation(value));
    }

    function exactLocation(property, requirement) {
        const wanted = wantedLocation(requirement);
        if (!wanted) {
            return true;
        }

        return propertyFields(property).some(field => field === wanted);
    }

    function partialLocation(property, requirement) {
        const wanted = wantedLocation(requirement);
        if (!wanted || wanted.length < 3) {
            return true;
        }

        return propertyFields(property).some(field => {
            if (!field || field.length < 3) {
                return false;
            }
            return field.includes(wanted) || wanted.includes(field);
        });
    }

    function stateMatch(property, requirement) {
        const wanted = wantedLocation(requirement);
        if (!wanted) {
            return true;
        }

        return E.normalizeLocation(property?.state || "") === wanted;
    }

    function districtMatch(property, requirement) {
        const wanted = wantedLocation(requirement);
        if (!wanted) {
            return true;
        }

        return E.normalizeLocation(property?.district || "") === wanted;
    }

    function cityMatch(property, requirement) {
        const wanted = wantedLocation(requirement);
        if (!wanted) {
            return true;
        }

        return E.normalizeLocation(property?.city || "") === wanted;
    }

    function nearbyLocation(property, requirement) {
        const wanted = wantedLocation(requirement);
        if (!wanted) {
            return true;
        }

        if (!requirement?.nearby) {
            return false;
        }

        const nearby = K.nearbyLocations?.[wanted] || [];
        if (!nearby.length) {
            return false;
        }

        const fields = propertyFields(property);
        return nearby.some(location => {
            const normalized = E.normalizeLocation(location);
            return fields.some(field => field.includes(normalized) || normalized.includes(field));
        });
    }

    function locationLevel(property, requirement) {
        const wanted = wantedLocation(requirement);
        if (!wanted) {
            return 0;
        }

        const fields = {
            village: E.normalizeLocation(property?.village || ""),
            locality: E.normalizeLocation(property?.locality || ""),
            taluk: E.normalizeLocation(property?.taluk || ""),
            city: E.normalizeLocation(property?.city || ""),
            district: E.normalizeLocation(property?.district || ""),
            state: E.normalizeLocation(property?.state || "")
        };

        if (fields.village === wanted) {
            return K.weights?.exactVillage || 60;
        }

        if (fields.locality === wanted) {
            return K.weights?.exactLocality || 55;
        }

        if (fields.taluk === wanted) {
            return K.weights?.exactTaluk || 50;
        }

        if (fields.city === wanted) {
            return K.weights?.exactCity || 45;
        }

        if (fields.district === wanted) {
            return K.weights?.exactDistrict || 35;
        }

        if (fields.state === wanted) {
            return K.weights?.exactState || 20;
        }

        const aiAliases = U.asArray(property?.ai?.aliases).map(value => E.normalizeLocation(value));
        if (aiAliases.some(alias => alias === wanted || alias.includes(wanted) || wanted.includes(alias))) {
            return K.weights?.alias || 35;
        }

        if (nearbyLocation(property, requirement)) {
            return K.weights?.nearby || 28;
        }

        if (partialLocation(property, requirement)) {
            return K.weights?.partial || 30;
        }

        return 0;
    }

    function locationMatch(property, requirement) {
        if (!requirement?.locationName && !requirement?.currentLocationCoords) {
            return true;
        }

        if (requirement?.currentLocationCoords) {
            return true;
        }

        return locationLevel(property, requirement) > 0;
    }

    function purposeMatch(property, requirement) {
        if (!requirement?.purpose) {
            return true;
        }

        const text = U.propertySearchText(property);
        const keywords = K.purposes?.[requirement.purpose] || [];

        return keywords.some(keyword => {
            const normalized = U.normalize(keyword);
            return normalized && text.includes(normalized);
        });
    }

    function areaMatch(property, requirement) {
        if (!requirement?.area) {
            return true;
        }

        const actual = U.propertyAreaInAcres(property);
        const requested = U.requestedAreaInAcres(requirement.area);

        if (actual === null || requested === null || requested <= 0) {
            return true;
        }

        if (requirement.areaMode === "minimum") {
            return actual >= requested * 0.95;
        }

        if (requirement.areaMode === "maximum") {
            return actual <= requested * 1.10;
        }

        return actual >= requested * 0.70;
    }

    function budgetMatch(property, requirement) {
        if (!requirement?.budget || requirement.budget.open) {
            return true;
        }

        const rate = U.rateCrorePerAcre(property);
        if (rate === null) {
            return true;
        }

        if (requirement.budget.maxCrore !== null && requirement.budget.maxCrore !== undefined) {
            if (rate > requirement.budget.maxCrore * 1.15) {
                return false;
            }
        }

        if (requirement.budget.minCrore !== null && requirement.budget.minCrore !== undefined) {
            if (rate < requirement.budget.minCrore * 0.85) {
                return false;
            }
        }

        return true;
    }

    function matches(property, requirement) {
        if (!property) {
            return false;
        }

        if (!locationMatch(property, requirement)) {
            return false;
        }

        if (!purposeMatch(property, requirement)) {
            return false;
        }

        if (!areaMatch(property, requirement)) {
            return false;
        }

        if (!budgetMatch(property, requirement)) {
            return false;
        }

        return true;
    }

    window.ISOWMatcher = {
        exactLocation,
        partialLocation,
        nearbyLocation,
        stateMatch,
        districtMatch,
        cityMatch,
        locationLevel,
        locationMatch,
        purposeMatch,
        areaMatch,
        budgetMatch,
        matches
    };
})();
