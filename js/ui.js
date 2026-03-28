let t = {};

let condiciones = {
  lluvia: false,
  pico: false,
  paro: false
};

let rutasGlobal = [];

export function initUI({ sectores, rutas }, diccionario, idiomaActual) {

  
  t = diccionario && diccionario[idiomaActual] ? diccionario[idiomaActual] : {};

  rutasGlobal = rutas;

  const origen = document.getElementById("origen");
  const destino = document.getElementById("destino");

  
  origen.innerHTML = "";
  destino.innerHTML = "";

  sectores.forEach(s => {
    origen.innerHTML += `<option value="${s.id}">${s.nombre}</option>`;
    destino.innerHTML += `<option value="${s.id}">${s.nombre}</option>`;
  });

  document.querySelectorAll(".card").forEach(card => {
    card.addEventListener("click", () => {

      const tipo = card.dataset.tipo;

      condiciones[tipo] = !condiciones[tipo];

      card.classList.toggle("activa");

      const estadoTexto = card.querySelector(".estado");

      estadoTexto.textContent = condiciones[tipo]
        ? (t.activa || "Activa")
        : (t.inactiva || "Inactiva");

    });
  });

  // FORM
  document.getElementById("form").addEventListener("submit", e => {
    e.preventDefault();
    calcular();
  });

  mostrarFavoritas();
}

// MAPA 
document.querySelectorAll("circle").forEach((c, index) => {
  const sectores = ["1", "2", "3"];

  c.addEventListener("click", () => {
    document.getElementById("origen").value = sectores[index];
  });
});

// BUSCAR
function calcular() {
  const o = parseInt(document.getElementById("origen").value);
  const d = parseInt(document.getElementById("destino").value);

  let res = rutasGlobal.filter(r => r.origen === o && r.destino === d);

  res = res.map(r => {
    let tiempo = r.tiempo;
    let costo = r.costo;

    let porcentaje = 0;

    if (condiciones.lluvia) porcentaje += 20;
    if (condiciones.pico) porcentaje += 30;

    tiempo = Math.round(tiempo * (1 + porcentaje / 100));

    if (condiciones.paro) costo += 20;

    return { ...r, tiempo, costo };
  });

  res.sort((a, b) => a.tiempo - b.tiempo);

  mostrar(res);
}

// MOSTRAR
function mostrar(rutas) {
  const cont = document.getElementById("resultados");
  cont.innerHTML = "";

  if (rutas.length === 0) {
    cont.innerHTML = t.no_rutas || "No hay rutas";
    return;
  }

  rutas.forEach(r => {
    cont.innerHTML += `
      <div class="ruta">
        ${r.tipo} <br>
        ${t.tiempo || "Tiempo"}: ${r.tiempo} min <br>
        RD$${r.costo} <br>
        <button onclick='guardar(${JSON.stringify(r)})'>
          ${t.guardar || "Guardar"}
        </button>
      </div>
    `;
  });
}

// FAVORITOS
window.guardar = function(ruta) {
  let favs = JSON.parse(localStorage.getItem("fav")) || [];
  favs.push(ruta);
  localStorage.setItem("fav", JSON.stringify(favs));
  mostrarFavoritas();
};

function mostrarFavoritas() {
  const cont = document.getElementById("favoritas");
  const favs = JSON.parse(localStorage.getItem("fav")) || [];

  cont.innerHTML = "";

  if (favs.length === 0) {
    cont.innerHTML = t.no_favoritas || "No tienes favoritas";
    return;
  }

  favs.forEach((f, i) => {
    cont.innerHTML += `
      <div class="ruta">
        ${f.tipo} - RD$${f.costo}
        <br>
        <button onclick="eliminar(${i})">
          ${t.eliminar || "Eliminar"}
        </button>
      </div>
    `;
  });

  cont.innerHTML += `
    <br>
    <button onclick="limpiarFav()">
      🗑 ${t.limpiar || "Limpiar todas"}
    </button>
  `;
}


window.ordenarTiempo = function() {
  calcular();
};


window.eliminar = function(index) {
  let favs = JSON.parse(localStorage.getItem("fav")) || [];
  favs.splice(index, 1);
  localStorage.setItem("fav", JSON.stringify(favs));
  mostrarFavoritas();
};


window.limpiarFav = function() {
  localStorage.removeItem("fav");
  mostrarFavoritas();
};

export function refrescarIdiomaUI(diccionario, idiomaActual) {
  const t = diccionario[idiomaActual];

  document.querySelectorAll(".card").forEach(card => {
    const estado = card.querySelector(".estado");

    if (estado.textContent === "Activa" || estado.textContent === "Active") {
      estado.textContent = t.activa;
    } else {
      estado.textContent = t.inactiva;
    }
  });

  mostrarFavoritas();
}