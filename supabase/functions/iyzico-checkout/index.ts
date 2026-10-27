// Retired optional HTML endpoint. Merchant checkout uses authenticated JSON only.
Deno.serve(() => new Response("Checkout route unavailable", { status: 410, headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } }));
