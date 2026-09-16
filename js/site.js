(function () {

"use strict";

window.addEventListener(

    "componentsLoaded",

    initSite

);

function initSite(){

const root = document.documentElement;

const nav = document.querySelector(".nav");

const intro = document.querySelector(".intro");

const tag = document.querySelector(".intro-tag");

const hint = document.querySelector(".scroll-hint");

/* =====================================================
TOAST
===================================================== */

function toast(message){

    let t = document.querySelector(".toast");

    if(!t){

        t = document.createElement("div");

        t.className = "toast";

        document.body.appendChild(t);

    }

    t.textContent = message;

    t.classList.add("show");

    setTimeout(()=>{

        t.classList.remove("show");

    },2200);

}

window.ISOWToast = toast;
/* =====================================================
MOUSE GLOW
===================================================== */

let lastX = 0;

let lastY = 0;

document.addEventListener("mousemove", e => {

    root.style.setProperty(

        "--mx",

        e.clientX + "px"

    );

    root.style.setProperty(

        "--my",

        e.clientY + "px"

    );

    const dx =

        Math.abs(e.clientX - lastX);

    const dy =

        Math.abs(e.clientY - lastY);

    if(dx > 10 || dy > 10){

        showNavigation();

    }

    lastX = e.clientX;

    lastY = e.clientY;

});


/* =====================================================
TOUCH SUPPORT
===================================================== */

document.addEventListener(

    "touchstart",

    showNavigation,

    {

        passive:true

    }

);


/* =====================================================
SMART NAVIGATION
===================================================== */
let navTimer;

function showNavigation() {

    if (!nav) return;

    nav.classList.add("show");

    clearTimeout(navTimer);

    navTimer = setTimeout(() => {

        if (window.scrollY < 150) {
            nav.classList.remove("show");
        }

    }, 4000);

}
/* =====================================================
SCROLL STATE
===================================================== */

function scrollState(){

    const y = window.scrollY || 0;

    /* Intro Tag */

    if(tag){

        tag.classList.toggle(

            "show",

            y > 35

        );

    }

    /* Scroll Hint */

    if(hint){

        hint.style.opacity =

        y > 35

        ? "0"

        : "1";

    }

    /* Body Class */

    document.body.classList.toggle(

        "intro-done",

        y > 160

    );

    /* Navigation */

    if(nav){

        if(y > 150){

            nav.classList.add("show");

        }

    }

    /* Scroll Progress */

    const h =

        document.documentElement.scrollHeight -

        window.innerHeight;

    if(h > 0){

        root.style.setProperty(

            "--scroll",

            Math.min(

                100,

                (y / h) * 100

            ) + "%"

        );

    }

}


/* =====================================================
SCROLL EVENT
===================================================== */

window.addEventListener(

    "scroll",

    scrollState,

    {

        passive:true

    }

);

scrollState();
/* =====================================================
REVEAL ANIMATION
===================================================== */

const revealItems =

document.querySelectorAll(

    ".reveal"

);

if(revealItems.length){

    const observer =

    new IntersectionObserver(

        entries=>{

            entries.forEach(entry=>{

                if(

                    entry.isIntersecting

                ){

                    entry.target.classList.add(

                        "show"

                    );

                }

            });

        },

        {

            threshold:0.12

        }

    );

    revealItems.forEach(item=>{

        observer.observe(item);

    });

}


/* =====================================================
NAVIGATION LINKS
===================================================== */

document

.querySelectorAll(

    "[data-nav]"

)

.forEach(link=>{

    link.addEventListener(

        "click",

        function(){

            const href =

            this.getAttribute(

                "href"

            );

            if(href==="#"){

                return;

            }

        }

    );

});


/* =====================================================
WINDOW RESIZE
===================================================== */

window.addEventListener(

    "resize",

    scrollState

);


/* =====================================================
INITIAL STATE
===================================================== */

requestAnimationFrame(()=>{

    scrollState();

});


/* =====================================================
END
===================================================== */

}

})();
