const request = require("supertest");
const app = require("../src/app");

describe("GET /", () => {
  it("returns the health check message", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe("protected expense routes", () => {
  it("rejects requests with no token", async () => {
    const res = await request(app).get("/api/expenses");
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("rejects requests with a malformed token", async () => {
    const res = await request(app)
      .get("/api/expenses")
      .set("Authorization", "Bearer not-a-real-token");
    expect(res.status).toBe(401);
  });
});

describe("auth rate limiting", () => {
  it("locks out after repeated invalid login attempts", async () => {
    let lastStatus;

    for (let i = 0; i < 11; i += 1) {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "nouser@example.com", password: "wrongpassword" });
      lastStatus = res.status;
    }

    expect(lastStatus).toBe(429);
  });
});
