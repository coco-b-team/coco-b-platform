# Decisiones del proyecto

Registro de decisiones técnicas tomadas durante el sprint, con el motivo detrás de cada una. Sin claves ni valores reales — esos viven en `.env.local` de cada integrante, nunca en este repositorio.

## HubSpot (INFRA-04)

- **Portal ID**: `51822684` (cuenta `cocobisla@proton.me`, correo de equipo, no personal).
- **Plan**: gratuito. Límites revisados: formularios disponibles (con marca de agua de HubSpot y funciones limitadas frente al plan pago), 2,000 envíos de email por mes, 10 segmentos de CRM activos y 1,000 estáticos. No se encontró un tope explícito de cantidad de formularios ni de envíos de formulario por mes.
- **Conclusión**: el plan gratuito alcanza de sobra para lo que pide el proyecto (formularios de solicitud → HubSpot, sin automatización compleja ni envíos masivos de email). No hace falta el plan pago.
- **Usuarios invitados**: por ahora solo 2 personas del equipo tienen acceso al portal. Es intencional, no un pendiente: el plan gratuito de HubSpot solo permite 2 usuarios, así que invitar "a todo el equipo" no es viable sin pagar. Si el equipo crece o más personas necesitan acceso al panel, evaluar entonces si vale la pena el plan pago.

## Google Gemini (INFRA-08)

- **Convención de claves**: a diferencia de HubSpot (una cuenta única y compartida), cada integrante del equipo genera su **propia** clave gratuita de Gemini con su cuenta personal de Google, para desarrollo local. Motivo: la clave es gratis e inmediata de generar, evita tener que compartir credenciales personales, y si una persona prueba mucho en su máquina no le agota la cuota gratuita a los demás.
- **Modelo a usar**: `gemini-flash-latest` (alias que apunta siempre al modelo Flash más reciente disponible). Los modelos "Pro" dejaron de tener capa gratuita desde abril 2026, así que hay que quedarse con la familia "Flash". Nota técnica: nombres de modelo fijos como `gemini-2.0-flash` pueden quedar sin cuota gratuita con el tiempo (ya pasó); usar el alias evita tener que actualizar el código cada vez que sale un modelo nuevo.
- **Límites de referencia** (fuentes de terceros, verificar en la consola real antes de confiar del todo): ~10-15 peticiones por minuto, ~1,500 por día, ~250,000 a 1,000,000 tokens por minuto.
- **Pendiente, sin resolver a propósito**: qué le mostramos al usuario si se agota la cuota (error 429). Se decide cuando se diseñe el chatbot.
- **Clave para producción (Vercel)**: pendiente. Se intentó crear una cuenta de Google con el correo de equipo (`cocobisla@proton.me`) para que esta clave no dependa de una persona en particular, pero Google bloqueó la verificación por teléfono (número ya usado muchas veces para crear cuentas de Gmail). Reintentar más adelante, cuando se configure Vercel de verdad.

## Anti-spam en formularios (DISC-07)

Tres capas, todas ya decididas:

1. **Honeypot** (obligatorio): campo de formulario invisible para personas pero visible para bots — si llega con contenido, se descarta el envío.
2. **Validación en el servidor** (obligatorio): nunca confiar solo en la validación del navegador.
3. **Cloudflare Turnstile** (adoptado): capa extra gratuita, más robusta que el honeypot solo contra bots sofisticados, sin fricción para quien completa el formulario (a diferencia de un CAPTCHA tradicional). Cuenta y widget ya creados en Cloudflare (dominios configurados: `localhost` y `coco-b-platform.vercel.app`). Claves en `.env.local` (`NEXT_PUBLIC_TURNSTILE_SITE_KEY` y `TURNSTILE_SECRET_KEY`).

Implementación real (conectar estas piezas al formulario) queda para cuando se construya el formulario (FE-03, Semana 2) — por ahora las tres decisiones están tomadas y las claves de Turnstile ya existen.
