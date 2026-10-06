import { test } from "@openwork/testkit";
import { expect } from "vitest";
import { checkOrganizationCreateMetadata } from "../../ee/apps/den-api/src/organization-reserved-metadata";

test("organization creation cannot grant platform-admin capabilities or entitlements", () => {
  for (const key of ["orgManagedDashboards", "modelsAnalytics", "appMcpServers", "auditLogs", "workbot", "installLinks", "futureCapability"]) {
    expect(checkOrganizationCreateMetadata({ capabilities: { [key]: true } })).toEqual({ ok: false, reservedKey: `capabilities.${key}` });
  }
  for (const key of ["dpaSigned", "plan", "limits", "seatsFreeAdditional", "inference", "inferenceFree"]) {
    expect(checkOrganizationCreateMetadata({ [key]: true })).toEqual({ ok: false, reservedKey: key });
  }
  expect(checkOrganizationCreateMetadata({ capabilities: "orgManagedDashboards" })).toEqual({ ok: false, reservedKey: "capabilities" });
});

test("organization creation keeps ordinary metadata and drops the retired gatewayDashboard flag", () => {
  expect(checkOrganizationCreateMetadata({})).toEqual({ ok: true, metadata: null });
  expect(checkOrganizationCreateMetadata({ brandAppName: "Example Workspace" })).toEqual({ ok: true, metadata: null });
  expect(checkOrganizationCreateMetadata({ capabilities: {} })).toEqual({ ok: true, metadata: null });
  expect(checkOrganizationCreateMetadata({ brandAppName: "Example Workspace", capabilities: { gatewayDashboard: true } })).toEqual({
    ok: true,
    metadata: { brandAppName: "Example Workspace", capabilities: {} },
  });
});
