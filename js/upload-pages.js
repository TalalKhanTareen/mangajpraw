// ======================================================
// MangaJPRaw - Upload Pages
// Step 11A
// ======================================================


// ======================================================
// ELEMENTS
// ======================================================

const mangaSelect =
    document.getElementById("mangaSelect");

const chapterSelect =
    document.getElementById("chapterSelect");

const pageFiles =
    document.getElementById("pageFiles");

const preview =
    document.getElementById("preview");

const uploadForm =
    document.getElementById("uploadForm");

const uploadBtn =
    document.getElementById("uploadBtn");

const message =
    document.getElementById("message");


// ======================================================
// CONFIG
// ======================================================

const MANGA_JSON =
    "../data/manga.json";


// ======================================================
// DATA
// ======================================================

let mangaData = [];


// ======================================================
// CHECK ADMIN
// ======================================================

function checkAdmin() {

    const admin =
        sessionStorage.getItem(
            "mangajpraw_admin"
        );

    const token =
        sessionStorage.getItem(
            "mangajpraw_token"
        );


    if (
        admin !== "true" ||
        !token
    ) {

        window.location.href =
            "./index.html";

        return false;
    }


    return true;
}


// ======================================================
// MESSAGE
// ======================================================

function showMessage(
    text,
    type = ""
) {

    message.textContent =
        text;

    message.className =
        "message " + type;
}


// ======================================================
// LOAD MANGA
// ======================================================

async function loadManga() {

    try {

        const response =
            await fetch(
                MANGA_JSON +
                "?v=" +
                Date.now()
            );


        if (!response.ok) {

            throw new Error(
                "Could not load manga data."
            );
        }


        mangaData =
            await response.json();


        mangaSelect.innerHTML =
            '<option value="">Select Manga</option>';


        mangaData.forEach(
            manga => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    manga.id;


                option.textContent =
                    manga.title;


                mangaSelect.appendChild(
                    option
                );

            }
        );


    }

    catch (error) {

        console.error(
            error
        );


        showMessage(
            error.message,
            "error"
        );

    }

}


// ======================================================
// MANGA CHANGE
// ======================================================

mangaSelect.addEventListener(
    "change",
    function() {

        const mangaId =
            mangaSelect.value;


        chapterSelect.innerHTML =
            '<option value="">Select Chapter</option>';


        chapterSelect.disabled =
            true;


        if (!mangaId) {

            return;
        }


        const manga =
            mangaData.find(
                item =>
                    item.id === mangaId
            );


        if (!manga) {

            return;
        }


        if (
            !Array.isArray(
                manga.chapters
            ) ||
            manga.chapters.length === 0
        ) {

            chapterSelect.innerHTML =
                '<option value="">No chapters available</option>';

            return;
        }


        manga.chapters.forEach(
            chapter => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    chapter.number;


                option.textContent =
                    "Chapter " +
                    chapter.number;


                chapterSelect.appendChild(
                    option
                );

            }
        );


        chapterSelect.disabled =
            false;

    }
);


// ======================================================
// IMAGE PREVIEW
// ======================================================

pageFiles.addEventListener(
    "change",
    function() {

        preview.innerHTML = "";


        const files =
            Array.from(
                pageFiles.files
            );


        files.sort(
            (a, b) =>
                a.name.localeCompare(
                    b.name,
                    undefined,
                    {
                        numeric: true
                    }
                )
        );


        files.forEach(
            (file, index) => {

                const reader =
                    new FileReader();


                reader.onload =
                    function(event) {

                        const wrapper =
                            document.createElement(
                                "div"
                            );


                        wrapper.className =
                            "preview-item";


                        const img =
                            document.createElement(
                                "img"
                            );


                        img.src =
                            event.target.result;


                        img.alt =
                            "Page " +
                            (index + 1);


                        const label =
                            document.createElement(
                                "span"
                            );


                        label.textContent =
                            String(
                                index + 1
                            ).padStart(
                                3,
                                "0"
                            ) +
                            ".jpg";


                        wrapper.appendChild(
                            img
                        );


                        wrapper.appendChild(
                            label
                        );


                        preview.appendChild(
                            wrapper
                        );

                    };


                reader.readAsDataURL(
                    file
                );

            }
        );

    }
);


// ======================================================
// UPLOAD
// ======================================================

uploadForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        const mangaId =
            mangaSelect.value;


        const chapterNumber =
            chapterSelect.value;


        const files =
            Array.from(
                pageFiles.files
            );


        if (!mangaId) {

            showMessage(
                "Please select a manga.",
                "error"
            );

            return;
        }


        if (!chapterNumber) {

            showMessage(
                "Please select a chapter.",
                "error"
            );

            return;
        }


        if (
            files.length === 0
        ) {

            showMessage(
                "Please select chapter images.",
                "error"
            );

            return;
        }


        showMessage(
            "Uploader is ready. GitHub upload will be connected in the next step."
        );

    }
);


// ======================================================
// START
// ======================================================

if (
    checkAdmin()
) {

    loadManga();

}
