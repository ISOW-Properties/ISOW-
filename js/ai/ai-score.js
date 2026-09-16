(function () {
    "use strict";

    const K = window.ISOW_KNOWLEDGE || {};
    const M = window.ISOWMatcher;
    const U = window.ISOWUtils;

    function locationScore(property, requirement) {
        if (!requirement?.locationName && !requirement?.currentLocationCoords) {
            return 8;
        }

        return M.locationLevel(property, requirement);
    }

    function purposeScore(property, requirement) {
        if (!requirement?.purpose) {
            return 0;
        }

        return M.purposeMatch(property, requirement)
            ? (K.weights?.purpose || 25)
            : 0;
    }

    function areaScore(property, requirement) {
        if (!requirement?.area) {
            return 0;
        }

        const actual = U.propertyAreaInAcres(property);
        const requested = U.requestedAreaInAcres(requirement.area);

        if (actual === null || requested === null || requested <= 0) {
            return 4;
        }

        if (requirement.areaMode === "minimum") {
            if (actual >= requested) {
                return K.weights?.area || 20;
            }
            if (actual >= requested * 0.90) {
                return 12;
            }
            return 0;
        }

        if (requirement.areaMode === "maximum") {
            if (actual <= requested) {
                return K.weights?.area || 20;
            }
            if (actual <= requested * 1.15) {
                return 12;
            }
            return 0;
        }

        const ratio = actual / requested;

        if (ratio >= 0.90 && ratio <= 1.25) {
            return K.weights?.area || 20;
        }

        if (ratio >= 0.70 && ratio <= 2) {
            return 14;
        }

        if (ratio > 2) {
            return 8;
        }

        return 0;
    }

    function budgetScore(property, requirement) {
        if (!requirement?.budget) {
            return 0;
        }

        if (requirement.budget.open) {
            return 5;
        }

        const rate = U.rateCrorePerAcre(property);
        if (rate === null) {
            return 4;
        }

        if (requirement.budget.maxCrore !== null && requirement.budget.maxCrore !== undefined) {
            if (rate <= requirement.budget.maxCrore) {
                return K.weights?.budget || 18;
            }
            if (rate <= requirement.budget.maxCrore * 1.15) {
                return 10;
            }
            return 0;
        }

        if (requirement.budget.minCrore !== null && requirement.budget.minCrore !== undefined) {
            if (rate >= requirement.budget.minCrore) {
                return K.weights?.budget || 18;
            }
            if (rate >= requirement.budget.minCrore * 0.85) {
                return 10;
            }
            return 0;
        }

        return 0;
    }

    function connectivityScore(property, requirement) {
        const c = requirement?.connectivity || {};
        let score = 0;

        if (c.highway && U.numeric(property?.highwayKm) !== null) {
            if (Number(property.highwayKm) <= 5) score += K.weights?.highway || 8;
            else if (Number(property.highwayKm) <= 15) score += 5;
        }

        if (c.airport && U.numeric(property?.airportKm) !== null) {
            if (Number(property.airportKm) <= 25) score += K.weights?.airport || 8;
            else if (Number(property.airportKm) <= 50) score += 4;
        }

        if (c.railway && U.numeric(property?.railwayKm) !== null) {
            if (Number(property.railwayKm) <= 15) score += K.weights?.railway || 6;
            else if (Number(property.railwayKm) <= 30) score += 3;
        }

        if (c.port && U.numeric(property?.portKm) !== null) {
            if (Number(property.portKm) <= 40) score += K.weights?.port || 6;
        }

        if (c.metro && U.numeric(property?.metroKm) !== null) {
            if (Number(property.metroKm) <= 15) score += K.weights?.metro || 5;
        }

        if (c.sipcot && U.numeric(property?.sipcotKm) !== null) {
            if (Number(property.sipcotKm) <= 20) score += K.weights?.sipcot || 8;
        }

        if (c.industrialPark && U.numeric(property?.industrialParkKm) !== null) {
            if (Number(property.industrialParkKm) <= 20) score += K.weights?.industrialPark || 8;
        }

        return Math.min(score, 20);
    }

    function reasonList(property, requirement, scores) {
        const reasons = [];

        if (scores.location > 0 && requirement?.locationName) {
            reasons.push("location match");
        }

        if (scores.purpose > 0 && requirement?.purpose) {
            reasons.push(`${requirement.purpose} suitability`);
        }

        if (scores.area > 0 && requirement?.area) {
            reasons.push("area fit");
        }

        if (scores.budget > 0 && requirement?.budget) {
            reasons.push("budget fit");
        }

        if (scores.connectivity > 0) {
            reasons.push("connectivity advantage");
        }

        if (property?.verified === true) {
            reasons.push("verified listing");
        }

        return reasons;
    }

    function totalScore(property, requirement) {
        const scores = {
            location: locationScore(property, requirement),
            purpose: purposeScore(property, requirement),
            area: areaScore(property, requirement),
            budget: budgetScore(property, requirement),
            connectivity: connectivityScore(property, requirement),
            verified: property?.verified === true ? (K.weights?.verified || 4) : 0
        };

        const raw = Object.values(scores).reduce((sum, value) => sum + value, 0);
        const score = Math.min(99, Math.round(raw));

        return {
            raw,
            score,
            breakdown: scores,
            reasons: reasonList(property, requirement, scores)
        };
    }

    function stars(score) {
        if (score >= 90) return "★★★★★";
        if (score >= 75) return "★★★★☆";
        if (score >= 60) return "★★★★";
        if (score >= 45) return "★★★☆";
        return "★★★";
    }

    function label(score) {
        if (score >= 90) return "Excellent Match";
        if (score >= 75) return "Strong Match";
        if (score >= 60) return "Good Match";
        if (score >= 45) return "Related Match";
        return "Nearby Match";
    }

    function rank(properties, requirement) {
        return U.asArray(properties)
            .filter(property => M.matches(property, requirement))
            .map(property => {
                const result = totalScore(property, requirement);
                return {
                    property,
                    rawScore: result.raw,
                    score: result.score,
                    breakdown: result.breakdown,
                    reasons: result.reasons,
                    stars: stars(result.score),
                    label: label(result.score)
                };
            })
            .filter(item => item.score > 0)
            .sort((a, b) => b.score - a.score);
    }

    window.ISOWScore = {
        rank,
        totalScore,
        stars,
        label,
        locationScore,
        purposeScore,
        areaScore,
        budgetScore,
        connectivityScore
    };
})();
