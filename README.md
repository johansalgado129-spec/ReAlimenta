# ReAlimenta

ReAlimenta es una aplicación web para explorar excedentes alimentarios de comercios cercanos, reservar productos y administrar publicaciones.

## Funciones

- Catálogo de alimentos con búsqueda, filtros por categoría y ordenamiento.
- Productos favoritos.
- Reserva de productos con actualización de existencias.
- Panel de reservas con opción de cancelación.
- Panel de comercios para publicar alimentos y actualizar inventario.
- Indicadores de productos, comercios y unidades disponibles.
- Diseño adaptable a computadores, tabletas y teléfonos.

## Cómo abrir el proyecto

No requiere instalar paquetes, compilar ni configurar un servidor.

1. Descarga o clona el repositorio.
2. Abre `index.html` en tu navegador.
3. Para editar el código, abre la carpeta en Visual Studio Code.

También se puede servir localmente con `python -m http.server 8000` y abrir `http://localhost:8000`.

## Publicación en GitHub Pages

1. Crea un repositorio público en GitHub, por ejemplo `realimenta-web`.
2. Sube `index.html`, `styles.css`, `app.js`, la carpeta `assets` y los demás archivos de esta carpeta a la raíz del repositorio.
3. En GitHub, abre **Settings → Pages**.
4. En **Build and deployment**, selecciona **Deploy from a branch**.
5. Selecciona la rama `main`, la carpeta `/ (root)` y guarda.
6. Cuando GitHub Pages termine la publicación, el enlace tendrá normalmente la estructura `https://USUARIO.github.io/realimenta-web/`.

## Funcionamiento y alcance

Las publicaciones iniciales son datos de ejemplo y no corresponden a ofertas verificadas de establecimientos reales. Las reservas y las cantidades se almacenan mediante `localStorage` en el navegador utilizado. No hay cuentas, servidor, inventario compartido entre dispositivos, cobros ni envío de reservas a comercios. Las reservas no constituyen pedidos reales y requieren una confirmación externa para un retiro efectivo.

Para un lanzamiento comercial se necesitarían autenticación, base de datos, conexión con establecimientos, verificación de disponibilidad, políticas de tratamiento de datos personales y controles de seguridad alimentaria.

## Estructura

```text
realimenta-web/
├── index.html
├── styles.css
├── app.js
├── assets/
│   └── favicon.svg
├── .gitignore
└── README.md
```

© 2026 ReAlimenta.
