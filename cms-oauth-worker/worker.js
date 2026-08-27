// Minimaler OAuth-Proxy für Decap CMS auf GitHub Pages.
//
// GitHub Pages hat (anders als Netlify) keinen eingebauten Login-Mechanismus
// für Decap CMS. Dieser Worker übernimmt nur den OAuth-"Handshake" mit GitHub
// (Client Secret bleibt hier serverseitig geheim) und gibt das fertige Token
// per postMessage an das CMS-Fenster zurück. Er hat sonst keinen Zugriff auf
// den Repo-Inhalt.
//
// Deploy: siehe README.md in diesem Ordner.

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/auth') {
      const authorizeUrl = new URL('https://github.com/login/oauth/authorize');
      authorizeUrl.searchParams.set('client_id', env.GITHUB_CLIENT_ID);
      authorizeUrl.searchParams.set('scope', 'repo,user');
      authorizeUrl.searchParams.set('redirect_uri', `${url.origin}/callback`);
      return Response.redirect(authorizeUrl.toString(), 302);
    }

    if (url.pathname === '/callback') {
      const code = url.searchParams.get('code');
      if (!code) {
        return new Response('Fehlender "code"-Parameter.', { status: 400 });
      }

      const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          client_id: env.GITHUB_CLIENT_ID,
          client_secret: env.GITHUB_CLIENT_SECRET,
          code,
        }),
      });
      const tokenData = await tokenResponse.json();

      if (!tokenResponse.ok || tokenData.error) {
        return new Response(
          `OAuth-Fehler: ${tokenData.error_description || tokenData.error || tokenResponse.statusText}`,
          { status: 400 }
        );
      }

      const message = `authorization:github:success:${JSON.stringify({
        token: tokenData.access_token,
        provider: 'github',
      })}`;

      const html = `<!doctype html>
<html>
  <body>
    <script>
      (function () {
        function receiveMessage(e) {
          window.opener.postMessage(${JSON.stringify(message)}, e.origin);
          window.removeEventListener('message', receiveMessage, false);
        }
        window.addEventListener('message', receiveMessage, false);
        window.opener.postMessage('authorizing:github', '*');
      })();
    </script>
  </body>
</html>`;

      return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    }

    return new Response('Not found', { status: 404 });
  },
};
