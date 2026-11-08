# Admin report policy regression

Run from the repository root:

```sh
npm ci --prefix supabase/tests
npm --prefix supabase/tests test
```

The isolated PGlite fixture uses synthetic rows and the live/source policy and
function ACL pattern. Before applying the actual append-only migration, an
authenticated administrator's four report reads fail with SQLSTATE 42501 because
has_role execution was revoked. After the migration, administrators can read the
reports while non-admin, anonymous and missing-subject contexts cannot.

Tests also verify own-role privacy, rejection of self-admin writes, exact
preservation of has_role/get_booked_slots bodies and ACLs, unchanged owner/service
function behavior, and that only the four intended policy expressions change.

This test package does not connect to Supabase or require credentials, accounts,
Docker, production rows, environment files or a payment provider.
