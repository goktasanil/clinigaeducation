-- Reviews may target only the authenticated user's actual counterparty in a
-- message thread for the same listing.
begin;

drop policy if exists "portal_reviews_insert_after_interaction" on public.portal_reviews;
create policy "portal_reviews_insert_after_interaction"
  on public.portal_reviews for insert to authenticated
  with check (
    reviewer_id = (select auth.uid())
    and status = 'published'
    and exists (
      select 1
      from public.portal_messages m
      where m.listing_id = portal_reviews.listing_id
        and (
          (
            m.sender_id = (select auth.uid())
            and m.recipient_id = portal_reviews.reviewee_id
          )
          or (
            m.recipient_id = (select auth.uid())
            and m.sender_id = portal_reviews.reviewee_id
          )
        )
    )
  );

commit;

