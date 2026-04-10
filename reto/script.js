/**
 * ═══════════════════════════════════════════════════════════════
 * Mixología Lounge — JavaScript Principal
 * 
 * SPA que consume la API de TheCocktailDB para buscar cócteles
 * por nombre o ingrediente, con favoritos y modal de detalle.
 * ═══════════════════════════════════════════════════════════════
 */

// ── Elementos del DOM ──
const $ = (id) => document.getElementById(id);
const searchForm = $("searchForm");
const searchInput = $("searchInput");
const clearBtn = $("clearBtn");
const randomBtn = $("randomBtn");
const favToggle = $("favoritesToggle");
const favCount = $("favCount");
const results = $("results");
const statusMsg = $("statusMessage");
const skeletons = $("loadingSkeletons");
const modalOverlay = $("modalOverlay");
const modalBody = $("modalBody");
const scrollTopBtn = $("scrollTop");

const radioPills = document.querySelectorAll(".radio-pill");
const API = "https://www.thecocktaildb.com/api/json/v1/1";

// ── Estado ──
let currentMode = "name";
let favorites = JSON.parse(localStorage.getItem("cocktail_favorites") || "[]");
let showingFavs = false;

// ═══════════════════════════════════════════════════════════════
// EVENTOS
// ═══════════════════════════════════════════════════════════════

document.addEventListener("DOMContentLoaded", () => {
  updateFavCount();
  getRandomCocktail();
});

searchForm.addEventListener("submit", (e) => { e.preventDefault(); showingFavs = false; handleSearch(); });
randomBtn.addEventListener("click", () => { showingFavs = false; getRandomCocktail(); });

searchInput.addEventListener("input", () => { clearBtn.hidden = !searchInput.value.trim(); });
clearBtn.addEventListener("click", () => { searchInput.value = ""; clearBtn.hidden = true; searchInput.focus(); });

// Cambiar modo de búsqueda
radioPills.forEach((pill) => {
  pill.addEventListener("click", () => {
    radioPills.forEach((p) => p.classList.remove("active"));
    pill.classList.add("active");
    pill.querySelector("input").checked = true;
    currentMode = pill.querySelector("input").value;
    searchInput.placeholder = currentMode === "name"
      ? "Busca tu cóctel... Ej: Margarita, Mojito, Daiquiri"
      : "Escribe un ingrediente... Ej: Vodka, Rum, Tequila";
    searchInput.focus();
  });
});

// Favoritos toggle
favToggle.addEventListener("click", () => {
  showingFavs = !showingFavs;
  showingFavs ? showFavorites() : (results.innerHTML = "", showStatus("Búsqueda limpia. ¡Busca un cóctel!"));
});

// Modal
$("modalClose").addEventListener("click", closeModal);
modalOverlay.addEventListener("click", (e) => { if (e.target === modalOverlay) closeModal(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !modalOverlay.hidden) closeModal(); });

// Scroll to top
window.addEventListener("scroll", () => { scrollTopBtn.hidden = window.scrollY < 400; });
scrollTopBtn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

// ═══════════════════════════════════════════════════════════════
// BÚSQUEDA
// ═══════════════════════════════════════════════════════════════

async function handleSearch() {
  const query = searchInput.value.trim();
  if (!query) { showStatus("✍️ Escribe algo para buscar.", "error"); return; }

  setLoading(true);
  showStatus("🔍 Buscando cócteles...", "loading");
  results.innerHTML = "";

  try {
    currentMode === "name" ? await searchByName(query) : await searchByIngredient(query);
  } catch (err) {
    console.error(err);
    showStatus("⚠️ Error al consultar la API. Intenta de nuevo.", "error");
    setLoading(false);
  }
}

/** Buscar por nombre — endpoint /search.php */
async function searchByName(name) {
  const data = await fetchJSON(`${API}/search.php?s=${encodeURIComponent(name)}`);
  setLoading(false);

  if (!data.drinks) return showStatus(`😕 No encontramos "${name}". ¡Intenta con otro nombre!`, "error");

  showStatus(`🍹 <strong>${data.drinks.length}</strong> resultado(s) para "${name}"`, "success");
  renderCocktails(data.drinks);
}

