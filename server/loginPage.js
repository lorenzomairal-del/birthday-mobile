const escape = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export function loginPage(error = '', username = '') {
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#7c3aed">
<meta name="robots" content="noindex, nofollow">
<title>Birthday Gifts · Entrar</title>
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<style>
  *{box-sizing:border-box}
  body{margin:0;min-height:100dvh;display:flex;align-items:center;justify-content:center;
    font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
    background:linear-gradient(160deg,#f5f3ff 0%,#fdf2f8 55%,#eff6ff 100%);color:#1f2937;
    padding:24px max(16px,env(safe-area-inset-left)) 24px max(16px,env(safe-area-inset-right))}
  .card{width:100%;max-width:380px;background:#fff;border-radius:28px;padding:32px 24px;
    box-shadow:0 20px 50px -20px rgba(124,58,237,.35)}
  .logo{width:64px;height:64px;margin:0 auto 16px;border-radius:20px;display:flex;align-items:center;justify-content:center;
    background:linear-gradient(135deg,#7c3aed,#db2777);font-size:32px}
  h1{margin:0;text-align:center;font-size:24px}
  p.sub{margin:6px 0 24px;text-align:center;color:#6b7280;font-size:15px}
  label{display:block;font-size:13px;font-weight:600;color:#4b5563;margin:0 0 6px}
  input{width:100%;font-size:16px;padding:14px 16px;border:1.5px solid #e5e7eb;border-radius:14px;margin-bottom:16px;background:#fafafa}
  input:focus{outline:none;border-color:#8b5cf6;background:#fff;box-shadow:0 0 0 4px rgba(139,92,246,.15)}
  button{width:100%;font-size:16px;font-weight:700;color:#fff;border:0;border-radius:14px;padding:15px;margin-top:4px;
    background:linear-gradient(90deg,#7c3aed,#db2777);cursor:pointer}
  .err{background:#fef2f2;color:#b91c1c;border-radius:12px;padding:10px 14px;font-size:14px;margin-bottom:16px}
</style>
</head>
<body>
  <form class="card" method="post" action="/login">
    <div class="logo">🎁</div>
    <h1>Birthday Gifts</h1>
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
