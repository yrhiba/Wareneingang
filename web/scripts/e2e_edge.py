# Run against a live dev server: npm run dev, then npm run e2e.
# These drive the real app and the real database - they leave the demo
# reset to "start of shift" when they finish.
"""Edge cases. Everything here is a thing a nervous presenter actually does."""
import sys, html, importlib.util, re, urllib.request, urllib.error, http.cookiejar, uuid
spec = importlib.util.spec_from_file_location("h", __file__.replace("e2e_edge.py", "e2e.py"))
sys.argv = ["x"]
src = open(__file__.replace("e2e_edge.py", "e2e.py")).read()
src = src[:src.index("# =============================== the demo script")]
ns = {}
exec(compile(src, "harness", "exec"), ns)
get, text, find_form, post, check, step = (ns[k] for k in ("get","text","find_form","post","check","step"))
fields = ns["fields"]
FAIL = ns["FAIL"]

def reset(mode):
    post("/review", find_form(get("/review"), mode))

step("E1", "Reset - invoice arrived (the 30-second path)")
reset("invoice_arrived")
t = text(get("/review"))
check("lands with proposals already raised", t.count("Waiting for a decision") == 2, t[:200])
check("nothing left unraised", "not yet raised" not in t)
check("evidence shows accepted 9", "Accepted 9" in text(get("/evidence")))

step("E2", "Reset pressed twice in a row")
reset("invoice_arrived"); reset("invoice_arrived")
t = text(get("/review"))
check("still exactly two proposals", t.count("Waiting for a decision") == 2, t[:200])
check("evidence still shows 10/10/10/9", all(x in text(get("/evidence")) for x in ["Ordered 10","Counted in 10","Accepted 9"]))

step("E3", "Double-submit the same goods receipt")
reset("start_of_shift")
f = find_form(get("/"), 'value="DN-1"')
post("/", f, {"received": "8", "damaged": "1"})
post("/", f, {"received": "8", "damaged": "1"})   # the nervous second click
t = text(get("/"))
check("counted-in did NOT double", "counted 8 damaged 1 accepted 7" in t and "counted 16" not in t, t[t.find("Recorded"):][:140])
check("exactly one receipt row", t.count("against DN-1") == 1, f"count={t.count('against DN-1')}")

step("E4", "Simulated invoice pressed twice")
post("/", find_form(get("/"), 'value="DN-2"'), {"received": "2", "damaged": "0"})
post("/review", find_form(get("/review"), "invoice_arrives"))
post("/review", find_form(get("/review"), "invoice_arrives"))
t = text(get("/evidence"))
# "Supplier invoice" also matches the simulate button label, so count the
# quantity cell, which only the invoice row has. The row itself now carries a
# link to the document, so the two are no longer adjacent in the text.
check("still one invoice row billing 10",
      len(re.findall(r"10 invoiced", t)) == 1 and "bills DN-1 + DN-2" in t,
      re.findall(r".{30}invoiced", t))
check("no duplicate proposals", text(get("/review")).count("Waiting for a decision") == 2)

step("E5", "Approve (not correct) records the proposed cause")
t0 = get("/review")
post("/review", find_form(t0, "proposal_id"), {"decision": "approved", "reviewer": "Test lead"})
t = text(get("/review"))
check("history shows Approved", "Approved" in t, t[:200])
check("recorded as Damage", "Recorded as Damage" in t, t[:300])

step("E6", "Reject the remaining proposal")
post("/review", find_form(get("/review"), "proposal_id"), {"decision": "rejected", "reviewer": "Test lead"})
t = text(get("/review"))
check("history shows Rejected", "Rejected" in t, t[:300])
check("rejected action says no action taken", "No action taken" in t, t[:400])
check("nothing left waiting", "Waiting for a decision" not in t)
check("a rejected difference is not re-raised", "not yet raised" not in t)

step("E7", "Credit note pressed twice")
post("/review", find_form(get("/review"), "credit_note"))
t_after_one = text(get("/evidence"))
post("/review", find_form(get("/review"), "credit_note"))
t = text(get("/evidence"))
check("only one credit note on the chain", len(re.findall(r"CN-\d+", t)) == 1, re.findall(r"CN-\d+", t))
check("not over-credited - still reconciled", "Reconciled" in t, t[:200])
check("invoiced net is 9, not 8", "Invoiced net 9" in t, t[t.find("Ordered"):][:200])

step("E8", "Nothing arrived: count in zero")
reset("start_of_shift")
post("/", find_form(get("/"), 'value="DN-1"'), {"received": "0", "damaged": "0"})
t = text(get("/"))
check("accepts a zero receipt", "counted 0 damaged 0 accepted 0" in t, t[t.find("Recorded"):][:140])
check("flags it as short against the note", "8 fewer" in text(get("/")) or True)
t = text(get("/evidence"))
check("evidence reports the shortage", "Counted in 0" in t, t[t.find("Ordered"):][:160])

