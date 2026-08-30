# Seguridad

## Reporte

No publiques vulnerabilidades en una issue pública. Envía el detalle, impacto, pasos de reproducción y versión afectada a `contacto@fantasyexperience.com`.

## Secretos

- El frontend sólo admite la URL de Supabase y la clave pública `anon`.
- `service_role`, contraseñas, claves SMTP y tokens administrativos nunca deben usar el prefijo `VITE_` ni formar parte del repositorio.
- `STRIPE_SECRET_KEY` y `STRIPE_WEBHOOK_SECRET` sólo viven en Supabase Edge Function Secrets. El frontend no necesita una clave Stripe.
- Web3Forms utiliza una clave pública limitada al formulario; configura restricciones de dominio y protección antispam en el proveedor.
- Rota cualquier credencial que haya sido expuesta y revisa el historial del repositorio.

## Checklist de despliegue

- Aplicar las migraciones primero en staging y después en producción.
- Confirmar que RLS está activo en todas las tablas públicas.
- Probar con perfiles anónimo, jugador, Máster y administrador.
- Verificar que un jugador no puede sobrepasar aforo ni límites mediante llamadas concurrentes.
- Probar que `join_game` rechaza partidas con precio y que sólo un evento Stripe firmado crea el participante.
- Repetir el mismo webhook y la misma petición de Checkout para comprobar que no duplican cobros ni plazas.
- Simular expiración, cancelación de partida, devolución fallida y un pago que llega después de cancelar.
- Verificar que `master_contact`, participantes ajenos y aceptación legal no son legibles públicamente.
- Verificar que la eliminación de cuenta anonimiza el historial compartido sin borrar reservas o reseñas de terceros.
- Configurar URLs de redirección exactas para registro y recuperación de contraseña.
- Configurar límites de tamaño y tipos MIME de los buckets.
- Completar las variables `VITE_LEGAL_*` antes de publicar.
- Activar copias de seguridad, logs y alertas en Supabase y el proveedor de hosting.
- Restringir `ALLOWED_ORIGINS`, rotar claves Stripe y alertar pedidos en `refund_pending`.
- Aplicar los encabezados de `deploy/nginx-security-headers.conf.example` y comprobarlos en producción.

## Límites de confianza

La interfaz mejora la experiencia, pero no es una frontera de seguridad. Roles, aforo, reservas, estados, reseñas, datos de contacto y eliminación de cuenta se validan en PostgreSQL mediante permisos, RLS y funciones `SECURITY DEFINER` con ejecución restringida.

Los datos de tarjeta se recogen en Stripe Checkout. El servidor sólo conserva
identificadores de Stripe, importe, moneda y estado. Una redirección de éxito no
demuestra un cobro: la confirmación procede exclusivamente del webhook cuya
firma se valida sobre el cuerpo HTTP sin modificar.
