const mangaSelect =
    document.getElementById("mangaSelect");

const chapterForm =
    document.getElementById("chapterForm");

const message =
    document.getElementById("message");

const addChapterBtn =
    document.getElementById("addChapterBtn");


const GITHUB_OWNER =
    "talalkhantareen";

const GITHUB_REPO =
    "mangajpraw";

const GITHUB_BRANCH =
    "main";

const MANGA_FILE =
    "data/manga.json";


let mangaData = [];


// ==========================================
// CHECK ADMIN LOGIN
// ==========================================

function checkAdmin() {

    const loggedIn =
        sessionStorage.getItem(
            "mangajpraw_admin"
        );

    const token =
        sessionStorage.getItem(
            "mangajpraw_token"
        );


    if (
        loggedIn !== "true" ||
        !token
    ) {

        window.location.href =
            "./index.html";

        return false;
    }

    return true;
}


// ==========================================
// GET TOKEN
// ==========================================

function getToken() {

    const token =
        sessionStorage.getItem(
            "mangajpraw_token"
        );


    if (!token) {

        throw new Error(
            "Admin session expired. Please login again."
        );

    }


    return token;
}


// ==========================================
// SHOW MESSAGE
// ==========================================

function showMessage(
    text,
    type = ""
) {

    message.textContent =
        text;

    message.className =
        "message " + type;
}


// ==========================================
// LOAD MANGA
// ==========================================

