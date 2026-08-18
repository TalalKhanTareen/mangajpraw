// ======================================================
// MangaJPRaw - Chapter Reader
// ======================================================

const params =
    new URLSearchParams(
        window.location.search
    );

const mangaId =
    params.get("id");

const chapterNumber =
    params.get("chapter");


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
// ERROR
// ======================================================

function showError(text) {

    if (loading) {

        loading.style.display =
            "none";

    }


    if (errorMessage) {

        errorMessage.textContent =
            text;

        errorMessage.style.display =
            "block";

    }

    console.error(text);

}


// ======================================================
// LOAD
// ======================================================

async function loadChapter() {

    try {

        if (
            !mangaId ||
            !chapterNumber
        ) {

            throw new Error(
                "Manga or chapter is missing."
            );

        }


        // ==============================================
        // LOAD JSON
        // ==============================================

        const response =
            await fetch(
                "./data/manga.json?v=" +
                Date.now()
            );


        if (!response.ok) {

            throw new Error(
                "Unable to load manga.json."
            );

        }


        const mangaList =
            await response.json();


        // ==============================================
        // FIND MANGA
        // ==============================================

        const manga =
            mangaList.find(
                manga =>
                    manga.id ===
                    mangaId
            );


        if (!manga) {

            throw new Error(
                "Manga not found: " +
                mangaId
            );

        }


        // ==============================================
        // FIND CHAPTER
        // ==============================================

        const chapter =
            manga.chapters?.find(
                chapter =>
                    Number(
                        chapter.number
                    ) ===
                    Number(
                        chapterNumber
                    )
            );


        if (!chapter) {

            throw new Error(
                "Chapter not found: " +
                chapterNumber
            );

        }


        // ==============================================
        // UPDATE TEXT
        // ==============================================

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


        // ==============================================
        // GET PAGES
        // ==============================================

        const pages =
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
                "No pages uploaded for this chapter."
            );

        }


        // ==============================================
        // CLEAR
        // ==============================================

        chapterPages.innerHTML =
            "";


        // ==============================================
        // CREATE PAGES
        // ==============================================

        pages.forEach(
            function(page, index) {

                const img =
                    document.createElement(
                        "img"
                    );


                img.className =
                    "chapter-page";


                img.alt =
                    "Page " +
                    (index + 1);


                // ======================================
                // EXACT IMAGE PATH
                // ======================================

                const imagePath =
                    "images/" +
                    manga.id +
                    "/" +
                    chapter.number +
                    "/" +
                    page;


                img.src =
                    imagePath;


                console.log(
                    "Loading page:",
                    imagePath
                );


                img.onerror =
                    function() {

                        console.error(
                            "FAILED:",
                            imagePath
                        );

                        img.alt =
                            "Page " +
                            (index + 1) +
                            " could not be loaded.";

                    };


                chapterPages.appendChild(
                    img
                );

            }
        );


        // ==============================================
        // HIDE LOADING
        // ==============================================

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
