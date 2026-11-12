# Invitación de boda

## Personalizar

Edita `js/config.js` y completa:

- `couple.first` y `couple.second`: nombres de quienes se casan.
- `date`: fecha y hora en formato ISO, por ejemplo `2027-06-19T17:00:00`.
- `venue`, `address` y `rsvpDeadline`: lugar, dirección y fecha límite para confirmar.
- `supabaseUrl` y `supabaseAnonKey`: URL del proyecto Supabase y su clave pública (`anon` o `publishable`).
- `schedule`: horas y momentos del día.
- `musicFile`, `coverImage`, `galleryUrl` y `galleryQrImage`: recursos de audio, portada y álbum de fotos.

El contenido de la sección «El menú» se puede personalizar directamente en `index.html`, buscando `id="menu"` y editando los platos y sus descripciones.

Coloca la canción en `audio/musica.mp3`. Si quieres una foto de portada, guárdala en `image/portada.jpg` y pon `"coverImage": "image/portada.jpg"` en la configuración. Al entrar, puedes elegir «Abrir con música» o «Abrir sin música». La canción se inicia al tocar la primera opción, lo que permite reproducirla en móviles que bloquean el audio automático. También se puede controlar con el botón de música.

El código QR de `image/fotos-qr.png` abre la dirección configurada en `galleryUrl`. La tarjeta enmarcada de la sección de fotos también es un enlace: se puede pulsar para abrir la carpeta, sin escanear el QR. Si cambias la dirección de la galería, genera un nuevo QR y reemplaza esa imagen; `galleryQrImage` indica su ruta. La imagen actual se generó con el servicio externo `api.qrserver.com`.

## Configurar la lista privada de invitados con Supabase

1. Crea un proyecto en Supabase.
2. En el editor SQL de ese proyecto, ejecuta el contenido de `supabase-setup.sql`. Activa Row Level Security y crea la tabla de confirmaciones y sus políticas: los invitados pueden enviar respuestas, pero solo las cuentas administradoras autorizadas pueden leerlas.
3. En Authentication, crea un usuario para la pareja con correo y contraseña. No habilites el registro público de usuarios.
4. Copia el UUID de esa cuenta desde la lista de usuarios. En el editor SQL, autoriza solo esa cuenta ejecutando `insert into public.wedding_admins (user_id) values ('UUID-DE-LA-CUENTA');`, sustituyendo el texto por el UUID real.
5. Copia la URL del proyecto y la clave pública (`anon` o `publishable`) en `supabaseUrl` y `supabaseAnonKey` de `js/config.js`. La clave pública está diseñada para usarse en la web; **nunca** pongas una `service_role` o una clave secreta en este archivo.
6. Publica la web por HTTPS. La pareja abre `admin.html` e inicia sesión con el correo y la contraseña de su usuario Supabase para consultar y actualizar la lista. La sesión se mantiene solo en memoria y hay que volver a iniciar sesión al recargar la página. Para probar la conexión a Supabase antes de publicar, sirve la carpeta desde `http://localhost` en lugar de abrir el archivo con `file://`.

El formulario guarda nombre, correo, asistencia, notas y fecha en Supabase. Los visitantes no pueden leer la tabla: las políticas de seguridad de la base de datos limitan la lectura a los usuarios añadidos a `wedding_admins`. Protege el proyecto con una contraseña fuerte y añade más administradores solo autorizando sus UUID de forma explícita.

La invitación principal (`index.html`) queda abierta para los invitados y permite enviar confirmaciones. La lista se encuentra separada en `admin.html` y exige iniciar sesión con una cuenta Supabase autorizada; la lista no está enlazada desde la invitación. Abre `index.html` en un navegador para previsualizarla. Las fuentes tipográficas y el código QR requieren conexión a internet.
