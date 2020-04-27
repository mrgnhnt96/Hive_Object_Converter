import * as changeCase from "change-case";
import { DartClass } from "./dart";

//todo: add visual for depricated types
export function getUpdatedHiveTypesFile(
  file: string,
  updateClass: string,
  existingClass: DartClass
): string {
  let existingVariables: Array<string> = [];

  for (var i = 0; i < existingClass.otherMethods.length; i++) {
    let varName = existingClass.otherMethods[i].name;
    let adapterName = changeCase.pascalCase(varName);
    existingVariables.push(adapterName);
  }

  if (existingVariables.indexOf(updateClass) === -1) {
    let casedUpdateClass = changeCase.camelCase(updateClass);
    existingVariables.push(casedUpdateClass);
  }

  let variables: Array<string> = [];
  for (var i = 0; i < existingVariables.length; i++) {
    let varName = existingVariables[i];
    let casedUpdateClass = changeCase.camelCase(varName);
    variables.push(`\tstatic const int ${casedUpdateClass} = ${i};`);
  }

  return `class ${existingClass.className} {
${variables.join("\n")}
}
`;
}