async function loadManga() {

    try {

        const response =
            await fetch(
                "../data/manga.json?t=" +
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
            '<option value="">Select manga</option>';


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

        console.error(error);


        mangaSelect.innerHTML =
            '<option value="">Failed to load manga</option>';


        showMessage(
            error.message,
            "error"
        );

    }

}


// ==========================================
// GET FILE FROM GITHUB
// ==========================================

async function getMangaFile() {

    const token =
        getToken();


    const url =
        `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${MANGA_FILE}?ref=${GITHUB_BRANCH}`;


    const response =
        await fetch(
            url,
            {

                headers: {

                    "Authorization":
                        "Bearer " + token,

                    "Accept":
                        "application/vnd.github+json",

                    "X-GitHub-Api-Version":
                        "2022-11-28"

                }

            }
        );


    if (!response.ok) {

        if (
            response.status === 401 ||
            response.status === 403
        ) {

            throw new Error(
                "GitHub authorization failed. Please login again."
            );

        }


        throw new Error(
            "Could not access manga.json on GitHub."
        );

    }


    return await response.json();

}


// ==========================================
// CONVERT UTF-8 TEXT TO BASE64
// ==========================================

function encodeBase64(text) {

    const bytes =
        new TextEncoder().encode(
            text
        );


    let binary = "";


    bytes.forEach(
        byte => {

            binary +=
                String.fromCharCode(
                    byte
                );

        }
    );


    return btoa(
        binary
    );

}


// ==========================================
// UPDATE MANGA FILE
// ==========================================

async function updateMangaFile(
    data,
    sha
) {

    const token =
        getToken();


    const url =
        `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${MANGA_FILE}`;


    const json =
        JSON.stringify(
            data,
            null,
            2
        ) + "\n";


    const encoded =
        encodeBase64(
            json
        );


    const response =
        await fetch(
            url,
            {

                method:
                    "PUT",

                headers: {

                    "Authorization":
                        "Bearer " + token,

                    "Accept":
                        "application/vnd.github+json",

                    "Content-Type":
                        "application/json",

                    "X-GitHub-Api-Version":
                        "2022-11-28"

                },

                body:
                    JSON.stringify({

                        message:
                            "Admin: Add chapter",

                        content:
                            encoded,

                        sha:
                            sha,

                        branch:
                            GITHUB_BRANCH

                    })

            }
        );


    const result =
        await response.json();


    if (!response.ok) {

        console.error(
            "GitHub error:",
            result
        );


        throw new Error(
            result.message ||
            "GitHub failed to update manga.json."
        );

    }


    return result;

}


// ==========================================
// ADD CHAPTER
// ==========================================

chapterForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        try {

            addChapterBtn.disabled =
                true;


            addChapterBtn.textContent =
                "Saving...";


            showMessage(
                "Preparing chapter..."
            );


            // ------------------------------
            // FORM DATA
            // ------------------------------

            const mangaId =
                mangaSelect.value;


            const chapterNumber =
                document
                    .getElementById(
                        "chapterNumber"
                    )
                    .value
                    .trim();


            const chapterTitle =
                document
                    .getElementById(
                        "chapterTitle"
                    )
                    .value
                    .trim();


            const chapterDescription =
                document
                    .getElementById(
                        "chapterDescription"
                    )
                    .value
                    .trim();


            const releaseDate =
                document
                    .getElementById(
                        "releaseDate"
                    )
                    .value;


            // ------------------------------
            // VALIDATION
            // ------------------------------

            if (!mangaId) {

                throw new Error(
                    "Please select a manga."
                );

            }


            if (!chapterNumber) {

                throw new Error(
                    "Please enter a chapter number."
                );

            }


            const manga =
                mangaData.find(
                    item =>
                        item.id === mangaId
                );


            if (!manga) {

                throw new Error(
                    "Selected manga was not found."
                );

            }


            // ------------------------------
            // GET LATEST FILE
            // ------------------------------

            showMessage(
                "Reading manga.json from GitHub..."
            );


            const file =
                await getMangaFile();


            // Decode GitHub content

            const binary =
                atob(
                    file.content.replace(
                        /\n/g,
                        ""
                    )
                );


            const bytes =
                Uint8Array.from(
                    binary,
                    char =>
                        char.charCodeAt(0)
                );


            const decoded =
                new TextDecoder()
                    .decode(bytes);


            const latestData =
                JSON.parse(
                    decoded
                );


            // ------------------------------
            // FIND MANGA
            // ------------------------------

            const latestManga =
                latestData.find(
                    item =>
                        item.id === mangaId
                );


            if (!latestManga) {

                throw new Error(
                    "Manga does not exist in GitHub data."
                );

            }


            // ------------------------------
            // CREATE CHAPTER ARRAY
            // ------------------------------

            if (
                !Array.isArray(
                    latestManga.chapters
                )
            ) {

                latestManga.chapters = [];

            }


            // ------------------------------
            // DUPLICATE CHECK
            // ------------------------------

            const exists =
                latestManga.chapters.some(
                    chapter =>
                        Number(
                            chapter.number
                        ) ===
                        Number(
                            chapterNumber
                        )
                );


            if (exists) {

                throw new Error(
                    `Chapter ${chapterNumber} already exists.`
                );

            }


            // ------------------------------
            // CREATE CHAPTER
            // ------------------------------

            let number =
                Number(
                    chapterNumber
                );


            if (
                !Number.isFinite(
                    number
                )
            ) {

                throw new Error(
                    "Invalid chapter number."
                );

            }


            const newChapter = {

                id:
                    String(
                        chapterNumber
                    ),

                number:
                    number,

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


            latestManga.chapters.push(
                newChapter
            );


            // ------------------------------
            // SORT CHAPTERS
            // ------------------------------

            latestManga.chapters.sort(
                (a, b) =>
                    Number(a.number) -
                    Number(b.number)
            );


            // ------------------------------
            // SAVE
            // ------------------------------

            showMessage(
                "Committing chapter to GitHub..."
            );


            await updateMangaFile(
                latestData,
                file.sha
            );


            // ------------------------------
            // SUCCESS
            // ------------------------------

            showMessage(
                `Chapter ${chapterNumber} added successfully!`,
                "success"
            );


            chapterForm.reset();


            mangaSelect.value =
                mangaId;


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

        finally {

            addChapterBtn.disabled =
                false;


            addChapterBtn.textContent =
                "Add Chapter";

        }

    }
);


// ==========================================
// START
// ==========================================

if (checkAdmin()) {

    loadManga();

}
