import * as changeCase from "change-case";

export function getHiveTypesTemplate(type: string): string {
  const casedType = changeCase.camelCase(type);
  const hiveType = `\tstatic const int ${casedType} = ${0};`;

  return `class HiveTypes {
${hiveType}
}
`;
}
