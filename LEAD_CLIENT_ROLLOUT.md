# Publish after the bounded lead RPC is prepared

This frontend requires backend PR76's prepare migration
`20261108234455_prepare_public_lead_rpc.sql` on the existing Education project.
Before merging/publishing this frontend, verify its function ACL/catalog state
and that an empty invalid RPC request returns HTTP 400 without creating a lead.

Contact and quiz submissions on static hosting now call the same bounded public
RPC as the server route. The database generates the confirmation code, applies
email/global quotas and checks the requested appointment atomically. No service
credential is added to the frontend. Existing optional server email notification
remains after successful storage; static hosting gains no mail provider secret.

After this frontend's Pages deployment is successful and the public contact/quiz
pages respond normally, apply only then backend PR76's final raw-INSERT lockdown
migration `20261108234456_require_public_lead_rpc.sql` in a separate transaction.
Existing cached forms require a reload after that final cutover. Do not apply
cutover before this frontend is live. No workflow in this change applies SQL.
