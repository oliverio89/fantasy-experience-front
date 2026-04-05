# Fantasy Experience — Guía de Diseño

> Documento de referencia para mantener coherencia visual en toda la aplicación.
> **No modificar el diseño existente sin actualizar este documento.**

---

## 1. Paleta de colores

### Colores principales

| Token | Hex / RGBA | Uso |
|---|---|---|
| `black` | `#0b0b0b` | Fondo principal de toda la app |
| `white` | `#ffffff` | Texto sobre fondos oscuros |
| `dark-gold` | `#cd9c20` | Acento principal — bordes, highlights, CTAs secundarios |
| `goldenrod` | `#f5cb5c` | Variante dorada más clara — iconos, estrellas, tags |
| `nude` / `oldlace-100` | `#f2ecdd` | Fondo cálido suave — tarjetas, formularios, secciones alternativas |
| `darkslategray` | `#333533` | Texto oscuro sobre fondos claros |

### Colores con opacidad

| Token | Valor | Uso |
|---|---|---|
| `oldlace-200` | `rgba(242, 236, 221, 0.15)` | Overlays sutiles sobre fondo negro |
| `oldlace-300` | `rgba(242, 236, 221, 0.25)` | Bordes y separadores suaves |
| `darkgoldenrod-100` | `#996900` | Dorado oscuro — variante hover de botones |
| `darkgoldenrod-200` | `rgba(153, 105, 0, 0.09)` | Fondos tintados muy sutiles |
| `gray-100` | `rgba(0, 0, 0, 0.1)` | Sombras ligeras |
| `gray-200` | `rgba(0, 0, 0, 0.25)` | Sombras medias, overlays |
| `lightgray-100` | `#d9d4c4` | Textos secundarios, placeholders |
| `lightgray-200` | `rgba(217, 212, 196, 0.25)` | Fondos desactivados, dividers |

### Color del loader / spinner

```css
border-left-color: #dab16a;  /* Gold cálido para animación de carga */
```

---

## 2. Tipografía

### Familias

| Token Tailwind | Fuente | Uso |
|---|---|---|
| `font-milonga` | `Milonga` (serif, Google Fonts) | Títulos, logo, elementos de marca |
| `font-titulo-2` | `Alegreya Sans` (sans-serif, Google Fonts) | Cuerpo de texto, subtítulos, UI general |

### Tamaños de fuente (sistema custom)

| Token | px | Uso orientativo |
|---|---|---|
| `text-101xl` | 120px | Hero gigante (ocasional) |
| `text-81xl` | 100px | Superheadline |
| `text-61xl` | 80px | Headline principal hero |
| `text-45xl` | 64px | Headline grande |
| `text-32xl` | 51px | Headline sección |
| `text-29xl` | 48px | H1 interior |
| `text-23xl` | 42px | H2 |
| `text-21xl` | 40px | H2 variante |
| `text-19xl` | 38px | H3 grande |
| `text-15xl` | 34px | H3 |
| `text-13xl` | 32px | H3 pequeño |
| `text-11xl` | 30px | H4 / subtítulo |
| `text-10xl` | 29px | — |
| `text-9xl` | 28px | H4 pequeño |
| `text-7xl` | 26px | — |
| `text-6xl` | 25px | — |
| `text-5xl` | 24px | Body grande / lead |
| `text-xl` | 20px | Body estándar grande |
| `text-lgi` | 19px | Body |
| `text-lg` | 18px | Body |
| `text-base` | 16px | Body pequeño / UI |
| `text-4xs` | 9px | Labels muy pequeños |

---

## 3. Bordes y redondeos

| Token | Valor | Uso |
|---|---|---|
| `rounded-31xl` | 50px | Botones pill, badges redondeados |
| `rounded-11xl` | 30px | Tarjetas, modales, contenedores |
| `rounded-12xs` | 1px | Bordes mínimos, divisores |

---

## 4. Breakpoints responsive

| Token | Condición | Uso |
|---|---|---|
| `lg` | max-width: 1200px | Layout general, columnas |
| `mq1050` | max-width: 1050px | Ajustes intermedios |
| `mq750` | max-width: 750px | Tablet / mobile landscape |
| `mq450` | max-width: 450px | Mobile portrait |

---

## 5. Componentes UI base

