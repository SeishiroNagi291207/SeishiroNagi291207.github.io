# AGENTS.md — Memoria técnica del portafolio

> **Archivo temporal de contexto.** Sirve para continuar el trabajo desde otra computadora.
> Última actualización: **2026-11-19**
> Estado: sitio completo y funcional; faltan assets reales, tema claro y limpieza final.
> **Al terminar la entrega este archivo debe eliminarse** (ver tarea 4).

---

## 0. Contexto rápido

| Dato | Valor |
|---|---|
| Proyecto | Portafolio personal de Seishiro Nagi |
| Repositorio / sitio | `SeishiroNagi291207.github.io` → `https://seishironagi291207.github.io/` |
| Tipo | Sitio estático para GitHub Pages (rama principal, raíz del repo) |
| Stack | HTML5 + CSS3 + JavaScript vanilla. **Sin frameworks, sin build, sin npm** |
| Dependencia externa | Solo Google Fonts (Sora, Inter, JetBrains Mono). Si falla la red, hay fallbacks del sistema |
| Idioma del contenido | Español |
| Archivos de la entrega | `index.html`, `style.css`, `script.js`, `README.md` |
| Assets | `img/` (hoy solo `FP_PA.jpg`), `info.txt` (vacío) |
| Git | La carpeta `.git` existe, **pero el CLI `git` no está instalado** en la máquina donde se construyó. No se hicieron commits |

### Previsualizar

```powershell
# Recomendado (HTTPS local no, pero localhost sí habilita Clipboard API)
python -m http.server 8000
# abrir http://localhost:8000

# Alternativa directa
start index.html
```

> En `file://` el copiado de correo usa el fallback `execCommand` y, si el navegador lo bloquea,
> muestra un toast con el correo para copiarlo a mano. En GitHub Pages (HTTPS) usa Clipboard API.

---

## 1. Arquitectura actual

### 1.1 Mapa de archivos

```
/
├── index.html      ~72.8 KB  → toda la página + 6 portadas SVG inline
├── style.css       ~52.9 KB  → diseño completo, 17 bloques numerados + responsive
├── script.js       ~10.4 KB  → interacciones, IIFE en modo estricto
├── README.md       ~30 B     → mínimo, una sola línea (se reescribe al final)
├── info.txt        0 B       → VACÍO actualmente (leer antes de borrar)
├── img/
│   └── FP_PA.jpg   3.7 MB    → 5033 × 5647 px, selfie de espejo (retrato)
└── .git/                     → existe, sin commits desde esta máquina
```

### 1.2 `index.html`

Estructura, en orden:

1. `<head>`: charset, viewport, title, description, author, `theme-color`, Open Graph/Twitter,
   favicon SVG en data URI, preconnect + Google Fonts, `style.css`,
   script inline que cambia `no-js` → `js`, JSON-LD `Person`.
2. `<body>`:
   - `.skip-link` → `#contenido`
   - `.page-glow` (fondo ambiental fijo, `aria-hidden`)
   - `<header class="site-header" id="site-header">` con marca, `#site-nav` y `#nav-toggle`
   - `<main id="contenido">`
     - `section.hero#inicio`
     - `section.section#sobre-mi`
     - `section.section.section--skills#habilidades`
     - `section.section.section--projects#proyectos`
     - `section.section.section--contact#contacto`
   - `<footer class="site-footer">`
   - `#to-top` (botón flotante)
   - `#toast` (`role="status"`, `aria-live="polite"`)
   - `<script src="script.js" defer>`

**Convenciones internas del HTML**

- Cada `<section>` tiene `aria-labelledby` apuntando al `id` de su título.
- Los títulos de sección usan `.section-eyebrow` con numeración: `01`, `02`, `03`, `04`.
- Los enlaces externos usan `target="_blank" rel="noopener noreferrer"`.
- Los SVG decorativos llevan `aria-hidden="true"`; los que son contenido llevan `role="img"` +
  `aria-labelledby` con un `<title id="...">` único.
