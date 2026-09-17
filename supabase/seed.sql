-- C04 seed. Records copied verbatim from initial.json - do not alter to make the
-- prototype look correct. Re-run this file to reset the demo to its start state.
-- Totals: 10 listed, 10 received, 9 accepted, 10 invoiced. The 1-unit gap is damage.

truncate review_decisions, proposals, credit_notes, invoice_lines, invoices, receipts, delivery_notes, orders restart identity cascade;

insert into orders (id, part, quantity) values
  ('PO-1', 'FILTER-X', 10);

insert into delivery_notes (id, order_id, part, listed_quantity) values
  ('DN-1', 'PO-1', 'FILTER-X', 8),
  ('DN-2', 'PO-1', 'FILTER-X', 2);

insert into receipts (id, delivery_note, received, damaged, accepted) values
  ('RC-1', 'DN-1', 8, 1, 7),
  ('RC-2', 'DN-2', 2, 0, 2);

insert into invoices (id, part, quantity) values
  ('INV-1', 'FILTER-X', 10);

insert into invoice_lines (invoice_id, delivery_note) values
  ('INV-1', 'DN-1'),
  ('INV-1', 'DN-2');
