// ======================================================
// MangaJPRaw - Smart Chapter Page Uploader
// Step 13
// ======================================================


// ======================================================
// GITHUB CONFIG
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
// HTML ELEMENTS
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
// DATA
// ======================================================

let mangaData = [];


// ======================================================
// ADMIN CHECK
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
// TOKEN
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
// MESSAGE
// ======================================================

function showMessage(
    text,
    type = ""
) {

    if (!message) {
        return;
    }


    message.textContent =
        text;


    message.className =
        "message " +
        type;

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
            function(manga) {

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
                function(item) {

                    return (
                        item.id ===
                        mangaId
                    );

                }
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
            function(chapter) {

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
// PREVIEW
// ======================================================

pageFiles.addEventListener(
    "change",
    function() {

        preview.innerHTML =
            "";


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
                            file.name;


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
// FILE TO BASE64
// ======================================================

function fileToBase64(
    file
) {

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
// GITHUB REQUEST
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


    if (options.body) {

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

        throw new Error(
            data?.message ||
            "GitHub API request failed."
        );

    }


    return data;

}


// ======================================================
// GET EXISTING CHAPTER PAGES
// ======================================================

async function getExistingPages(
    mangaId,
    chapterNumber
) {

    const path =
        "images/" +
        mangaId +
        "/" +
        chapterNumber;


    const url =
        "https://api.github.com/repos/" +
        GITHUB_OWNER +
        "/" +
        GITHUB_REPO +
        "/contents/" +
        path +
        "?ref=" +
        GITHUB_BRANCH;


    try {

        const files =
            await githubRequest(
                url
            );


        if (
            !Array.isArray(files)
        ) {

            return [];

        }


        return files
            .filter(
                function(file) {

                    return (
                        file.type ===
                        "file" &&
                        /\.(jpg|jpeg|png|webp)$/i
                            .test(
                                file.name
                            )
                    );

                }
            )
            .map(
                function(file) {

                    return file.name;

                }
            );

    }

    catch (error) {

        // Directory doesn't exist yet.

        console.log(
            "No existing page directory."
        );


        return [];

    }

}


// ======================================================
// FIND NEXT PAGE NUMBER
// ======================================================

function getNextPageNumber(
    existingPages
) {

    let highest =
        0;


    existingPages.forEach(
        function(filename) {

            const match =
                filename.match(
                    /^(\d+)\./
                );


            if (!match) {

                return;

            }


            const number =
                parseInt(
                    match[1],
                    10
                );


            if (
                number > highest
            ) {

                highest =
                    number;

            }

        }
    );


    return highest + 1;

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


    const base64 =
        await fileToBase64(
            file
        );


    const body = {

        message:
            "Admin: Upload page " +
            filename,

        content:
            base64,

        branch:
            GITHUB_BRANCH

    };


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
// GET MANGA.JSON
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


    let binary =
        "";


    bytes.forEach(
        function(byte) {

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


    const manga =
        data.find(
            function(item) {

                return (
                    item.id ===
                    mangaId
                );

            }
        );


    if (!manga) {

        throw new Error(
            "Manga was not found."
        );

    }


    if (
        !Array.isArray(
            manga.chapters
        )
    ) {

        throw new Error(
            "Manga has no chapters."
        );

    }


    const chapter =
        manga.chapters.find(
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


    if (!chapter) {

        throw new Error(
            "Chapter was not found."
        );

    }


    if (
        !Array.isArray(
            chapter.pages
        )
    ) {

        chapter.pages =
            [];

    }


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
            // DISABLE BUTTON
            // ------------------------------------------

            uploadBtn.disabled =
                true;


            uploadBtn.textContent =
                "Checking existing pages...";


            // ------------------------------------------
            // GET EXISTING PAGES
            // ------------------------------------------

            const existingPages =
                await getExistingPages(
                    mangaId,
                    chapterNumber
                );


            console.log(
                "Existing pages:",
                existingPages
            );


            // ------------------------------------------
            // FIND NEXT NUMBER
            // ------------------------------------------

            let nextNumber =
                getNextPageNumber(
                    existingPages
                );


            console.log(
                "Next page:",
                nextNumber
            );


            // ------------------------------------------
            // UPLOAD
            // ------------------------------------------

            const uploadedPages =
                [];


            for (
                let i = 0;
                i < files.length;
                i++
            ) {

                const pageNumber =
                    nextNumber +
                    i;


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
                    (i + 1) +
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
            // UPDATE JSON
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
