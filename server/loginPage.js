const escape = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export function loginPage(error = '', username = '', cssHref = '') {
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#ffffff">
<meta name="robots" content="noindex, nofollow">
<title>Birthday Gifts · Entrar</title>
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
${cssHref ? `<link rel="stylesheet" href="${escape(cssHref)}">` : ''}
<style>
  *{box-sizing:border-box}
  body{margin:0;min-height:100dvh;display:flex;flex-direction:column;justify-content:center;
    font-family:Inter,ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
    background:#fff;color:#111;-webkit-font-smoothing:antialiased;
    padding:32px max(24px,env(safe-area-inset-left)) 32px max(24px,env(safe-area-inset-right))}
  form{width:100%;max-width:360px;margin:0 auto}
  .badge{width:64px;height:64px;border-radius:22px;background:#c8f560;display:flex;align-items:center;justify-content:center;font-size:30px;margin-bottom:22px}
  h1{margin:0;font-weight:700;font-size:32px;letter-spacing:-.035em}
  .sub{margin:4px 0 30px;color:#8e8e93;font-size:15px}
  label{display:block;font-size:13px;font-weight:500;color:#8e8e93;margin:0 0 6px}
  input{width:100%;font-size:16px;padding:14px 16px;border:1px solid transparent;border-radius:16px;margin-bottom:16px;background:#f6f6f7;color:#111}
  input:focus{outline:none;border-color:rgba(17,17,17,.2);background:#fff}
  button{width:100%;font-size:16px;font-weight:600;color:#fff;border:0;border-radius:999px;padding:15px;margin-top:8px;background:#111;cursor:pointer}
  .err{background:#fff0f0;color:#c62828;border-radius:14px;padding:10px 14px;font-size:14px;margin-bottom:16px}
</style>
</head>
<body>
  <form class="card" method="post" action="/login">
    <div class="badge">🎂</div>
    <h1>Cumpleaños</h1>
    <p class="sub">Acceso privado</p>
    ${error ? `<div class="err" role="alert">${escape(error)}</div>` : ''}
    <label for="u">Usuario</label>
    <input id="u" name="username" autocomplete="username" autocapitalize="none" autocorrect="off" required value="${escape(username)}" ${username ? '' : 'autofocus'}>
    <label for="p">Contraseña</label>
    <input id="p" name="password" type="password" autocomplete="current-password" required ${username ? 'autofocus' : ''}>
    <button type="submit">Entrar</button>
  </form>
</body>
</html>`;
}
