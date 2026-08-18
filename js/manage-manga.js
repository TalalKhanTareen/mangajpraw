// ======================================================
// MangaJPRaw - Manage Manga
// Step 14A
// ======================================================


// ======================================================
// CONFIG
// ======================================================

const MANGA_JSON =
    "../data/manga.json";


// ======================================================
// ELEMENTS
// ======================================================

const mangaGrid =
    document.getElementById(
        "mangaGrid"
    );


const loading =
    document.getElementById(
        "loading"
    );


const message =
    document.getElementById(
        "message"
    );


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
// MESSAGE
// ======================================================

function showMessage(
    text,
    type
) {

    message.textContent =
        text;


    message.className =
        "message show " +
        type;

}


// ======================================================
// LOAD MANGA
// ======================================================

async function loadManga() {

    try {

        loading.style.display =
            "block";


        const response =
            await fetch(
                MANGA_JSON +
                "?v=" +
                Date.now()
            );


        if (!response.ok) {

            throw new Error(
                "Could not load manga.json."
            );

        }


        const mangaList =
            await response.json();


        console.log(
            "Manga loaded:",
            mangaList
        );


        displayManga(
            mangaList
        );

    }

    catch (error) {

        console.error(
            error
        );


        loading.textContent =
            error.message;


        showMessage(
            error.message,
            "error"
        );

    }

}


// ======================================================
// DISPLAY MANGA
// ======================================================

function displayManga(
    mangaList
) {

    loading.style.display =
        "none";


    mangaGrid.innerHTML =
        "";


    if (
        !Array.isArray(
            mangaList
        ) ||
        mangaList.length === 0
    ) {

        mangaGrid.innerHTML =
            "<p>No manga found.</p>";

        return;

    }


    mangaList.forEach(
        function(manga) {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "manga-card";


            const chapters =
                Array.isArray(
                    manga.chapters
                )
                    ? manga.chapters
                    : [];


            const genres =
                Array.isArray(
                    manga.genres
                )
                    ? manga.genres
                    : [];


            card.innerHTML = `

                <h3>
                    ${escapeHTML(
                        manga.title ||
                        "Untitled"
                    )}
                </h3>

                <div class="manga-id">

                    ID:
                    ${escapeHTML(
                        manga.id ||
                        "-"
                    )}

                </div>

                <div class="manga-description">

                    ${escapeHTML(
                        manga.description ||
                        "No description."
                    )}

                </div>

                <div class="manga-info">

                    <span class="badge status">

                        Status:
                        ${escapeHTML(
                            manga.status ||
                            "Unknown"
                        )}

                    </span>

                    <span class="badge chapter-count">

                        Chapters:
                        ${chapters.length}

                    </span>

                </div>

                <div class="manga-info">

                    ${
                        genres
                            .map(
                                genre =>
                                    `<span class="badge">
                                        ${escapeHTML(
                                            genre
                                        )}
                                    </span>`
                            )
                            .join("")
                    }

                </div>

                <div class="card-actions">

                    <button
                        class="edit-btn"
                        onclick="editManga('${escapeAttribute(manga.id)}')"
                    >
                        ✏️ Edit
                    </button>

                    <button
                        class="delete-btn"
                        onclick="deleteManga('${escapeAttribute(manga.id)}')"
                    >
                        🗑️ Delete
                    </button>

                    <button
                        class="view-btn"
                        onclick="viewManga('${escapeAttribute(manga.id)}')"
                    >
                        👁️ View
                    </button>

                </div>

            `;


            mangaGrid.appendChild(
                card
            );

        }
    );

}


// ======================================================
// ESCAPE HTML
// ======================================================

function escapeHTML(
    value
) {

    return String(
        value
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


// ======================================================
// ESCAPE ATTRIBUTE
// ======================================================

function escapeAttribute(
    value
) {

    return String(
        value
    )
        .replace(
            /\\/g,
            "\\\\"
        )
        .replace(
            /'/g,
            "\\'"
        );

}


// ======================================================
// EDIT
// ======================================================

function editManga(
    mangaId
) {

    alert(
        "Manga editing will be added in Step 14B.\n\nManga ID: " +
        mangaId
    );

}


// ======================================================
// DELETE
// ======================================================

function deleteManga(
    mangaId
) {

    alert(
        "Manga deletion will be added in Step 14B.\n\nManga ID: " +
        mangaId
    );

}


// ======================================================
// VIEW
// ======================================================

function viewManga(
    mangaId
) {

    window.open(
        "../manga.html?id=" +
        encodeURIComponent(
            mangaId
        ),
        "_blank"
    );

}


// ======================================================
// START
// ======================================================

if (
    checkAdmin()
) {

    loadManga();

}
