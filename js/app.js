const DATA_URL = "./data/manga.json";

let mangaList = [];


/* ==========================================
   LOAD MANGA DATABASE
========================================== */

async function loadManga() {

    try {

        const response = await fetch(DATA_URL);

        if (!response.ok) {
            throw new Error(
                `Failed to load manga data: ${response.status}`
            );
        }

        mangaList = await response.json();

        console.log("Manga database loaded:", mangaList);

        displayLatestManga(mangaList);

        displayLibrary(mangaList);

        displayFeatured(mangaList);

        setupSearch();

    } catch (error) {

        console.error("Manga loading error:", error);

        showLoadError();

    }

}


/* ==========================================
   DISPLAY LATEST MANGA
========================================== */

function displayLatestManga(manga) {

    const container =
        document.getElementById("mangaGrid");

    const noResults =
        document.getElementById("noResults");


    if (!container) {

        console.error("mangaGrid element not found");

        return;

    }


    container.innerHTML = "";


    if (!manga || manga.length === 0) {

        container.innerHTML = `
            <div class="loading">
                No manga available.
            </div>
        `;

        if (noResults) {
            noResults.style.display = "block";
        }

        return;

    }


    if (noResults) {
        noResults.style.display = "none";
    }


    manga.forEach(function(item) {

        const card = createMangaCard(item);

        container.appendChild(card);

    });

}


/* ==========================================
   DISPLAY LIBRARY
========================================== */

function displayLibrary(manga) {

    const container =
        document.getElementById("libraryGrid");


    if (!container) {

        console.error("libraryGrid element not found");

        return;

    }


    container.innerHTML = "";


    if (!manga || manga.length === 0) {

        container.innerHTML = `
            <div class="loading">
                No manga available.
            </div>
        `;

        return;

    }


    manga.forEach(function(item) {

        const card = createMangaCard(item);

        container.appendChild(card);

    });

}


/* ==========================================
   CREATE MANGA CARD
========================================== */

function createMangaCard(manga) {

    const card =
        document.createElement("article");


    card.className = "manga-card";


    let coverHTML;


    if (manga.cover) {

        coverHTML = `
            <img
                src="${escapeHTML(manga.cover)}"
                alt="${escapeHTML(manga.title)}"
                loading="lazy"
            >
        `;

    } else {

        coverHTML = `
            <div class="manga-cover-placeholder">
                No Cover
            </div>
        `;

    }


    let latestChapter = "No chapters";


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
                ${escapeHTML(manga.title)}
            </h3>


            <p>
                ${escapeHTML(
                    manga.description || "Manga"
                )}
            </p>


            <span class="chapter">
                ${escapeHTML(latestChapter)}
            </span>

        </div>

    `;


    card.addEventListener(
        "click",
        function() {

            openManga(manga.id);

        }
    );


    return card;

}


/* ==========================================
   FEATURED MANGA
========================================== */

function displayFeatured(manga) {

    const container =
        document.getElementById("featuredManga");


    if (!container) {

        console.error(
            "featuredManga element not found"
        );

        return;

    }


    if (!manga || manga.length === 0) {

        return;

    }


    const featured = manga[0];


    let coverHTML;


    if (featured.cover) {

        coverHTML = `
            <img
                src="${escapeHTML(featured.cover)}"
                alt="${escapeHTML(featured.title)}"
            >
        `;

    } else {

        coverHTML = "Featured";

    }


    container.innerHTML = `

        <div class="featured-cover">

            ${coverHTML}

        </div>


        <div class="featured-info">

            <span class="tag">
                Featured
            </span>


            <h3>
                ${escapeHTML(featured.title)}
            </h3>


            <p>
                ${escapeHTML(
                    featured.description ||
                    "Read this manga online."
                )}
            </p>


            <a
                class="btn"
                href="./manga.html?id=${encodeURIComponent(
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
        document.getElementById("searchInput");


    if (!searchInput) {

        console.error(
            "searchInput element not found"
        );

        return;

    }


    searchInput.addEventListener(
        "input",
        function() {

            const query =
                this.value
                    .toLowerCase()
                    .trim();


            if (!query) {

                displayLatestManga(mangaList);

                displayLibrary(mangaList);

                return;

            }


            const results =
                mangaList.filter(function(manga) {

                    const title =
                        String(
                            manga.title || ""
                        ).toLowerCase();


                    const japaneseTitle =
                        String(
                            manga.japaneseTitle || ""
                        ).toLowerCase();


                    const description =
                        String(
                            manga.description || ""
                        ).toLowerCase();


                    return (
                        title.includes(query) ||
                        japaneseTitle.includes(query) ||
                        description.includes(query)
                    );

                });


            displayLatestManga(results);

            displayLibrary(results);


            const noResults =
                document.getElementById("noResults");


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
   OPEN MANGA
========================================== */

function openManga(id) {

    window.location.href =
        `./manga.html?id=${encodeURIComponent(id)}`;

}


/* ==========================================
   ERROR
========================================== */

function showLoadError() {

    const latest =
        document.getElementById("mangaGrid");


    const library =
        document.getElementById("libraryGrid");


    const error =
        document.getElementById("loadError");


    if (latest) {

        latest.innerHTML = "";

    }


    if (library) {

        library.innerHTML = "";

    }


    if (error) {

        error.style.display = "block";

    }

}


/* ==========================================
   HTML ESCAPE
========================================== */

function escapeHTML(value) {

    return String(value)

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");

}


/* ==========================================
   START
========================================== */

document.addEventListener(
    "DOMContentLoaded",
    loadManga
);
