# MightyNetworks Video Download Bypass

Da Neo Emotional Release auf MightyNetworks gehostet ist, sind die Video-Inhalte stark geschützt (HLS-Streams, geschützte M3U8 Playlists). Versuche, die `.m3u8`-URLs oder `.ts`-Segmente direkt via `curl`, `yt-dlp` oder `fetch` (außerhalb der aktiven Browser-Session) herunterzuladen, resultieren in **403 Forbidden** Fehlern.

## Die Lösung: In-Browser Fetch via Playwright
Um die Videos automatisiert und im Hintergrund herunterzuladen, nutzen wir folgenden Workaround:

1. **Persistentes Playwright-Profil:** 
   Wir verwenden ein lokal gespeichertes Chromium-Profil (z. B. `neo_chrome_profile`), in das sich der User einmalig manuell einloggt. Dieses Profil speichert die Cookies und Tokens langfristig (MightyNetworks Magic Links halten sehr lange).
   
2. **Request Interception:**
   Ein Skript öffnet die Seite und fängt alle Netzwerk-Requests ab (`page.on('request')`). Sobald die Master-Playlist (`.m3u8`) gefunden wird, wird der URL gespeichert.
   
3. **In-Browser Fetch (`page.evaluate`)**:
   Statt die URL über Node.js oder das Playwright `APIRequestContext` (`context.request.get()`) herunterzuladen (was aus CORS/Token-Gründen fehlschlagen kann), injizieren wir die Downloads **direkt in die geladene Seite**. 
   ```javascript
   await page.evaluate(async (url) => {
     const res = await fetch(url);
     const buffer = await res.arrayBuffer();
     // Convert to base64 and return to Node
   }, segmentUrl);
   ```
   Da der Request *innerhalb* der aktiven DOM-Session der MightyNetworks-Plattform ausgeführt wird, fügt der Browser automatisch alle notwendigen Cookies, CORS-Header und Sicherheits-Tokens hinzu. 

4. **Segment-Assemblierung**:
   Node.js empfängt die Binärdaten als Base64-Strings, decodiert sie und hängt sie sequenziell an eine lokale `.ts` Datei an.

Diese Methode ist äußerst robust und erfordert keine komplexe Reverse-Engineering Arbeit von DRM-Mechanismen oder signierten Tokens, solange kein DRM via Widevine oder FairPlay (Encrypted Media Extensions) eingesetzt wird. MightyNetworks verwendet zum jetzigen Zeitpunkt standardisiertes HLS ohne DRM-Verschlüsselung (`#EXT-X-KEY`), lediglich Token-geschützte URLs.
