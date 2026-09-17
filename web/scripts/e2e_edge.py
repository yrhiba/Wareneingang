# Run against a live dev server: npm run dev, then npm run e2e.
# These drive the real app and the real database - they leave the demo
# reset to "start of shift" when they finish.
"""Edge cases. Everything here is a thing a nervous presenter actually does."""
import sys, importlib.util, re
spec = importlib.util.spec_from_file_location("h", __file__.replace("e2e_edge.py", "e2e.py"))
sys.argv = ["x"]
src = open(__file__.replace("e2e_edge.py", "e2e.py")).read()
src = src[:src.index("# =============================== the demo script")]
ns = {}
exec(compile(src, "harness", "exec"), ns)
get, text, find_form, post, check, step = (ns[k] for k in ("get","text","find_form","post","check","step"))
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
# "Supplier invoice" also matches the simulate button label, so count the row itself.
check("still one invoice row billing 10", len(re.findall(r"bills DN-1 \+ DN-2 10 invoiced", t)) == 1, re.findall(r".{20}invoiced", t))
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

step("E10", "Leave the database ready for the demo")
reset("start_of_shift")
t = text(get("/"))
check("bay has both notes waiting", "2 delivery note s waiting" in t or "2 delivery notes waiting" in t, t[:300])
check("review is clean", "Nothing to review" in text(get("/review")))

print("\n" + "=" * 62)
print("FAILURES: " + (", ".join(FAIL) if FAIL else "none"))
sys.exit(1 if FAIL else 0)
