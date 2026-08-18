const mangaSelect = document.getElementById("mangaSelect");
const mangaInfo = document.getElementById("mangaInfo");
const form = document.getElementById("chapterForm");
const submitButton = document.getElementById("submitButton");
const statusBox = document.getElementById("status");

let mangaData = [];


// -----------------------------------------
// STATUS
// -----------------------------------------

function showStatus(message, type) {

    statusBox.textContent = message;

    statusBox.className = type;
}


// -----------------------------------------
// LOAD MANGA
// -----------------------------------------

async function loadManga() {

    try {

        const response = await fetch(
            "../data/manga.json?t=" + Date.now()
        );

        if (!response.ok) {
            throw new Error("Unable to load manga.json");
        }

        mangaData = await response.json();

        mangaSelect.innerHTML =
            '<option value="">Select a manga</option>';

        mangaData.forEach(manga => {

            const option = document.createElement("option");

            option.value = manga.id;

            option.textContent =
                manga.title + " (" + manga.id + ")";

            mangaSelect.appendChild(option);

        });

    } catch (error) {

        console.error(error);

        mangaSelect.innerHTML =
            '<option value="">Failed to load manga</option>';

        showStatus(
            "Could not load manga data.",
            "error"
        );
    }
}


// -----------------------------------------
// MANGA SELECTION
// -----------------------------------------

mangaSelect.addEventListener("change", () => {

    const mangaId = mangaSelect.value;

    const manga = mangaData.find(
        item => item.id === mangaId
    );

    if (!manga) {

        mangaInfo.style.display = "none";

        return;
    }

    let chapterCount = 0;

    if (Array.isArray(manga.chapters)) {
        chapterCount = manga.chapters.length;
    }

    mangaInfo.innerHTML = `
        <strong>${manga.title}</strong><br>
        ID: ${manga.id}<br>
        Existing chapters: ${chapterCount}
    `;

    mangaInfo.style.display = "block";
});


// -----------------------------------------
// CREATE CHAPTER ID
// -----------------------------------------

function createChapterId(number) {

    return String(number)
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^\w.-]/g, "");
}


// -----------------------------------------
// FORM SUBMIT
// -----------------------------------------

form.addEventListener("submit", async (event) => {

    event.preventDefault();

    statusBox.className = "";

    const mangaId =
        mangaSelect.value;

    const chapterNumber =
        document.getElementById("chapterNumber").value.trim();

    const chapterTitle =
        document.getElementById("chapterTitle").value.trim();

    const chapterDescription =
        document.getElementById("chapterDescription").value.trim();

    const releaseDate =
        document.getElementById("releaseDate").value;


    if (!mangaId) {

        showStatus(
            "Please select a manga.",
            "error"
        );

        return;
    }


    if (!chapterNumber) {

        showStatus(
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

        showStatus(
            "Selected manga was not found.",
            "error"
        );

        return;
    }


    // Make sure chapters exists

    if (!Array.isArray(manga.chapters)) {

        manga.chapters = [];

    }


    const chapterId =
        createChapterId(chapterNumber);


    // Check duplicate

    const alreadyExists =
        manga.chapters.some(chapter =>
            String(chapter.number) ===
            String(chapterNumber)
        );


    if (alreadyExists) {

        showStatus(
            "This chapter already exists.",
            "error"
        );

        return;
    }


    // Create chapter

    const newChapter = {

        id: chapterId,

        number: Number(chapterNumber),

        title:
            chapterTitle ||
            `Chapter ${chapterNumber}`,

        description:
            chapterDescription,

        releaseDate:
            releaseDate ||
            new Date().toISOString().split("T")[0],

        pages: []

    };


    manga.chapters.push(newChapter);


    // Sort chapters numerically

    manga.chapters.sort(
        (a, b) =>
            Number(a.number) -
            Number(b.number)
    );


    try {

        submitButton.disabled = true;

        submitButton.textContent =
            "Saving...";


        await saveMangaData(mangaData);


        showStatus(
            `Chapter ${chapterNumber} added successfully.`,
            "success"
        );


        form.reset();

        mangaInfo.style.display = "none";


    } catch (error) {

        console.error(error);

        showStatus(
            error.message ||
            "Failed to save chapter.",
            "error"
        );

    } finally {

        submitButton.disabled = false;

        submitButton.textContent =
            "Add Chapter";
    }

});


// -----------------------------------------
// SAVE TO GITHUB
// -----------------------------------------

async function saveMangaData(data) {

    if (
        typeof GITHUB_CONFIG === "undefined"
    ) {

        throw new Error(
            "GitHub configuration is missing."
        );
    }


    const owner =
        GITHUB_CONFIG.owner;

    const repo =
        GITHUB_CONFIG.repo;

    const branch =
        GITHUB_CONFIG.branch ||
        "main";

    const token =
        GITHUB_CONFIG.token;

    const filePath =
        "data/manga.json";


    if (!token) {

        throw new Error(
            "GitHub token is missing."
        );
    }


    // Get current file

    const getUrl =
        `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`;


    const getResponse =
        await fetch(getUrl, {

            headers: {

                "Accept":
                    "application/vnd.github+json",

                "Authorization":
                    `Bearer ${token}`

            }

        });


    if (!getResponse.ok) {

        throw new Error(
            "Could not access manga.json on GitHub."
        );
    }


    const file =
        await getResponse.json();


    // Convert JSON to Base64

    const jsonText =
        JSON.stringify(data, null, 2);


    const encodedContent =
        btoa(
            unescape(
                encodeURIComponent(jsonText)
            )
        );


    // Commit update

    const updateResponse =
        await fetch(getUrl, {

            method: "PUT",

            headers: {

                "Accept":
                    "application/vnd.github+json",

                "Authorization":
                    `Bearer ${token}`,

                "Content-Type":
                    "application/json"

            },

            body: JSON.stringify({

                message:
                    `Add chapter`,

                content:
                    encodedContent,

                sha:
                    file.sha,

                branch:
                    branch

            })

        });


    if (!updateResponse.ok) {

        const error =
            await updateResponse.json();

        throw new Error(
            error.message ||
            "GitHub update failed."
        );
    }

    return await updateResponse.json();
}


// -----------------------------------------
// START
// -----------------------------------------

loadManga();