- Los IDs de gradientes SVG están **namespaced por proyecto** (`ryujin-bg`, `mech-...`, etc.).
  No reutilizar IDs entre SVG: rompe los degradados.

### 1.3 `style.css`

Bloques numerados (mantener el orden al añadir estilos):

| # | Bloque |
|---|---|
| 1 | Tokens (`:root`) |
| 2 | Reset + base + scrollbar |
| 3 | Utilidades (`.container`, `.section`, `.sr-only`, `.skip-link`, `.text-gradient`, `.page-glow`, `.status-dot`) |
| 4 | Botones (`.btn`, `-primary`, `-secondary`, `-ghost`, `-sm`, `-accent`) |
| 5 | Header / navbar / menú hamburguesa |
| 6 | Hero (copy, socials) |
| 7 | Tarjeta de perfil (`.profile-*`, `.orbit`, `.float-chip`) |
| 8 | Stats + marquee de tecnologías |
| 9 | Encabezados de sección |
| 10 | Keyframes de animación |
| 11 | Sobre mí (`.about-*`, `.approach-*`, `.panel`, `.timeline`, `.focus-list`) |
| 12 | Habilidades (`.skill-*`, `.tag`, `.skills-note`) |
| 13 | Proyectos (`.filter-*`, `.project-*`, `.tech-list`) |
| 14 | Contacto (`.contact-*`, `.copy-email`) |
| 15 | Footer |
| 16 | `#to-top` + `.toast` |
| 17 | Responsive + `prefers-reduced-motion` |

### 1.4 `script.js`

IIFE con `"use strict"`, helpers `$` / `$$`. Bloques en este orden:

1. **Año dinámico** → `#year` (hoy el HTML ya trae 2026 como fallback).
2. **Header + scroll spy + to-top**
   - `#site-header` recibe `.is-scrolled` con `scrollY > 12`.
   - `#to-top` recibe `.is-visible` con `scrollY > 620`.
   - Scroll spy sobre `main section[id]`; marca `.is-active` y `aria-current="location"` en
     `.nav-link`. Detecta fin de página para activar la última sección.
   - Scroll listener con `requestAnimationFrame` (passive).
3. **Menú móvil**
   - Estado en `.site-nav.is-open` + `body.nav-open`.
   - Actualiza `aria-expanded` y `aria-label` del botón.
   - Cierra con clic en enlace, `Escape`, clic fuera y al pasar a desktop (`max-width: 900px`).
