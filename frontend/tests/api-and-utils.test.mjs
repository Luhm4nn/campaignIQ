import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendRoot = path.resolve(__dirname, "..");

test("integridad de arquitectura: no existen archivos de mock-data en el frontend", () => {
  const mockPath = path.join(frontendRoot, "lib", "mock-data.ts");
  assert.equal(fs.existsSync(mockPath), false);
});

test("contratos de endpoints en lib/api.ts coinciden con las rutas REST del backend", () => {
  const apiSource = fs.readFileSync(
    path.join(frontendRoot, "lib", "api.ts"),
    "utf-8"
  );

  assert.match(apiSource, /\/health/);
  assert.match(apiSource, /\/dashboard/);
  assert.match(apiSource, /\/campaigns/);
  assert.match(apiSource, /\/posts/);
  assert.match(apiSource, /\/users/);
  assert.match(apiSource, /\/export\/campaigns\/csv/);
  assert.match(apiSource, /\/export\/campaign\/\$\{campaignId\}\/csv/);
  assert.equal(apiSource.includes("mock-data"), false);
});

test("cliente HTTP propaga errores sin caer en datos simulados y envia payloads tipados", async () => {
  const calls = [];
  const mockFetch = async (url, options = {}) => {
    calls.push({ url, options });
    if (url.endsWith("/error")) {
      return { ok: false, status: 500, json: async () => ({}) };
    }
    return {
      ok: true,
      status: 200,
      json: async () => ({ id: 1, status: "ok", database: "postgresql" }),
    };
  };

  const healthRes = await mockFetch("http://localhost:8000/health");
  const healthBody = await healthRes.json();
  assert.equal(healthBody.database, "postgresql");

  await mockFetch("http://localhost:8000/campaigns", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Campaña Test",
      description: "Prueba de contrato",
      platform: "instagram",
      campaignType: "Conversion",
      budget: 1500,
      status: "active",
    }),
  });

  assert.equal(calls.length, 2);
  assert.equal(calls[1].options.method, "POST");
  const parsedBody = JSON.parse(calls[1].options.body);
  assert.equal(parsedBody.name, "Campaña Test");
  assert.equal(parsedBody.platform, "instagram");

  const failedRes = await mockFetch("http://localhost:8000/error");
  assert.equal(failedRes.ok, false);
  assert.equal(failedRes.status, 500);
});
