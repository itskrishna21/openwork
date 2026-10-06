/**
 * Organization metadata keys that only platform administration may write.
 * Every `metadata.capabilities` key is a platform-admin grant, so the whole
 * object is reserved except the retired `gatewayDashboard` flag, which older
 * clients may still send and is silently dropped.
 */
export const RESERVED_ORGANIZATION_METADATA_KEYS = [
  "dpaSigned",
  "plan",
  "limits",
  "seatsFreeAdditional",
  "inference",
  "inferenceFree",
] as const

const DROPPED_CAPABILITY_KEYS: readonly string[] = ["gatewayDashboard"]

export type OrganizationCreateMetadataCheck =
  | { ok: true; metadata: Record<string, unknown> | null }
  | { ok: false; reservedKey: string }

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

/**
 * Rejects platform-admin-only metadata on organization creation. Returns the
 * metadata to store when keys had to be dropped, or null when it is unchanged.
 */
export function checkOrganizationCreateMetadata(metadata: Record<string, unknown>): OrganizationCreateMetadataCheck {
  for (const key of RESERVED_ORGANIZATION_METADATA_KEYS) {
    if (key in metadata) {
      return { ok: false, reservedKey: key }
    }
  }

  if (!("capabilities" in metadata)) {
    return { ok: true, metadata: null }
  }

  const capabilities = metadata.capabilities
  if (!isRecord(capabilities)) {
    return { ok: false, reservedKey: "capabilities" }
  }

  const reservedCapability = Object.keys(capabilities).find((key) => !DROPPED_CAPABILITY_KEYS.includes(key))
  if (reservedCapability) {
    return { ok: false, reservedKey: `capabilities.${reservedCapability}` }
  }

  if (Object.keys(capabilities).length === 0) {
    return { ok: true, metadata: null }
  }

  const retainedCapabilities = Object.fromEntries(
    Object.entries(capabilities).filter(([key]) => !DROPPED_CAPABILITY_KEYS.includes(key)),
  )
  return { ok: true, metadata: { ...metadata, capabilities: retainedCapabilities } }
}
