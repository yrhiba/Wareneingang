# Run against a live dev server: npm run dev, then npm run e2e.
# These drive the real app and the real database - they leave the demo
# reset to "start of shift" when they finish.
#
# Point them at a deployment to verify one: C04_BASE=https://... npm run e2e.
# Same database either way, so run it when nobody is mid-demo.
"""Drives the real app over HTTP the way a browser with JS disabled would:
Next renders each server action's id as a hidden $ACTION_ID_* field, so posting
the form executes the action for real. No mocking anywhere."""
import html, os, re, sys, urllib.request, urllib.error, uuid

BASE = os.environ.get("C04_BASE", "http://localhost:3000").rstrip("/")
FAIL = []

def get(path):
    with urllib.request.urlopen(BASE + path) as r:
        return r.read().decode()

def text(h):
    h = re.sub(r"<script.*?</script>", " ", h, flags=re.S)
    h = re.sub(r"<style.*?</style>", " ", h, flags=re.S)
    # A closed <dialog> renders nothing on the page. The confirmation boxes name
    # the same records the chain does, so leaving them in would count every id
    # twice. The forms inside them are untouched: find_form reads the raw HTML.
    h = re.sub(r"<dialog\b.*?</dialog>", " ", h, flags=re.S)
    return re.sub(r"[ \t\n]+", " ", html.unescape(re.sub(r"<[^>]+>", " ", h))).strip()

def forms(h):
    return re.findall(r"<form\b.*?</form>", h, flags=re.S)

def find_form(h, must_contain):
    for f in forms(h):
        if must_contain in f:
            return f
    raise AssertionError(f"no form containing {must_contain!r}")

def fields(form):
    out = {}
    for m in re.finditer(r"<input\b([^>]*)>", form):
        a = m.group(1)
        n = re.search(r'name="([^"]*)"', a)
        v = re.search(r'value="([^"]*)"', a)
        if n:
            out[html.unescape(n.group(1))] = html.unescape(v.group(1)) if v else ""
    return out

def post(path, form, overrides=None):
    data = fields(form)
    data.update(overrides or {})
    b = uuid.uuid4().hex
    body = b"".join(
        f'--{b}\r\nContent-Disposition: form-data; name="{k}"\r\n\r\n{v}\r\n'.encode()
        for k, v in data.items()
    ) + f"--{b}--\r\n".encode()
    req = urllib.request.Request(
        BASE + path, data=body,
        headers={"Content-Type": f"multipart/form-data; boundary={b}"}, method="POST")
    try:
        with urllib.request.urlopen(req) as r:
            return r.status, r.geturl(), r.read().decode()
    except urllib.error.HTTPError as e:
        return e.code, BASE + path, e.read().decode()

def check(label, cond, detail=""):
    print(("  PASS  " if cond else "  FAIL  ") + label + (f"   [{detail}]" if detail and not cond else ""))
    if not cond:
        FAIL.append(label)

def step(n, s):
    print(f"\n--- {n}. {s}")

# =============================== the demo script ===========================
step(1, "Reset - start of shift")
st, url, body = post("/review", find_form(get("/review"), "start_of_shift"))
check("reset returns 200", st == 200, f"status {st}")
t = text(get("/"))
check("two notes waiting at the bay", "2 delivery note s waiting" in t or "2 delivery notes waiting" in t, t[:300])
check("no invoice yet", "Invoiced" not in text(get("/evidence")) or "no invoice" in text(get("/evidence")))
check("review is empty and says why", "Nothing to review" in text(get("/review")))

step(2, "Count in DN-1: counted 8, damaged 1")
st, url, body = post("/", find_form(get("/"), 'value="DN-1"'), {"received": "8", "damaged": "1"})
check("capture returns 200", st == 200, f"status {st}")
t = text(get("/"))
check("RC-1 recorded 8/1/7", "RC-1" in t and "counted 8 damaged 1 accepted 7" in t, t[t.find("Recorded"):][:120])
check("DN-2 still waiting", "1 delivery note waiting" in t, t[:160])

step(3, "Count in DN-2: counted 2, damaged 0")
st, url, body = post("/", find_form(get("/"), 'value="DN-2"'), {"received": "2", "damaged": "0"})
check("redirected to the evidence screen", url.endswith("/evidence"), url)
t = text(get("/evidence"))
check("accepted is 9", "Accepted 9" in t, t[t.find("Ordered"):][:140])
check("bay is now empty", "Nothing waiting at the bay" in text(get("/")))
check("still nothing to review before the invoice", "Nothing to review" in text(get("/review")))

step(4, "Simulated event: supplier invoice arrives")
st, url, body = post("/review", find_form(get("/review"), "invoice_arrives"))
check("redirected to review", url.endswith("/review"), url)
t = text(get("/review"))
check("proposals are waiting", t.count("Waiting for a decision") == 2, f"found {t.count(chr(34))} / {t[:200]}")
check("both the invoice gap and the split-delivery question are raised", "difference of 1" in t and "delivery notes reference PO-1" in t, t[:300])
check("leading cause is Damage", "Damage" in t)
check("alternatives still open", all(c in t for c in ["Shortage", "Duplicate scan", "Second delivery"]))
check("evidence ids shown", "INV-1" in t and "RC-1" in t)
check("proposes a credit note", "credit note" in t.lower())
check("no second prompt needed", "not yet raised" not in t)

step(5, "Reviewer corrects the cause")
f = find_form(get("/review"), "proposal_id")
st, url, body = post("/review", f, {"decision": "corrected", "cause": "shortage",
                                    "reviewer": "Test lead", "note": "supplier confirmed"})
check("correction returns 200", st == 200, f"status {st}")
t = text(get("/review"))
check("history shows Corrected by reviewer", "Corrected by reviewer" in t, t[:300])
check("records the reviewer's cause, not the proposed one", "Recorded as Shortage" in t)
check("keeps the reviewer's note", "supplier confirmed" in t)
check("action labelled not sent", "Not sent" in t)

step(6, "Simulated event: supplier issues a credit note")
st, url, body = post("/review", find_form(get("/review"), "credit_note"))
check("credit note returns 200", st == 200, f"status {st}")
t = text(get("/evidence"))
check("evidence shows reconciled", "Reconciled" in t, t[:200])
check("credit note is on the chain and labelled", "CN-" in t and "Simulated" in t)
check("invoiced net drops to 9", "Invoiced net 9" in t, t[t.find("Ordered"):][:180])

print("\n" + "=" * 62)
print("FAILURES: " + (", ".join(FAIL) if FAIL else "none"))
sys.exit(1 if FAIL else 0)