/**
 * Buscar por ingrediente — endpoint /filter.php
 * NOTA: /filter.php solo devuelve datos básicos (nombre, imagen, ID).
 * Para obtener ingredientes e instrucciones, hacemos una segunda
 * petición por cada cóctel a /lookup.php (máx. 12 resultados).
 */
async function searchByIngredient(ingredient) {
  const data = await fetchJSON(`${API}/filter.php?i=${encodeURIComponent(ingredient)}`);

  if (!data.drinks) { setLoading(false); return showStatus(`😕 No hay cócteles con "${ingredient}".`, "error"); }

  showStatus(`🧪 Cargando detalles de ${Math.min(data.drinks.length, 12)} cóctel(es)...`, "loading");

  const details = await Promise.all(
    data.drinks.slice(0, 12).map((d) =>
      fetchJSON(`${API}/lookup.php?i=${d.idDrink}`).then((r) => r.drinks?.[0]).catch(() => null)
    )
  );
  const valid = details.filter(Boolean);
  setLoading(false);

  if (!valid.length) return showStatus("😕 No pudimos cargar los detalles.", "error");

  showStatus(`🍹 <strong>${data.drinks.length}</strong> resultado(s) con "${ingredient}" (mostrando ${valid.length})`, "success");
  renderCocktails(valid);
}

/** Cóctel aleatorio — endpoint /random.php */
async function getRandomCocktail() {
  setLoading(true);
  showStatus("🎲 Buscando un cóctel aleatorio...", "loading");
  results.innerHTML = "";

  try {
    const data = await fetchJSON(`${API}/random.php`);
    setLoading(false);
    showStatus("✨ ¡Cóctel aleatorio! Haz clic en la tarjeta para ver más.", "success");
    renderCocktails(data.drinks);
  } catch {
    setLoading(false);
    showStatus("⚠️ No se pudo cargar. Verifica tu conexión.", "error");
  }
}

// ═══════════════════════════════════════════════════════════════
// MAPEO DE INGREDIENTES
// ═══════════════════════════════════════════════════════════════

/**
 * Extrae y empareja dinámicamente ingredientes con sus medidas.
 *
 * En TheCocktailDB, los datos vienen en llaves separadas:
 *   strIngredient1..15 → nombre del ingrediente
 *   strMeasure1..15    → cantidad/medida correspondiente
 *
 * Iteramos del 1 al 15, verificamos que el ingrediente NO sea
 * null ni cadena vacía, y lo emparejamos con su medida.
 * Si la medida es null/vacía, solo se muestra el ingrediente.
 *
 * @param {Object} drink - Objeto del cóctel de la API
 * @returns {Array<{ingredient: string, measure: string}>}
 */
function getIngredients(drink) {
  const list = [];
  for (let i = 1; i <= 15; i++) {
    const ing = drink[`strIngredient${i}`];
    const msr = drink[`strMeasure${i}`];
    if (ing && ing.trim()) {
      list.push({ ingredient: ing.trim(), measure: msr ? msr.trim() : "" });
    }
  }
  return list;
}

/** Formatea ingrediente como HTML (medida en negrita si existe) */
function fmtIng(item) {
  return item.measure ? `<strong>${item.measure}</strong> ${item.ingredient}` : item.ingredient;
}

// ═══════════════════════════════════════════════════════════════
// RENDERIZADO
// ═══════════════════════════════════════════════════════════════

function renderCocktails(drinks) {
  results.innerHTML = "";

  drinks.forEach((drink) => {
    const ings = getIngredients(drink);
    const isFav = favorites.includes(drink.idDrink);
    const instructions = drink.strInstructionsES || drink.strInstructions || "No hay instrucciones.";
    const shortInst = instructions.length > 120 ? instructions.slice(0, 120) + "..." : instructions;

    const card = document.createElement("article");
    card.className = "cocktail-card";

    card.innerHTML = `
      <div class="card-img-wrapper">
        <img src="${drink.strDrinkThumb}" alt="${drink.strDrink}" loading="lazy" />
        <button class="fav-btn ${isFav ? 'active' : ''}" data-id="${drink.idDrink}"
          aria-label="${isFav ? 'Quitar de' : 'Agregar a'} favoritos">${isFav ? '❤️' : '🤍'}</button>
        <span class="card-badge">${drink.strCategory || "Cóctel"}</span>
      </div>
      <div class="card-content">
        <h2>${drink.strDrink}</h2>
        <div class="card-meta">
          <span>🥃 ${drink.strAlcoholic || "N/A"}</span>
          <span>🍷 ${drink.strGlass || "N/A"}</span>
        </div>
        <h3>🧪 Ingredientes</h3>
        <ul class="ingredients-list">${ings.map((i) => `<li>${fmtIng(i)}</li>`).join("")}</ul>
        <h3>📋 Preparación</h3>
        <p class="instructions">${shortInst}</p>
        <button class="card-expand-btn">Ver receta completa →</button>
      </div>`;

    // Eventos
    card.querySelector(".fav-btn").addEventListener("click", (e) => { e.stopPropagation(); toggleFav(drink.idDrink, e.currentTarget); });
    card.querySelector(".card-expand-btn").addEventListener("click", (e) => { e.stopPropagation(); openModal(drink); });
    card.addEventListener("click", () => openModal(drink));

    results.appendChild(card);
  });
}

