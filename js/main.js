import { fetchJson } from "./fetch.js";
import { fetchAllNews } from "./news.js";

async function createNewsCard(news) {
    let newsHtml = `<div class="card-body user-card-body news-card-body">
    ${(news.picture == null) ? "" : `<img class="news-img" src="api/news/${news.id}/attachment">`}
        <div class="row news-text-block">
            <div class="card">
                <div class="card-header news-header">
                    ${news.title}
                </div>
                <div class="card-body news-body">
                    <p class="card-text">${news.content}</p>
                </div>
            </div>
        </div>
    </div>`;
    let newsCardElement = document.createElement("div");
    newsCardElement.className = "card news-card";
    newsCardElement.innerHTML = newsHtml;
    return newsCardElement;
}

async function displayAllNews() {
    let allNews = await fetchAllNews();
    let container = document.getElementById("news-container");
    container.innerHTML = "";
    for (let news of allNews) {
        let card = await createNewsCard(news);
        container.appendChild(card);
    }
}

async function main() {
    await displayAllNews();
}

document.addEventListener("DOMContentLoaded", main);
