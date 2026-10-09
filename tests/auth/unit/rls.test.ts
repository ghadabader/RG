// ACCEPT 5: with two seeded accounts, account A can't select or update account B's profiles row.
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { anonClient, createTestUser, deleteTestUser, profileOf } from "../support";

describe("profiles row-level security (ACCEPT 5)", () => {
  let a: Awaited<ReturnType<typeof createTestUser>>;
  let b: Awaited<ReturnType<typeof createTestUser>>;
  const clientA = anonClient();

  beforeAll(async () => {
    a = await createTestUser("en");
    b = await createTestUser("ar");
    const { error } = await clientA.auth.signInWithPassword({ email: a.email, password: a.password });
    if (error) throw error;
  });

  afterAll(async () => {
    await deleteTestUser(a?.id);
    await deleteTestUser(b?.id);
  });

  it("A can read its own row", async () => {
    const { data, error } = await clientA.from("profiles").select("user_id, locale").eq("user_id", a.id);
    expect(error).toBeNull();
    expect(data).toEqual([{ user_id: a.id, locale: "en" }]);
  });

  it("A cannot select B's row", async () => {
    const { data } = await clientA.from("profiles").select("*").eq("user_id", b.id);
    expect(data ?? []).toEqual([]);
  });

  it("A cannot update B's row", async () => {
    const { data } = await clientA
      .from("profiles")
      .update({ locale: "he" })
      .eq("user_id", b.id)
      .select();
    expect(data ?? []).toEqual([]);
    expect((await profileOf(b.id))?.locale).toBe("ar");
  });

  it("anonymous visitors see no rows", async () => {
    const { data } = await anonClient().from("profiles").select("*");
    expect(data ?? []).toEqual([]);
  });
});
