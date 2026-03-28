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
