(function () {

"use strict";

/* ==========================================================
   ISOW PROPERTIES
========================================================== */


/* ==========================================================
   SEARCH ENGINE
========================================================== */

const SEARCH = window.ISOW_SEARCH;

if (!SEARCH) {

    console.error(
        "ISOW Search Engine not loaded."
    );

    return;

}


/* ==========================================================
   DATABASE
========================================================== */

const properties = [

    ...SEARCH.database

];

let filteredProperties = [

    ...properties

];


/* ==========================================================
   DOM
========================================================== */

const grid =
document.getElementById("propertyGrid");

const resultCount =
document.getElementById("resultCount");

const noResults =
document.getElementById("noResults");

const search =
document.getElementById("search");
   const state =
document.getElementById("stateFilter");

const district =
document.getElementById("districtFilter");

const city =
document.getElementById("cityFilter");

const landType =
document.getElementById("landTypeFilter");

const category =
document.getElementById("categoryFilter");

const minArea =
document.getElementById("minArea");

const maxArea =
document.getElementById("maxArea");

const maxRate =
document.getElementById("maxRate");

const roadWidth =
document.getElementById("roadWidth");

const frontage =
document.getElementById("frontage");

const exclusive =
document.getElementById("exclusiveFilter");

const sort =
document.getElementById("sort");

const reset =
document.getElementById("resetFilters");


/* ==========================================================
   UNIQUE VALUES
========================================================== */

function unique(field){

    return [

        ...new Set(

            properties

            .map(property=>property[field])

            .filter(Boolean)

        )

    ].sort();

}


/* ==========================================================
   SELECT OPTIONS
========================================================== */

function populateSelect(

    element,

    values,

    placeholder

){

    if(!element)
        return;

    element.innerHTML=

    `<option value="">

    ${placeholder}

    </option>`;

    values.forEach(value=>{

        element.insertAdjacentHTML(

            "beforeend",

            `

            <option value="${value}">

            ${value}

            </option>

            `

        );

    });

}


/* ==========================================================
   INITIALISE FILTERS
========================================================== */
populateSelect(
    state,
    unique("state"),
    "All States"
);
populateSelect(

district,

unique("district"),

"All Districts"

);

populateSelect(

city,

unique("city"),

"All Cities"

);

populateSelect(

landType,

unique("landType"),

"All Land Types"

);

populateSelect(

category,

unique("category"),

"All Categories"

);


/* ==========================================================
   NORMALIZE
========================================================== */

function normalize(value){

    return String(value ?? "")

    .toLowerCase()

    .replace(/[^\w\s.-]/g," ")

    .replace(/\s+/g," ")

    .trim();

}


/* ==========================================================
   SAFE NUMBER
========================================================== */

function numberValue(value){

    const n=Number(value);

    return Number.isFinite(n)

    ? n

    : null;

}


/* ==========================================================
   NEW DATABASE HELPERS
========================================================== */

function getArea(property){

    return {

        acres: property.acres,

        grounds: property.grounds,

        sqft: property.sqft

    };

}
function getPricing(property){

    return {

        rate: property.rate,

        unit: property.priceUnit,

        currency: property.currency,

        negotiable: property.negotiable

    };

}

function getRoad(property){

    return {

        type: property.roadType,

        width: property.roadWidth,

        frontage: property.frontage,

        roadFacing: property.roadFacing,

        cornerPlot: property.cornerPlot

    };

}
function getConnectivity(property){

    return {

        highwayKm: property.highwayKm,

        metroKm: property.metroKm,

        airportKm: property.airportKm,

        railwayKm: property.railwayKm,

        portKm: property.portKm,

        sipcotKm: property.sipcotKm,

        industrialParkKm: property.industrialParkKm

    };

}


/* ==========================================================
   SEARCH TEXT
========================================================== */

function getSearchText(property){

    const ai=

    property.ai||{};

    const road=

    getRoad(property);

    const connectivity=

    getConnectivity(property);

    return normalize([

        property.id,

        property.name,

        property.landType,

        property.category,

        property.village,

        property.locality,

        property.taluk,

        property.district,

        property.city,

        property.state,

        property.country,

        road.type,

        road.width,

        road.frontage,

        property.zoning,

        property.terrain,

        property.landClass,

        property.facing,

        property.status,

        property.ownerType,

        property.note,

        connectivity.highwayKm,

        connectivity.metroKm,

        connectivity.airportKm,

        connectivity.railwayKm,

        connectivity.portKm,

        connectivity.sipcotKm,

        connectivity.industrialParkKm,

        ...(Array.isArray(property.usage)

        ?property.usage

        :[]),

        ...(Array.isArray(ai.searchKeywords)

        ?ai.searchKeywords

        :[]),

        ...(Array.isArray(ai.aliases)

        ?ai.aliases

        :[]),

        ...(Array.isArray(ai.strengths)

        ?ai.strengths

        :[]),

        ...(Array.isArray(ai.bestFor)

        ?ai.bestFor

        :[])

    ].join(" "));

}

/* ==========================================================
   SEARCH MATCH
========================================================== */

function searchMatch(property, query){

    const text = normalize(query);

    if(!text)
        return true;

    const words =

        text

        .split(/\s+/)

        .filter(word=>word.length>=2);

    const source =

        getSearchText(property);

    return words.every(

        word=>source.includes(word)

    );

}


/* ==========================================================
   LAND TYPE MATCH
========================================================== */

function landTypeMatch(property,value){

    if(!value)
        return true;

    return normalize(property.landType)

    ===

    normalize(value);

}


/* ==========================================================
   CATEGORY MATCH
========================================================== */

function categoryMatch(property,value){

    if(!value)
        return true;

    return normalize(property.category)

    ===

    normalize(value);

}


/* ==========================================================
   DISTRICT MATCH
========================================================== */

function districtMatch(property,value){

    if(!value)
        return true;

    return normalize(property.district)

    ===

    normalize(value);

}


/* ==========================================================
   CITY MATCH
========================================================== */

function cityMatch(property,value){

    if(!value)
        return true;

    return normalize(property.city)

    ===

    normalize(value);

}


/* ==========================================================
   AREA MATCH
========================================================== */

function areaMatch(property){

    const minimum =

        minArea && minArea.value

        ? Number(minArea.value)

        : null;

    const maximum =

        maxArea && maxArea.value

        ? Number(maxArea.value)

        : null;

    const acres =

        numberValue(

            getArea(property).acres

        );

    if(

        minimum!==null &&

        acres!==null &&

        acres<minimum

    ){

        return false;

    }

    if(

        maximum!==null &&

        acres!==null &&

        acres>maximum

    ){

        return false;

    }

    return true;

}


/* ==========================================================
   RATE MATCH
========================================================== */

function rateMatch(property){

    if(

        !maxRate ||

        !maxRate.value

    ){

        return true;

    }

    const maximum =

        Number(maxRate.value);

    const pricing =

        getPricing(property);

    const rate =

        numberValue(pricing.rate);

    if(rate===null)
        return true;

    if(

        normalize(pricing.unit)

        .includes("acre")

    ){

        return rate<=maximum;

    }

    return true;

}


/* ==========================================================
   ROAD WIDTH MATCH
========================================================== */

function roadWidthMatch(property){

    if(

        !roadWidth ||

        !roadWidth.value

    ){

        return true;

    }

    const minimum =

        Number(roadWidth.value);

    const width =

        numberValue(

            getRoad(property).width

        );

    if(width===null)
        return false;

    return width>=minimum;

}


/* ==========================================================
   FRONTAGE MATCH
========================================================== */

function frontageMatch(property){

    if(

        !frontage ||

        !frontage.value

    ){

        return true;

    }

    const minimum =

        Number(frontage.value);

    const value =

        numberValue(

            getRoad(property).frontage

        );

    if(value===null)
        return false;

    return value>=minimum;

}


/* ==========================================================
   EXCLUSIVE MATCH
========================================================== */

function exclusiveMatch(property){

    if(

        !exclusive ||

        !exclusive.value

    ){

        return true;

    }

    return property.exclusive===true;

}
/* ==========================================================
   ALL FILTERS
========================================================== */

function matchesAllFilters(property){

    if(

        search &&

        !searchMatch(

            property,

            search.value

        )

    ){

        return false;

    }


    if(

        !districtMatch(

            property,

            district

            ? district.value

            : ""

        )

    ){

        return false;

    }


    if(

        !cityMatch(

            property,

            city

            ? city.value

            : ""

        )

    ){

        return false;

    }


    if(

        !landTypeMatch(

            property,

            landType

            ? landType.value

            : ""

        )

    ){

        return false;

    }


    if(

        !categoryMatch(

            property,

            category

            ? category.value

            : ""

        )

    ){

        return false;

    }


    if(

        !areaMatch(property)

    ){

        return false;

    }


    if(

        !rateMatch(property)

    ){

        return false;

    }


    if(

        !roadWidthMatch(property)

    ){

        return false;

    }


    if(

        !frontageMatch(property)

    ){

        return false;

    }


    if(

        !exclusiveMatch(property)

    ){

        return false;

    }


    return true;

}


/* ==========================================================
   FILTERED PROPERTIES
========================================================== */

function getFilteredProperties(){

    return properties.filter(

        matchesAllFilters

    );

}
/* ==========================================================
   SORT PROPERTIES
========================================================== */

function sortProperties(list){

    const selected =

        sort

        ? sort.value

        : "score";

    const results = [...list];

    switch(selected){

        case "score":

            return SEARCH.sort(results,"score");

        case "area":

            return SEARCH.sort(results,"area");

        case "price":

            return SEARCH.sort(results,"price");

        case "frontage":

            return SEARCH.sort(results,"frontage");

        case "name":

            return SEARCH.sort(results,"name");

        default:

            return results;

    }

}


/* ==========================================================
   DISPLAY AREA
========================================================== */

function displayArea(property){

    if(property.acres != null)
        return property.acres + " Acres";

    if(property.grounds != null)
        return property.grounds + " Grounds";

    if(property.sqft != null)
        return property.sqft.toLocaleString() + " Sq.ft";

    return "On Request";

}

/* ==========================================================
   DISPLAY PRICE
========================================================== */

function displayPrice(property){

    if(property.rate == null)
        return "Price on Request";

    const rate = Number(property.rate);

    const unit = property.priceUnit || "";

    if(unit.toLowerCase().includes("acre")){

        if(rate < 1){

            return `₹${(rate * 100).toFixed(0)} Lakhs / Acre`;

        }

        return `₹${rate.toFixed(2).replace(/\.00$/,"")} Cr / Acre`;

    }

    if(unit.toLowerCase().includes("ground")){

        return `₹${rate.toFixed(2).replace(/\.00$/,"")} Cr / Ground`;

    }

    if(unit.toLowerCase().includes("sq.ft")){

        return `₹${rate.toLocaleString()} / Sq.ft`;

    }

    return property.price || `₹${rate}`;

}


/* ==========================================================
   DISPLAY LOCATION
========================================================== */

function displayLocation(property) {

    return [

        property.locality,

        property.village,

        property.city,

        property.state

    ]

    .filter(Boolean)

    .join(", ");

}


/* ==========================================================
   PROPERTY CARD
========================================================== */

function propertyCard(property){

    const aiScore = SEARCH.aiScore(property);

    const usage =

        Array.isArray(property.usage)

        ? property.usage.slice(0,3)

        : [];

    return `

<article class="property-card glass">

<div class="property-card-header">

<div>


<div class="eyebrow">

${property.landType}

</div>

<h3>

${property.name}

</h3>
<div class="property-id">

    ${property.id.replace("P","")}

</div>

<p>

${displayLocation(property)}

</p>

</div>

</div>

<div class="property-info">

<div>

<strong>

${displayArea(property)}

</strong>

<small>

Area

</small>

</div>

<div>

<strong>

${displayPrice(property)}

</strong>

<small>

Price

</small>

</div>

</div>

<div class="property-tags">

${usage.map(tag=>`

<span>

${tag}

</span>

`).join("")}

</div>

<div class="property-actions">

<a

href="property.html?id=${encodeURIComponent(property.id)}"

class="btn primary">

View Details

</a>

<button

class="btn"

data-connect="${property.id}">

Connect

</button>

</div>

</article>

`;

}


/* ==========================================================
   RESULT COUNT
========================================================== */

function renderCount(total){

    if(!resultCount)
        return;

    resultCount.textContent =

        `${total} Properties Found`;

}


/* ==========================================================
   EMPTY
========================================================== */

function renderEmpty(){

    grid.innerHTML = "";

    noResults.style.display = "block";

}


/* ==========================================================
   GRID
========================================================== */

function renderGrid(list){

    noResults.style.display = "none";

    grid.innerHTML =

        list

        .map(propertyCard)

        .join("");

}
/* ==========================================================
   UPDATE
========================================================== */

function update(){

    filteredProperties =
        getFilteredProperties();

    filteredProperties =
        sortProperties(
            filteredProperties
        );

    renderCount(
        filteredProperties.length
    );

    if(
        !filteredProperties.length
    ){

        renderEmpty();

        return;

    }

    renderGrid(
        filteredProperties
    );

}


/* ==========================================================
   RESET FILTERS
========================================================== */

function resetAll(){

    if(search)
        search.value = "";

    if(district)
        district.value = "";

    if(city)
        city.value = "";

    if(landType)
        landType.value = "";

    if(category)
        category.value = "";

    if(minArea)
        minArea.value = "";

    if(maxArea)
        maxArea.value = "";

    if(maxRate)
        maxRate.value = "";

    if(roadWidth)
        roadWidth.value = "";

    if(frontage)
        frontage.value = "";

    if(exclusive)
        exclusive.value = "";

    if(sort)
        sort.value = "score";

    update();

}


/* ==========================================================
   EVENTS
========================================================== */

[
    search,
    district,
    city,
    landType,
    category,
    minArea,
    maxArea,
    maxRate,
    roadWidth,
    frontage,
    exclusive,
    sort

]

.forEach(element => {

    if(!element)
        return;

    element.addEventListener(
        "input",
        update
    );

    element.addEventListener(
        "change",
        update
    );

});


/* ==========================================================
   RESET BUTTON
========================================================== */

if(reset){

    reset.addEventListener(
        "click",
        resetAll
    );

}


/* ==========================================================
   CONNECT
========================================================== */

document.addEventListener(

    "click",

    function(event){

        const button =
            event.target.closest(
                "[data-connect]"
            );

        if(!button)
            return;


        const id =
            button.dataset.connect;


        const property =
            properties.find(
                item =>
                    item.id === id
            );


        if(!property)
            return;


        const message = `

Hello ISOW,

I am interested in the following property.

Property ID:
${property.id}

Property:
${property.name}

Location:
${displayLocation(property)}

Area:
${displayArea(property)}

Price:
${displayPrice(property)}

Please share more details.

`;


        window.open(

            "https://wa.me/918593076501?text=" +

            encodeURIComponent(message),

            "_blank"

        );

    }

);


/* ==========================================================
   INITIALISE
========================================================== */

update();


})();
