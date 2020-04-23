export function getAdapter(adapterName: string): string {
  return `Hive.registerAdapter(${adapterName}());`;
}
