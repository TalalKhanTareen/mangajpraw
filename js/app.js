const DATA_URL = "./data/manga.json";

async function loadManga() {
    try {
        const response = await fetch(DATA_URL);

        if (!response.ok) {
            throw new Error("Failed to load manga data");
        }

        const manga = await response.json();

        console.log("Manga loaded:", manga);

        displayManga(manga);

    } catch (error) {
        console.error("Error:", error);
    }
}

function displayManga(manga) {
    const container = document.getElementById("manga-list");

    if (!container) {
        console.error("manga-list element not found");
        return;
    }

    container.innerHTML = "";

    manga.forEach(item => {

        const card = document.createElement("div");

        card.className = "manga-card";

        card.innerHTML = `
            <img 
                src="${item.cover}" 
                alt="${item.title}"
            >

            <h3>${item.title}</h3>

            <p>${item.japaneseTitle}</p>

            <button onclick="openManga('${item.id}')">
                Read Manga
            </button>
        `;

        container.appendChild(card);
    });
}

function openManga(id) {
    window.location.href = `manga.html?id=${id}`;
}

loadManga();
