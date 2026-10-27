# Türkiye payment activation with iyzico

This adapter does not activate a merchant account, create a legal entity, submit KYC, purchase a provider subscription, install live credentials, or prove a production payment. It remains closed until the merchant and integration prerequisites below are met. Payoneer Request a Payment is not a consumer-checkout replacement; Payoneer Checkout's current public eligibility does not establish Turkish-entity eligibility.

## Source and integration boundary

The existing public site is statically hosted. API calls and payment state belong in Supabase Edge Functions. The new provider-specific functions do not replace Stripe, change Stripe identifiers, or route third-party seller payouts through the platform's membership fees.

Endpoint contract (all paths under the project's /functions/v1):

- iyzico-health: public GET, safe readiness/price metadata; no credential values.
- iyzico-commerce: POST with a valid Supabase user Bearer token. Authentication is validated server-side with auth.getUser.
- iyzico-callback: public POST form callback; posted token is re-queried with the provider and matched to the saved merchant checkout.
- iyzico-webhook: public POST; requires the provider's X-IYZ-SIGNATURE-V3 and server-to-server reconciliation.
- iyzico-checkout: retired; always HTTP410. Only the authenticated merchant JSON checkout route is supported.

Configure public callback/webhook/health functions with verify_jwt=false. iyzico-commerce performs its own user-token validation; configure it consistently with the current Supabase JWT/API-key setup. Do not deploy the retired iyzico-checkout endpoint.

## Browser integration

Default subscription initialization returns:

    {url:"https://www.clinigaeducation.com/portal/checkout?session=<checkout UUID>",provider:"iyzico",currency:"EUR"}

The merchant checkout route must authenticate the user, then call iyzico-commerce:

    {action:"checkout",orderId:"<checkout UUID>"}

Response:

    {provider:"iyzico",orderId,formContent,expiresAt,currency,amountMinor}

The backend verifies ownership, ready state and expiry. It returns only the exact provider-generated form snippet. It does not return API keys, service-role keys, billing request data, or a fabricated paymentPageUrl. Render the documented responsive checkout div and provider snippet in an isolated iframe. Do not give that iframe allow-same-origin. Restrict scripts/connect to documented iyzico/iyzipay hosts, permit provider/bank challenge frames, and validate actual sandbox operation before declaring the embedding compatible. No card number, expiry or CVC field belongs in our own React billing form.

IYZICO_CHECKOUT_BASE_URL is unsupported and ignored. Checkout always uses the exact canonical merchant route above. A separate custom-domain HTML handoff is not part of this integration.

## Inputs

Membership request:

    {
      action:"membership",plan:"basic"|"plus"|"pro",yearly:false,
      currency:"EUR"|"TRY",requestId:"<UUID>",
      billing:{
        name,surname,gsmNumber,identityNumber,
        billingAddress:{address,contactName,city,country,zipCode?}
      }
    }

Credit pack request uses action:"credits" and pack:"credits-25"|"credits-75"|"credits-200" instead of plan/yearly.

Missing billing returns HTTP422 with BILLING_DATA_REQUIRED and field names. The email is bound to the authenticated account. No fabricated national ID, phone, customer name or address is generated. Foreign-customer identification/phone acceptance must be confirmed with the merchant's provider setup.

Status: {action:"status"} returns provider and a nullable own subscription. Subscription fields are subscriptionReferenceCode, plan, status, currency, yearly, amountMinor, currentPeriodEnd, renewalsStopped. statusVerified=false means only the last server-verified database state was available.

Cancel: {action:"cancel",subscriptionReferenceCode}. Cancellation verifies ownership and current provider state, cancels further renewals, and preserves access already paid through currentPeriodEnd. Cancellation is deliberately independent of whether new checkout creation is enabled.

## Server-only configuration

- SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.
- IYZICO_ENV: live only. Sandbox/disabled modes fail closed for API calls, checkout, callbacks, webhook mutations and entitlement grants. No caller-supplied provider base URL is accepted.
- IYZICO_API_KEY, IYZICO_SECRET_KEY and IYZICO_MERCHANT_ID.
- IYZICO_MERCHANT_APPROVED=true, IYZICO_SUBSCRIPTION_ENABLED=true, IYZICO_WEBHOOK_V3_ENABLED=true.
- IYZICO_OPERATIONS_VERIFIED=true only after the lifecycle acceptance checks below.
- IYZICO_PLANS_JSON: merchant-approved fixed catalog.
- There is no sandbox checkout opt-in. IYZICO_ALLOW_SANDBOX_CHECKOUT is unsupported and ignored. Persisted checkout/subscription provider_mode is constrained to live; sandbox provider credentials must never be installed on this deployed adapter.
- Optional IYZICO_ALLOWED_ORIGINS: JSON array of exact trusted preview origins.

Catalog shape:

    {
      "plans":[
        {"plan":"basic","yearly":false,"currency":"EUR","amountMinor":499,"referenceCode":"<actual provider plan reference>"}
      ],
      "creditPacks":[
        {"pack":"credits-25","currency":"EUR","amountMinor":999}
      ]
    }

Use actual provider plan references. Existing EUR amounts are fixed and checked server-side: Basic 499/4900, Plus 899/8900, Pro 1999/19900 minor units for monthly/yearly; credit packs 999/2499/5499. The adapter will not invent TRY values or silently convert EUR. Add TRY entries only after explicit operator-approved pricing. Current provider documentation restricts foreign-currency subscription plans to non-TRY cards; displaying EUR alone does not establish domestic-card compatibility.

Every configured subscription plan is queried from iyzico and checked for matching reference, price, currency, monthly/yearly interval, interval count1, recurring payment type, active status and no trial. A configuration flag alone is insufficient to make a mismatched provider plan usable.

## State, privacy and entitlement checks

The append-only migration creates private checkout/event/period tables and owner-readable provider-neutral subscriptions. No billing identity/address fields are stored. A provider form may itself contain customer display data; this private, necessary checkout artifact is cleared on reconciliation. Configure scheduled cleanup for expired forms as part of production operations; public health never mutates checkout data.

Public readiness is cached for sixty seconds per Edge isolate, with one shared in-flight check. Provider-plan probes run concurrently. Checkout bypasses the cache and verifies the selected plan immediately before initialization.

The additional ledger migration replaces the legacy NULLS NOT DISTINCT provider-event constraint with a partial unique index for non-null provider/event pairs. Listing debits with NULL payment identifiers can therefore coexist; user/idempotency uniqueness and provider-payment replay protection remain intact.

A unique open-membership index prevents parallel signup requests with different request IDs. Unknown provider initialization outcomes require reconciliation rather than automatic retry. Confirmed provider order references, not webhook delivery IDs, determine credit idempotency. SQL transaction locks and unique ledger keys protect duplicate callback/webhook delivery.

Only a provider-confirmed successful, correctly priced payment period with a successful payment attempt creates membership credits and paid access. ACTIVE with a trial/card validation is not sufficient. No period length is guessed: startPeriod/endPeriod come from provider records. Failed renewal does not create a new paid period. Cancellation keeps paid access until its existing end, while explicit revocation removes it.

portal_current_paid_access() is an authenticated, no-argument RPC returning a nullable own entitlement: provider, plan, status:"active", current_period_end, cancel_at_period_end, provider_status, has_access:true. It merges existing valid Stripe membership and actual paid iyzico periods without writing Stripe columns. portal_has_paid_access(user UUID) permits only self or service role. Both existing paid-listing RPC membership predicates use it. Other explicit legacy subscription readers should use the new own-entitlement RPC.

## Acceptance before live enablement

1. Apply both new migrations in an isolated test database and test privilege boundaries, simultaneous duplicate deliveries, two distinct users' listing debits, and database rejection of sandbox checkout rows.
2. Run offline protocol tests, Edge type/runtime checks, and the SQL integration fixture against disposable local Supabase.
3. Exercise the provider's official sandbox SDK/examples in a separate, disposable acceptance harness with separate credentials and database. This deployed adapter deliberately rejects sandbox checkout and grants; changing a runtime opt-in cannot enable it. Verify successful and failed payment, trial rejection, wrong amount/currency/plan, duplicate request, callback lost, duplicate webhook, renewal success/failure, cancellation and expired form before recording merchant approval.
4. Verify isolated provider form rendering/3DS callbacks on desktop/mobile, actual card-data ownership, exact amounts, recurring consent and terms.
5. Verify HTTPS callback/webhook delivery with V3 signing enabled in the merchant account. Unsigned and altered events must have no financial effect.
6. Confirm refund/dispute operations with the provider. This adapter does not automatically turn an unsupported refund event into a ledger adjustment; supervised reconciliation and service-role revocation must be available before activation.
7. Configure approved live products/TRY prices where needed, prove live credentials and pricing via the server checks, and perform an operator-authorized end-to-end production acceptance payment. Do not claim live collection from a green frontend button or local test.
8. Keep failures/pending states visible. A browser redirect is not payment success.

Offline tests:

    node --test scripts/iyzico-protocol.test.mjs

Disposable database only:

    psql "$LOCAL_TEST_DATABASE_URL" -v ON_ERROR_STOP=1 -f scripts/iyzico-entitlements.integration.sql

## Official references checked 27 October 2026

- https://www.payoneer.com/checkout/
- https://payoneer.custhelp.com/app/answers/detail/a_id/12280/~/request-a-payment---information-for-receivers
- https://www.iyzico.com/isim-icin/abonelik-yontemi
- https://docs.iyzico.com/en/products/subscription/subscription-implementation/payment-plan
- https://docs.iyzico.com/en/products/subscription/subscription-implementation/subscription-transactions
- https://docs.iyzico.com/en/payment-methods/checkoutform/cf-implementation/cf-initialize
- https://docs.iyzico.com/en/payment-methods/checkoutform/cf-implementation/cf-retrieve
- https://docs.iyzico.com/en/getting-started/preliminaries/authentication/hmacsha256-auth
- https://docs.iyzico.com/ek-servisler/webhook
- https://supabase.com/docs/guides/functions/limits
