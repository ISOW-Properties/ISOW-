(function () {
    "use strict";

    window.ISOW_KNOWLEDGE = {
        states: {
            "tamil nadu": ["tamil nadu", "tn", "tamilnadu"],
            "kerala": ["kerala", "kl"],
            "karnataka": ["karnataka", "ka"],
            "andhra pradesh": ["andhra pradesh", "ap"],
            "telangana": ["telangana", "ts", "tg"],
            "puducherry": ["puducherry", "py", "pondicherry", "pondy"]
        },

        locationAliases: {
            "madras": "chennai",
            "madras city": "chennai",
            "chennaicity": "chennai",
            "chn": "chennai",

            "blr": "bengaluru",
            "bangalore": "bengaluru",
            "banglore": "bengaluru",
            "bangluru": "bengaluru",
            "bengaluru city": "bengaluru",

            "cochin": "kochi",
            "cochin city": "kochi",

            "trivandrum": "thiruvananthapuram",
            "tvm": "thiruvananthapuram",

            "chengapattu": "chengalpattu",
            "chengalpet": "chengalpattu",
            "chengelpet": "chengalpattu",
            "chengalpatt": "chengalpattu",

            "sriperambudur": "sriperumbudur",
            "sriperambadoor": "sriperumbudur",
            "sriperumbadoor": "sriperumbudur",

            "kanchi": "kanchipuram",
            "kanchipuram town": "kanchipuram",

            "trichy": "tiruchirappalli",
            "tiruchi": "tiruchirappalli",

            "thoothukudi": "tuticorin",
            "tuticorin": "tuticorin",

            "pondy": "puducherry",
            "pondicherry": "puducherry",

            "ecr road": "ecr",
            "omr road": "omr",
            "gst road": "gst road",
            "nh road": "highway"
        },

        knownLocations: {
            "chennai": ["chennai", "madras"],
            "bengaluru": ["bengaluru", "bangalore", "banglore", "blr"],
            "kochi": ["kochi", "cochin"],
            "thiruvananthapuram": ["thiruvananthapuram", "trivandrum", "tvm"],
            "alappuzha": ["alappuzha", "alleppey"],
            "coimbatore": ["coimbatore", "kovai"],
            "madurai": ["madurai"],
            "tiruchirappalli": ["tiruchirappalli", "trichy", "tiruchi"],
            "salem": ["salem"],
            "vellore": ["vellore"],
            "kanchipuram": ["kanchipuram", "kanchi"],
            "chengalpattu": ["chengalpattu", "chengalpet", "chengapattu"],
            "sriperumbudur": ["sriperumbudur", "sriperambudur", "sriperumbadoor"],
            "oragadam": ["oragadam"],
            "maraimalai nagar": ["maraimalai nagar", "mm nagar"],
            "singaperumal koil": ["singaperumal koil", "sp koil"],
            "walajabad": ["walajabad"],
            "tambaram": ["tambaram"],
            "kundrathur": ["kundrathur"],
            "ecr": ["ecr", "east coast road"],
            "omr": ["omr", "old mahabalipuram road"],
            "puducherry": ["puducherry", "pondicherry", "pondy"],
            "tuticorin": ["tuticorin", "thoothukudi"]
        },

        nearbyLocations: {
            "chennai": ["oragadam", "sriperumbudur", "maraimalai nagar", "chengalpattu", "walajabad", "tambaram", "ecr", "omr"],
            "oragadam": ["sriperumbudur", "chennai", "walajabad", "kanchipuram"],
            "sriperumbudur": ["oragadam", "chennai", "walajabad", "kundrathur", "kanchipuram"],
            "chengalpattu": ["maraimalai nagar", "singaperumal koil", "chennai", "ecr"],
            "kanchipuram": ["sriperumbudur", "oragadam", "walajabad"],
            "maraimalai nagar": ["chengalpattu", "chennai", "singaperumal koil"],
            "ecr": ["chennai", "puducherry", "chengalpattu"],
            "omr": ["chennai", "chengalpattu"]
        },

        purposes: {
            logistics: [
                "logistics", "logistics hub", "logistics park", "distribution", "distribution center",
                "distribution centre", "supply chain", "truck terminal", "transport hub"
            ],
            warehouse: [
                "warehouse", "warehousing", "godown", "storage", "storage facility", "fulfillment",
                "fulfilment", "fulfillment center", "fulfilment center", "cold storage"
            ],
            industrial: [
                "industrial", "industry", "factory", "factories", "manufacturing", "manufacturing plant",
                "production plant", "plant", "industrial park", "industrial use", "factory land",
                "automobile", "electronics", "assembly", "workshop"
            ],
            commercial: [
                "commercial", "retail", "showroom", "office", "business park", "mall", "shopping",
                "commercial development", "mixed use", "it park", "tech park"
            ],
            resort: [
                "resort", "hotel", "hospitality", "holiday resort", "beach resort", "tourism",
                "tourist", "farm stay", "eco resort"
            ],
            investment: [
                "investment", "invest", "appreciation", "land banking", "land bank", "capital appreciation",
                "large parcel", "land parcel", "future growth", "hold", "commercial investment"
            ],
            residential: [
                "residential", "housing", "villa", "apartment", "residential development", "gated community"
            ],
            layout: [
                "layout", "plotted development", "plotting", "residential layout", "plots"
            ],
            township: [
                "township", "integrated township"
            ]
        },

        connectivity: {
            highway: ["highway", "highway access", "national highway", "nh", "expressway", "main road", "road access", "wide road"],
            airport: ["airport", "airport access", "near airport", "close to airport"],
            railway: ["railway", "railway station", "rail", "train station"],
            port: ["port", "seaport", "sea port", "port access", "harbour", "harbor"],
            metro: ["metro", "metro rail", "metro station"],
            sipcot: ["sipcot", "sipcot park", "sipcot industrial park"],
            industrialPark: ["industrial park", "industrial estate", "industrial corridor", "industrial zone"]
        },

        queryWords: {
            nearby: ["near", "nearby", "close to", "around", "within", "close", "in and around", "surrounding"],
            maximum: ["under", "below", "less than", "maximum", "max", "upto", "up to", "within", "not more than"],
            minimum: ["above", "more than", "minimum", "min", "at least", "not less than"],
            reset: ["reset", "clear", "start over", "new search", "fresh search"],
            searchNow: ["search", "show", "show results", "find now", "search now", "skip", "any", "anything", "no preference"]
        },

        weights: {
            exactVillage: 60,
            exactLocality: 55,
            exactTaluk: 50,
            exactCity: 45,
            exactDistrict: 35,
            exactState: 20,
            nearby: 28,
            partial: 30,
            alias: 35,
            purpose: 25,
            area: 20,
            budget: 18,
            highway: 8,
            airport: 8,
            railway: 6,
            port: 6,
            metro: 5,
            sipcot: 8,
            industrialPark: 8,
            verified: 4
        },

        thresholds: {
            excellent: 85,
            strong: 70,
            good: 55,
            related: 35,
            weak: 20
        }
    };
})();
