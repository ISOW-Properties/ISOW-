(function () {

    "use strict";

    /* ======================================================
       HOME PAGE
    ====================================================== */

    const DATABASE =
        window.ISOW_DATABASE
            ? window.ISOW_DATABASE.properties
            : [];

    /* ======================================================
       STATS
    ====================================================== */

    function updateStats() {

        const totalProperties =
            DATABASE.length;

        const industrial =
            DATABASE.filter(
                p =>
                    String(p.landType)
                        .toLowerCase()
                        .includes("industrial")
            ).length;

        const commercial =
            DATABASE.filter(
                p =>
                    String(p.landType)
                        .toLowerCase()
                        .includes("commercial")
            ).length;

        const resort =
            DATABASE.filter(
                p =>
                    String(p.landType)
                        .toLowerCase()
                        .includes("beach") ||
                    String(p.landType)
                        .toLowerCase()
                        .includes("resort")
            ).length;

        const stats =
            document.querySelectorAll(
                ".stat strong"
            );

        if (stats.length >= 4) {

            stats[0].textContent =
                totalProperties + "+";

            stats[1].textContent =
                industrial + "+";

            stats[2].textContent =
                "24/7";

            stats[3].textContent =
                "South";

        }

    }

    /* ======================================================
       REVEAL ANIMATION
    ====================================================== */

    function revealElements() {

        const observer =
            new IntersectionObserver(

                entries => {

                    entries.forEach(entry => {

                        if (entry.isIntersecting) {

                            entry.target.classList.add(
                                "visible"
                            );

                        }

                    });

                },

                {
                    threshold: 0.15
                }

            );

        document
            .querySelectorAll(".reveal")
            .forEach(element => {

                observer.observe(element);

            });

    }

    /* ======================================================
       INTRO
    ====================================================== */

    function initialiseIntro() {

        const intro =
            document.getElementById(
                "intro"
            );

        if (!intro) return;

        function hideIntro() {

            intro.classList.add("hide");

            setTimeout(() => {

                intro.style.display = "none";

            }, 900);

        }

        window.addEventListener(
            "wheel",
            hideIntro,
            {
                once: true
            }
        );

        window.addEventListener(
            "touchstart",
            hideIntro,
            {
                once: true
            }
        );

    }

    /* ======================================================
       AI BUTTON
    ====================================================== */

    function initialiseAIButton() {

        document
            .querySelectorAll(
                'a[href="ai.html"]'
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    function () {

                        if (
                            window.ISOW &&
                            ISOW.saveSearch
                        ) {

                            ISOW.saveSearch(
                                "Home Page"
                            );

                        }

                    }
                );

            });

    }

    /* ======================================================
       INITIALISE
    ====================================================== */

    function initialise() {

        updateStats();

        revealElements();

        initialiseIntro();

        initialiseAIButton();

        console.log(
            "ISOW Home Loaded"
        );

    }

    document.addEventListener(

        "DOMContentLoaded",

        initialise

    );

})();
