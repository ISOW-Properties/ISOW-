(function () {
    "use strict";

    const Extractor = window.ISOWExtractor;
    const Score = window.ISOWScore;

    function database() {
        if (window.ISOW_DATABASE && Array.isArray(window.ISOW_DATABASE.properties)) {
            return window.ISOW_DATABASE.properties;
        }

        if (window.ISOW_SEARCH && Array.isArray(window.ISOW_SEARCH.database)) {
            return window.ISOW_SEARCH.database;
        }

        return [];
    }

    function search(query) {
        const requirement = Extractor.extractRequirements(query);
        return searchRequirement(requirement);
    }

    function searchRequirement(requirement) {
        const ranked = Score.rank(database(), requirement || {});

        return {
            query: requirement?.originalQuery || "",
            requirement: requirement || {},
            ranked
        };
    }

    function topMatches(query, limit = 10) {
        return search(query).ranked.slice(0, limit);
    }

    function exact(query) {
        return topMatches(query).filter(item => item.score >= 75);
    }

    function nearby(query) {
        return topMatches(query).filter(item => item.score >= 35 && item.score < 75);
    }

    function response(query) {
        const result = search(query);

        if (!window.ISOWResponse) {
            return result;
        }

        return window.ISOWResponse.generateResponse(result);
    }

    window.ISOWEngine = {
        database,
        search,
        searchRequirement,
        response,
        exact,
        nearby,
        topMatches
    };
})();
