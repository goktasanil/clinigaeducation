import test from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import {
 authorization,billingCustomer,constantTimeEqual,decimalMinor,hostedPaymentUrl,
 isolatedCheckoutBase,parseCatalog,paidPeriods,providerFormHtml,subscriptionState,verifyV3,hmacHex,
} from "../supabase/functions/_shared/iyzico-protocol.mjs";

test("HMAC follows RFC4231 and auth signs the exact path/body bytes",async()=>{
 assert.equal(await hmacHex("\x0b".repeat(20),"Hi There"),"b0344c61d8db38535ca8afceaf0bf12b881dc200c9833da726e9376c2e32cff7");
 const raw='{"plan":"basic"}',path="/v2/subscription/checkoutform/initialize";
 const result=await authorization("public-api-key","test-only-secret","random123",path,raw);
 const decoded=Buffer.from(result.slice("IYZWSv2 ".length),"base64").toString();
 const expected=createHmac("sha256","test-only-secret").update("random123"+path+raw).digest("hex");
 assert.equal(decoded,"apiKey:public-api-key&randomKey:random123&signature:"+expected);
 assert.notEqual(await authorization("public-api-key","test-only-secret","random123",path,raw+" "),result);
});
test("subscription V3 rejects altered merchant, order, customer and signatures",async()=>{
 const key="test-only-secret";
 const payload={merchantId:123,eventType:"subscription.order.success",subscriptionReferenceCode:"sub-test-123",orderReferenceCode:"order-test-123",customerReferenceCode:"customer-test-123"};
 const message="123"+key+payload.eventType+payload.subscriptionReferenceCode+payload.orderReferenceCode+payload.customerReferenceCode;
 const signature=createHmac("sha256",key).update(message).digest("hex");
 assert.equal(await verifyV3(key,"123",payload,signature),true);
 for(const field of ["merchantId","eventType","subscriptionReferenceCode","orderReferenceCode","customerReferenceCode"]){
  assert.equal(await verifyV3(key,"123",{...payload,[field]:"tampered-value"},signature),false);
 }
 assert.equal(await verifyV3(key,"123",payload,null),false);
 assert.equal(await verifyV3(key,"123",payload,"0".repeat(64)),false);
});
test("HPP V3 authenticates payment token, amount context and result fields",async()=>{
 const key="test-only-secret";
 const payload={iyziEventType:"CHECKOUT_FORM_AUTH",iyziPaymentId:12,token:"test-token-123",paymentConversationId:"checkout-123",status:"SUCCESS"};
 const signature=createHmac("sha256",key).update(key+payload.iyziEventType+payload.iyziPaymentId+payload.token+payload.paymentConversationId+payload.status).digest("hex");
 assert.equal(await verifyV3(key,"123",payload,signature),true);
 assert.equal(await verifyV3(key,"123",{...payload,token:"another-token"},signature),false);
 assert.equal(await verifyV3(key,"123",{...payload,status:"FAILURE"},signature),false);
});
test("EUR prices cannot drift and no TRY prices are invented",()=>{
 const row={plan:"basic",yearly:false,currency:"EUR",amountMinor:499,referenceCode:"plan-test-123"};
 assert.equal(parseCatalog(JSON.stringify({plans:[row]})).plans[0].amountMinor,499);
 assert.deepEqual(parseCatalog("{}"),{plans:[],packs:[]});
 assert.throws(()=>parseCatalog(JSON.stringify({plans:[{...row,amountMinor:500}]})),/EUR_PRICE_CHANGED/);
 assert.throws(()=>parseCatalog(JSON.stringify({plans:[row,row]})),/DUPLICATE_PRICE_CONFIGURATION/);
 assert.equal(parseCatalog(JSON.stringify({plans:[{...row,currency:"TRY",amountMinor:32100}]})).plans[0].amountMinor,32100);
 assert.throws(()=>decimalMinor("4.999"),/INVALID_AMOUNT/);
 assert.throws(()=>decimalMinor("-1"),/INVALID_AMOUNT/);
});
const expected={subscriptionReferenceCode:"sub-test-123",referenceCode:"plan-test-123",customerReferenceCode:"customer-test-123",currency:"EUR",amountMinor:499};
const period={referenceCode:"order-test-123",orderStatus:"SUCCESS",price:"4.99",currencyCode:"EUR",startPeriod:1700000000000,endPeriod:1702592000000,paymentAttempts:[{paymentStatus:"SUCCESS",paymentId:123}]};
const detail={referenceCode:expected.subscriptionReferenceCode,pricingPlanReferenceCode:expected.referenceCode,customerReferenceCode:expected.customerReferenceCode,orders:[period]};
test("paid-period extraction binds identity, plan, amount and actual successful payment",()=>{
 assert.equal(paidPeriods(detail,expected).length,1);
 for(const field of ["referenceCode","pricingPlanReferenceCode","customerReferenceCode"]){
  assert.throws(()=>paidPeriods({...detail,[field]:"wrong-ref"},expected),/PROVIDER_SUBSCRIPTION_MISMATCH/);
 }
 assert.throws(()=>paidPeriods({...detail,orders:[{...period,price:"5.99"}]},expected),/PROVIDER_AMOUNT_MISMATCH/);
 assert.throws(()=>paidPeriods({...detail,orders:[{...period,currencyCode:"TRY"}]},expected),/PROVIDER_AMOUNT_MISMATCH/);
 assert.deepEqual(paidPeriods({...detail,orders:[{...period,paymentAttempts:[{paymentStatus:"FAILED"}]}]},expected),[]);
 assert.deepEqual(paidPeriods({...detail,orders:[{...period,orderStatus:"WAITING"}]},expected),[]);
 assert.throws(()=>paidPeriods({...detail,orders:[{...period,endPeriod:1}]},expected),/INVALID_PAID_PERIOD/);
});
test("duplicate provider order IDs produce one entitlement candidate and unknown statuses fail closed",()=>{
 assert.equal(paidPeriods({...detail,orders:[period,period]},expected).length,1);
 assert.equal(subscriptionState("CANCELED"),"cancelled");
 assert.equal(subscriptionState("UNPAID"),"past_due");
 assert.throws(()=>subscriptionState("mystery"),/UNKNOWN_SUBSCRIPTION_STATUS/);
});
test("billing cannot be fabricated and email is always authenticated identity",()=>{
 assert.ok(billingCustomer({},"").missing.includes("identityNumber"));
 const input={name:"Synthetic",surname:"Fixture",gsmNumber:"+905000000000",identityNumber:"TEST-IDENTITY",email:"ignored@example.invalid",billingAddress:{address:"Synthetic fixture address",contactName:"Synthetic Fixture",city:"Test",country:"Test"}};
 const result=billingCustomer(input,"authenticated@example.invalid");
 assert.equal(result.customer.email,"authenticated@example.invalid");
 assert.equal(result.customer.identityNumber,"TEST-IDENTITY");
 assert.deepEqual(billingCustomer({...input,gsmNumber:"123"},"authenticated@example.invalid").missing,["gsmNumber"]);
});
test("provider redirect host and form isolation prevent URL-based redirects",()=>{
 assert.ok(hostedPaymentUrl("https://cpp.iyzipay.com/?token=fixture","live").startsWith("https://cpp.iyzipay.com/"));
 for(const bad of ["http://cpp.iyzipay.com/","https://cpp.iyzipay.com.evil.invalid/","https://attacker.invalid/","https://user:password@cpp.iyzipay.com/","https://sandbox-cpp.iyzipay.com/"]){
  assert.throws(()=>hostedPaymentUrl(bad,"live"),/INVALID_PROVIDER_CHECKOUT_URL/);
 }
 assert.throws(()=>isolatedCheckoutBase("https://project.supabase.co/functions/v1/iyzico-checkout"),/ISOLATED_HOSTED_FORM_ORIGIN_REQUIRED/);
 assert.throws(()=>isolatedCheckoutBase("https://www.clinigaeducation.com/checkout"),/ISOLATED_HOSTED_FORM_ORIGIN_REQUIRED/);
 assert.equal(constantTimeEqual("same","same"),true);
 assert.equal(constantTimeEqual("same","same-long"),false);
 assert.equal(constantTimeEqual(null,"same"),false);
});
test("documented provider snippet accepts raw or base64 response without substituting arbitrary text",()=>{
 const html="<script>var iyziInit = {token:'synthetic-test'};</script>";
 assert.equal(providerFormHtml(html),html);
 assert.equal(providerFormHtml(Buffer.from(html).toString("base64")),html);
 assert.throws(()=>providerFormHtml("<p>User-generated content is not a payment form.</p>"),/INVALID_PROVIDER_FORM/);
});
