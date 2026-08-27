# Sihltalerhof – neue Website

Statischer Nachbau von sihltalerhof.ch mit [Astro](https://astro.build) +
[Decap CMS](https://decapcms.org) statt WordPress. Ziel: minimale
laufende Kosten, kein Server/keine Datenbank, Textänderungen ohne
Programmierkenntnisse über eine Weboberfläche.

## Struktur

```
src/content/pages/      # die 4 Seiten (Home, über uns, Direktvermarktung, Hofladen) – Text
src/content/termine/    # Direktvermarktung: Liste kommender Freitags-Termine
src/content/notices/    # zeitlich begrenzte Hinweistexte (z.B. Adventsfenster)
src/components/ScheduledText.astro   # Baustein für Datums-gesteuerte Sichtbarkeit
src/layouts/Layout.astro             # Header/Nav/Footer + Sichtbarkeits-Skript
public/admin/            # Decap-CMS-Oberfläche (Route: /admin/)
public/images/site/      # von der alten Seite übernommene Bilder
```

## Wie die Datums-Sichtbarkeit funktioniert

Jeder "Hinweis" (`notices`) hat optionale Felder **Sichtbar ab** / **Sichtbar
bis**. Ein kleines JavaScript im Layout blendet den Text ein, wenn das
aktuelle Datum im Zeitraum liegt – ganz ohne Server oder geplanten Rebuild.
Die Direktvermarktungs-Termine funktionieren nach demselben Prinzip:
vergangene Freitage werden automatisch ausgeblendet, ist die Liste leer,
erscheint automatisch "Zur Zeit sind keine Termine bekannt."

Ohne JavaScript (Suchmaschinen-Crawler, seltene Edge Cases) bleiben
Hinweistexte standardmässig sichtbar ("fail open"), damit nie versehentlich
gültiger Inhalt verschwindet.

## Lokal entwickeln

```bash
npm install
npm run dev          # Seite: http://localhost:4321
```

Decap CMS lokal testen (zweites Terminal, kein Netlify-Account nötig):

```bash
npx decap-server
```

Dann `http://localhost:4321/admin/` öffnen.

## Inhalte bearbeiten (für den Betrieb, ohne Programmierkenntnisse)

Nach dem Deployment (siehe unten) ruft die Betreiberin/der Betreiber
`https://sihltalerhof.ch/admin/` auf, loggt sich ein und bearbeitet:

- **Seiteninhalte**: die Texte der 4 Seiten
- **Direktvermarktung – Termine**: nächste Freitags-Termine hinzufügen/löschen
- **Zeitlich begrenzte Hinweise**: z.B. "Adventsfenster ab 1.12." mit
  Start-/Enddatum – erscheint automatisch nur im gewählten Zeitraum

Jede Änderung wird als Git-Commit gespeichert (Versionsgeschichte, kein
Datenverlust möglich) und löst automatisch ein neues Deployment aus
(ca. 1 Minute bis live).

Die Datei `src/content/notices/beispiel-hinweis.md` ist ein Testeintrag zur
Demonstration – vor dem Live-Schalten löschen oder durch echten Inhalt
ersetzen.

## Deployment: GitHub Pages (Projekt-URL, ohne eigene Domain)

Die Seite ist aktuell auf die GitHub-Pages-Projekt-URL
`https://sihltalerhof.github.io/sihltalerhof/` konfiguriert (siehe
`base` in `astro.config.mjs`). Alle internen Links und Bildpfade laufen
über den Helper `src/lib/base.ts` (`withBase()`), der automatisch den
richtigen Pfadpräfix voranstellt – dadurch funktioniert die Seite korrekt
unter dem `/sihltalerhof/`-Unterpfad, inklusive CSS und Bildern.

Gebaut und veröffentlicht wird automatisch über GitHub Actions
(`.github/workflows/deploy.yml`, läuft bei jedem Push auf `main`).

### Einmalige Einrichtung

1. **Repo-Einstellungen**: GitHub → Settings → Pages → Source: "GitHub
   Actions" auswählen (statt "Deploy from a branch") – sonst schlägt der
   Deploy-Schritt mit `HttpError: Not Found` fehl.
2. **CMS-Login**: `cms-oauth-worker/README.md` durcharbeiten (GitHub OAuth
   App erstellen, Worker deployen, `base_url` in `public/admin/config.yml`
   auf die eigene Worker-URL setzen) – GitHub Pages hat anders als Netlify
   keinen eingebauten CMS-Login.
3. Repo ist öffentlich (Voraussetzung für kostenloses GitHub Pages) – das
   Client Secret aus Schritt 2 liegt nicht im Repo, sondern nur als Worker-
   Secret bei Cloudflare.

Laufende Kosten: 0 CHF/Monat.

### Später auf eigene Domain (z.B. sihltalerhof.ch) umstellen

1. `astro.config.mjs`: `base` entfernen, `site` auf `https://sihltalerhof.ch`
   setzen.
2. `public/CNAME` mit Inhalt `sihltalerhof.ch` anlegen.
3. Beim DNS-Anbieter der Domain A-Records auf die GitHub-Pages-IPs setzen
   (Details: [GitHub-Doku zu Custom Domains](https://docs.github.com/pages/configuring-a-custom-domain-for-your-github-pages-site)),
   danach in den Pages-Einstellungen "Enforce HTTPS" aktivieren.

Da alle Links über `withBase()` laufen, ist dafür keine weitere Code-
Änderung nötig – nur die zwei Config-Anpassungen oben.

### Alternative: Netlify

Wer den zusätzlichen Cloudflare-Worker vermeiden möchte: Netlify bringt mit
**Identity + Git Gateway** einen CMS-Login ohne eigenes OAuth-Setup mit –
dafür Hosting UND Login an einem Ort. In dem Fall `public/admin/config.yml`
wieder auf `backend: { name: git-gateway, branch: main }` zurückstellen,
den GitHub-Actions-Workflow deaktivieren/löschen und die Seite stattdessen
über Netlify aus dem Repo bauen lassen (Build command: `npm run build`,
Publish directory: `dist`).

## Build

```bash
npm run build     # erzeugt dist/ (rein statische Dateien)
npm run preview   # dist/ lokal wie im Live-Betrieb testen
```

