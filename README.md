# Invitación de boda

## Personalizar

Edita `js/config.js` y completa:

- `couple.first` y `couple.second`: nombres de quienes se casan.
- `date`: fecha y hora en formato ISO, por ejemplo `2027-06-19T17:00:00`.
- `venue`, `address` y `rsvpDeadline`: lugar, dirección y fecha límite para confirmar.
- `whatsappNumber`: número que recibirá las confirmaciones, con prefijo internacional y solo dígitos (por ejemplo, `34600123456`).
- `schedule`: horas y momentos del día.
- `musicFile`, `coverImage`, `galleryUrl` y `galleryQrImage`: recursos de audio, portada y álbum de fotos.

Coloca la canción en `audio/musica.mp3`. Si quieres una foto de portada, guárdala en `image/portada.jpg` y pon `"coverImage": "image/portada.jpg"` en la configuración. La página intenta reproducir la música automáticamente al abrirse y al pulsar «Abrir invitación» o «Saltar animación». Algunos navegadores móviles bloquean el audio automático; en ese caso, la primera pulsación inicia la canción. También se puede controlar con el botón de música.

El código QR de `image/fotos-qr.png` abre la dirección configurada en `galleryUrl`. La tarjeta enmarcada de la sección de fotos también es un enlace: se puede pulsar para abrir la carpeta, sin escanear el QR. Si cambias la dirección de la galería, genera un nuevo QR y reemplaza esa imagen; `galleryQrImage` indica su ruta. La imagen actual se generó con el servicio externo `api.qrserver.com`.

## Confirmaciones por WhatsApp

El formulario abre WhatsApp con un mensaje preparado con el nombre, la asistencia, la necesidad de autobús y las notas del invitado. La persona debe revisar el mensaje y pulsar «Enviar» en WhatsApp para completar la confirmación. La página no almacena esos datos ni usa un panel de administración.

El número de destino de `whatsappNumber` queda visible en el código público de la web; configura uno destinado a recibir estas confirmaciones.

## Lista local de invitados

Abre `invitados.html` para anotar manualmente las respuestas recibidas por WhatsApp. La lista se guarda en el almacenamiento local del navegador: no se comparte entre dispositivos, no se sincroniza con las respuestas de la invitación y no se suben los registros a GitHub. Usa «Descargar CSV» para guardar una copia de seguridad.

Abre `index.html` en un navegador para previsualizar la invitación. Las fuentes tipográficas y el código QR requieren conexión a internet.
