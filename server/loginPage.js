const escape = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export function loginPage(error = '', username = '', cssHref = '') {
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#0a0a0b">
<meta name="robots" content="noindex, nofollow">
<title>Birthday Gifts · Entrar</title>
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
${cssHref ? `<link rel="stylesheet" href="${escape(cssHref)}">` : ''}
<style>
  *{box-sizing:border-box}
  body{margin:0;min-height:100dvh;display:flex;flex-direction:column;justify-content:center;
    font-family:Inter,ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
    background:#0a0a0b;color:#f2eee6;-webkit-font-smoothing:antialiased;
    padding:32px max(24px,env(safe-area-inset-left)) 32px max(24px,env(safe-area-inset-right))}
  body:before{content:'';position:fixed;right:-120px;top:-120px;width:360px;height:360px;border-radius:50%;
    background:radial-gradient(closest-side,rgba(217,194,156,.18),transparent);pointer-events:none}
  form{width:100%;max-width:360px;margin:0 auto;position:relative}
  .eyebrow{font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#8a867e}
  h1{margin:10px 0 36px;font-family:"Instrument Serif",ui-serif,Georgia,serif;font-weight:400;font-size:46px;line-height:1}
  h1 em{color:#d9c29c}
  label{display:block;margin:0 0 8px}
  input{width:100%;font-size:16px;padding:14px 16px;border:1px solid #262523;border-radius:14px;margin-bottom:20px;
    background:rgba(255,255,255,.03);color:#f2eee6}
  input:focus{outline:none;border-color:rgba(217,194,156,.5);background:rgba(255,255,255,.05)}
  button{width:100%;font-size:15px;font-weight:600;color:#0a0a0b;border:0;border-radius:14px;padding:15px;margin-top:8px;
    background:#f2eee6;cursor:pointer}
  .err{border:1px solid rgba(248,113,113,.35);color:#fca5a5;border-radius:12px;padding:10px 14px;font-size:14px;margin-bottom:20px}
</style>
</head>
<body>
  <form class="card" method="post" action="/login">
    <p class="eyebrow">Acceso privado</p>
    <h1>Birthday <em>Gifts</em></h1>
    ${error ? `<div class="err" role="alert">${escape(error)}</div>` : ''}
    <label class="eyebrow" for="u">Usuario</label>
    <input id="u" name="username" autocomplete="username" autocapitalize="none" autocorrect="off" required value="${escape(username)}" ${username ? '' : 'autofocus'}>
    <label class="eyebrow" for="p">Contraseña</label>
    <input id="p" name="password" type="password" autocomplete="current-password" required ${username ? 'autofocus' : ''}>
    <button type="submit">Entrar</button>
  </form>
</body>
</html>`;
}
