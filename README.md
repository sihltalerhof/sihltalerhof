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

## Deployment (empfohlen: Netlify, kostenlos)

Decap CMS braucht einen Login-Mechanismus. Am einfachsten ist **Netlify
Identity + Git Gateway** – beides im kostenlosen Tarif enthalten und ohne
eigenes OAuth-App-Setup nutzbar:

1. Repo auf GitHub erstellen und pushen.
2. Auf [netlify.com](https://netlify.com) einloggen → "Add new site" → Repo
   verbinden. Build command: `npm run build`, Publish directory: `dist`.
3. Im Netlify-Dashboard: **Site settings → Identity → Enable Identity**.
4. **Identity → Registration**: auf "Invite only" stellen (sonst kann sich
   jede/r registrieren).
5. **Identity → Services → Git Gateway**: aktivieren.
6. Unter **Identity** die Betreiberin/den Betreiber per E-Mail einladen.
7. Domain sihltalerhof.ch bei Netlify hinterlegen (DNS beim aktuellen
   Registrar auf Netlify umbiegen, Anleitung im Netlify-Dashboard).

Laufende Kosten: 0 CHF/Monat (Netlify Free Tier reicht für diese Seitengrösse
bei weitem), einzige Fixkosten bleiben wie bisher die Domain-Registrierung.

### Alternative: Cloudflare Pages

Technisch ebenfalls kostenlos und etwas grosszügiger im Bandbreiten-Limit,
erfordert für Decap CMS aber zusätzlich eine eigene GitHub-OAuth-App (oder
einen kleinen selbst gehosteten OAuth-Proxy), da Cloudflare kein
Äquivalent zu Netlify Identity/Git Gateway anbietet. Für den Aufwand lohnt
sich das hier nicht – Netlify ist für diesen Anwendungsfall die pragmatischere
Wahl.

## Build

```bash
npm run build     # erzeugt dist/ (rein statische Dateien)
npm run preview   # dist/ lokal wie im Live-Betrieb testen
```
