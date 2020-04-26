import * as changeCase from "change-case";
import { getPackageImport } from "../utils/get-package-import";
import { getAdapter } from "../utils/get-adapter";
import { DartClass } from "../utils/dart";

export function getHiveTypesTemplate(type: string): string {
  const casedType = changeCase.camelCase(type);
  const hiveType = `\tfinal int ${casedType} = ${0};`;

  return `class HiveTypes {
${hiveType}
}
`;
}
