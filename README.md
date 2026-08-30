# Fantasy Experience

Marketplace web que conecta jugadores de rol con Másters. Los Másters publican partidas, los jugadores buscan y reservan plazas, y las sesiones completadas pueden recibir reseñas verificadas.

## Estado del MVP

Incluido actualmente:

- registro con roles `player` y `master`, confirmación de correo y recuperación de contraseña;
- catálogo de Másters y partidas con búsqueda, filtros, orden y paginación;
- creación y edición de partidas por Másters;
- reservas atómicas con límites de aforo y de reservas activas;
- cobros con Stripe Checkout, reserva temporal de plaza, webhook idempotente y devoluciones al cancelar una partida;
- ciclo `active` → `full` / `cancelled` / `completed`;
- panel de reservas del jugador y partidas del Máster;
- reseñas sólo para participantes de partidas completadas;
- notificaciones internas de reservas y cambios de estado;
- edición y eliminación autoservicio de cuenta con anonimización del historial compartido;
- RLS, permisos por columna y funciones seguras en PostgreSQL;
- páginas de privacidad, cookies, términos y aviso legal configurables.

Los cobros de esta versión entran en la cuenta Stripe de la plataforma. El reparto automático a Másters todavía no está incluido: para ello hay que definir fiscalidad, comisión y onboarding antes de incorporar Stripe Connect.

## Stack

- React 18, TypeScript, Vite y Tailwind CSS.
- Supabase Auth, PostgreSQL, Storage y Row Level Security.
- Vitest, Testing Library, ESLint, auditoría npm y Dependabot.
- Web3Forms para contacto y feedback.

## Arranque local

Requisitos: Node.js 20.19 o superior y npm.

```bash
npm ci
cp .env.example .env
npm start
```

En Windows, copia `.env.example` a `.env` con el Explorador o PowerShell antes de arrancar.

Variables necesarias:

- `VITE_PUBLIC_SUPABASE_URL`
- `VITE_ANON_KEY` — usa exclusivamente la clave pública/anon, nunca `service_role`.
- `VITE_WEB3FORMS_ACCESS_KEY`
- `VITE_LEGAL_OWNER`, `VITE_LEGAL_TAX_ID`, `VITE_LEGAL_ADDRESS`, `VITE_LEGAL_EMAIL`
- `VITE_SHOW_CONSTRUCTION_BANNER` (`true` o `false`)

## Base de datos

Las migraciones versionadas son la fuente de verdad:

1. `supabase/migrations/20260830180000_initial_schema.sql`
2. `supabase/migrations/20260830185000_legacy_schema_compatibility.sql`
3. `supabase/migrations/20260830190000_mvp_core_hardening.sql`
4. `supabase/migrations/20260830200000_stripe_payments_security.sql`
5. `supabase/migrations/20260830210000_master_ranking_digital_products.sql`

En un proyecto nuevo, enlaza Supabase CLI y ejecuta:

```bash
supabase link --project-ref TU_PROJECT_REF
supabase db push
```

### Activar Stripe

1. Copia `supabase/.env.example` a `supabase/.env.local` y completa las claves de prueba.
2. Sube los secretos y despliega las funciones:

```bash
supabase secrets set --env-file supabase/.env.local
supabase functions deploy create-checkout-session
supabase functions deploy payment-status
supabase functions deploy download-digital-product
supabase functions deploy cancel-game
supabase functions deploy stripe-webhook --no-verify-jwt
```

3. En Stripe Workbench crea un destino de eventos HTTPS hacia
   `https://TU_PROJECT_REF.supabase.co/functions/v1/stripe-webhook` para
   `checkout.session.completed`, `checkout.session.expired` y
   `charge.refunded`.
4. Copia su secreto `whsec_...` a `STRIPE_WEBHOOK_SECRET` y vuelve a ejecutar
   `supabase secrets set --env-file supabase/.env.local`.

Usa primero el modo test de Stripe. La plaza sólo se confirma desde el webhook;
la URL `/payment/success` consulta el resultado, pero nunca concede acceso por
sí misma.

Las funciones todavía no publicadas deben enlazar a `/en-desarrollo` (también
disponible como `/proximamente`). La página informa de que la funcionalidad no
está disponible, aclara que no puede generar reservas ni cobros y ofrece una
vuelta directa al inicio.

En una base que ya se creó manualmente con `DATABASE.md`, no ejecutes la migración inicial sin comparar primero el esquema; aplica el hardening en staging y valida los datos existentes. `DATABASE.md` queda como referencia explicativa, pero las migraciones mandan.

Tras desplegar el frontend, añade en Supabase Auth las URLs permitidas de producción:

- `https://tu-dominio/reset-password`
- `https://tu-dominio/email-confirmation`

El hosting debe resolver las rutas de la SPA contra `index.html`. En Nginx, el
bloque que sirve el frontend necesita `try_files $uri $uri/ /index.html;` para
que enlaces directos como `/detailsgame/:id` y `/user/:id` no devuelvan 404.

## Calidad

```bash
npm run typecheck
npm run lint
npm test
npm run test:coverage
npm audit --audit-level=high
npm run build
```

La CI ejecuta typecheck, lint, tests y build antes del despliegue.

## Seguridad y operación

- El cliente nunca puede asignarse `admin` ni modificar rating, estado o contador de plazas.
- Las reservas pasan por `join_game` / `leave_game` con bloqueo de fila.
- Las partidas con precio no pueden usar `join_game`: el importe se calcula en PostgreSQL, Checkout se crea en una Edge Function y el webhook firmado confirma la plaza.
- Las sesiones de pago caducan, cuentan temporalmente para el aforo y se limitan por usuario; los eventos y reembolsos usan claves de idempotencia.
- El contacto de una partida sólo se obtiene para el Máster, un participante o administración.
- Los perfiles de jugadores, los participantes y el historial cerrado no forman parte del catálogo público.
- La publicación y las reservas se serializan por usuario para respetar los límites incluso con peticiones concurrentes.
- La eliminación de cuenta limpia los archivos propios, retira datos personales y conserva anonimizado únicamente el historial que afecta a terceros.
- Una partida con reservas se cancela; no puede borrarse perdiendo historial.
- No publiques `.env`, credenciales de Supabase, claves privadas ni `service_role`.
- Incluye `deploy/nginx-security-headers.conf.example` en el bloque HTTPS de Nginx y revisa la CSP al cambiar el JSON-LD o proveedores externos.

Consulta [SECURITY.md](./SECURITY.md) para el checklist de despliegue y reporte de vulnerabilidades.

## Pendiente antes del lanzamiento comercial

- completar y revisar profesionalmente los datos/textos legales;
- definir comisión, impuestos, disputas, política de cancelación individual y Stripe Connect antes de pagar automáticamente a Másters;
- configurar correos transaccionales para cancelaciones y recordatorios;
- validar las migraciones en staging con datos representativos;
- revisar conjuntamente el contenido y acabado visual, que se ha dejado fuera de este bloque de trabajo.
