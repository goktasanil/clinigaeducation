# Recommended Stripe Connect integration plan

## Business model

CliniGA Education operates a marketplace where verified students, landlords, dormitories and service providers publish paid listings, and students can purchase eligible goods or services. CliniGA also sells its own portal memberships and prepaid listing credits.

## Payment flows

1. CliniGA memberships and credit packs use Stripe Billing and hosted Checkout on the platform account.
2. Eligible marketplace listings use destination charges. Checkout runs under CliniGA, a 5% platform margin plus a configurable processing-cost reserve is retained, and the remainder is transferred automatically to one verified connected account.

## Connected-account configuration

- Dashboard: Express.
- Onboarding: Stripe-hosted Account Links, with eventual requirements collected up front.
- Fee collection: CliniGA manages pricing (`fees_collector: application`).
- Negative balance liability: CliniGA (`losses_collector: application`).
- Account configuration: recipient with Stripe transfers requested.
- Initial transaction availability: Stripe-supported countries, starting with Italy and the EEA.

## Risk and operations

- CliniGA is the merchant of record for destination charges.
- Radar defaults and dynamic payment methods are used; payment method types are not hardcoded.
- CliniGA handles refunds, disputes and transfer reversals through signed, idempotent webhooks.
- Express users can see payouts, but CliniGA owns destination-charge refund and dispute operations.
- Marketplace margin reports must be monitored in Stripe Dashboard.

## Tax

Stripe Tax remains disabled until CliniGA confirms active registrations in the relevant jurisdictions. Billing and marketplace tax obligations must be reviewed before expanding transaction payments beyond the initial supported region.

## Required production configuration

- Restricted Stripe API key with minimum Checkout, Billing, Accounts v2, Account Links, Transfers and refund permissions.
- Webhook signing secret.
- Separate live Price IDs for Basic, Plus and Pro monthly/yearly memberships and the three credit packs.
- Connect platform profile acknowledgement for platform-owned negative balances.
- Production webhook endpoint: `https://www.clinigaeducation.com/api/stripe-webhook`.
