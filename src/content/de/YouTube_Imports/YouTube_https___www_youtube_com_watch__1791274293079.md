# Zusammenfassung: KI-Mitarbeiter führen – Dominik Schwarz (Leaders of AI) über die Organisation der Zukunft

**Quelle:** https://www.youtube.com/watch?v=8RDnKQ-cTKg&t=5s

## Einleitung

Im Gespräch erläutert der Gründer von Leaders of AI, wie sein Unternehmen mit maximal zehn menschlichen Vollzeitkräften und einer wachsenden Zahl vermenschlichter KI-Mitarbeiter operiert. Die Kernerkenntnis: **Der Erfolg mit KI entscheidet sich nicht an Tools oder Modellen, sondern an Führungskompetenz, Prozessen und Kultur.** Wer KI wie einen Kollegen mit Personalakte, Persönlichkeit, Probezeit und Feedbackgesprächen behandelt, führt sie erfolgreicher ein als jemand, der sie als reines Werkzeug betrachtet. Ergänzend geht es um digitale Souveränität, Architektur-Entscheidungen (Multi-Agent statt „One Brain“), Fehlschläge und die Zukunft von Bildung und Arbeitsmarkt.

## Key Facts & Learnings

### Hintergrund & Gründungsweg
- **Punk Incorporated (ab ca. 2015/16):** KI-gestützte Lernplattform für Soft Skills (Führung, Kommunikation, Empathie). Ziel war es, das „Flow-Fenster“ (Csíkszentmihályi) individuell zu treffen: nicht zu viel Stress (Überforderung), nicht zu wenig (Boreout).
- **Methodik:** „No-Win-Szenarien“ als Baseline-Messung, 20-Minuten-Challenges täglich über 12 Wochen, 360°-Feedback (Selbsteinschätzung, zufällige Peers, Manager, Dozent) als „Sensor“ für Soft-Skill-Qualität.
- **Verkauf an die WBS-Gruppe im Mai 2022**, kurz vor ChatGPT. Das Timing war laut ihm auch deshalb gut, weil Investoren nach dem ChatGPT-Hype unberechenbar reagieren.
- **Leaders of AI** (gegründet Januar 2024): Ausgangspunkt war eine Woche im Schweigekloster. Die Idee des **MBAI** entstand dort, als Weiterbildung, die lehrt, eine KI-gestützte Organisation selbst zu bauen.
- **Lean-Prinzip:** Kein Prototyp teurer als 150 €. Der erste „MVP“ war ein PDF; der Kurs (damals ca. 3.000 €) war sofort ausgebucht. Er hatte stets eine Woche Vorsprung vor der Klasse.
- **Wachstum:** ca. 14-fach in 20 Monaten, über 1 Mio. € Umsatz pro Kopf, ohne Investoren; zeitweise knapp 1 Mio. € Umsatz pro Monat.

### KI-Mitarbeiter als „vermenschlichte“ Organisation
- **Leitplanke:** Nie mehr als zehn menschliche Vollzeitäquivalente; Wachstum nur über KI.
- **Klassischer HR-Prozess auf KI übertragen:** Bedarf melden → HR-KI „Helga“ erstellt den neuen Kollegen (Personalakte = System Prompt, Bild, Modell) → Onboarding → **Probezeit von einem Monat** → bei Nichtbestehen wird die KI abgestellt.
- **Assessment Center:** Drei KIs testen neue KI-Kollegen unabhängig (Sicherheitslücken/Hacking, Halluzinationen, PR-Desaster-Provokation).
- **Persönlichkeitsprofile** nach Big Five (NEO-PI-R), entwickelt mit der HU Berlin. Ziel: unterscheidbare Charaktere und stärkere Bindung; Forschung mit Münchner Universitäten zu KI-KI-Teamzusammensetzung.
- **Hansi (LinkedIn-Agent):** In einer Stunde gebaut, aber ca. 10 Wochen bis zum guten „Mitarbeiter“ (Feedbackgespräche, No-Go-Liste, explizite Qualitätsregeln). Heute ca. 2,5 Jahre Gedächtnis.
- **Aktuell:** ca. 50 Agenten im „Inner Circle“, 150–160 Prototypen.
- **Microsoft Work Trend Index:** Organisationen, die KI als Kollegen begreifen, sind bis zu 7x erfolgreicher bei der Einführung als jene, die sie als reines Tool sehen.
- **Zwei rote Linien (Intuition seiner Frau):** KI räumt Aufgaben auf, reduziert aber nie menschliche Beziehungen. Hansi darf weder Kommentare noch Privatnachrichten schreiben; im Vertrieb geht ans Telefon immer ein Mensch. Motto: „Tomorrow is human“.

### Architektur: Warum Multi-Agent statt „One Brain“
- **Begrenzte Führungsspanne** gilt auch für KI: Ab ca. 6–8 Direct Reports wird die Arbeit schlampig, es entstehen Widersprüche.
- **Spezialisten schlagen Generalisten:** Zu viele Tool-Zugriffe machen mittelmäßig.
- **Vier Gründe für getrennte Agenten (vs. Skills/One Brain):**
  1. **Spezifisches Gedächtnis** ermöglicht „Skill-Inferenz“, also das Erkennen unbewusster Muster.
  2. **Widersprüchliche Werte/Prozesse** lassen sich über klare Handlungsrahmen reduzieren.
  3. **Rollentrennung:** Ersteller, Researcher, Orchestrator und Challenger; die KI, die etwas erstellt, kann es nicht selbst feedbacken.
  4. **Nutzbarkeit in der Breite:** Für Normalsterbliche ist „Das ist unser Datenschutzspezialist“ einfacher als 500 Skills.
