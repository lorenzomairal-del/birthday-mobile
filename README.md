# Birthday Gifts

App para no olvidar cumpleaños y encontrar regalos, pensada para el móvil y protegida con usuario y contraseña.

## Qué hace

- **Cumpleaños**: lista ordenada por próximos o A-Z, buscador, cuenta atrás, edad que cumple, signo del zodiaco y foto.
- **Ideas de regalo**: recomendaciones, favoritos (❤️), wishlist (⭐), chat para pedir ideas con IA y enlaces de compra con UTM.
- **Connecting**: grupos de Familia, Amigos y Profesional con acceso directo a WhatsApp.
- **Mi perfil**: datos propios, ciudad con autocompletado, wishlist, invitar por WhatsApp, exportar/importar datos y cerrar sesión.

Los datos se guardan en el navegador de cada persona (separados por usuario). Para pasarlos a otro dispositivo, usa *Exportar* e *Importar* en Mi perfil.

## Desarrollo

```bash
npm install
npm run build
APP_USERS="loren:una-contraseña" npm start   # http://localhost:3000
```

Para trabajar con recarga en caliente: `APP_USERS=... npm run dev:server` en una terminal y `npm run dev` en otra (Vite redirige `/api` y `/login` al servidor).

## Variables de entorno

| Variable | Para qué |
| --- | --- |
| `APP_USERS` | Usuarios permitidos: `usuario1:contraseña1,usuario2:contraseña2` |
| `SESSION_SECRET` | Texto largo aleatorio para firmar la sesión (Render lo genera solo) |
| `ANTHROPIC_API_KEY` | Opcional. Activa las ideas de regalo con IA; sin ella se usan ideas predefinidas |

Para añadir o quitar a alguien, cambia `APP_USERS` en Render (Environment) y guarda: el servicio se reinicia solo.

## Despliegue en Render

1. En Render: **New → Blueprint**, elige este repositorio. Usa `render.yaml`.
2. Rellena `APP_USERS` (y `ANTHROPIC_API_KEY` si quieres IA).
3. Al terminar tendrás una URL tipo `https://birthday-gifts.onrender.com`.

En el plan gratuito el servicio se duerme tras 15 minutos sin uso; la primera visita después tarda unos 30-50 segundos en cargar.
