export function getAdapter(className: string): string {
  return `Hive.registerAdapter(${className}Adapter());`.trim();
}
