const escape = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export function loginPage(error = '', username = '', cssHref = '') {
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#f2ede4">
<meta name="robots" content="noindex, nofollow">
<title>Birthday Gifts · Entrar</title>
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
${cssHref ? `<link rel="stylesheet" href="${escape(cssHref)}">` : ''}
<style>
  *{box-sizing:border-box}
  body{margin:0;min-height:100dvh;display:flex;flex-direction:column;justify-content:center;
    font-family:Inter,ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
    background:#f2ede4;color:#16130f;-webkit-font-smoothing:antialiased;
    padding:32px max(24px,env(safe-area-inset-left)) 32px max(24px,env(safe-area-inset-right))}
  body:before{content:'';position:fixed;right:-120px;top:-120px;width:360px;height:360px;border-radius:50%;
    display:none}
  form{width:100%;max-width:360px;margin:0 auto;position:relative}
  .eyebrow{font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#7a7266}
  h1{margin:10px 0 36px;font-family:Fraunces,ui-serif,Georgia,serif;font-weight:600;font-size:48px;line-height:1;letter-spacing:-.03em;border-bottom:1.5px solid #16130f;padding-bottom:14px}
  h1 em{color:#b6462a;font-weight:400}
  label{display:block;margin:0 0 8px}
  input{width:100%;font-size:16px;padding:14px 16px;border:1px solid #d9d2c5;border-radius:14px;margin-bottom:20px;
    background:#f8f5ef;color:#16130f}
  input:focus{outline:none;border-color:#16130f;background:#fff}
  button{width:100%;font-size:15px;font-weight:600;color:#f2ede4;border:0;border-radius:999px;padding:15px;margin-top:8px;
    background:#16130f;cursor:pointer}
  .err{border:1px solid rgba(182,70,42,.35);color:#b6462a;border-radius:12px;padding:10px 14px;font-size:14px;margin-bottom:20px}
</style>
</head>
<body>
  <form class="card" method="post" action="/login">
    <p class="eyebrow">Acceso privado</p>
    <h1>Cumple<em>años</em></h1>
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
