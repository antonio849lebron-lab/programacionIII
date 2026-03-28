let idiomaActual = "es";
let diccionario = {};

import { cargarDatos } from "./dataService.js";
import { initUI, refrescarIdiomaUI } from "./ui.js";

document.addEventListener("DOMContentLoaded", async () => {

  try {

    const data = await cargarDatos();

    // CARGAR DICCIONARIO
    try {
      const res = await fetch("./js/diccionario.json");
      diccionario = await res.json();
    } catch {
      diccionario = {};
    }

    //  INIT SOLO UNA VEZ
    initUI(data, diccionario, idiomaActual);

    aplicarIdioma();

    //  MODO AHORRO
    try {
      const config = await fetch("./config.json").then(r => r.json());

      if (config.modo_ahorro) {
        document.body.classList.add("modo-ahorro");
      }
    } catch {}

    const ahorroBtn = document.getElementById("ahorroBtn");

    if (ahorroBtn) {
      ahorroBtn.addEventListener("click", () => {
        document.body.classList.toggle("modo-ahorro");
      });
    }

    //  MODO OSCURO
    const btn = document.getElementById("modoBtn");

    if (btn) {
      document.body.classList.remove("dark-mode");
      btn.textContent = "🌙";

      btn.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");

        btn.textContent =
          document.body.classList.contains("dark-mode") ? "☀️" : "🌙";
      });
    }

    // BOTÓN IDIOMA
    const langBtn = document.getElementById("langBtn");

    if (langBtn) {
      langBtn.addEventListener("click", () => {

        idiomaActual = idiomaActual === "es" ? "en" : "es";

        langBtn.textContent = idiomaActual === "es" ? "EN" : "ES";

        aplicarIdioma();

        
        refrescarIdiomaUI(diccionario, idiomaActual);

        // 🔥 recalcular resultados
        const event = new Event("submit");
        document.getElementById("form").dispatchEvent(event);
      });
    }

    // BORDE PARO
    const cards = document.querySelectorAll('.card');

    cards.forEach(card => {
      card.addEventListener('click', () => {
        cards.forEach(c => c.classList.remove('paro-activa'));

        if (card.dataset.tipo === 'paro') {
          card.classList.add('paro-activa');
        }
      });
    });

    // FAVORITOS
    const favoritasContainer = document.getElementById("favoritas");
    const resultadosContainer = document.getElementById("resultados");

    function agregarFavorito(texto) {
      const div = document.createElement("div");
      div.className = "favorito-item";
      div.textContent = texto;

      const btnEliminar = document.createElement("button");
      btnEliminar.textContent = "❌";
      btnEliminar.style.marginLeft = "10px";

      btnEliminar.addEventListener("click", () => {
        div.remove();
      });

      div.appendChild(btnEliminar);
      favoritasContainer.appendChild(div);
    }

    if (resultadosContainer) {
      resultadosContainer.addEventListener("click", (e) => {
        if (e.target.classList.contains("resultado-item")) {
          agregarFavorito(e.target.textContent);
        }
      });
    }

    const btnLimpiar = document.createElement("button");
    btnLimpiar.textContent = "🗑 Limpiar Favoritos";
    btnLimpiar.style.margin = "10px 0";

    btnLimpiar.addEventListener("click", () => {
      favoritasContainer.innerHTML = "";
    });

    if (favoritasContainer) {
      favoritasContainer.parentNode.insertBefore(btnLimpiar, favoritasContainer);
    }

  } catch (error) {
    console.error("Error general:", error);
  }

});


// FUNCIÓN IDIOMA 
function aplicarIdioma() {
  if (!diccionario || !diccionario[idiomaActual]) return;

  const t = diccionario[idiomaActual];

  // HEADER
  const titulo = document.getElementById("titulo");
  if (titulo) titulo.textContent = t.titulo;

  const btnBuscar = document.getElementById("btnBuscar");
  if (btnBuscar) btnBuscar.textContent = t.buscar;

  const fav = document.getElementById("favTitulo");
  if (fav) fav.textContent = t.favoritas;

  // ALERTAS
  document.getElementById("txtLluvia").textContent = t.lluvia;
  document.getElementById("txtPico").textContent = t.pico;
  document.getElementById("txtParo").textContent = t.paro;

  // DESCRIPCIONES
  document.getElementById("descLluvia").textContent =
    idiomaActual === "es" ? "Aumenta el tiempo de viaje" : "Increases travel time";

  document.getElementById("descPico").textContent =
    idiomaActual === "es" ? "Mayor tráfico" : "More traffic";

  document.getElementById("descParo").textContent =
    idiomaActual === "es" ? "Sube el costo" : "Increases cost";

  // REGLAS 
  document.getElementById("tituloReglas").textContent = t.reglas_titulo;
  document.getElementById("regTiempo").textContent = t.tiempo;
  document.getElementById("regCosto").textContent = t.costo;
  document.getElementById("regRanking").textContent = t.ranking;
  document.getElementById("regTipos").textContent = t.tipos;

  
  const parrafos = document.querySelectorAll(".reglas p");

  if (parrafos.length >= 4) {
    parrafos[0].textContent = t.reglas_tiempo_desc1;
    parrafos[1].textContent = t.reglas_tiempo_desc2;
    parrafos[2].textContent = t.reglas_costo_desc;
    parrafos[3].textContent = t.reglas_ranking_desc;
  }
}