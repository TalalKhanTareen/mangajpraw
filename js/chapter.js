// ======================================================
// MangaJPRaw - Chapter Reader
// ======================================================


// ======================================================
// GET URL PARAMETERS
// ======================================================

const params =
    new URLSearchParams(
        window.location.search
    );


const mangaId =
    params.get("id");


const chapterNumber =
    params.get("chapter");


// ======================================================
// GET HTML ELEMENTS
// ======================================================

const mangaTitle =
    document.getElementById(
        "mangaTitle"
    );


const chapterTitle =
    document.getElementById(
        "chapterTitle"
    );


const chapterPages =
    document.getElementById(
        "chapterPages"
    );


const loading =
    document.getElementById(
        "loading"
    );


const errorMessage =
    document.getElementById(
        "errorMessage"
    );


// ======================================================
// ERROR FUNCTION
// ======================================================

function showError(
    message
) {

    console.error(
        message
    );


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

}


// ======================================================
// LOAD MANGA JSON
// ======================================================

async function loadMangaData() {

    try {

        // ----------------------------------------------
        // CHECK URL
        // ----------------------------------------------

        if (
            !mangaId
        ) {

            throw new Error(
                "Manga ID is missing from the URL."
            );

        }


        if (
            !chapterNumber
        ) {

            throw new Error(
                "Chapter number is missing from the URL."
            );

        }


        console.log(
            "Manga ID:",
            mangaId
        );


        console.log(
            "Chapter:",
            chapterNumber
        );


        // ----------------------------------------------
        // LOAD JSON
        // ----------------------------------------------

        const response =
            await fetch(
                "./data/manga.json?v=" +
                Date.now()
            );


        console.log(
            "manga.json status:",
            response.status
        );


        if (
            !response.ok
        ) {

            throw new Error(
                "manga.json returned HTTP " +
                response.status
            );

        }


        const mangaList =
            await response.json();


        console.log(
            "Manga data:",
            mangaList
        );


        // ----------------------------------------------
        // FIND MANGA
        // ----------------------------------------------

        const manga =
            mangaList.find(
                function(item) {

                    return (
                        item.id ===
                        mangaId
                    );

                }
            );


        if (
            !manga
        ) {

            throw new Error(
                "Manga not found: " +
                mangaId
            );

        }


        console.log(
            "Selected manga:",
            manga
        );


        // ----------------------------------------------
        // FIND CHAPTER
        // ----------------------------------------------

        const chapters =
            Array.isArray(
                manga.chapters
            )
                ? manga.chapters
                : [];


        const chapter =
            chapters.find(
                function(item) {

                    return (
                        Number(
                            item.number
                        ) ===
                        Number(
                            chapterNumber
                        )
                    );

                }
            );


        if (
            !chapter
        ) {

            throw new Error(
                "Chapter " +
                chapterNumber +
                " not found in manga.json."
            );

        }


        console.log(
            "Selected chapter:",
            chapter
        );


        // ----------------------------------------------
        // UPDATE PAGE TITLE
        // ----------------------------------------------

        document.title =
            manga.title +
            " - Chapter " +
            chapter.number;


        mangaTitle.textContent =
            manga.title;


        chapterTitle.textContent =
            chapter.title ||
            "Chapter " +
            chapter.number;


        // ----------------------------------------------
        // GET PAGES
        // ----------------------------------------------

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
                        numeric: true,
                        sensitivity: "base"
                    }
                );

            }
        );


        console.log(
            "Pages:",
            pages
        );


        if (
            pages.length === 0
        ) {

            throw new Error(
                "This chapter has no pages in manga.json."
            );

        }


        // ----------------------------------------------
        // REMOVE LOADING
        // ----------------------------------------------

        loading.style.display =
            "none";


        // ----------------------------------------------
        // CLEAR PAGE CONTAINER
        // ----------------------------------------------

        chapterPages.innerHTML =
            "";


        // ----------------------------------------------
        // CREATE IMAGES
        // ----------------------------------------------

        pages.forEach(
            function(
                page,
                index
            ) {

                const img =
                    document.createElement(
                        "img"
                    );


                img.className =
                    "chapter-page";


                img.alt =
                    "Page " +
                    (index + 1);


                // --------------------------------------
                // BUILD EXACT PATH
                // --------------------------------------

                const imageURL =
                    "./images/" +
                    manga.id +
                    "/" +
                    chapter.number +
                    "/" +
                    page;


                console.log(
                    "Loading image:",
                    imageURL
                );


                img.src =
                    imageURL;


                // --------------------------------------
                // IMAGE ERROR
                // --------------------------------------

                img.onerror =
                    function() {

                        console.error(
                            "IMAGE FAILED:",
                            imageURL
                        );


                        img.alt =
                            "Page " +
                            (index + 1) +
                            " could not be loaded.";

                    };


                // --------------------------------------
                // IMAGE SUCCESS
                // --------------------------------------

                img.onload =
                    function() {

                        console.log(
                            "IMAGE LOADED:",
                            imageURL
                        );

                    };


                chapterPages.appendChild(
                    img
                );

            }
        );

    }

    catch (
        error
    ) {

        showError(
            error.message
        );

    }

}


// ======================================================
// START
// ======================================================

loadMangaData();
