/* ==========================================================
   ISOW SEARCH ENGINE v1.0
==========================================================*/

(function(){

"use strict";

/* ==========================================================
   DATABASE
==========================================================*/

const DATABASE=

window.ISOW_DATABASE
?
window.ISOW_DATABASE.properties
:
[];


/* ==========================================================
   NORMALIZE
==========================================================*/

function normalize(text){

return String(text||"")

.toLowerCase()

.replace(/[^\w\s]/g," ")

.replace(/\s+/g," ")

.trim();

}


/* ==========================================================
   PROPERTY SEARCH TEXT
==========================================================*/

function propertyText(property){

const ai=property.ai||{};

return normalize([

property.name,

property.landType,

property.category,

property.village,

property.locality,

property.taluk,

property.city,

property.district,

property.state,

property.note,

...(property.usage||[]),

...(ai.searchKeywords||[]),

...(ai.aliases||[]),

...(ai.bestFor||[]),

...(ai.strengths||[])

].join(" "));

}


/* ==========================================================
   SEARCH
==========================================================*/

function search(query){

if(!query)

return DATABASE;

const q=normalize(query);

return DATABASE.filter(property=>{

return propertyText(property)

.includes(q);

});

}


/* ==========================================================
   FILTER
==========================================================*/

function filter(options={}){

let results=[...DATABASE];

/* Land Type */

if(options.landType){

results=

results.filter(property=>

property.landType===options.landType

);

}

/* Category */

if(options.category){

results=

results.filter(property=>

property.category===options.category

);

}

/* City */

if(options.city){

results=

results.filter(property=>

property.city===options.city

);

}

/* District */

if(options.district){

results=

results.filter(property=>

property.district===options.district

);

}

/* Area */

if(options.minArea){

results=

results.filter(property=>

(property.acres||0)>=options.minArea

);

}

if(options.maxArea){

results=

results.filter(property=>

(property.acres||0)<=options.maxArea

);

}

/* Budget */

if(options.maxRate){

results=

results.filter(property=>

(property.rate||0)<=options.maxRate

);

}

return results;

}


/* ==========================================================
   AI SCORE
==========================================================*/

function aiScore(property){

let score=50;

/* Frontage */

if(property.frontage)

score+=Math.min(

property.frontage/100,

10

);

/* Highway */

if(property.highwayKm!==null)

score+=10;

/* SIPCOT */

if(property.sipcotKm!==null)

score+=10;

/* Metro */

if(property.metroKm!==null)

score+=5;

/* Airport */

if(property.airportKm!==null)

score+=5;

/* Verification */

if(property.verified)

score+=5;

/* Exclusive */

if(property.exclusive)

score+=5;

return Math.min(

100,

Math.round(score)

);

}


/* ==========================================================
   SORT
==========================================================*/

function sort(properties,type){

const list=[...properties];

switch(type){

case"score":

list.sort(

(a,b)=>

aiScore(b)-

aiScore(a)

);

break;

case"area":

list.sort(

(a,b)=>

(b.acres||0)-

(a.acres||0)

);

break;

case"price":

list.sort(

(a,b)=>

(a.rate||0)-

(b.rate||0)

);

break;

case"frontage":

list.sort(

(a,b)=>

(b.frontage||0)-

(a.frontage||0)

);

break;

case"name":

list.sort(

(a,b)=>

a.name.localeCompare(

b.name

)

);

break;

}

return list;

}


/* ==========================================================
   SIMILAR
==========================================================*/

function similar(property){

return DATABASE

.filter(p=>p.id!==property.id)

.map(p=>{

let score=0;

if(

p.landType===property.landType

)

score+=40;

if(

p.category===property.category

)

score+=25;

if(

p.city===property.city

)

score+=20;

if(

Math.abs(

(p.acres||0)-

(property.acres||0)

)<=10

)

score+=15;

return{

property:p,

score

};

})

.sort(

(a,b)=>b.score-a.score

)

.slice(0,6);

}


/* ==========================================================
   EXPORT
==========================================================*/

window.ISOW_SEARCH={

database:DATABASE,

search,

filter,

sort,

similar,

aiScore

};

})();