### Botón principal
- Fondo: `dark-gold` (#cd9c20)
- Texto: negro (`black`) o blanco según contraste
- Border-radius: `rounded-31xl` (50px)
- Hover: `darkgoldenrod-100` (#996900)
- Fuente: `font-titulo-2`

### Tarjeta (Card)
- Fondo: `oldlace-100` (#f2ecdd) sobre sección clara, o contenedor oscuro sobre `black`
- Border-radius: `rounded-11xl` (30px)
- Sin border, sombra sutil con `gray-200`

### Inputs / Formularios
- Fondo: muy oscuro o `oldlace-200`
- Borde: `dark-gold` al focus
- Texto: `white` o `darkslategray` según fondo
- Placeholder: `lightgray-100`
- Border-radius: moderado

### Modal
- Overlay: `rgba(0,0,0,0.7)`
- Contenido: fondo oscuro próximo a `black`, borde `oldlace-300`
- Título: `font-milonga`, color `goldenrod`

### Toast / Notificaciones
- Éxito: fondo verdoso oscuro, icono verde
- Error: fondo rojizo oscuro, icono rojo
- Info: fondo dorado oscuro, icono `goldenrod`
- Duración: 3 segundos, auto-dismiss

### Loader / Spinner
```css
.loader {
  border: 4px solid rgba(255,255,255,0.1);
  border-left-color: #dab16a;
  width: 36px; height: 36px;
  border-radius: 50%;
  animation: spin 1s ease-in-out infinite;
}
```

---

## 6. Estructura de layout

```
┌─────────────────────────────────────┐
│  Navbar (sticky, fondo negro)       │
├─────────────────────────────────────┤
│  [Banner construcción - temporal]   │
├─────────────────────────────────────┤
│                                     │
│  <Outlet> — contenido de página     │
│                                     │
├─────────────────────────────────────┤
│  Footer (fondo negro)               │
└─────────────────────────────────────┘
│  FeedbackWidget (sticky bottom-right)
```

### Navbar
- Fondo: negro (`black`)
- Logo: `font-milonga`, color `goldenrod` o `nude`
- Links: `font-titulo-2`, color `white`, hover `dark-gold`
- Sticky top, z-index alto
- Mobile: hamburger menu

### Footer
- Fondo: negro
- Texto: `lightgray-100` o `white`
- Links: hover `dark-gold`

---

## 7. Iconografía y assets

- Iconos vectoriales: SVGs en `/public/` y `/src/assets/`
- Estrellas de rating: `star-1.svg`, color `goldenrod`
- Imágenes de partidas: subidas a Supabase Storage (bucket `games-images`)
- Imágenes de perfil: almacenadas en Supabase
- Frame decorativo: `frame-5@3x.png` (elemento visual home)

---

## 8. Badges / Etiquetas

### Tipo de partida
| Tipo | Estilo orientativo |
|---|---|
| Online | Fondo azul oscuro / borde azul |
| Presencial | Fondo verde oscuro / borde verde |
| Digital | Fondo morado oscuro / borde morado |

### Tags de partida
- Fondo: `darkgoldenrod-200`
- Texto: `goldenrod`
- Border-radius: `rounded-31xl`
- Fuente: `font-titulo-2`, pequeña

---

## 9. Sistema de rating
- 5 estrellas
- Estrella llena: color `goldenrod` (#f5cb5c)
- Estrella vacía: color `lightgray-200`
- Fuente del número: `font-titulo-2`

---

## 10. Normas generales

1. **Fondo de toda la app es negro** (`#0b0b0b`). Nunca usar blanco puro como fondo de página.
2. **Dorado es el acento**, no el color principal. Usarlo con moderación para CTAs y destacados.
3. **Milonga solo para marca y títulos principales**. El cuerpo siempre en Alegreya Sans.
4. **Sin sombras agresivas** — las sombras son sutiles, con opacidades bajas.
5. **Consistencia en tarjetas** — todas las cards usan `rounded-11xl` (30px).
6. **Botones de acción principal** — siempre `rounded-31xl` (pill), fondo `dark-gold`.
7. **Responsive primero** — diseñar pensando en mobile (450px) y escalar hacia arriba.
8. **Skeleton loaders** — usar el componente `ui/Skeleton.tsx` durante estados de carga, nunca spinners en el lugar del contenido (el `.loader` global solo para cargas de página completa).
