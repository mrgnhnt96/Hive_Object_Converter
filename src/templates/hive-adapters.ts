import * as changeCase from "change-case";
import { getPackageImport } from "../utils/get-package-import";
import { getAdapter } from "../utils/get-adapter";
import { DartClass } from "../utils/dart";

export function getHiveAdapterTemplate(adapter: string): string {
  const casedDartClass = changeCase.camelCase(adapter);
  const hiveAdapter = `\tstatic const String ${casedDartClass} = '${adapter}Adapter';`;

  return `class HiveAdapters {
${hiveAdapter}
}
`;
}