4. **Scroll suave con offset**
   - Intercepta `a[href^="#"]`, calcula `top` con `--nav-h` + 8 px.
   - `history.replaceState` protegido con `try/catch` (file://).
   - Enfoca el destino con `tabindex="-1"` tras 420 ms (0 ms con reduced motion).
5. **Reveal animations**
   - Añade `reveal-ready` a `<html>` **solo si** hay `IntersectionObserver` y no hay
     `prefers-reduced-motion`. Así, si `script.js` falla, el contenido nunca queda oculto.
   - Stagger: asigna `--delay` (70 ms por hijo, máx. 280 ms) a hijos directos de
     `[data-reveal-group]`.
   - Observer: `threshold: 0.12`, `rootMargin: "0px 0px -48px 0px"`, `unobserve` tras revelar.
   - Fallback: añade `.is-visible` a todos.
6. **Filtros**: conteos automáticos, `aria-pressed`, `hidden`, animación Web Animations API,
   texto en `#filter-result`.
7. **Copiar correo + toast**: Clipboard API → fallback textarea/`execCommand`; toast 3.4 s;
   estado `.is-copied` 2.6 s; actualiza `aria-label`.

### 1.5 Hooks que NO se deben renombrar sin actualizar JS

| Hook | Tipo | Usado para |
|---|---|---|
| `#site-header` | id | estado scrolled |
| `#site-nav` | id | menú móvil |
| `#nav-toggle` | id | abrir/cerrar menú |
| `#to-top` | id | botón volver arriba |
| `#year` | id | año del footer |
| `#filter-result` | id | contador de resultados |
| `#copy-email` | id | botón copiar; `data-email` contiene el correo |
| `#toast`, `#toast-message` | id | notificación |
| `.nav-link` | clase | scroll spy |
| `.filter-btn` | clase | filtros; `data-filter="all\|videojuegos\|3d\|web"` |
| `.project-card` | clase | filtrado; `data-category` con el mismo vocabulario |
| `data-reveal` | atributo | animación de aparición |
| `data-reveal-group` | atributo | stagger de hijos directos |
| `#contenido`, `#inicio`, `#sobre-mi`, `#habilidades`, `#proyectos`, `#contacto` | ids | navegación y skip link |
| `--nav-h` | CSS var | offset de scroll y altura del menú |

---

## 2. Guía de estilo implementada

### 2.1 Paleta (tokens reales en `:root`)

| Token | Valor | Uso |
|---|---|---|
| `--bg` | `#07090f` | fondo base |
| `--bg-2` | `#0a0d15` | tarjetas / superficies sólidas |
| `--bg-3` | `#0d111b` | tercer nivel |
| `--surface` | `rgba(255,255,255,.032)` | vidrio sutil |
| `--surface-2` | `rgba(255,255,255,.06)` | hover de vidrio |
| `--border` | `rgba(255,255,255,.085)` | bordes base |
| `--border-strong` | `rgba(255,255,255,.16)` | bordes destacados |
| `--text` | `#f1f5fb` | texto principal |
| `--text-soft` | `#d6dfec` | texto secundario |
| `--muted` | `#98a5b8` | párrafos |
| `--muted-2` | `#748197` | metadatos / labels |
| `--accent` | `#5eead4` | teal principal |
| `--accent-2` | `#818cf8` | índigo |
| `--sky` | `#7dd3fc` | celeste |
| `--violet` | `#a78bfa` | violeta |
| `--gradient` | `linear-gradient(110deg, #5eead4 0%, #7dd3fc 42%, #a78bfa 100%)` | acentos, texto degradado, CTA |
| `--nav-h` | `74px` (70 en ≤900) | altura del header |
| `--container` | `1180px` | ancho máximo |
| Radios | `12 / 18 / 24 / 32 px` | `--radius-sm/md/lg/xl` |
| `--ease` | `cubic-bezier(.22,1,.36,1)` | todas las transiciones |
| `--shadow-card` | `0 22px 60px -30px rgba(0,0,0,.9)` | tarjetas |
| `--shadow-glow` | `0 14px 40px -16px rgba(94,234,212,.35)` | CTA |

> **Regla:** los colores nuevos deben entrar como token en `:root`. No introducir hex sueltos
> en componentes nuevos (los existentes todavía tienen rgba/hex locales; ver tarea 3).

### 2.2 Tipografías

| Fuente | Rol | Detalles |
|---|---|---|
| **Sora** | títulos y cifras | `--font-display`, pesos 400–800, `letter-spacing` negativo (-.02 a -.045em) |
| **Inter** | cuerpo e interfaz | `--font-body`, 16 px base, `line-height` 1.65 |
| **JetBrains Mono** | labels, eyebrows, metadatos, tags, código | `--font-mono`, 0.56–0.82 rem, `uppercase` + `letter-spacing` .06–.17em |

Escalas clave:
- Hero: `clamp(2.65rem, 5.6vw, 4.65rem)`, `line-height 1.07`.
- Título de sección: `clamp(2rem, 3.8vw, 3.05rem)`, `text-wrap: balance`.
- Título de contacto: `clamp(2.15rem, 4.3vw, 3.5rem)`.
- Botones: 0.92 rem, 600; `.btn-sm` 0.83 rem.
- Tags: 0.76 rem; metadatos mono: 0.58–0.68 rem.

### 2.3 Receta de glassmorphism

```css
background: linear-gradient(165deg, rgba(255,255,255,.045), rgba(255,255,255,.012));
border: 1px solid var(--border);
border-radius: var(--radius-lg);
box-shadow: var(--shadow-card);
backdrop-filter: blur(18px); /* solo donde hay contenido detrás */
```

- El fondo ambiental es `.page-glow`: tres radiales teal/índigo + rejilla de 88 px enmascarada.
- Los títulos con acento usan `.text-gradient` (background-clip: text).
- El brillo de hover se hace con `radial-gradient` en `::before`, no con imágenes.

### 2.4 Estructura visual de secciones

| Sección | Fondo / detalle | Grid principal |
|---|---|---|
| Hero | glows + órbitas + tarjeta de perfil rotada -2° | 2 columnas `1.04fr / .96fr` → 1 col ≤900 |
| Stats | barra de 3 celdas con separadores de 1 px | 3 → 1 col ≤560 (filas) |
| Marquee | `.tech-strip` con máscara lateral; pausa al hover | pista duplicada, animación 34 s |
| Sobre mí | `.about-grid` + panel sticky | `1.12fr / .88fr` → 1 col ≤1024 |
| Habilidades | 3 tarjetas con icono, tags y nota final | 3 → 2 (≤1024) → 1 (≤820) |
| Proyectos | filtros + grid de tarjetas 16:10 | 3 → 2 (≤1024) → 1 (≤700) |
| Contacto | tarjeta grande con radiales y rejilla | `1.15fr / .85fr` → 1 col ≤900 |
| Footer | 3 columnas | 3 → 2 (≤820) → 1 (≤560) |

### 2.5 Breakpoints

| Ancho | Cambios principales |
|---|---|
| `1080px` | ajustes de órbitas/chips y gap de about |
| `1024px` | about a 1 columna; skills 2 col; projects 2 col |
| `900px` | **cambio a menú móvil** y `--nav-h: 70px`; hero 1 col; contacto 1 col |
| `820px` | approach cards en fila icono+texto; skills 1 col; footer 2 col |
| `700px` | proyectos 1 col; gutters 36 px |
| `560px` | gutters 32 px; stats en filas; CTAs full width; tipografías reducidas |
| `380px` | correo a 0.62 rem para que quepa completo |
| `prefers-reduced-motion` | sin animaciones/transiciones; reveals visibles |

### 2.6 Reglas para no romper el diseño

1. **No cambiar el orden de las secciones** sin actualizar numeración (01–04) y scroll spy.
2. **No renombrar hooks** de la tabla 1.5.
3. Mantener **IDs únicos** en SVG y en el documento (hoy: 52 IDs, 22 gradientes únicos).
4. Los hijos directos de `[data-reveal-group]` deben conservar `data-reveal` para el stagger.
5. Las tarjetas de proyecto ocultas usan el atributo `hidden`; existe `.project-card[hidden]{display:none}`.
6. `--nav-h` debe seguir coincidiendo con `scroll-padding-top` y con `getNavHeight()`.
7. Las portadas SVG usan `viewBox="0 0 800 500"` + `preserveAspectRatio="xMidYMid slice"` + clase
   `.project-cover`; el contenedor fija `aspect-ratio: 16/10`.
8. No añadir elementos que provoquen scroll horizontal; el único desborde intencional es
   `.marquee` dentro de `.tech-strip` (`overflow: hidden`).
9. Respetar `prefers-reduced-motion` en cualquier animación nueva.
10. Todo texto nuevo, en español, con tildes correctas. Enlaces externos con `noopener noreferrer`.
11. El botón de copiar depende de `data-email`; si cambia el correo, actualizar texto visible,
    `mailto:`, `aria-label`, `data-email` y footer.
12. No usar `innerHTML` para contenido dinámico (hoy no se usa).

---

## 3. Estado actual

### 3.1 Funciona y está verificado

- ✅ Las 5 secciones renderizan y mantienen jerarquía/alineación en 320, 390, 768, 1024 y 1440 px.
- ✅ Header fijo con transición a glass al hacer scroll.
- ✅ Menú móvil (abre/cierra, `aria-expanded`, cierre por Escape/clic fuera, bloqueo de scroll).
- ✅ Scroll spy (probado: a `scrollY 1750` se activa “Sobre mí”; se detecta el final de página).
- ✅ Scroll suave con offset y foco accesible al destino.
- ✅ Filtros: `Todos 6`, `Videojuegos 2`, `3D 2`, `Web 2`; contador “N proyectos visibles”;
  restaurar “Todos” vuelve a 6.
- ✅ Copiar correo con fallback y toast (el fallback muestra mensaje si el portapapeles está bloqueado).
- ✅ Botón “volver arriba” aparece tras 620 px.
- ✅ Año dinámico (2026).
- ✅ Reveal animations con fallback sin JS (el contenido nunca queda invisible).
- ✅ `prefers-reduced-motion` respetado en CSS y JS.
- ✅ Validaciones: etiquetas HTML balanceadas; 0 IDs duplicados; 0 enlaces `#` rotos;
  0 `_blank` sin `noopener`; `aria-labelledby` resueltos; gradientes únicos; `node --check` OK;
  llaves CSS 413/413.

### 3.2 Limitaciones conocidas

- Las **6 portadas de proyectos son SVG ilustrativos** (no fotos reales). Se ven bien, pero son
  arte de ejemplo.
- El avatar del hero es un **monograma “SN”**, no una foto.
- Google Fonts requiere red; hay fallbacks (`Segoe UI`, `system-ui`, `Consolas`).
- Clipboard API solo en contexto seguro (HTTPS/localhost); en `file://` puede fallar y se muestra
  el toast con el correo.
- En Chrome headless de Windows la ventana mínima es ~500 px: para probar 320/390 se usó un
  iframe contenedor (ver §5). Además, las transiciones e `IntersectionObserver` no avanzan bien
  con `--virtual-time-budget`; no confundir con bugs reales.
- No se ha inicializado/commitado nada con Git desde esta máquina (no hay CLI de Git).

### 3.3 Placeholders de ejemplo (todo esto es ficticio o genérico)

| Dato | Valor actual | Dónde |
|---|---|---|
| Nombre | `Seishiro Nagi` | título, JSON-LD, aria-labels, footer, marca |
| Marca | `seishiro.dev` | header y footer |
| Correo | `seishiro.nagi.dev@gmail.com` | `#copy-email[data-email]`, `mailto:`, textos, aria-label, footer |
| GitHub | `https://github.com/SeishiroNagi291207` | hero socials, contacto, footer, repos de proyectos |
| LinkedIn | `https://www.linkedin.com/in/seishiro-nagi` | contacto, footer, JSON-LD (**placeholder**) |
| itch.io | `https://seishironagi.itch.io/...` | demos de los 2 juegos |
| ArtStation | `https://www.artstation.com/seishironagi` | demos de los 2 proyectos 3D |
| Ubicación | `México · Remoto` | contacto |
| Disponibilidad | “Disponible para prácticas y freelance”, respuesta 24–48 h | hero, perfil, contacto |
| Stats | `6+ proyectos`, `3 años`, `2 motores`; tarjeta: `6+ / 3 / ∞` | hero y perfil |
| Formación | Universidad Tecnológica (genérica), 2022–2026, diplomado 2024, Unity Certified 2023 | timeline de Sobre mí |
| Copy del hero/bio | redactado como ejemplo plausible | hero, about |
| JSON-LD URL | `https://seishironagi291207.github.io/` | head |

**Proyectos (todos de ejemplo):**

| # | Título | Categoría | Año | Tags | Demo | Repo |
|---|---|---|---|---|---|---|
| 01 | Nebula Drift | Videojuegos | 2025 | Unity, C#, Aseprite | itch.io/nebula-drift | github/…/nebula-drift |
| 02 | Kitsune no Yume | Videojuegos | 2024 | Unreal Engine 5, Blueprints, Blender | itch.io/kitsune-no-yume | github/…/kitsune-no-yume |
| 03 | Ryujin Temple | 3D | 2025 | Blender, Substance Painter, Marmoset | artstation | github/…/ryujin-temple |
| 04 | Mech Unit-07 | 3D | 2024 | Blender, ZBrush, Substance Painter | artstation | github/…/mech-unit-07 |
| 05 | Portfolio Engine | Web | 2026 | HTML5, CSS3, JavaScript | seishironagi291207.github.io | github/…/SeishiroNagi291207.github.io |
| 06 | PixelForge Dashboard | Web | 2025 | JavaScript, Chart.js, Vite | …/pixelforge-dashboard/ | github/…/pixelforge-dashboard |

**Assets reales disponibles hoy:**

- `info.txt`: **0 bytes (vacío)**. No hay contenido que leer todavía.
- `img/FP_PA.jpg`: **5033 × 5647 px, 3.7 MB**, selfie de espejo de cuerpo completo/medio.
  - Es demasiado pesada para la web. Optimizar antes de usarla.
  - Para el avatar circular (118 px, se ve a 104 px en móvil) conviene un recorte 1:1 de cabeza y hombros.
  - Para una sección “Sobre mí” con foto, un recorte 4:5 u 1:1 a ~1000 px es suficiente.

---

## 4. Tareas pendientes para la siguiente sesión

> Orden sugerido: **1 → 2 → 3 → 4**. Marcar cada casilla al completarla y anotar decisiones.

### ☐ Tarea 1 — Leer `info.txt` y vincular las imágenes reales de `img/`

1. Abrir `info.txt` y extraer nombre, rol, bio, formación, enlaces y datos reales.
   - **Si sigue vacío (0 bytes), preguntar al usuario antes de inventar contenido.**
2. Optimizar `img/FP_PA.jpg`:
   - Recorte 1:1 de cabeza/hombros para avatar → `img/perfil-600.jpg` (600×600, calidad ~82, < 150 KB).
   - Opcional: `img/perfil-1200.jpg` para una foto grande en “Sobre mí”.
   - Opcional: generar WebP y usar `<picture>` con fallback JPEG.
   - **No** usar el original de 3.7 MB en la página; no es necesario commitearlo.
3. Integrar la foto en la tarjeta del hero:
   - Sustituir el contenido de `.avatar` (monograma `<span>SN</span>`) por:
     ```html
     <img class="avatar-img" src="img/perfil-600.jpg"
          alt="Retrato de Seishiro Nagi" width="600" height="600">
     ```
   - CSS: `position:absolute; inset:0; width:100%; height:100%; object-fit:cover;
     border-radius:50%; z-index:1;` (mantener el anillo `.avatar-wrap::before` y `.avatar-status`).
   - Ajustar `object-position` para que la cara quede centrada (probar `center 22%`).
4. Si hay imágenes de proyectos en `img/`:
   - Colocarlas por ejemplo en `img/proyectos/` y reemplazar el `<svg class="project-cover">`
     por `<img class="project-cover" src="…" alt="…" width="800" height="500" loading="lazy">`.
   - Conservar `.project-media` (16:10) y el zoom del hover.
   - Eliminar los `<defs>`/gradientes SVG que queden sin uso para no cargar peso muerto.
5. Actualizar `alt` descriptivos y, si hay una imagen representativa, añadir `og:image` en `<head>`.
6. Verificar que no haya CLS (usar `width`/`height`) y que las imágenes carguen también en móvil.

**Criterio de aceptación:** la foto real se ve nítida y bien encuadrada en el avatar; ninguna
imagen pesa más de ~300 KB; todos los `alt` son descriptivos; el original de 3.7 MB no se usa.

### ☐ Tarea 2 — Reemplazar todos los placeholders

Checklist basada en §3.3:

- [ ] Nombre real y marca si aplica (buscar `Seishiro`, `seishiro`, `Nagi` en los 3 archivos + JSON-LD).
- [ ] Correo real en: `#copy-email[data-email]`, texto visible del botón, `aria-label`,
      enlaces `mailto:` (contacto y footer) y cualquier texto.
- [ ] LinkedIn real (`index.html`, contacto + footer + JSON-LD `sameAs`).
- [ ] GitHub/itch.io/ArtStation reales en hero, contacto, footer y botones de proyecto.
- [ ] Sustituir los 6 proyectos de ejemplo por proyectos reales: título, año, descripción,
      tags, categoría (`data-category`), enlaces demo/repo y portada.
      Actualizar también los contadores de los filtros (se recalculan solos) y `.filter-count` inicial
      si cambia el número total.
- [ ] Bio, enfoque, formación/timeline, stats (`6+`, `3`, `2`), disponibilidad, ubicación y
      “respuesta en 24–48 h”.
- [ ] Marquee de tecnologías: dejar solo herramientas que realmente use.
- [ ] JSON-LD: `name`, `jobTitle`, `description`, `url`, `sameAs` (y `email` si se decide añadirlo).
- [ ] `<title>`, `meta description`, Open Graph y `theme-color` acordes al resultado final.
- [ ] Añadir `og:image` y `og:url` si el sitio ya está publicado.

**Criterio de aceptación:** cero datos ficticios; todos los enlaces abren el destino correcto;
los filtros siguen cuadrando con las categorías reales.

### ☐ Tarea 3 — Botón funcional de modo oscuro / claro

La página hoy es **solo oscura**, con muchos rgba/hex locales. Enfoque recomendado:

1. **Refactor de tokens semánticos** en `:root` (sin cambiar el look oscuro):
   ```css
   :root {
     color-scheme: dark;
     --page: #07090f;
     --panel: rgba(255,255,255,.032);
     --panel-solid: #0a0d15;
     --glass: rgba(255,255,255,.045);
     --border: rgba(255,255,255,.085);
     --header-bg: rgba(7,9,15,.78);
     --grid-line: rgba(255,255,255,.022);
     --shadow-color: rgba(0,0,0,.9);
     --art-bg: #0b0e16;
   }
   html[data-theme="light"] {
     color-scheme: light;
     --page: #f5f7fb;
     --panel: rgba(15,23,42,.035);
     --panel-solid: #ffffff;
     --glass: rgba(255,255,255,.72);
     --border: rgba(15,23,42,.10);
     --header-bg: rgba(245,247,251,.82);
     --grid-line: rgba(15,23,42,.05);
     --shadow-color: rgba(15,23,42,.18);
     --text: #0b1220;
     --text-soft: #1e293b;
     --muted: #4b5563;
     --muted-2: #6b7280;
     /* mantener accent, accent-2, sky, violet y --gradient:
        funcionan en ambos temas; ajustar si el contraste no llega a AA */
   }
   ```
2. Sustituir los literales que hoy impiden el tema claro, al menos en:
   - `body`, `.page-glow` (glows + rejilla), `.site-header.is-scrolled`
   - `.profile-body`, `.profile-code`, `.window-dots`, `.float-chip`
   - `.panel`, `.skill-card`, `.project-card`, `.project-media` (`--art-bg`)
   - `.contact-card`, `.contact-link`, `.contact-link-icon`
   - `.site-footer`, `.to-top`, `.toast`, `::selection`, scrollbar
   - sombras (`--shadow-color`) y textos de botones.
   - **Nota:** las 6 portadas SVG son arte oscuro; se recomienda **mantenerlas igual** en ambos
     temas (funcionan como “piezas”) o crear variantes solo si el usuario lo pide.
3. **Antiflash (FOUC)**: añadir un script inline en `<head>`, antes de `style.css`, que lea
   `localStorage` y `prefers-color-scheme` y fije `document.documentElement.dataset.theme`
   inmediatamente.
4. **Markup del botón** (header, visible en desktop y móvil):
   ```html
   <button class="theme-toggle" id="theme-toggle" type="button"
           aria-label="Cambiar a modo claro" aria-pressed="false">
     <svg class="icon-moon" …>…</svg>
     <svg class="icon-sun" …>…</svg>
   </button>
   ```
   Colocarlo dentro de `.header-inner`, antes de `#nav-toggle`; en móvil no debe solaparse con la
   hamburguesa (revisar gaps y tamaño 44×44).
5. **JS**:
   - Alternar `data-theme` entre `dark` y `light`, guardar en `localStorage` (`theme`) y actualizar
     `aria-pressed`, `aria-label` y `<meta name="theme-color">`.
   - Si no hay preferencia guardada, seguir `prefers-color-scheme`; escuchar cambios del sistema
     solo en ese caso.
   - Respetar `prefers-reduced-motion` (sin transición de colores).
6. **QA**: contraste AA en ambos temas (texto normal ≥ 4.5:1), foco visible, glass legible,
   gradientes correctos, toast/to-top legibles, filtros y menú intactos, capturas a 320/390/768/1440
   en ambos temas, y persistencia tras recargar.

**Criterio de aceptación:** el botón cambia todo el sitio (no solo el fondo), no hay destello al
cargar, la preferencia persiste y ambos temas mantienen la estética y la accesibilidad.

### ☐ Tarea 4 — Limpieza final y README

1. Confirmar que **toda** la información de `info.txt` quedó integrada.
2. **Eliminar `info.txt`**.
3. **Eliminar `AGENTS.md`** (este archivo) — solo al final, cuando ya no se necesite el contexto.
4. Reescribir `README.md` para la entrega final, en español, con:
   - Título + descripción breve y URL del sitio.
   - Captura o nota visual (opcional, si se añade una imagen).
   - Secciones del portafolio y funcionalidades (filtros, copiar correo, tema claro/oscuro).
   - Stack y estructura de archivos.
   - Cómo ejecutar en local (`python -m http.server 8000`).
   - Cómo desplegar en GitHub Pages.
   - Datos de contacto y créditos.
   - Nota de que no hay build ni dependencias (solo Google Fonts).
5. Pasada final de QA:
   - [ ] Sin placeholders (`grep -i "placeholder\|ejemplo\|lorem"`).
   - [ ] Enlaces internos y externos correctos; `_blank` con `noopener`.
   - [ ] `node --check script.js`; llaves CSS balanceadas; IDs únicos.
   - [ ] Revisión visual en 320, 390, 768, 1024 y 1440 px, en ambos temas.
   - [ ] Menú móvil, filtros, copiar correo, toast, to-top y año.
   - [ ] `README.md` actualizado y archivos temporales eliminados.

**Criterio de aceptación:** repo limpio con `index.html`, `style.css`, `script.js`, `README.md`,
`img/` optimizada y `.git`; sin `info.txt` ni `AGENTS.md`; sitio listo para GitHub Pages.

---

## 5. Comandos y verificaciones útiles

```powershell
# Servidor local
python -m http.server 8000

# Sintaxis JS
node --check script.js

# Validaciones rápidas con Python
@'
from html.parser import HTMLParser
from collections import Counter
# ... parser de etiquetas/IDs (ver historial) ...
'@ | python -

# Captura desktop (Chrome headless)
& 'C:\Program Files\Google\Chrome\Application\chrome.exe' `
  --headless=new --disable-gpu --hide-scrollbars --force-prefers-reduced-motion `
  --run-all-compositor-stages-before-draw --virtual-time-budget=5000 `
  --window-size=1440,5900 --screenshot="$env:TEMP\desktop.png" `
  "file:///C:/Users/Alumno/Documents/GitHub/SeishiroNagi291207.github.io/index.html"
```

**Truco para móvil:** Chrome en Windows no baja de ~500 px de ancho de ventana. Para probar
320/390 px, crear un HTML temporal con un `<iframe>` del ancho deseado y abrirlo con
`--allow-file-access-from-files`; capturar la ventana y recortar el iframe.

---

## 6. Convenciones de trabajo

- Contenido y comentarios en **español**; nombres de clases/IDs en inglés (como está hoy).
- CSS: BEM ligero (`.bloque__elemento--modificador` no usado; se prefiere `.bloque-elemento`).
- No añadir frameworks, librerías ni pasos de build.
- No añadir imágenes externas por CDN; todo local salvo Google Fonts.
- Cualquier cambio visual debe comprobarse al menos en 390 px y 1440 px.
- Actualizar este archivo si cambia la arquitectura; eliminarlo antes de la entrega.
