const DATA_URL = "./data/manga.json";

let mangaList = [];


/* ==========================================
   LOAD MANGA DATABASE
========================================== */

async function loadManga() {

    try {

        const response =
            await fetch(DATA_URL);

        if (!response.ok) {

            throw new Error(
                "Manga database could not be loaded."
            );

        }


        mangaList =
            await response.json();


        console.log(
            "Manga database loaded:",
            mangaList
        );


        displayLatestManga(
            mangaList
        );


        displayLibrary(
            mangaList
        );


        displayFeatured(
            mangaList
        );


        setupSearch();


    } catch (error) {

        console.error(
            "Manga loading error:",
            error
        );


        showLoadError();

    }

}


/* ==========================================
   LATEST MANGA
========================================== */

function displayLatestManga(manga) {

    const container =
        document.getElementById(
            "mangaGrid"
        );


    if (!container) {

        return;

    }


    container.innerHTML = "";


    if (
        !manga ||
        manga.length === 0
    ) {

        container.innerHTML = `
            <div class="loading">
                No manga available.
            </div>
        `;

        return;

    }


    manga.forEach(
        mangaItem => {

            const card =
                createMangaCard(
                    mangaItem
                );


            container.appendChild(
                card
            );

        }
    );

}


/* ==========================================
   MANGA LIBRARY
========================================== */

function displayLibrary(manga) {

    const container =
        document.getElementById(
            "libraryGrid"
        );


    if (!container) {

        return;

    }


    container.innerHTML = "";


    manga.forEach(
        mangaItem => {

            const card =
                createMangaCard(
                    mangaItem
                );


            container.appendChild(
                card
            );

        }
    );

}


/* ==========================================
   CREATE MANGA CARD
========================================== */

function createMangaCard(manga) {

    const card =
        document.createElement(
            "article"
        );


    card.className =
        "manga-card";


    const coverHTML =
        manga.cover

            ? `
                <img
                    src="${escapeHTML(
                        manga.cover
                    )}"
                    alt="${escapeHTML(
                        manga.title
                    )}"
                    loading="lazy"
                >
            `

            : `
                <div
                    class="manga-cover-placeholder"
                >
                    No Cover
                </div>
            `;


    let latestChapter =
        "No chapters";


    if (
        manga.chapters &&
        manga.chapters.length > 0
    ) {

        const latest =
            manga.chapters[
                manga.chapters.length - 1
            ];


        latestChapter =
            latest.title ||
            `Chapter ${latest.number}`;

    }


    card.innerHTML = `

        <div class="manga-cover">

            ${coverHTML}

        </div>


        <div class="manga-info">

            <h3>
                ${escapeHTML(
                    manga.title
                )}
            </h3>


            <p>

                ${escapeHTML(
                    manga.description ||
                    "Manga"
                )}

            </p>


            <span class="chapter">

                ${escapeHTML(
                    latestChapter
                )}

            </span>

        </div>

    `;


    card.addEventListener(
        "click",
        function () {

            openManga(
                manga.id
            );

        }
    );


    return card;

}


/* ==========================================
   FEATURED MANGA
========================================== */

function displayFeatured(manga) {

    const container =
        document.getElementById(
            "featuredManga"
        );


    if (
        !container ||
        !manga ||
        manga.length === 0
    ) {

        return;

    }


    const featured =
        manga[0];


    const coverHTML =
        featured.cover

            ? `
                <img
                    src="${escapeHTML(
                        featured.cover
                    )}"
                    alt="${escapeHTML(
                        featured.title
                    )}"
                >
            `

            : `
                Featured
            `;


    container.innerHTML = `

        <div class="featured-cover">

            ${coverHTML}

        </div>


        <div class="featured-info">

            <span class="tag">
                Featured
            </span>


            <h3>

                ${escapeHTML(
                    featured.title
                )}

            </h3>


            <p>

                ${escapeHTML(
                    featured.description ||
                    "Read this manga online."
                )}

            </p>


            <a
                class="btn"
                href="manga.html?id=${encodeURIComponent(
                    featured.id
                )}"
            >
                Read Manga
            </a>

        </div>

    `;

}


/* ==========================================
   SEARCH
========================================== */

function setupSearch() {

    const searchInput =
        document.getElementById(
            "searchInput"
        );


    if (!searchInput) {

        return;

    }


    searchInput.addEventListener(
        "input",
        function () {

            const query =
                this.value
                    .toLowerCase()
                    .trim();


            if (!query) {

                displayLatestManga(
                    mangaList
                );

                displayLibrary(
                    mangaList
                );

                return;

            }


            const results =
                mangaList.filter(
                    manga => {

                        const title =
                            String(
                                manga.title ||
                                ""
                            )
                            .toLowerCase();


                        const japaneseTitle =
                            String(
                                manga.japaneseTitle ||
                                ""
                            )
                            .toLowerCase();


                        const description =
                            String(
                                manga.description ||
                                ""
                            )
                            .toLowerCase();


                        return (

                            title.includes(
                                query
                            )

                            ||

                            japaneseTitle.includes(
                                query
                            )

                            ||

                            description.includes(
                                query
                            )

                        );

                    }
                );


            displayLatestManga(
                results
            );


            displayLibrary(
                results
            );


            const noResults =
                document.getElementById(
                    "noResults"
                );


            if (noResults) {

                noResults.style.display =
                    results.length === 0
                        ? "block"
                        : "none";

            }

        }
    );

}


/* ==========================================
   ERROR
========================================== */

function showLoadError() {

    const latest =
        document.getElementById(
            "mangaGrid"
        );


    const library =
        document.getElementById(
            "libraryGrid"
        );


    const error =
        document.getElementById(
            "loadError"
        );


    if (latest) {

        latest.innerHTML = "";

    }


    if (library) {

        library.innerHTML = "";

    }


    if (error) {

        error.style.display =
            "block";

    }

}


/* ==========================================
   OPEN MANGA
========================================== */

function openManga(id) {

    window.location.href =
        `manga.html?id=${encodeURIComponent(
            id
        )}`;

}


/* ==========================================
   SECURITY
========================================== */

function escapeHTML(value) {

    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


/* ==========================================
   START APPLICATION
========================================== */

document.addEventListener(
    "DOMContentLoaded",
    loadManga
);