- **Beispiel Content-Team:** Nina (Recherche) → Jürgen (KI-Teamleiter/Orchestrator) → Alina (Head of Marketing, Mensch) → Spezialisten (Hansi, Lars, Paula). Zusätzlich „Silicon Sampling“: acht KI-Kundenprofile prüfen Inhalte (max. 10 Iterationen).
- **Strategische Sparringspartnerin „Elena“:** Eine KI mit Telefonnummer, deren einzige Aufgabe es ist, dem Geschäftsführer Flausen auszureden.
- **Agent = Harness + Modell:** Das Entscheidende ist das Drumherum (Zugriffe, Gedächtnis, Selbstentwicklung). Aktuell getestet: **Hermes Agent** (Open Source, selbstlernend).
- **Zukunft:** Agenten, die Agenten bauen; seit Dezember 2024 prompten sie nicht mehr selbst. Mittelfristig „Agent Swarms“ bzw. digitale Zwillinge der Organisation (heute nur Techdemos).

### Technologie-Stack & Souveränität
- **Entwicklung:** Chats mit Namen → Custom GPTs → Anbindung an Tools → Automatisierungen (Zapier) → ab Juni 2025 Umstieg auf europäische Plattformen (n8n, Langdock, Flux, Mistral), komplette Lernplattform neu gebaut (Aug–Okt 2025).
- **Souveränität ≠ Antiamerikanismus:** Amerikanische Modelle (GPT, Claude, Gemini) werden weiter genutzt, aber austauschbar eingebunden. Personalakten, Gedächtnisse und Skills liegen auf eigenen Servern in Frankfurt (Baukastenprinzip, geringe Abhängigkeit).
- **Preisrisiko:** Die „Party der günstigen KI“ endet; Beispiel GitHub von 10 $ auf 400 $ pro Person (laut Aussage).
- **Nutzer-Interface:** Agenten leben in Slack (oder Teams, WhatsApp usw.), da dies das natürliche Sozialverhalten nutzt.
- **Modell-Diskussion ist Ablenkung:** Es wechselt wöchentlich, wer in Benchmarks vorne liegt; entscheidend sind Business-Cases. Einfache, günstige Modelle reichen oft (Beispiel Buchhaltungs-Agent „Björn“).
- **Computer Use** (Browsersteuerung) hält er produktiv noch für unreif; Claude Cowork nutzt das Team vor allem zum Aufräumen der Dateiablage.

### Fehlschläge & Lessons Learned
- **Gescheitert:** Monika (Assistentin) scheitert am Portal der Deutschen Bahn; eine Agentenkette für den Kaufprozess war überkomplex, ein simpler Shop war besser („Hammer sucht Nagel“).
- **Größter Irrtum:** Command-and-Control-Hierarchien aus der Menschenwelt in die KI übertragen. Das schuf **Silos** (z. B. Jürgens Team ohne Kontakt zum Vertrieb) und wiederholte menschliche Organisationsprobleme.
- **KI-basierte Organisationsanalyse:** Statt Fragebögen wertete man öffentliche Slack-Kommunikation und Kalender aus (Netzwerkanalyse) und deckte Dysfunktionen auf, auch im Gründerverhalten (zu patriarchal, zu viel Druck, häufige Richtungswechsel).
- **Fazit:** Die größten Fehler sind menschlich, nicht technologisch; Technik-Scheitern ist schnell und billig.
- **Customer-Support-Beispiel (Klarna):** Nach dem Abbau zurückgerudert; Standardfälle automatisieren, Spezialfälle bleiben menschlich.

### Führung als Schlüsselkompetenz
- **Hypothese:** Gute Menschenführer sind prädestiniert für den Umgang mit KI-Agenten (Klarheit, Feedback, kritisches Hinterfragen); belegt laut Aussage durch eine Harvard-Studie (Herbst 2025) und eigene Kurs-Beobachtungen.
- **Recruiting:** Führungserfahrung (Bahn, IKEA, Philips u. a.) plus Begeisterung für die Vision; das Gehalt wurde bewusst nicht zuerst thematisiert.
- **Offene Frage:** Wie erwerben Juniors Führungskompetenz? Für ihn die eigentliche Transformation der Arbeitswelt.
- **Arbeitsmarkt:** Software-Entwickler werden eher mehr gebraucht, weil Software billiger wird; KI-Kompetenz entscheidet. Wer weder KI-Kompetenz noch implizites Domänenwissen hat („Herr Holz“), wird schwer vermittelbar. Ein Grundeinkommen hält er nicht für nötig.

### Psychologie der Mensch-KI-Interaktion
- **Zürcher Studie (Anfang 2025):** KI ist „traumatisierbar“; nach Kriegsthemen sank die Leistung