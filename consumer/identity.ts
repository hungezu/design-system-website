const record=(value:unknown):value is Record<string,unknown>=>Boolean(value)&&typeof value==='object'&&!Array.isArray(value)
/** The expected identity comes from the host project, not from the package being checked. */
export function matchesDelivery(runtimeBuildId:unknown,snapshot:unknown,expected:unknown):boolean {
 if(!record(snapshot)||!record(snapshot.entry)||!record(snapshot.assets)||!record(expected))return false
 const manifest=snapshot.assets['manifest.json']
 return record(manifest)&&typeof runtimeBuildId==='string'&&typeof expected.runtimeBuildId==='string'&&runtimeBuildId===manifest.componentRuntimeVersion&&runtimeBuildId===expected.runtimeBuildId&&snapshot.entry.version===expected.version&&snapshot.entry.checksum===expected.snapshotChecksum
}
