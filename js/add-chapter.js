const mangaSelect = document.getElementById("mangaSelect");
const chapterForm = document.getElementById("chapterForm");
const message = document.getElementById("message");
const addChapterBtn = document.getElementById("addChapterBtn");

let mangaData = [];


// ==========================================
// SHOW MESSAGE
// ==========================================

function showMessage(text, type) {

    message.textContent = text;

    message.className = "message " + type;
}


// ==========================================
// LOAD MANGA
// ==========================================

async function loadManga() {

    try {

        const response = await fetch(
            "../data/manga.json?t=" + Date.now()
        );

        if (!response.ok) {
            throw new Error("Could not load manga data.");
        }

        mangaData = await response.json();

        mangaSelect.innerHTML =
            '<option value="">Select manga</option>';

        mangaData.forEach(manga => {

            const option =
                document.createElement("option");

            option.value = manga.id;

            option.textContent =
                manga.title;

            mangaSelect.appendChild(option);

        });

    }

    catch (error) {

        console.error(error);

        mangaSelect.innerHTML =
            '<option value="">Failed to load manga</option>';

        showMessage(
            "Failed to load manga.json.",
            "error"
        );
    }
}


// ==========================================
// ADD CHAPTER
// ==========================================

chapterForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        const mangaId =
            mangaSelect.value;

        const chapterNumber =
            document
                .getElementById("chapterNumber")
                .value
                .trim();

        const chapterTitle =
            document
                .getElementById("chapterTitle")
                .value
                .trim();

        const chapterDescription =
            document
                .getElementById("chapterDescription")
                .value
                .trim();

        const releaseDate =
            document
                .getElementById("releaseDate")
                .value;


        // ----------------------------------
        // VALIDATION
        // ----------------------------------

        if (!mangaId) {

            showMessage(
                "Please select a manga.",
                "error"
            );

            return;
        }


        if (!chapterNumber) {

            showMessage(
                "Please enter a chapter number.",
                "error"
            );

            return;
        }


        const manga =
            mangaData.find(
                item => item.id === mangaId
            );


        if (!manga) {

            showMessage(
                "Manga not found.",
                "error"
            );

            return;
        }


        // ----------------------------------
        // CREATE CHAPTER ARRAY
        // ----------------------------------

        if (!Array.isArray(manga.chapters)) {

            manga.chapters = [];

        }


        // ----------------------------------
        // DUPLICATE CHECK
        // ----------------------------------

        const exists =
            manga.chapters.some(
                chapter =>
                    Number(chapter.number) ===
                    Number(chapterNumber)
            );


        if (exists) {

            showMessage(
                "This chapter already exists.",
                "error"
            );

            return;
        }


        // ----------------------------------
        // CREATE CHAPTER
        // ----------------------------------

        const chapter = {

            id: String(chapterNumber),

            number: Number(chapterNumber),

            title:
                chapterTitle ||
                `Chapter ${chapterNumber}`,

            description:
                chapterDescription,

            releaseDate:
                releaseDate ||
                new Date()
                    .toISOString()
                    .split("T")[0],

            pages: []

        };


        manga.chapters.push(chapter);


        // Sort chapters

        manga.chapters.sort(
            (a, b) =>
                Number(a.number) -
                Number(b.number)
        );


        // ----------------------------------
        // CURRENT DEMO MODE
        // ----------------------------------

        console.log(
            "Updated manga data:",
            mangaData
        );


        showMessage(
            "Chapter information prepared successfully. GitHub saving will be connected in the next part.",
            "success"
        );


        console.log(
            JSON.stringify(
                mangaData,
                null,
                2
            )
        );

    }
);


// ==========================================
// START
// ==========================================

loadManga();