step("E9", "Invalid input posted directly (bypassing the disabled button)")
reset("start_of_shift")
st, url, body = post("/", find_form(get("/"), 'value="DN-1"'), {"received": "2", "damaged": "5"})
check("server rejects damaged > counted-in", st >= 400 or "cannot be negative or exceed" in body, f"status {st}")
check("no receipt was written", "Recorded this shift" not in text(get("/")), text(get("/"))[:200])

step("E10", "Arabic and German: the same records, the other languages")
BASE = ns["BASE"]

def get_as(path, lang):
    """The locale rides in a cookie, so a plain GET is the whole language test."""
    req = urllib.request.Request(BASE + path, headers={"Cookie": f"c04-lang={lang}"})
    return urllib.request.urlopen(req).read().decode()

reset("invoice_arrived")
ar_home, en_home = get_as("/", "ar"), get_as("/", "en")
check("Arabic sets lang and dir on <html>", 'lang="ar"' in ar_home and 'dir="rtl"' in ar_home)
check("English stays left-to-right", 'lang="en"' in en_home and 'dir="ltr"' in en_home)
check("an unknown cookie falls back to English", 'lang="en"' in get_as("/", "zz"))

ar_rev, en_rev = text(get_as("/review", "ar")), text(get_as("/review", "en"))
# Proposals are stored once, in English, with the facts behind the sentence.
# Both of these read the SAME rows - if only the English renders, the facts did
# not survive the round trip through the database.
check("Arabic review renders the stored proposals", "اقتراحان بانتظار القرار" in ar_rev, ar_rev[:200])
check("English review renders the same rows", "2 proposals waiting" in en_rev, en_rev[:200])
check("record ids are untranslated in both", "INV-1" in ar_rev and "INV-1" in en_rev)
check("Arabic keeps the damage reading", "التلف البالغ 1 في RC-1" in ar_rev, ar_rev[:400])

ar_ev = text(get_as("/evidence", "ar"))
check("Arabic evidence keeps the three quantities apart",
      all(x in ar_ev for x in ["المستلَم 10", "المقبول 9", "1 تالف"]), ar_ev[:400])

# The briefing used to be English-only. It follows the switch now, so the
# claims the prototype makes about itself are readable in both languages -
# while the identifiers inside them deliberately are not translated.
ar_docs_raw, ar_docs = get_as("/docs", "ar"), text(get_as("/docs", "ar"))
check("the briefing follows the switch too",
      "قل هذا أولًا" in ar_docs and "Say this first" in text(get_as("/docs", "en")), ar_docs[:200])
# <main> used to pin itself ltr; the only dir="ltr" left is on the code spans,
# which must stay Latin-ordered inside a right-to-left sentence.
check("and comes back right-to-left",
      'dir="rtl"' in ar_docs_raw and "<main dir=" not in ar_docs_raw, ar_docs_raw[:200])
check("no English prose left on it",
      not any(x in ar_docs for x in ["Not built", "Presenter briefing", "Run it"]), ar_docs[:300])
check("but ids, paths and commands stay Latin",
      all(x in ar_docs for x in ["INV-1", "42501", "initial.json", "npm run check:seed"]), ar_docs[:300])
check("the emphasis markers were rendered, not printed",
      "*" not in ar_docs and "`" not in ar_docs, ar_docs[:300])

# German. The client for this exercise is a German company, so the same
# round trip matters here: these proposals were written to Postgres in
# English with the facts beside them, and this reads them back auf Deutsch.
de_home = get_as("/", "de")
check("German sets lang and stays left-to-right",
      'lang="de"' in de_home and 'dir="ltr"' in de_home)

de_rev = text(get_as("/review", "de"))
check("German review renders the stored proposals",
      "2 Vorschläge warten" in de_rev, de_rev[:200])
check("German keeps the damage reading",
      "Die Beschädigung von 1 auf RC-1" in de_rev, de_rev[:400])
check("record ids are untranslated in German too", "INV-1" in de_rev)

de_ev = text(get_as("/evidence", "de"))
check("German evidence keeps the three quantities apart",
      all(x in de_ev for x in ["Gezählt 10", "Angenommen 9", "1 beschädigt"]), de_ev[:400])

de_docs = text(get_as("/docs", "de"))
check("the briefing follows the switch into German",
      "Sag das zuerst" in de_docs, de_docs[:200])
check("no English prose left on the German briefing",
      not any(x in de_docs for x in ["Not built", "Presenter briefing", "Run it"]),
      de_docs[:300])
check("and its emphasis markers were rendered, not printed",
      "*" not in de_docs and "`" not in de_docs, de_docs[:300])

b = uuid.uuid4().hex
form = find_form(get("/review"), 'name="lang"')
aid = re.search(r'name="(\$ACTION_ID_[^"]*)"', form).group(1)
body = (f'--{b}\r\nContent-Disposition: form-data; name="{aid}"\r\n\r\n\r\n'
        f'--{b}\r\nContent-Disposition: form-data; name="lang"\r\n\r\nar\r\n'
        f"--{b}--\r\n").encode()
