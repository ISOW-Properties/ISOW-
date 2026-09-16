document.addEventListener("DOMContentLoaded", async () => {

    const components = document.querySelectorAll("[data-component]");

    for (const element of components) {

        const name = element.dataset.component;

        try {

            const response = await fetch(`components/${name}.html`);

            if (!response.ok) {
                throw new Error(`${name}.html not found`);
            }

            element.innerHTML = await response.text();

            /* ===========================================
               ACTIVE NAVIGATION
            =========================================== */

            if (name === "nav") {

                let currentFile = window.location.pathname
                    .split("/")
                    .pop()
                    .toLowerCase();

                if (currentFile === "") {
                    currentFile = "index.html";
                }

                if (currentFile === "property.html") {
                    currentFile = "properties.html";
                }

                const links = element.querySelectorAll(".nav-links a");

                /* Remove any existing active class */
                links.forEach(link => {

                    link.classList.remove("active");

                });

                /* Add active class to current page */
                links.forEach(link => {

                    const href = link.getAttribute("href").toLowerCase();

                    if (href === currentFile) {

                        link.classList.add("active");

                    }

                });

            }

        }

        catch (err) {

            console.error(err);

        }

    }

    window.dispatchEvent(
        new Event("componentsLoaded")
    );

});
