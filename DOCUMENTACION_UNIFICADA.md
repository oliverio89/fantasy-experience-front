# 📘 Documentación Unificada — Fantasy Experience Front

Última actualización: 25 Oct 2025 — Versión 1.1.0

---

## 1) Introducción
- **Objetivo**: Conectar Masters de rol con usuarios mediante tarjetas de partidas consistentes y preparadas para API.
- **Stack**: React + Vite (frontend), TypeScript, Tailwind. Backend previsto: Laravel/PHP (o equivalente), DB MySQL.

---

## 2) Empieza Rápido
1. Instala dependencias: `npm install`
2. Arranca el proyecto: `npm start`
3. Build opcional: `npm run build`

Ubicaciones clave ya funcionando:
- `src/components/UpcomingGamesCarousel.tsx` (6 partidas digitales)
- `src/components/NextGames.tsx` (4 próximas partidas)

---

## 3) Componente Principal: `PartidaCard`
- Unifica visualización de partidas (sustituye `CardDigital`).
- Accesible, responsivo y tipado.
- Navegación con doble click (no interfiere con arrastre del carrusel). Botón interno con click simple.

Tipos y props (resumen):
- `Partida`: { id, titulo, masterName, sistemaJuego, fecha?, descripcion?, imagenUrl, tipoPartida: "digital"|"presencial"|"online", rating: 0..5 }
- `PartidaCard` props: { partida, mostrarDescripcion?, onClick?, className? }

Límites visuales para uniformidad:
- `titulo` (≤60, 2 líneas), `masterName` (≤40, 1 línea), `sistemaJuego` (≤30, 1 línea), `fecha` (≤20, 1 línea), `descripcion` (≤150, 2 líneas). `rating` entero 0..5.

Archivos relacionados:
- `src/components/PartidaCard.tsx` (componente)
- `src/services/partidasService.ts` (servicio API)
- `src/hooks/usePartidas.ts` (hooks)
- `src/components/*.FUTURE_API.tsx` (ejemplos con API)

---

## 4) Uso en 3 pasos
1) Define tus datos `Partida` (hardcoded o API)
2) Renderiza: `<PartidaCard partida={miPartida} />`
3) Interacción: doble click abre detalles; botón interno navega con click simple

Personalización común:
- Mostrar descripción: `mostrarDescripcion`.
- Acción personalizada: `onClick`.
- Clases extra: `className`.

---

## 5) Integración con API (futuro)
- Hooks listos: `usePartidas`, `usePartidasDestacadas(limit)`, `useProximasPartidas(limit)`, `usePartida(id)`.
- Servicio: `PartidasService` con métodos CRUD y destacados/próximas.
- Flujo recomendado: configurar `REACT_APP_API_URL`, renombrar archivos `.FUTURE_API.tsx` a sus equivalentes sin sufijo.

Respuesta esperada (resumen):
- Listado: `data.partidas[]` con las propiedades de `Partida` + paginación.

---

## 6) Especificaciones Backend (resumen)
- Validaciones: respetar límites de longitud, `rating` entero 0..5, `tipoPartida` en {digital, presencial, online}.
- Imágenes: ratio 3:2, min 720x480, peso ≤500KB, URL válida.
- Endpoints públicos: GET listados/detalle/destacadas/próximas.
- Endpoints protegidos: creación/edición/eliminación.
Incluye tablas de validación sugeridas, esquemas (Joi/Mongoose/Sequelize) y casos de error recomendados.

---

## 7) Migración
- Ya actualizado: `UpcomingGamesCarousel.tsx`, `NextGames.tsx`.
- A migrar: páginas/lugares que aún usen `GameCard`/`CardDigital`.
- Obsoleto: `CardDigital.tsx`.
- Check de migración: importar `PartidaCard`, usar `key={partida.id}`, verificar imágenes y responsive.
Pasos de migración incluidos aquí con checklist y comparativas antes/después.

---

## 8) Unificación de Masters (resumen)
- Componente `UnifiedMasterCard.tsx` centraliza lógica y usa `CardMaster` internamente.
- `BestMasters.tsx` y `master-list.tsx` consumen el mismo modelo (`MASTERS_DATA`) y flujo.
- Beneficios: datos consistentes, mantenimiento simple, UX uniforme.
Resumen de la unificación incorporado en este documento.

Estrellas parciales (Masters):
- Soporta ratings con decimales (.5) mediante media estrella.
- Evitar redondeo del rating de entrada.
El sistema soporta medias estrellas para ratings .5 en tarjetas de Masters.

---

## 9) Cambios y mejoras
- v1.1.0: doble click para navegación; tarjetas de altura uniforme; truncamiento inteligente; especificaciones backend.
- Documentación reestructurada y ejemplos con API listos.
Para detalle de versiones, consulta `CHANGELOG.md`.

---

## 10) Índice rápido
- Inicio rápido: sección 2 de este documento.
- Uso del componente: secciones 3 y 4.
- API/Backend: sección 6.
- Migración: sección 7.
- Masters unificados: sección 8.
- Historial y mejoras: sección 9.

---

## 11) Preguntas frecuentes (FAQ)
- No se ven imágenes → Asegura archivo en `public/` y rutas iniciando con `/`.
- Duplicados → Verifica `id` único y `key={partida.id}`.
- Rating incorrecto → Usa entero 0..5 (Partidas) y .5 soportado en Masters.
- Arrastre vs click → Doble click para detalles, botón con click simple.

---

## 12) Créditos y contacto
Mantención: Equipo de Desarrollo. Contacto en `README.md`.


