-- Optional hardening for a database created before this rule existed.
-- The app already refuses a second receipt against the same delivery note; this
-- moves the same guarantee into Postgres. Safe to skip for the exercise, and it
-- will fail loudly if duplicates already exist - clean them up first.

alter table receipts
  add constraint receipts_one_per_note unique (delivery_note);
