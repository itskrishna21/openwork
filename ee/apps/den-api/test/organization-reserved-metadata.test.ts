import assert from "node:assert/strict"
import { test } from "node:test"
import { checkOrganizationCreateMetadata } from "../src/organization-reserved-metadata.js"

test("organization creation cannot grant platform-admin capabilities or entitlements", () => {
  for (const key of ["orgManagedDashboards", "modelsAnalytics", "appMcpServers", "auditLogs", "workbot", "installLinks", "futureCapability"]) {
    assert.deepEqual(checkOrganizationCreateMetadata({ capabilities: { [key]: true } }), { ok: false, reservedKey: `capabilities.${key}` })
  }
  for (const key of ["dpaSigned", "plan", "limits", "seatsFreeAdditional", "inference", "inferenceFree"]) {
    assert.deepEqual(checkOrganizationCreateMetadata({ [key]: true }), { ok: false, reservedKey: key })
  }
  assert.deepEqual(checkOrganizationCreateMetadata({ capabilities: "orgManagedDashboards" }), { ok: false, reservedKey: "capabilities" })
})

test("organization creation keeps ordinary metadata and drops the retired gatewayDashboard flag", () => {
  assert.deepEqual(checkOrganizationCreateMetadata({}), { ok: true, metadata: null })
  assert.deepEqual(checkOrganizationCreateMetadata({ brandAppName: "Example Workspace" }), { ok: true, metadata: null })
  assert.deepEqual(checkOrganizationCreateMetadata({ capabilities: {} }), { ok: true, metadata: null })
  assert.deepEqual(checkOrganizationCreateMetadata({ brandAppName: "Example Workspace", capabilities: { gatewayDashboard: true } }), {
    ok: true,
    metadata: { brandAppName: "Example Workspace", capabilities: {} },
  })
})
