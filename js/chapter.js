// ======================================================
// MangaJPRaw - Dynamic Chapter Reader
// ======================================================

const API_BASE = "../";

const mangaId =
    new URLSearchParams(window.location.search).get("id");

const chapterNumber =
    new URLSearchParams(window.location.search).get("chapter");

const chapterTitle =
    document.getElementById("chapterTitle");

const mangaTitle =
    document.getElementById("mangaTitle");

const chapterPages =
    document.getElementById("chapterPages");

const loading =
    document.getElementById("loading");

const errorMessage =
    document.getElementById("errorMessage");


// ======================================================
// SHOW ERROR
// ======================================================

function showError(message) {

    if (loading) {
        loading.style.display = "none";
    }

    if (errorMessage) {

        errorMessage.textContent =
            message;

        errorMessage.style.display =
            "block";

    } else {

        console.error(message);

    }

}


// ======================================================
// LOAD MANGA DATA
// ======================================================

async function loadChapter() {

    try {

        if (!mangaId || !chapterNumber) {

            throw new Error(
                "Manga or chapter was not specified."
            );

        }


        const response =
            await fetch(
                API_BASE +
                "data/manga.json?v=" +
                Date.now()
            );


        if (!response.ok) {

            throw new Error(
                "Could not load manga data."
            );

        }


        const mangaList =
            await response.json();


        const manga =
            mangaList.find(
                item =>
                    item.id === mangaId
            );


        if (!manga) {

            throw new Error(
                "Manga not found."
            );

        }


        const chapter =
            manga.chapters?.find(
                item =>
                    Number(item.number) ===
                    Number(chapterNumber)
            );


        if (!chapter) {

            throw new Error(
                "Chapter " +
                chapterNumber +
                " not found."
            );

        }


        // ==================================================
        // UPDATE TITLE
        // ==================================================

        document.title =
            manga.title +
            " - Chapter " +
            chapter.number;


        if (mangaTitle) {

            mangaTitle.textContent =
                manga.title;

        }


        if (chapterTitle) {

            chapterTitle.textContent =
                chapter.title ||
                "Chapter " +
                chapter.number;

        }


        // ==================================================
        // GET PAGES
        // ==================================================

        let pages =
            Array.isArray(
                chapter.pages
            )
                ? [...chapter.pages]
                : [];


        pages.sort(
            (a, b) =>
                a.localeCompare(
                    b,
                    undefined,
                    {
                        numeric: true
                    }
                )
        );


        if (
            pages.length === 0
        ) {

            throw new Error(
                "No pages have been uploaded for this chapter yet."
            );

        }


        // ==================================================
        // DISPLAY PAGES
        // ==================================================

        if (!chapterPages) {

            throw new Error(
                "Chapter page container was not found."
            );

        }


        chapterPages.innerHTML =
            "";


        pages.forEach(
            function(page, index) {

                const image =
                    document.createElement(
                        "img"
                    );


                image.className =
                    "chapter-page";


                image.alt =
                    manga.title +
                    " Chapter " +
                    chapter.number +
                    " Page " +
                    (index + 1);


                image.loading =
                    index === 0
                        ? "eager"
                        : "lazy";


                image.src =
                    API_BASE +
                    "images/" +
                    encodeURIComponent(
                        manga.id
                    ) +
                    "/" +
                    encodeURIComponent(
                        String(
                            chapter.number
                        )
                    ) +
                    "/" +
                    encodeURIComponent(
                        page
                    );


                image.onerror =
                    function() {

                        console.error(
                            "Could not load:",
                            image.src
                        );

                    };


                chapterPages.appendChild(
                    image
                );

            }
        );


        // ==================================================
        // HIDE LOADING
        // ==================================================

        if (loading) {

            loading.style.display =
                "none";

        }

    }

    catch (error) {

        console.error(
            error
        );


        showError(
            error.message
        );

    }

}


// ======================================================
// START
// ======================================================

loadChapter();
