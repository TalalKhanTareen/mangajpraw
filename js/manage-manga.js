// ======================================================
// MangaJPRaw - Manage Manga
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

        const response =
            await fetch(
                "../data/manga.json?v=" +
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


        loading.style.display =
            "none";


        displayManga(
            mangaList
        );

    }

    catch (error) {

        console.error(
            error
        );


        loading.textContent =
            "Failed to load manga.";


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


            const genreHTML =
                genres
                    .map(
                        function(genre) {

                            return `
                                <span class="badge">
                                    ${escapeHTML(
                                        genre
                                    )}
                                </span>
                            `;

                        }
                    )
                    .join("");


            card.innerHTML = `

                <h2>
                    ${escapeHTML(
                        manga.title ||
                        "Untitled"
                    )}
                </h2>

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
                        "No description available."
                    )}

                </div>

                <div class="manga-info">

                    <span class="badge">

                        Status:
                        ${escapeHTML(
                            manga.status ||
                            "Unknown"
                        )}

                    </span>

                    <span class="badge">

                        Chapters:
                        ${chapters.length}

                    </span>

                </div>

                <div class="manga-info">

                    ${genreHTML}

                </div>

                <div class="card-actions">

                    <button
                        type="button"
                        class="edit-btn"
                        data-id="${escapeHTML(
                            manga.id
                        )}"
                    >
                        ✏️ Edit
                    </button>

                    <button
                        type="button"
                        class="delete-btn"
                        data-id="${escapeHTML(
                            manga.id
                        )}"
                    >
                        🗑️ Delete
                    </button>

                    <button
                        type="button"
                        class="view-btn"
                        data-id="${escapeHTML(
                            manga.id
                        )}"
                    >
                        👁️ View
                    </button>

                </div>

            `;


            // EDIT

            card
                .querySelector(
                    ".edit-btn"
                )
                .addEventListener(
                    "click",
                    function() {

                        editManga(
                            manga.id
                        );

                    }
                );


            // DELETE

            card
                .querySelector(
                    ".delete-btn"
                )
                .addEventListener(
                    "click",
                    function() {

                        deleteManga(
                            manga.id
                        );

                    }
                );


            // VIEW

            card
                .querySelector(
                    ".view-btn"
                )
                .addEventListener(
                    "click",
                    function() {

                        viewManga(
                            manga.id
                        );

                    }
                );


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
// EDIT
// ======================================================

function editManga(
    mangaId
) {

    alert(
        "Edit Manga will be implemented in the next part.\n\nManga ID: " +
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
        "Delete Manga will be implemented in the next part.\n\nManga ID: " +
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
