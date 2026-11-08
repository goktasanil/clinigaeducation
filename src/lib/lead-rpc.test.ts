import { describe, expect, it, vi } from "vitest";
import { submitLeadWithRpc, type LeadInput } from "./lead-rpc";

const input: LeadInput = {
  name: "Synthetic Applicant",
  email: "applicant@example.invalid",
  phone: "+12025550123",
  message: "Synthetic fixture for consultation.",
  startedAt: 1700000000000,
  honeypot: "",
};
const receipt = { confirmation_code: "CG-A1B2C3D4", appointment_at: null };

describe("public lead RPC adapter", () => {
  it("sends only the narrow payload and returns the server receipt", async () => {
    const rpc = vi.fn().mockResolvedValue({ data: [receipt], error: null });
    const contaminated = {
      ...input,
      status: "won",
      user_id: "forged",
      confirmation_code: "forged",
    };
    expect(await submitLeadWithRpc(rpc, contaminated)).toEqual({
      ok: true,
      confirmationCode: receipt.confirmation_code,
      appointmentAt: null,
    });
    expect(rpc).toHaveBeenCalledOnce();
    const [name, args] = rpc.mock.calls[0];
    expect(name).toBe("submit_education_lead");
    expect(Object.keys(args)).toEqual(["p_payload"]);
    expect(args.p_payload).toMatchObject({ ...input, source: "contact_form" });
    expect(args.p_payload).not.toHaveProperty("status");
    expect(args.p_payload).not.toHaveProperty("user_id");
    expect(args.p_payload).not.toHaveProperty("confirmation_code");
  });

  it("preserves bounded quiz answers without forwarding nested unknown fields", async () => {
    const rpc = vi.fn().mockResolvedValue({ data: [receipt], error: null });
    const answer = {
      step: 0,
      question: "Synthetic question",
      answer: "Synthetic answer",
      admin: true,
    };
    await submitLeadWithRpc(rpc, { ...input, source: "quiz", quizAnswers: [answer] });
    expect(rpc.mock.calls[0][1].p_payload.source).toBe("quiz");
    expect(rpc.mock.calls[0][1].p_payload.quizAnswers[0]).toMatchObject({
      step: 0,
      question: answer.question,
    });
    expect(rpc.mock.calls[0][1].p_payload.quizAnswers[0]).not.toHaveProperty("admin");
  });

  it.each([
    ["PT400", "invalid_request"],
    ["PT429", "rate_limited"],
    ["PT409", "slot_taken"],
    ["PT503", "insert_failed"],
    ["42501", "insert_failed"],
  ])("maps %s to a generic result without exposing backend details", async (code, error) => {
    const rpc = vi
      .fn()
      .mockResolvedValue({ data: null, error: { code, message: input.email, details: "private" } });
    const result = await submitLeadWithRpc(rpc, input);
    expect(result).toEqual({ ok: false, error });
    expect(JSON.stringify(result)).not.toContain(input.email);
  });

  it.each([
    null,
    [],
    [receipt, receipt],
    [{ confirmation_code: "forged", appointment_at: null }],
    [{ ...receipt, appointment_at: "invalid" }],
    [{}],
  ])("rejects malformed or missing receipts %#", async (data) => {
    expect(await submitLeadWithRpc(async () => ({ data, error: null }), input)).toEqual({
      ok: false,
      error: "insert_failed",
    });
  });

  it("preserves the server-confirmed appointment", async () => {
    const appointment_at = "2030-01-02T12:00:00+00:00";
    expect(
      await submitLeadWithRpc(
        async () => ({ data: [{ ...receipt, appointment_at }], error: null }),
        input,
      ),
    ).toEqual({
      ok: true,
      confirmationCode: receipt.confirmation_code,
      appointmentAt: appointment_at,
    });
  });

  it("turns network exceptions into generic failure without logging submitted data", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(
      await submitLeadWithRpc(async () => {
        throw new Error(input.email);
      }, input),
    ).toEqual({ ok: false, error: "insert_failed" });
    expect(log).not.toHaveBeenCalled();
    log.mockRestore();
  });
});
