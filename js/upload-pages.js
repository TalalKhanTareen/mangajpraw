// ======================================================
// MangaJPRaw - Upload Chapter Pages
// Step 11B - GitHub Upload
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
// GITHUB CONFIGURATION
// ======================================================

const GITHUB_OWNER =
    "talalkhantareen";

const GITHUB_REPO =
    "mangajpraw";

const GITHUB_BRANCH =
    "main";

const MANGA_FILE =
    "data/manga.json";


// ======================================================
// DATA
// ======================================================

let mangaData = [];


// ======================================================
// CHECK ADMIN LOGIN
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
// GET TOKEN
// ======================================================

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


// ======================================================
// SHOW MESSAGE
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
                "../data/manga.json?v=" +
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
// LOAD CHAPTERS
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
// SORT FILES
// ======================================================

function sortFiles(files) {

    return files.sort(
        function(a, b) {

            return a.name.localeCompare(
                b.name,
                undefined,
                {
                    numeric: true,
                    sensitivity: "base"
                }
            );

        }
    );

}


// ======================================================
// PREVIEW IMAGES
// ======================================================

pageFiles.addEventListener(
    "change",
    function() {

        preview.innerHTML = "";


        let files =
            Array.from(
                pageFiles.files
            );


        files =
            sortFiles(files);


        files.forEach(
            function(file, index) {

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
// CONVERT FILE TO BASE64
// ======================================================

function fileToBase64(file) {

    return new Promise(
        function(resolve, reject) {

            const reader =
                new FileReader();


            reader.onload =
                function() {

                    const result =
                        reader.result;


                    const base64 =
                        result.split(
                            ","
                        )[1];


                    resolve(
                        base64
                    );

                };


            reader.onerror =
                function() {

                    reject(
                        new Error(
                            "Could not read " +
                            file.name
                        )
                    );

                };


            reader.readAsDataURL(
                file
            );

        }
    );

}


// ======================================================
// GITHUB API REQUEST
// ======================================================

async function githubRequest(
    url,
    options = {}
) {

    const token =
        getToken();


    const headers = {

        "Authorization":
            "Bearer " +
            token,

        "Accept":
            "application/vnd.github+json",

        "X-GitHub-Api-Version":
            "2022-11-28"

    };


    if (
        options.body &&
        !headers["Content-Type"]
    ) {

        headers["Content-Type"] =
            "application/json";

    }


    const response =
        await fetch(
            url,
            {
                ...options,
                headers: {
                    ...headers,
                    ...(options.headers || {})
                }
            }
        );


    const text =
        await response.text();


    let data = null;


    try {

        data =
            text
                ? JSON.parse(text)
                : null;

    }

    catch {

        data = null;

    }


    if (!response.ok) {

        console.error(
            "GitHub API error:",
            data
        );


        throw new Error(
            data?.message ||
            "GitHub API request failed."
        );

    }


    return data;

}


// ======================================================
// UPLOAD ONE IMAGE
// ======================================================

async function uploadImage(
    mangaId,
    chapterNumber,
    file,
    pageNumber
) {

    const filename =
        String(
            pageNumber
        ).padStart(
            3,
            "0"
        ) +
        ".jpg";


    const path =
        "images/" +
        mangaId +
        "/" +
        chapterNumber +
        "/" +
        filename;


    const url =
        "https://api.github.com/repos/" +
        GITHUB_OWNER +
        "/" +
        GITHUB_REPO +
        "/contents/" +
        path;


    // ------------------------------------------
    // CONVERT IMAGE
    // ------------------------------------------

    const base64 =
        await fileToBase64(
            file
        );


    // ------------------------------------------
    // CHECK IF FILE EXISTS
    // ------------------------------------------

    let existingFile = null;


    try {

        existingFile =
            await githubRequest(
                url +
                "?ref=" +
                GITHUB_BRANCH
            );

    }

    catch (error) {

        // 404 is expected for a new page

        existingFile =
            null;

    }


    // ------------------------------------------
    // CREATE / UPDATE FILE
    // ------------------------------------------

    const body = {

        message:
            "Admin: Upload page " +
            filename,

        content:
            base64,

        branch:
            GITHUB_BRANCH

    };


    if (
        existingFile &&
        existingFile.sha
    ) {

        body.sha =
            existingFile.sha;

    }


    await githubRequest(
        url,
        {

            method:
                "PUT",

            body:
                JSON.stringify(
                    body
                )

        }
    );


    return filename;

}


// ======================================================
// GET LATEST MANGA.JSON
// ======================================================

async function getMangaFile() {

    const url =
        "https://api.github.com/repos/" +
        GITHUB_OWNER +
        "/" +
        GITHUB_REPO +
        "/contents/" +
        MANGA_FILE +
        "?ref=" +
        GITHUB_BRANCH;


    return await githubRequest(
        url
    );

}


// ======================================================
// DECODE BASE64
// ======================================================

function decodeBase64(
    base64
) {

    const clean =
        base64.replace(
            /\n/g,
            ""
        );


    const binary =
        atob(clean);


    const bytes =
        Uint8Array.from(
            binary,
            function(character) {

                return character.charCodeAt(
                    0
                );

            }
        );


    return new TextDecoder()
        .decode(
            bytes
        );

}


// ======================================================
// ENCODE BASE64
// ======================================================

function encodeBase64(
    text
) {

    const bytes =
        new TextEncoder()
            .encode(
                text
            );


    let binary = "";


    for (
        const byte of bytes
    ) {

        binary +=
            String.fromCharCode(
                byte
            );

    }


    return btoa(
        binary
    );

}


// ======================================================
// UPDATE MANGA.JSON
// ======================================================

async function updateMangaJson(
    mangaId,
    chapterNumber,
    pageNames
) {

    showMessage(
        "Updating manga.json..."
    );


    // ------------------------------------------
    // GET CURRENT FILE
    // ------------------------------------------

    const file =
        await getMangaFile();


    const decoded =
        decodeBase64(
            file.content
        );


    const data =
        JSON.parse(
            decoded
        );


    if (
        !Array.isArray(data)
    ) {

        throw new Error(
            "manga.json format is invalid."
        );

    }


    // ------------------------------------------
    // FIND MANGA
    // ------------------------------------------

    const manga =
        data.find(
            item =>
                item.id ===
                mangaId
        );


    if (!manga) {

        throw new Error(
            "Manga was not found."
        );

    }


    // ------------------------------------------
    // FIND CHAPTER
    // ------------------------------------------

    if (
        !Array.isArray(
            manga.chapters
        )
    ) {

        throw new Error(
            "This manga has no chapters."
        );

    }


    const chapter =
        manga.chapters.find(
            item =>
                Number(
                    item.number
                ) ===
                Number(
                    chapterNumber
                )
        );


    if (!chapter) {

        throw new Error(
            "Chapter was not found."
        );

    }


    // ------------------------------------------
    // CREATE PAGES ARRAY
    // ------------------------------------------

    if (
        !Array.isArray(
            chapter.pages
        )
    ) {

        chapter.pages = [];

    }


    // ------------------------------------------
    // ADD PAGE NAMES
    // ------------------------------------------

    pageNames.forEach(
        function(pageName) {

            if (
                !chapter.pages.includes(
                    pageName
                )
            ) {

                chapter.pages.push(
                    pageName
                );

            }

        }
    );


    // ------------------------------------------
    // SORT PAGES
    // ------------------------------------------

    chapter.pages.sort(
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


    // ------------------------------------------
    // SAVE
    // ------------------------------------------

    const json =
        JSON.stringify(
            data,
            null,
            2
        ) +
        "\n";


    const encoded =
        encodeBase64(
            json
        );


    const url =
        "https://api.github.com/repos/" +
        GITHUB_OWNER +
        "/" +
        GITHUB_REPO +
        "/contents/" +
        MANGA_FILE;


    await githubRequest(
        url,
        {

            method:
                "PUT",

            body:
                JSON.stringify({

                    message:
                        "Admin: Update chapter pages",

                    content:
                        encoded,

                    sha:
                        file.sha,

                    branch:
                        GITHUB_BRANCH

                })

        }
    );

}


// ======================================================
// UPLOAD FORM
// ======================================================

uploadForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        try {

            // ------------------------------------------
            // GET VALUES
            // ------------------------------------------

            const mangaId =
                mangaSelect.value;


            const chapterNumber =
                chapterSelect.value;


            let files =
                Array.from(
                    pageFiles.files
                );


            // ------------------------------------------
            // VALIDATION
            // ------------------------------------------

            if (!mangaId) {

                throw new Error(
                    "Please select a manga."
                );

            }


            if (!chapterNumber) {

                throw new Error(
                    "Please select a chapter."
                );

            }


            if (
                files.length === 0
            ) {

                throw new Error(
                    "Please select chapter images."
                );

            }


            // ------------------------------------------
            // SORT
            // ------------------------------------------

            files =
                sortFiles(
                    files
                );


            // ------------------------------------------
            // DISABLE
            // ------------------------------------------

            uploadBtn.disabled =
                true;


            uploadBtn.textContent =
                "Uploading...";


            const uploadedPages = [];


            // ------------------------------------------
            // UPLOAD FILES
            // ------------------------------------------

            for (
                let i = 0;
                i < files.length;
                i++
            ) {

                const pageNumber =
                    i + 1;


                const filename =
                    String(
                        pageNumber
                    ).padStart(
                        3,
                        "0"
                    ) +
                    ".jpg";


                showMessage(
                    "Uploading " +
                    filename +
                    " (" +
                    pageNumber +
                    "/" +
                    files.length +
                    ")..."
                );


                await uploadImage(
                    mangaId,
                    chapterNumber,
                    files[i],
                    pageNumber
                );


                uploadedPages.push(
                    filename
                );

            }


            // ------------------------------------------
            // UPDATE MANGA.JSON
            // ------------------------------------------

            await updateMangaJson(
                mangaId,
                chapterNumber,
                uploadedPages
            );


            // ------------------------------------------
            // SUCCESS
            // ------------------------------------------

            showMessage(
                files.length +
                " page(s) uploaded successfully!",
                "success"
            );


            pageFiles.value =
                "";


            preview.innerHTML =
                "";


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

            uploadBtn.disabled =
                false;


            uploadBtn.textContent =
                "Upload Pages";

        }

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