// ═══════════════════════════════════════════════════════════════
// MODAL
// ═══════════════════════════════════════════════════════════════

function openModal(drink) {
  const ings = getIngredients(drink);
  const instructions = drink.strInstructionsES || drink.strInstructions || "No hay instrucciones.";

  modalBody.innerHTML = `
    <img class="modal-img" src="${drink.strDrinkThumb}" alt="${drink.strDrink}" />
    <div class="modal-content">
      <h2>${drink.strDrink}</h2>
      <div class="modal-tags">
        ${drink.strCategory ? `<span class="modal-tag category">📂 ${drink.strCategory}</span>` : ""}
        ${drink.strGlass ? `<span class="modal-tag glass">🍷 ${drink.strGlass}</span>` : ""}
        ${drink.strAlcoholic ? `<span class="modal-tag alcoholic">🥃 ${drink.strAlcoholic}</span>` : ""}
      </div>
      <p class="modal-section-title">🧪 Ingredientes</p>
      <ul class="modal-ingredients">
        ${ings.map((i) => `<li>
          <img class="ing-thumb" src="https://www.thecocktaildb.com/images/ingredients/${encodeURIComponent(i.ingredient)}-Small.png"
            alt="${i.ingredient}" loading="lazy" onerror="this.style.display='none'" />
          <span>${fmtIng(i)}</span>
        </li>`).join("")}
      </ul>
      <p class="modal-section-title">📋 Instrucciones</p>
      <p class="modal-instructions">${instructions}</p>
    </div>`;

  modalOverlay.hidden = false;
  document.body.style.overflow = "hidden";
}

function closeModal() {
  modalOverlay.hidden = true;
  document.body.style.overflow = "";
}

// ═══════════════════════════════════════════════════════════════
// FAVORITOS (localStorage)
// ═══════════════════════════════════════════════════════════════

function toggleFav(id, btn) {
  const idx = favorites.indexOf(id);
  if (idx > -1) { favorites.splice(idx, 1); btn.classList.remove("active"); btn.innerHTML = "🤍"; }
  else { favorites.push(id); btn.classList.add("active"); btn.innerHTML = "❤️"; }
  localStorage.setItem("cocktail_favorites", JSON.stringify(favorites));
  updateFavCount();
}

function updateFavCount() { favCount.textContent = favorites.length; }

async function showFavorites() {
  if (!favorites.length) { results.innerHTML = ""; return showStatus("❤️ No tienes favoritos aún."); }

  setLoading(true);
  showStatus(`❤️ Cargando ${favorites.length} favorito(s)...`, "loading");
  results.innerHTML = "";

  const drinks = (await Promise.all(
    favorites.map((id) => fetchJSON(`${API}/lookup.php?i=${id}`).then((r) => r.drinks?.[0]).catch(() => null))
  )).filter(Boolean);

  setLoading(false);
  if (!drinks.length) return showStatus("😕 No pudimos cargar tus favoritos.", "error");
  showStatus(`❤️ <strong>${drinks.length}</strong> favorito(s)`, "success");
  renderCocktails(drinks);
}

// ═══════════════════════════════════════════════════════════════
// UTILIDADES
// ═══════════════════════════════════════════════════════════════

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

function showStatus(msg, type = "") {
  statusMsg.innerHTML = msg;
  statusMsg.className = "status-message" + (type ? ` ${type}` : "");
}

function setLoading(show) {
  skeletons.hidden = !show;
}