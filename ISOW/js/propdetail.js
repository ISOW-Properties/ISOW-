(function () {

"use strict";

/* =====================================================
DATABASE
===================================================== */

const properties = window.ISOW_SEARCH.database || [];

const params = new URLSearchParams(window.location.search);

const propertyId = params.get("id");

const property = properties.find(

    item => String(item.id) === String(propertyId)

);

if (!property) {

    window.location.href = "properties.html";

    return;

}

/* =====================================================
HELPERS
===================================================== */

function text(selector, value){

    const element = document.querySelector(selector);

    if(!element) return;

    element.textContent = value || "-";

}

function html(selector, value){

    const element = document.querySelector(selector);

    if(!element) return;

    element.innerHTML = value || "";

}

/* =====================================================
AREA
===================================================== */

function displayArea(){

    if(property.acres != null)
        return property.acres + " Acres";

    if(property.grounds != null)
        return property.grounds + " Grounds";

    if(property.sqft != null)
        return property.sqft.toLocaleString() + " Sq.ft";

    return "-";

}

/* =====================================================
PRICE
===================================================== */

function displayPrice(){

    if(property.rate == null)
        return "-";

    const rate = Number(property.rate);

    const unit = property.priceUnit || "";

    if(unit.toLowerCase().includes("acre")){

        if(rate < 1){

            return `₹${(rate*100).toFixed(0)} Lakhs / Acre`;

        }

        return `₹${rate.toFixed(2).replace(/\.00$/,"")} Cr / Acre`;

    }

    if(unit.toLowerCase().includes("ground")){

        return `₹${rate.toFixed(2).replace(/\.00$/,"")} Cr / Ground`;

    }

    if(unit.toLowerCase().includes("sq")){

        return `₹${rate.toLocaleString()} / Sq.ft`;

    }

    return property.price || "-";

}
/* =====================================================
PROPERTY HEADER
===================================================== */

text(

    "[data-title]",

    property.name

);

text(

    "[data-landtype]",

    property.landType

);

text(

    "[data-location]",

    [

        property.village,

        property.district,

        property.state

    ]

    .filter(Boolean)

    .join(", ")

);

/* =====================================================
USAGE TAGS
===================================================== */

const usageContainer =

document.querySelector(

    "[data-usage]"

);

if(

    usageContainer &&

    Array.isArray(property.usage)

){

    usageContainer.innerHTML =

    property.usage

    .map(

        item =>

        `

        <span>

            ${item}

        </span>

        `

    )

    .join("");

}
/* =====================================================
PROPERTY DETAILS
===================================================== */

text("[data-area]", displayArea());

text("[data-price]", displayPrice());

text("[data-category]", property.category);

text("[data-status]", property.status);

text(

    "[data-roadtype]",

    property.roadType || "-"

);

text(

    "[data-roadwidth]",

    property.roadWidth != null

        ? property.roadWidth + " ft"

        : "-"

);

text(

    "[data-frontage]",

    property.frontage != null

        ? property.frontage + " ft"

        : "-"

);

text(

    "[data-village]",

    property.village

);

text(

    "[data-taluk]",

    property.taluk

);

text(

    "[data-district]",

    property.district

);

text(

    "[data-city]",

    property.city

);

text(

    "[data-state]",

    property.state

);

/* =====================================================
CONNECTIVITY
===================================================== */

text(

    "[data-highway]",

    property.highwayKm != null

        ? property.highwayKm + " km"

        : "-"

);

text(

    "[data-airport]",

    property.airportKm != null

        ? property.airportKm + " km"

        : "-"

);

text(

    "[data-railway]",

    property.railwayKm != null

        ? property.railwayKm + " km"

        : "-"

);

text(

    "[data-metro]",

    property.metroKm != null

        ? property.metroKm + " km"

        : "-"

);

text(

    "[data-port]",

    property.portKm != null

        ? property.portKm + " km"

        : "-"

);

text(

    "[data-sipcot]",

    property.sipcotKm != null

        ? property.sipcotKm + " km"

        : "-"

);

text(

    "[data-industrialpark]",

    property.industrialParkKm != null

        ? property.industrialParkKm + " km"

        : "-"

);

/* =====================================================
DESCRIPTION
===================================================== */

text(

    "[data-note]",

    property.note

);
/* =====================================================
GOOGLE MAPS
===================================================== */

const mapButton =

document.querySelector(

    "[data-map]"

);

if (

    mapButton

) {

    if (

        property.googleMaps

    ) {

        mapButton.href =

        property.googleMaps;

    }

    else {

        mapButton.style.display =

        "none";

    }

}


/* =====================================================
WHATSAPP
===================================================== */

const whatsapp =

document.querySelector(

    "[data-whatsapp]"

);

if (

    whatsapp

) {

    const message =

`Hello ISOW,

I am interested in the following property.

Property ID:
${property.id}

Property:
${property.name}

Location:
${property.village},
${property.district},
${property.state}

Please share more details.`;

    whatsapp.href =

    "https://wa.me/918593076501?text=" +

    encodeURIComponent(message);

}


/* =====================================================
ISOW AI
===================================================== */

const aiLink =

document.querySelector(

    "[data-ai-link]"

);

if (

    aiLink

) {

    aiLink.href =

    "ai.html?property=" +

    encodeURIComponent(property.id);

}


/* =====================================================
PAGE TITLE
===================================================== */

document.title =

property.name +

" | ISOW Properties";


/* =====================================================
PAGE HEADING
===================================================== */

const heading =

document.querySelector(

    "h1"

);

if (

    heading

) {

    heading.textContent =

    property.name;

}
document.getElementById("backLink").addEventListener("click", function(e){

    e.preventDefault();

    if (history.length > 1) {

        history.back();

    } else {

        window.location.href = "properties.html";

    }

});


/* =====================================================
FINISH
===================================================== */

})();