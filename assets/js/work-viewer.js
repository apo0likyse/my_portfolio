const examples = {
  presentations: { title: "Презентации", pages: 5 },
  leaflets: { title: "Листовки", pages: 2 },
  posters: { title: "Плакаты", pages: 1 },
  "media-kit": { title: "Медиакит", pages: 4 },
  brandbook: { title: "Бранчбук", pages: 5 },
};

const params = new URLSearchParams(window.location.search);
const example = examples[params.get("item")] ?? examples.presentations;
const title = document.querySelector("#work-title");
const sheetTitle = document.querySelector("#viewer-sheet-title");
const kicker = document.querySelector("#viewer-kicker");
const count = document.querySelector("#viewer-count");
const previous = document.querySelector("#viewer-prev");
const next = document.querySelector("#viewer-next");
let page = 1;

document.title = `${example.title} — Елена Ляшок`;
title.textContent = example.title;
sheetTitle.textContent = example.title;

function updatePage() {
  const pageLabel = String(page).padStart(2, "0");
  const pageTotal = String(example.pages).padStart(2, "0");
  count.textContent = `${pageLabel} / ${pageTotal}`;
  kicker.textContent = `ПРИМЕР РАБОТЫ · СТРАНИЦА ${pageLabel}`;
  previous.disabled = page === 1;
  next.disabled = page === example.pages;
}

previous.addEventListener("click", () => {
  if (page > 1) page -= 1;
  updatePage();
});

next.addEventListener("click", () => {
  if (page < example.pages) page += 1;
  updatePage();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft" && page > 1) page -= 1;
  else if (event.key === "ArrowRight" && page < example.pages) page += 1;
  else return;
  updatePage();
});

updatePage();
