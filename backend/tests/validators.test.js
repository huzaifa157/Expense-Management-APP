const { expenseSchema, expenseQuerySchema } = require("../src/validators/expense.validator");
const { registerSchema, loginSchema } = require("../src/validators/auth.validator");

describe("expenseSchema", () => {
  const valid = {
    title: "Lunch",
    amount: 12.5,
    category: "Food",
    type: "expense",
    date: "2026-01-01",
  };

  it("accepts a valid expense", () => {
    expect(expenseSchema.validate(valid).error).toBeUndefined();
  });

  it("rejects a category not in the allowed list", () => {
    const { error } = expenseSchema.validate({ ...valid, category: "NotACategory" });
    expect(error).toBeDefined();
  });

  it("rejects a negative amount", () => {
    const { error } = expenseSchema.validate({ ...valid, amount: -5 });
    expect(error).toBeDefined();
  });

  it("rejects an invalid type", () => {
    const { error } = expenseSchema.validate({ ...valid, type: "transfer" });
    expect(error).toBeDefined();
  });

  it("allows empty notes", () => {
    expect(expenseSchema.validate({ ...valid, notes: "" }).error).toBeUndefined();
  });
});

describe("expenseQuerySchema", () => {
  it("defaults page/limit/sort", () => {
    const { value, error } = expenseQuerySchema.validate({});
    expect(error).toBeUndefined();
    expect(value.page).toBe(1);
    expect(value.limit).toBe(20);
    expect(value.sort).toBe("date_desc");
  });

  it("rejects a limit above the max", () => {
    const { error } = expenseQuerySchema.validate({ limit: 1000 });
    expect(error).toBeDefined();
  });

  it("rejects an unknown category filter", () => {
    const { error } = expenseQuerySchema.validate({ category: "NotACategory" });
    expect(error).toBeDefined();
  });
});

describe("auth validators", () => {
  it("rejects a short password on register", () => {
    const { error } = registerSchema.validate({
      name: "Jane",
      email: "jane@example.com",
      password: "123",
    });
    expect(error).toBeDefined();
  });

  it("rejects a malformed email on login", () => {
    const { error } = loginSchema.validate({
      email: "not-an-email",
      password: "password123",
    });
    expect(error).toBeDefined();
  });
});
