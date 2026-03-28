export async function cargarDatos() {
  const sectores = await fetch("data/sectores.json").then(r => r.json());
  const rutas = await fetch("data/rutas.json").then(r => r.json());

  return { sectores, rutas };
}