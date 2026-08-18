// ======================================================
// MangaJPRaw - Dynamic Chapter Reader
// ======================================================

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

        loading.style.display =
            "none";

    }


    if (errorMessage) {

        errorMessage.textContent =
            message;

        errorMessage.style.display =
            "block";

    }


    console.error(
        message
    );

}


// ======================================================
// LOAD CHAPTER
// ======================================================

async function loadChapter() {

    try {

        // ------------------------------------------
        // VALIDATE URL
        // ------------------------------------------

        if (
            !mangaId ||
            !chapterNumber
        ) {

            throw new Error(
                "Manga or chapter was not specified."
            );

        }


        // ------------------------------------------
        // LOAD MANGA JSON
        // ------------------------------------------

        const response =
            await fetch(
                "./data/manga.json?v=" +
                Date.now()
            );


        if (!response.ok) {

            throw new Error(
                "Could not load manga data."
            );

        }


        const mangaList =
            await response.json();


        // ------------------------------------------
        // FIND MANGA
        // ------------------------------------------

        const manga =
            mangaList.find(
                item =>
                    item.id ===
                    mangaId
            );


        if (!manga) {

            throw new Error(
                "Manga not found: " +
                mangaId
            );

        }


        // ------------------------------------------
        // FIND CHAPTER
        // ------------------------------------------

        const chapter =
            Array.isArray(
                manga.chapters
            )
                ? manga.chapters.find(
                    item =>
                        Number(
                            item.number
                        ) ===
                        Number(
                            chapterNumber
                        )
                )
                : null;


        if (!chapter) {

            throw new Error(
                "Chapter " +
                chapterNumber +
                " was not found."
            );

        }


        // ------------------------------------------
        // PAGE LIST
        // ------------------------------------------

        let pages =
            Array.isArray(
                chapter.pages
            )
                ? [...chapter.pages]
                : [];


        pages.sort(
            function(a, b) {

                return a.localeCompare(
                    b,
                    undefined,
                    {
                        numeric: true
                    }
                );

            }
        );


        if (
            pages.length === 0
        ) {

            throw new Error(
                "No pages have been uploaded for this chapter."
            );

        }


        // ------------------------------------------
        // UPDATE TITLE
        // ------------------------------------------

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


        // ------------------------------------------
        // CLEAR OLD PAGES
        // ------------------------------------------

        chapterPages.innerHTML =
            "";


        // ------------------------------------------
        // CREATE IMAGES
        // ------------------------------------------

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


                // ----------------------------------
                // IMPORTANT PATH
                // ----------------------------------

                image.src =
                    "./images/" +
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
                            "Page " +
                            (index + 1) +
                            " could not be loaded:",
                            image.src
                        );

                        image.alt =
                            "Page " +
                            (index + 1) +
                            " could not be loaded.";

                    };


                chapterPages.appendChild(
                    image
                );

            }
        );


        // ------------------------------------------
        // HIDE LOADING
        // ------------------------------------------

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
