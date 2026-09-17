import type { Dict } from "./en";

/**
 * German, in the receiving vocabulary a German parts depot actually uses:
 * Lieferschein for the delivery note, Gutschrift for the supplier credit,
 * Fehlmenge for a shortage, Rechnungsprüfung for the person who gets the
 * invoice weeks later. Belege carries both meanings the case needs - the
 * records themselves, and the evidence they provide.
 *
 * Address is "du", not "Sie". The assigned client writes that way to its own
 * customers, and this is a tool for colleagues on the same shift, not a letter
 * to a supplier. Where German can avoid a gendered role noun it does: the
 * reviewer field is "Geprüft von" and the role is "Leitung Warenannahme".
 *
 * Typed as Dict, so this file cannot fall behind en.ts without failing the
 * typecheck.
 */
export const de: Dict = {
  dir: "ltr",
  bcp47: "de-DE",
  name: "Deutsch",
  short: "DE",

  chrome: {
    metaTitle: "Wareneingang — C04",
    metaDescription:
      "Was bei der Annahme zu erfassen ist, damit die nächste Person die Abweichung klären kann.",
    banner:
      "Synthetische Übungsdaten · Wareneingang im Trast-Stil · kein echter Lieferant",
    bannerModified: "Zahlen in den Einstellungen geändert",
    brand: "Wareneingang",
    flow: "Annahmeprozess",
    briefing: "Briefing",
    settings: "Einstellungen",
    steps: {
      receive: "Wareneingang",
      evidence: "Belege",
      review: "Prüfung",
    },
    toLight: "Zum hellen Design wechseln",
    toDark: "Zum dunklen Design wechseln",
    language: "Sprache",
    languageHint: "Sprache wechseln",
  },

  cause: {
    shortage: "Fehlmenge",
    damage: "Beschädigung",
    duplicate_scan: "Doppelerfassung",
    second_delivery: "Zweite Lieferung",
    unknown: "Unbekannt",
  },

  confidence: {
    likely: "Wahrscheinlich — ein Beleg erklärt sie genau",
    possible: "Möglich — passt, ist aber nicht die einzige Lesart",
    uncertain: "Unklar — die Belege lassen keine Reihenfolge der Ursachen zu",
  },

  ui: {
    simulated: "Simuliert",
    evidence: "Belege:",
  },

  receive: {
    title: "Wareneingang — Rampe 1",
    intro:
      "Erfasse zu jedem Lieferschein, was physisch angekommen ist. Gezählte Menge, Beschädigung und das, was tatsächlich in den Bestand geht, sind drei getrennte Zahlen — sie hier auseinanderzuhalten ist genau das, was später die Klärung der Rechnung möglich macht.",
    waiting: (n: number) => `${n} Lieferschein${n > 1 ? "e" : ""} offen`,
    emptyTitle: "Nichts an der Rampe",
    emptyNoNotes: "Zu dieser Bestellung liegt noch kein Lieferschein vor.",
    emptyAllCounted: (n: number, orderId: string) =>
      `Alle ${n} Lieferscheine zu ${orderId} sind gezählt. Die Belege sind verknüpft und liegen bereit für alle, die später die Rechnung bearbeiten.`,
    toEvidence: "Verknüpfte Belege ansehen →",
    recorded: "In dieser Schicht erfasst",
    against: "zu",
    counted: "gezählt",
    damaged: "beschädigt",
    accepted: "angenommen",
    invoiceGap: (invoiceId: string, gap: number) => ({
      lead: `${invoiceId} ist eingetroffen und passt nicht zu dem, was angenommen wurde. Eine Abweichung von`,
      value: String(gap),
      tail: "wartet auf eine Entscheidung.",
    }),
    toReview: "Abweichung prüfen →",
    legendTag: "So liest du das",
    legend:
      "Korallrot markiert alles Eingespielte oder Simulierte. Nichts in diesem Prototyp kontaktiert einen Lieferanten oder bucht auf den Bestand.",
  },

  form: {
    noteFor: (part: string, orderId: string) => `${part} · zu ${orderId}`,
    noteLists: "Lieferschein weist aus",
    countedIn: "Gezählt",
    countedInHint: "Was du physisch von der Palette gezählt hast",
    damagedLabel: "Beschädigt",
    damagedHint: "Angekommen, aber nicht verwendbar",
    // Same word as on the evidence screen and in the settings preview, so the
    // three quantities read as the same three everywhere. The column is a
    // third of the form - "In den Bestand übernommen" wrapped to two lines and
    // left the other two labels looking unrelated.
    acceptedLabel: "Angenommen",
    acceptedHint:
      "Abgeleitet: gezählt − beschädigt. Geht in den Bestand, getrennt von beiden gespeichert.",
    shortWarning: (short: number, noteId: string) =>
      `${short} weniger, als ${noteId} ausweist. Das wird als Fehlmenge zum Lieferschein erfasst, nicht ausgebucht.`,
    invalid: "Beschädigt darf die gezählte Menge nicht übersteigen.",
    submit: "Wareneingang erfassen",
    submitting: "Wird erfasst…",
    footnote:
      "Erfasst den Wareneingang. Es wird nichts auf den Bestand oder in die Buchhaltung gebucht.",
  },

  evidence: {
    emptyTitle: "Noch keine Belege",
    emptyBody: (n: number) =>
      `${n} Lieferschein${n === 1 ? " liegt" : "e liegen"} an der Rampe, aber nichts ist gezählt. Die Kette beginnt mit dem Wareneingang.`,
    toBay: "Zur Rampe →",
    title: (orderId: string, part: string) => `Belege — ${orderId} · ${part}`,
    intro:
      "Jede Zahl unten lässt sich auf einen Beleg zurückführen. Die Kette lautet Wareneingang → Lieferschein → Bestellung → Rechnungsposition, damit eine Abweichung auf eine Ursache zurückgeführt und nicht ausdiskutiert wird.",
    ordered: "Bestellt",
    listed: "Ausgewiesen",
    countedIn: "Gezählt",
    accepted: "Angenommen",
    invoiced: "Berechnet",
    invoicedNet: "Berechnet netto",
    notesHint: (n: number) => `${n} Lieferscheine`,
    arrivedHint: "physisch angekommen",
    damagedHint: (n: number) => `${n} beschädigt`,
    noneDamaged: "nichts beschädigt",
    noInvoiceYet: "noch keine Rechnung",
    netHint: (billed: number, credited: number) =>
      `${billed} berechnet − ${credited} gutgeschrieben`,
    reconciledLead: "Ausgeglichen.",
    reconciledBody:
      "Was der Lieferant fordert, stimmt jetzt mit dem überein, was in den Bestand ging.",
    chain: "Die Kette",
    thRecord: "Beleg",
    thSupports: "Belegt",
    thCounted: "Gezählt",
    thDamaged: "Beschädigt",
    thAccepted: "Angenommen",
    purchaseOrder: (part: string) => `Bestellung · ${part}`,
    orderedQty: (n: number) => `${n} bestellt`,
    duplicateOf: (id: string) => `Doppelerfassung von ${id} — ausgeschlossen`,
    noteLists: (n: number) => `Lieferschein · weist ${n} aus`,
    notCounted: "nicht gezählt",
    invoiceBills: (notes: string) => `Lieferantenrechnung · berechnet ${notes}`,
    invoicedQty: (n: number) => `${n} berechnet`,
    creditNote: (reason: string) => `Gutschrift · ${reason}`,
    creditedQty: (n: number) => `−${n} gutgeschrieben`,
    mismatch: "Was nicht zusammenpasst",
    toReview: "Zur Prüfung →",
  },

  review: {
    title: "Abweichungsprüfung",
    intro:
      "Das System legt einen Vorschlag vor, mit den Belegen dahinter und der Ursache, die es für die wahrscheinlichste hält. Es entscheidet nicht. Du bestätigst, korrigierst oder verwirfst — und deine Antwort wird zum Beleg.",
    status: {
      approved: "Bestätigt",
      corrected: "Von der Prüfung korrigiert",
      rejected: "Verworfen",
      pending: "Wartet auf Entscheidung",
    },
    unraised: (n: number) =>
      `${n} Abweichung${n > 1 ? "en" : ""} erkannt, noch nicht vorgelegt`,
    raise: "Zur Prüfung vorlegen",
    raising: "Wird vorgelegt…",
    unraisedNote:
      "Diese Belege wurden außerhalb des Annahmeprozesses geladen, deshalb wurde kein Vorschlag automatisch erstellt.",
    emptyTitle: "Nichts zu prüfen",
    emptyNoReceipts:
      "Es ist noch nichts gezählt, also gibt es nichts abzugleichen.",
    emptyNoInvoice:
      "Die Ware ist gezählt und stimmt mit den Lieferscheinen überein. Die Rechnung des Lieferanten ist noch nicht eingetroffen.",
    emptyReconciled:
      "Alle Zahlen gehen auf. Was der Lieferant fordert, deckt sich mit dem, was in den Bestand ging.",
    toBay: "Zur Rampe →",
    toEvidence: "Belege ansehen →",
    pending: (n: number) =>
      n > 1 ? `${n} Vorschläge warten` : `${n} Vorschlag wartet`,
    proposedBy: "Vom System vorgeschlagen",
    causesLead: "Wahrscheinlichste Ursache — und was sonst offen bleibt:",
    nextAction: "Vorgeschlagener nächster Schritt",
    history: "Entscheidungsverlauf",
    recordedAs: (cause: string) => `Erfasst als ${cause}`,
    actionRecorded: "Maßnahme erfasst: ",
    notSent: "Nicht versendet",
    noAction: "Keine Maßnahme ergriffen.",
  },

  decide: {
    reviewer: "Geprüft von",
    reviewerDefault: "Leitung Warenannahme",
    correctLead: (cause: string) =>
      `Das System hat ${cause} vorgeschlagen. Erfasse die Ursache, die du für richtig hältst:`,
    notePlaceholder:
      "Warum — z. B. Lieferant hat bestätigt, dass beide Lieferscheine zu einer Sendung gehören",
    save: "Korrektur speichern",
    saving: "Korrektur wird erfasst…",
    cancel: "Abbrechen",
    approve: "Vorschlag bestätigen",
    approving: "Entscheidung wird erfasst…",
    correct: "Korrigieren",
    reject: "Verwerfen",
    rejecting: "Wird erfasst…",
    footnote:
      "Das Bestätigen erfasst die Entscheidung und die vorgesehene Maßnahme. Es geht nichts an den Lieferanten.",
  },

  demo: {
    heading: "Simulierte Ereignisse",
    intro:
      "Nichts hier unten kontaktiert einen Lieferanten oder ein Buchhaltungssystem. Diese Schaltflächen spielen einen Beleg ein, den sonst die Moderation mitten in der Übung überreicht.",
    creditUnavailableBefore: "Gutschriften sind nicht verfügbar: führe",
    creditUnavailableAfter:
      "im Supabase-SQL-Editor aus, um dieses Ereignis freizuschalten.",
    invoiceArrives: "◆ Lieferantenrechnung trifft ein",
    invoiceArriving: "Rechnung wird eingespielt…",
    creditIssued: "◆ Lieferant stellt eine Gutschrift aus",
    creditIssuing: "Gutschrift wird ausgestellt…",
    resetShift: "Zurücksetzen — Schichtbeginn",
    resetInvoice: "Zurücksetzen — Rechnung eingetroffen",
    resetting: "Wird zurückgesetzt…",
    creditReason: (n: number) =>
      `Gutschrift des Lieferanten für ${n} bei der Annahme gemeldete beschädigte Einheit(en).`,
  },

  settings: {
    title: "Fall-Einstellungen",
    tag: "Nur Prototyp",
    intro:
      "Der Prototyp liest jede Menge aus der Datenbank, keine davon steht im Code. Dieser Bildschirm bearbeitet sie — der schnellste Weg zu zeigen, dass der Abgleich mit Belegen rechnet und kein Skript abspielt.",
    notAFeature:
      "Ein ausgeliefertes System hätte diesen Bildschirm nicht. Eine Bestellmenge kommt aus dem ERP, eine ausgewiesene Menge steht auf dem Lieferschein des Lieferanten, und in der Warenannahme tippt niemand eine davon ab. Er existiert, damit die Demo die Frage „Funktioniert das nur für 10 FILTER-X?“ beantworten kann.",
    suppliedSafe:
      "initial.json wird nie verändert. Änderungen liegen in einem Cookie in diesem Browser, das Banner sagt es, solange eine gesetzt ist, und „Wiederherstellen“ holt die gelieferten Belege zurück.",

    orderHeading: "Bestellung",
    part: "Artikel",
    partHint: "Wird in jedem erzeugten Satz genannt",
    ordered: "Bestellt",
    orderedHint: "Was PO-1 beim Lieferanten angefordert hat",

    invoiceHeading: "Lieferantenrechnung",
    invoiced: "Berechnet",
    invoicedHint: "Was INV-1 berechnet, vor jeder Gutschrift",

    notesHeading: "Lieferscheine",
    notesIntro:
      "„Ausgewiesen“ ist, was der Lieferschein behauptet. „Gezählt“ und „Beschädigt“ stehen im Wareneingang — die Voreinstellungen setzen sie, an der Rampe tippt die Warenannahme sie stattdessen ein.",
    listed: "Ausgewiesen",
    counted: "Gezählt",
    damagedLabel: "Beschädigt",
    acceptedLabel: "Angenommen",
    derived: "Abgeleitet",

    previewHeading: "Was der Abgleich sehen wird",
    previewOrdered: "Bestellt",
    previewListed: "Ausgewiesen",
    previewCounted: "Gezählt",
    previewAccepted: "Angenommen",
    previewInvoiced: "Berechnet",
    gapNone:
      "Rechnung und angenommener Bestand stimmen überein — keine Abweichung vorzulegen.",
    gapSome: (n: number) =>
      `Die berechnete Menge ${n > 0 ? "übersteigt" : "unterschreitet"} die angenommene um ${Math.abs(n)}: eine Abweichung, die die Prüfung klären muss.`,
    previewNote:
      "„Gezählt“ und „Beschädigt“ gelten nur für die Voreinstellung „Rechnung eingetroffen“. Bei Schichtbeginn bleibt die Rampe leer, damit du die Ware selbst einzählen kannst.",

    invalid: (noteId: string) =>
      `Beschädigt auf ${noteId} darf die gezählte Menge nicht übersteigen.`,
    changed: "geändert",
    suppliedValue: (v: string | number) => `war ${v}`,

    applyShift: "Übernehmen — Schichtbeginn",
    applyInvoice: "Übernehmen — Rechnung eingetroffen",
    applying: "Wird neu aufgebaut…",
    applyNote:
      "Das Übernehmen baut den Fall aus diesen Zahlen neu auf. Zählungen und Vorschläge zu den alten Zahlen werden gelöscht, weil sie eine Frage beantworten, die es nicht mehr gibt.",
    restore: "Gelieferte Belege wiederherstellen",
    restoring: "Wird wiederhergestellt…",
    restoreHint: "Zurück zu initial.json, und die Banner-Markierung verschwindet.",

    limitsHeading: "Was dieser Bildschirm nicht kann",
    limits: [
      "Die Lieferschein-Nummern stehen fest. Du kannst ändern, was DN-1 und DN-2 ausweisen, aber keinen dritten hinzufügen oder einen streichen — das wäre eine Änderung an den Belegen, keine Einstellung.",
      "Die Änderung ist ein Cookie in diesem Browser. Ein anderer Browser auf derselben Datenbank sieht dieselben Belege, fällt aber auf die gelieferten Zahlen zurück.",
      "Nichts hier wird gegen eine echte Bestellung geprüft. Die Werte werden so übernommen, wie sie getippt sind — im Rahmen dessen, was die Datenbank selbst zulässt.",
    ],
  },

  docs: {
    metaTitle: "Briefing für die Präsentation — C04",
    metaDescription:
      "Wie der Prototyp läuft, was er heute kann und was noch Hypothese ist.",
    title: "Briefing für die Präsentation — C04",
    subtitle:
      "Wie man ihn startet, der Ablauf der Demo und eine ehrliche Aufstellung dessen, was echt ist. Fünf Minuten Lesezeit.",
    back: "← Zurück zum Prototyp",

    sayFirstHeading: "Sag das zuerst",
    pitch:
      "Zehn Filter wurden bestellt, zehn kamen an, zehn wurden berechnet — aber nur *neun* gingen in den Bestand. Heute kann niemand sagen, ob der fehlende eine Fehlmenge, eine Beschädigung, eine Doppelerfassung oder eine zweite Lieferung war, also wird die Rechnung aus dem Bauch heraus bezahlt oder bestritten. Wir haben geändert, was die Warenannahme an der Rampe erfasst — damit sich die Abweichung mit Belegen auf eine Ursache zurückführen lässt.",

    demoHeading: "Die Demo — sechs Schritte, knapp zwei Minuten",
    beats: [
      "*Zurücksetzen — Schichtbeginn.* Zwei Lieferscheine liegen an der Rampe. Nichts gezählt, keine Rechnung. Schritt 3 zeigt _nichts zu prüfen_ — das ist der leere Zustand, und er ist ehrlich.",
      "*DN-1 einzählen.* 8 gezählt, 1 beschädigt. „Angenommen“ zeigt `7` und lässt sich nicht überschreiben — es ist abgeleitet, und die Datenbank verweigert einen Wareneingang, bei dem die drei Zahlen nicht aufgehen. _Das ist die Antwort auf die Ausgangsfrage._",
      "*DN-2 einzählen.* 2 und 0. Du landest automatisch bei den Belegen: 10 bestellt, 10 ausgewiesen, 10 gezählt, 9 angenommen. Noch stimmt alles — die Ware passt zu den Lieferscheinen.",
      "*Drücke „Lieferantenrechnung trifft ein“* (korallrot — eine Simulation). Die Rechnung berechnet 10. Zwei Vorschläge werden erstellt und du landest in der Prüfung. Ein Klick, keine Rückfrage.",
      "*Lies den ersten Vorschlag laut vor.* Wahrscheinlichste Ursache _Beschädigung_, markiert als _wahrscheinlich_, während Fehlmenge, Doppelerfassung und Zweite Lieferung offen bleiben. Belege: `INV-1 · DN-1 · DN-2 · RC-1`. Vorgeschlagene Maßnahme: eine Gutschrift anfordern. Und dann der wichtige Satz: _es schlägt vor, es entscheidet nicht._",
      "*Bestätige ihn* — oder drücke _Korrigieren_, wähle eine andere Ursache und tippe eine Begründung. So oder so werden die Entscheidung, die prüfende Person und die endgültige Ursache erfasst, und der Verlauf zeigt, welche es war. Drücke danach „Lieferant stellt eine Gutschrift aus“ und sieh zu, wie sich die Lücke zu „ausgeglichen“ schließt. Der zweite Vorschlag ist die Frage nach der Doppelerfassung — zwei Lieferscheine zu einer Bestellung — und er ist da, um zu zeigen: das System fragt, statt anzunehmen.",
    ],
    thirtyLabel: "Wenn du nur 30 Sekunden hast",
    thirtyBody:
      "Zurücksetzen — Rechnung eingetroffen. Das führt dich direkt zum Vorschlag auf Schritt 3. Vorlesen, bestätigen, fertig.",

    runHeading: "Starten",
    runSteps: [
      "`cd web && npm install` — einmalig, falls `node_modules` fehlt.",
      "`web/.env.local` muss die Supabase-URL, den Publishable Key und den Secret Key enthalten. Die Datei ist gitignored, also nach einem frischen Klon — und nur dann — `web/.env.example` kopieren und ausfüllen. *Wenn die Datei schon existiert, lass sie in Ruhe:* das Beispiel darüberzukopieren ersetzt die Schlüssel durch Platzhalter, und jeder Bildschirm läuft in einen 500er.",
      "`npm run dev` ausführen, dann `http://localhost:3000` öffnen.",
    ],
    resetLabel: "Auf einen bekannten Startzustand zurücksetzen",
    resetBody:
      "Nimm die zwei Schaltflächen unten auf jedem Bildschirm — sie bauen die Datenbank mit einem Klick aus den gelieferten Belegen neu auf. `supabase/seed.sql` in den Supabase-SQL-Editor zu kopieren macht dasselbe. `npm run check:seed` belegt, dass die App die gelieferten Werte weiterhin unverändert einspielt.",

    whoHeading: "Wer in der Geschichte vorkommt",
    roles: {
      receiver: {
        who: "Leitung Warenannahme (Schritt 1)",
        does: "Lädt die Lieferung ab und erfasst den Wareneingang: gezählt, beschädigt, angenommen. Zwei Zahlen getippt, die dritte abgeleitet.",
        why: "Die Person, um die es in der Ausgangsfrage geht. Alles Weitere hängt an den dreißig Sekunden, die sie an der Rampe hat.",
      },
      reconciler: {
        who: "Rechnungsprüfung (Schritt 3)",
        does: "Bekommt die Rechnung Wochen später, liest den Vorschlag und seine Belege und bestätigt, korrigiert oder verwirft ihn.",
        why: "Leidtragende des heutigen Ablaufs und die einzige Rolle, die eine Abweichung klären kann. Ihre Antwort wird zum Beleg — nicht die des Systems.",
      },
    },
    noLoginLabel: "Es gibt keinen Login",
    noLoginBody:
      "Keine Konten, keine Authentifizierung. Die prüfende Person ist ein Name in einem Feld. Sag das lieber, als die Demo ein Identitätsmodell andeuten zu lassen, das es nicht gibt.",

    existsHeading: "Was es heute gibt",
    features: {
      flow: {
        name: "Annahmeprozess über drei Schritte",
        body: "Wareneingang, dann die verknüpften Belege, dann die Abweichungsprüfung — mit funktionierenden Schaltflächen auf jedem Schritt.",
      },
      quantities: {
        name: "Drei Mengen, sauber getrennt",
        body: "„Angenommen“ wird aus gezählt minus beschädigt abgeleitet und getrennt gespeichert. Ein Check-Constraint in der Datenbank macht einen unausgeglichenen Wareneingang unschreibbar — die Regel hält also auch dann, wenn die App falsch liegt.",
      },
      proposal: {
        name: "Gewichteter Vorschlag, Entscheidung bleibt offen",
        body: "Das System nennt die wahrscheinlichste Ursache mit einer Einschätzung, lässt die anderen Kandidaten sichtbar und sagt, was die Frage klären würde. Es schließt die Lücke nie selbst.",
      },
      review: {
        name: "Menschliche Prüfung, die den Zustand setzt",
        body: "Bestätigen, korrigieren oder verwerfen. Eine Korrektur überschreibt die vorgeschlagene Ursache, und die prüfende Person, die Begründung und die endgültige Ursache werden alle erfasst.",
      },
      events: {
        name: "Zwei gekennzeichnete simulierte Ereignisse",
        body: "Die eintreffende Rechnung und die Gutschrift des Lieferanten. Jedes aktualisiert mit einem Druck die Belege und den offenen Vorschlag.",
      },
      states: {
        name: "Leere und unklare Zustände",
        body: "Nichts an der Rampe, noch keine Belege, nichts zu prüfen — jeder davon ist ein gestalteter Bildschirm. Der unklare Zustand ist auf Schritt 3 der Normalfall.",
      },
      languages: {
        name: "Englisch, Arabisch und Deutsch — bis in den Abgleich hinein",
        body: "Der Schalter im Kopfbereich ändert jeden Bildschirm — dieses Briefing eingeschlossen. Auf Arabisch kommt die Seite von rechts nach links mit arabischer Schrift zurück. Auch die Sätze des Abgleichs selbst sind übersetzt: ein Vorschlag speichert die Fakten neben dem englischen Text, sodass eine in einer Sprache erfasste Abweichung in den anderen richtig zu lesen ist. Belegnummern, Mengen und getippte Begründungen werden nie übersetzt.",
      },
      settings: {
        name: "Fall-Einstellungen, als Gerüst",
        body: "`/settings` bearbeitet die bestellte, ausgewiesene, gezählte, beschädigte und berechnete Menge sowie den Artikelnamen und baut den Fall daraus neu auf. Es existiert, um die Frage „Funktioniert das nur für 10 FILTER-X?“ zu beantworten — der Abgleich liest diese Zahlen aus Postgres, eine Änderung gewichtet die Ursache also neu. Auf der Seite ist es als reines Prototyp-Gerüst gekennzeichnet, die Änderung liegt in einem Cookie statt in `initial.json`, und das Banner oben sagt das, bis sie zurückgesetzt ist. Ein ausgeliefertes System holt diese Werte aus dem ERP.",
      },
      rls: {
        name: "Keine Buchung ohne Prüfung — erzwungen",
        body: "Der Browser-Schlüssel darf lesen und sonst nichts; ein Schreibversuch scheitert mit Postgres `42501`. Jede Zustandsänderung läuft über eine Server Action.",
      },
      external: {
        name: "Alles, was das Haus verlässt",
        body: "Keine Lieferanten-E-Mail, keine Bestandsbuchung, kein Buchhaltungseintrag. Eine bestätigte Maßnahme wird erfasst und mit „Nicht versendet“ gekennzeichnet. Das ist Absicht — die Übung verbietet es — aber es ist die Grenze der Demo.",
      },
    },

    pathsHeading: "Die drei Wege",
    paths: {
      ordinary: {
        name: "Normalfall",
        body: "Auf Schichtbeginn zurücksetzen, beide Lieferscheine einzählen. Zehn ausgewiesen, zehn gezählt, die Ware passt zu den Lieferscheinen und es gibt nichts zu prüfen. Der langweilige Fall — zeig ihn zehn Sekunden lang, damit die Ausnahme Kontrast bekommt.",
      },
      changed: {
        name: "Geänderte Information",
        body: "Drücke „Lieferantenrechnung trifft ein“, später „Lieferant stellt eine Gutschrift aus“. Beides sind gekennzeichnete Simulationen, die genau einen Beleg einspielen und Abgleich und Vorschlag von selbst nachziehen lassen. Die Gutschrift ist ein neuer Beleg; INV-1 wird nie verändert.",
      },
      failure: {
        name: "Fehler / Unklarheit",
        body: "Der Normalzustand von Schritt 3. Beschädigung gilt als wahrscheinlich, weil sie genau zur Lücke passt, aber Fehlmenge, Doppelerfassung und Zweite Lieferung bleiben auf der Karte, und der Vorschlag sagt klar, dass diese Belege allein die Frage nicht klären. Drücke „Korrigieren“, um zu zeigen, wie die Prüfung das System überstimmt.",
      },
    },

    decisionHeading: "Die eine Designentscheidung, die zu verteidigen ist",
    decisionLead:
      "Der Abgleich könnte „Beschädigung“ behaupten und die Lücke schließen: eine Einheit beschädigt, eine Einheit Differenz, die Rechnung geht auf. Stattdessen schlägt er es nur vor.",
    decisionBody:
      "Dass die Beschädigung die Lücke rechnerisch erklärt, heißt nicht, dass der Lieferant sie gutschreibt — und nichts in diesen Belegen beweist das. Ein System, das still die bequeme Ursache wählt, produziert eine Zahl, die später jemand gegenüber einem Lieferanten verteidigen muss, ohne zu wissen, woher sie kommt — genau der Schmerz, den der Kunde beschrieben hat. Also gewichtet es, zeigt die Alternativen, sagt, was die Frage klären würde, und übergibt die Entscheidung an einen Menschen.",
    decisionAside:
      "Wenn jemand einwendet, es solle doch einfach antworten: das ist eine Produktentscheidung, keine technische Grenze. Frag zurück, wer die Gutschrift unterschreibt.",

    realHeading: "Echt oder simuliert",
    thComponent: "Baustein",
    thStatus: "Status",
    thEvidence: "Nachweis und Grenze",
    rows: {
      capture: {
        c: "Wareneingangserfassung",
        s: "Echt",
        l: "Schreibt eine Zeile über eine Server Action. Das Check-Constraint der Datenbank weist einen unausgeglichenen Wareneingang zurück.",
      },
      records: {
        c: "Belege und Persistenz",
        s: "Echt",
        l: "Live-Supabase-Postgres, 8 Tabellen. Aus den gelieferten Belegen neu eingespielt; npm run check:seed belegt, dass sie unverändert sind.",
      },
      engine: {
        c: "Abgleich und Vorschlag",
        s: "Echt",
        l: "Reines TypeScript, kein Modellaufruf. Deterministisch — dieselben Belege ergeben immer denselben Vorschlag.",
      },
      review: {
        c: "Menschliche Prüfung",
        s: "Echt",
        l: "Bestätigen / Korrigieren / Verwerfen schreibt eine review_decisions-Zeile. RLS verbietet dem Browser-Schlüssel jedes Schreiben.",
      },
      events: {
        c: "Auslösendes Ereignis",
        s: "Simuliert, gekennzeichnet",
        l: "Zwei Schaltflächen spielen die Rechnung und die Gutschrift ein. Überall korallrot markiert und mit „Simuliert“ getaggt.",
      },
      scans: {
        c: "Gescannte Dokumente",
        s: "Simuliert",
        l: "Kein OCR. Lieferscheine und Rechnungen sind strukturierte Zeilen, wie die Übung es erlaubt.",
      },
      external: {
        c: "Externe Maßnahme",
        s: "Keine, mit Absicht",
        l: "Es wird keine Lieferantennachricht, keine Bestandsbuchung und kein Buchhaltungseintrag ausgeführt. Bestätigte Maßnahmen werden erfasst und mit „Nicht versendet“ gekennzeichnet.",
      },
    },

    limitsHeading: "Grenzen — und was als Nächstes zu testen wäre",
    limits: [
      "Eine Bestellung, ein Artikel, eine Rechnung. Kein Katalog, keine Teilrechnungen, keine Preiszeilen.",
      "Row-Level Security ist für die Demo offen: wer die URL hat, kann lesen, und die Demo-Schaltflächen lassen jeden zurücksetzen. Für die Übung gewollt, keine Produktionshaltung.",
      "Keine Authentifizierung, „wer hat das bestätigt“ ist also ein Textfeld, keine Identität.",
      "Die vier möglichen Ursachen sind die, die der Kunde genannt hat — von Hand hinterlegt. Eine echte Warenannahme hat mehr.",
      "Die Bildschirme lesen live aus Supabase; ohne Netz laden sie nicht.",
    ],
    nextTestLabel: "Nächster Validierungstest",
    nextTestBody:
      "Nimm eine Woche echter Lieferscheine und Rechnungen von einem Lieferanten, lass sie durch den Abgleich laufen und zähle, wie viele Abweichungen sich mit Belegen auf eine einzige Ursache zurückführen lassen — und wie viele weiterhin einen Anruf brauchen. Erfolg ist ein Rückgang dieser Anrufe, beurteilt von der Rechnungsprüfung, nicht von uns.",
    close:
      "Schließe mit der Trennung: *Gezeigt* ist, dass der richtige Wareneingangsbeleg eine Abweichung mit Belegen klärbar macht und dass ein Mensch in der Schleife bleibt. *Hypothese* bleibt, dass das den Aufwand der Rechnungsprüfung bei echtem Volumen senkt.",

    status: {
      built: "Gebaut",
      partial: "Teilweise",
      pending: "Nicht gebaut",
    },
  },

  error: {
    title: "Auf diesem Bildschirm ist etwas schiefgelaufen",
    body: "Die Belege in Supabase sind unberührt. Versuch es erneut, oder bau den Startzustand neu auf und mach mit der Demo weiter.",
    retry: "Erneut versuchen",
    home: "Zurück zur Rampe",
    detail: "Technische Details",
  },

  recon: {
    received_vs_listed: {
      statement: (p: { listed: number; received: number }) =>
        `Die Lieferscheine weisen ${p.listed} aus, gezählt wurden ${p.received}.`,
      action: (p: { abs: number; part: string; notes: string[] }) =>
        `Frag beim Lieferanten wegen ${p.abs} × ${p.part} zu ${p.notes.join(" und ")} nach.`,
      settledBy: () =>
        "Eine Nachzählung gegen die Lieferscheine, dann der Versandnachweis des Lieferanten.",
    },
    invoiced_vs_accepted: {
      statement: (p: {
        invoiceId: string;
        invoicedNet: number;
        accepted: number;
        delta: number;
      }) =>
        `${p.invoiceId} fordert ${p.invoicedNet}, angenommen wurden aber ${p.accepted}: eine Abweichung von ${p.delta}.`,
      actionDamage: (p: { delta: number; part: string; receipts: string[] }) =>
        `Fordere beim Lieferanten eine Gutschrift über ${p.delta} × ${p.part} an, unter Verweis auf ${p.receipts.join(", ")}.`,
      actionUnclear: (p: { notes: string[]; invoiceId: string }) =>
        `Lass dir vom Lieferanten bestätigen, was zu ${p.notes.join(" und ")} versandt wurde, bevor ${p.invoiceId} bezahlt wird.`,
      settledDamage: (p: { damaged: number; receipts: string[] }) =>
        `Die Beschädigung von ${p.damaged} auf ${p.receipts.join(", ")} passt genau zur Lücke. Eine Gutschrift des Lieferanten würde die Frage klären; diese Belege allein tun es nicht.`,
      settledUnclear: () =>
        "Kein einzelner Beleg erklärt die Abweichung. Es braucht eine Bestätigung des Lieferanten.",
    },
    split_delivery: {
      statement: (p: { count: number; orderId: string; ordered: number }) =>
        `${p.count} Lieferscheine verweisen auf ${p.orderId} und ergeben zusammen genau die ${p.ordered} bestellten Einheiten.`,
      action: () =>
        "Erfasse beide Lieferscheine als eine Bestellung, die in Teilen geliefert wurde. Keine Bestandsänderung.",
      settledBy: () =>
        "Die Mengen gehen auf, das liest sich also wie eine Teillieferung. Prüfe, ob die Lieferscheine unterschiedliche Daten oder Spediteure tragen, bevor du sie als getrennte Lieferungen behandelst.",
    },
  },
};
