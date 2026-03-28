<<<<<<< HEAD
# 🚌 GuaguaTime RD

Aplicación web que permite calcular rutas de transporte en República Dominicana, mostrando tiempo y costo según condiciones como lluvia, hora pico y paro de transporte.

---

## 🚀 Cómo ejecutar el proyecto

1. Descargar o clonar el repositorio:

   ```
   git clone https://github.com/antonio849lebron-lab/Lebronrd090
   ```
   

## ⚙️ Funcionalidades

* Selección de origen y destino
* Cálculo de rutas
* Modo oscuro 🌙
* Favoritos ⭐
* Cambio de idioma (ES/EN) 🌍
* Modo ahorro ⚡

---

## 📐 Criterios de Cálculo

### Tiempo

El tiempo base es la suma de los minutos de cada tramo.

Por cada condición activa:
**tiempo = tiempo × (1 + tiempo_pct / 100)**
(redondeado al minuto)

---

### Costo

Es la suma del costo de cada tramo más el costo extra por condición activa.

---

### Ranking

Por defecto se ordena por tiempo total.
Se puede cambiar a costo o transbordos.

---

## 🚐 Tipos de transporte

* Guagua → transporte colectivo principal
* Concho → taxi colectivo
* Carro público → vehículo de ruta fija
* Motoconcho → transporte rápido
* A pie → sin costo

---

## 👨‍💻 Autor

José Antonio Lebrón Mora
=======
# GuaguaTime RD

Aplicación web para cálculo de rutas de transporte en República Dominicana.

## 🚀 Cómo ejecutar

- Clonar el repositorio
- Abrir con Live Server o usar GitHub Pages

⚠️ IMPORTANTE:
No funciona abriendo el archivo directamente (file://),
requiere servidor web.

## 📐 Criterios de cálculo

Tiempo:
Se calcula sumando los minutos de cada tramo.
Se incrementa según condiciones activas (lluvia, hora pico).

Costo:
Suma del costo base más recargos por condiciones.

Ranking:
Ordenado por tiempo total por defecto.

## 🌙 Funcionalidades

- Modo oscuro automático (prefers-color-scheme)
- Cambio de idioma (ES/EN)
- Modo ahorro ⚡
- Sistema de favoritos
>>>>>>> 4b496af2d3a93d1b2382b50aae1ba81efb6d1c04
