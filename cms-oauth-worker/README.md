# CMS-Login für GitHub Pages

GitHub Pages liefert nur statische Dateien aus – es gibt (anders als bei
Netlify) keinen eingebauten Login für Decap CMS. Dieser kleine
[Cloudflare Worker](https://workers.cloudflare.com/) übernimmt genau diese
eine Aufgabe: er wickelt den GitHub-OAuth-Handshake ab, damit sich die
Betreiberin/der Betreiber unter `/admin/` einloggen kann. Er hat sonst
keinerlei Zugriff auf den Website-Inhalt. Kostenlos im Cloudflare Free Tier.

## Einmalige Einrichtung

### 1. GitHub OAuth App erstellen

1. GitHub → Settings → Developer settings → OAuth Apps → "New OAuth App"
2. Homepage URL: `https://sihltalerhof.ch`
3. Authorization callback URL: `https://sihltalerhof-cms-auth.<dein-cloudflare-subdomain>.workers.dev/callback`
   (die genaue Worker-URL bekommst du nach Schritt 2 unten – App kann
   danach noch bearbeitet werden)
4. Client ID und Client Secret notieren

### 2. Worker deployen

```bash
cd cms-oauth-worker
npx wrangler login
npx wrangler deploy
```

Zeigt danach die Worker-URL an, z.B.
`https://sihltalerhof-cms-auth.<subdomain>.workers.dev`.

### 3. Secrets setzen

```bash
npx wrangler secret put GITHUB_CLIENT_ID
npx wrangler secret put GITHUB_CLIENT_SECRET
```

(Werte aus Schritt 1 einfügen, wenn danach gefragt wird.)

### 4. config.yml anpassen

In `public/admin/config.yml` bei `backend.base_url` die tatsächliche
Worker-URL aus Schritt 2 eintragen (ohne `/callback`), committen und
pushen.

### 5. Callback-URL in der OAuth App korrigieren

Falls in Schritt 1 nur ein Platzhalter eingetragen wurde: jetzt in der
GitHub OAuth App die echte Worker-URL + `/callback` nachtragen.

## Testen

`https://sihltalerhof.ch/admin/` öffnen → "Login with GitHub" → sollte ein
Popup öffnen, GitHub-Login abfragen und danach automatisch schliessen.