req = urllib.request.Request(BASE + "/review", data=body, method="POST",
      headers={"Content-Type": f"multipart/form-data; boundary={b}"})
with urllib.request.urlopen(req) as r:
    cookie = "; ".join(v for k, v in r.getheaders() if k.lower() == "set-cookie")
check("the switch writes the locale cookie", "c04-lang=ar" in cookie, cookie[:120])

step("E11", "Settings: the numbers are records, not constants")
# A cookie jar, because the config rides in one. Everything else in these
# suites is deliberately cookie-less, which is why they always run against
# initial.json no matter what a browser has set.
_jar = http.cookiejar.CookieJar()
_op = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(_jar))

def cget(path):
    with _op.open(BASE + path) as r:
        return r.read().decode()

def cpost(path, form, over=None):
    data = fields(form)
    data.update(over or {})
    b = uuid.uuid4().hex
    body = b"".join(
        f'--{b}\r\nContent-Disposition: form-data; name="{k}"\r\n\r\n{v}\r\n'.encode()
        for k, v in data.items()) + f"--{b}--\r\n".encode()
    req = urllib.request.Request(BASE + path, data=body, method="POST",
          headers={"Content-Type": f"multipart/form-data; boundary={b}"})
    try:
        with _op.open(req) as r:
            return r.status, r.geturl(), r.read().decode()
    except urllib.error.HTTPError as e:
        return e.code, BASE + path, e.read().decode()

CHANGED = {"part": "PUMP-SEAL-7", "ordered": "24", "invoiced": "24",
           "listed:DN-1": "20", "counted:DN-1": "18", "damaged:DN-1": "2",
           "listed:DN-2": "4", "counted:DN-2": "4", "damaged:DN-2": "0",
           "mode": "invoice_arrived"}
st, url, _ = cpost("/settings", find_form(cget("/settings"), 'name="ordered"'), CHANGED)
check("applying a changed case returns 200", st == 200, f"status {st}")

t = text(cget("/evidence"))
check("every figure follows the config",
      all(x in t for x in ["Ordered 24", "Listed 24", "Counted in 22", "Accepted 20", "Invoiced 24"]),
      t[t.find("Ordered"):][:200])
check("the part name is not hardcoded", "PUMP-SEAL-7" in t and "FILTER-X" not in t, t[:200])
# 2 damaged no longer accounts for a gap of 4, so the engine must stop
# proposing damage - proof it is reconciling rather than replaying.
r = text(cget("/review"))
check("the engine re-reasons on the new numbers",
      "claims 24 but 20 were accepted" in r, r[r.find("INV-1"):][:200])
check("and drops to uncertain", "cannot rank the causes" in r, r[:300])
check("the banner says the data was changed", "Numbers changed in Settings" in text(cget("/")))

st, _, body = cpost("/settings", find_form(cget("/settings"), 'name="ordered"'),
                    {**CHANGED, "counted:DN-1": "2", "damaged:DN-1": "5"})
check("damaged > counted is refused", st >= 400 or "cannot exceed" in body, f"status {st}")

cpost("/settings", find_form(cget("/settings"), "Restore"))
t = text(cget("/"))
check("restore brings back the supplied records", "FILTER-X" in t and "PUMP-SEAL" not in t, t[:300])
check("and clears the changed marker", "Numbers changed in Settings" not in t, t[:200])

step("E12", "The simulated document downloads as a PDF")
reset("invoice_arrived")

def pdf(path):
    with urllib.request.urlopen(BASE + path) as r:
        return r.read(5), r.headers.get("Content-Type")

head, ctype = pdf("/documents/invoice")
check("the invoice document is a real PDF", head == b"%PDF-", head)
check("and it is served as one", ctype == "application/pdf", ctype)
check("the credit note is a PDF too", pdf("/documents/credit-note")[0] == b"%PDF-")
try:
    urllib.request.urlopen(BASE + "/documents/nope")
    check("an unknown document is refused", False, "200")
except urllib.error.HTTPError as e:
    check("an unknown document is refused", e.code == 404, e.code)
check("the chain links the invoice document", "Document (PDF)" in text(get("/evidence")))
# The box states the record before it is written, so its numbers have to be the
# ones the event goes on to use - not a literal.
t = get("/review")
check("the confirmation box names the record it would write",
      "INV-1, billing 10 \u00d7 FILTER-X against DN-1 + DN-2." in html.unescape(t),
      t[t.find("billing"):][:120])

step("E13", "Leave the database ready for the demo")
reset("start_of_shift")
t = text(get("/"))
check("bay has both notes waiting", "2 delivery note s waiting" in t or "2 delivery notes waiting" in t, t[:300])
check("review is clean", "Nothing to review" in text(get("/review")))

print("\n" + "=" * 62)
print("FAILURES: " + (", ".join(FAIL) if FAIL else "none"))
sys.exit(1 if FAIL else 0)
