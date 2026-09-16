/* ==========================================================
   ISOW APPLICATION
==========================================================*/

(function(){

"use strict";

/* ==========================================================
   APPLICATION
==========================================================*/

const APP={

version:"1.0.0",

page:"",

database:

window.ISOW_DATABASE||

null

};


/* ==========================================================
   PAGE
==========================================================*/

function detectPage(){

const path=

location.pathname

.toLowerCase();

if(path.includes("properties"))

return"properties";

if(path.includes("property"))

return"property";

if(path.includes("ai"))

return"ai";

return"home";

}


/* ==========================================================
   LOADER
==========================================================*/

function loader(show){

const loader=

document.getElementById(

"loader"

);

if(!loader)

return;

loader.style.display=

show

?

"flex"

:

"none";

}


/* ==========================================================
   NOTIFICATION
==========================================================*/

function notify(

message,

type="success"

){

let toast=

document.createElement(

"div"

);

toast.className=

`toast ${type}`;

toast.innerHTML=

message;

document.body.appendChild(

toast

);

setTimeout(()=>{

toast.classList.add(

"show"

);

},100);

setTimeout(()=>{

toast.classList.remove(

"show"

);

setTimeout(()=>{

toast.remove();

},300);

},3000);

}


/* ==========================================================
   LOCAL STORAGE
==========================================================*/

function storage(

key,

value

){

if(value===undefined){

return JSON.parse(

localStorage.getItem(key)

);

}

localStorage.setItem(

key,

JSON.stringify(value)

);

}


/* ==========================================================
   RECENT SEARCH
==========================================================*/

function saveSearch(query){

if(!query)

return;

let searches=

storage(

"isowRecent"

)||[];

searches=

searches.filter(

item=>

item!==query

);

searches.unshift(

query

);

searches=

searches.slice(0,10);

storage(

"isowRecent",

searches

);

}


/* ==========================================================
   SAVED
==========================================================*/

function savedProperties(){

return storage(

"isowSaved"

)||[];

}


/* ==========================================================
   INIT
==========================================================*/

function initialise(){

APP.page=

detectPage();

console.log(

"ISOW",

APP.version,

APP.page

);

loader(false);

}


/* ==========================================================
   EXPORT
==========================================================*/

window.ISOW={

app:APP,

notify,

loader,

storage,

saveSearch,

savedProperties

};


/* ==========================================================
   START
==========================================================*/

document.addEventListener(

"DOMContentLoaded",

initialise

);

})();