import * as changeCase from "change-case";
import { getPackageImport } from "../utils/get-package-import";
import { getAdapter } from "../utils/get-adapter";
import { DartClass } from "../utils/dart";

export function getHiveFieldsTemplate(dartClass: DartClass): string {
  let variables: Array<String> = [];
  for (var i = 0; i < dartClass.instanceVariables.length; i++) {
    let varName = dartClass.instanceVariables[i].name;
    variables.push(`\tstatic const int ${varName} = ${i};`);
  }

  return `class ${dartClass.className}Fields {
${variables.join("\n")}
}
`;
}
