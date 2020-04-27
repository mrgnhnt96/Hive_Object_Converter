import * as changeCase from "change-case";
import { DartClass } from "./dart";

//todo: add visual for depricated types
export function getUpdatedHiveFieldsFile(
  file: string,
  updateClass: DartClass,
  existingClass: DartClass
): string {
  let updateVariables: Array<string> = [];
  let existingVariables: Array<string> = [];
  let toAddVariables: Array<string> = [];

  for (var i = 0; i < existingClass.otherMethods.length; i++) {
    let varName = existingClass.otherMethods[i].name;
    existingVariables.push(varName);
  }

  for (var i = 0; i < updateClass.instanceVariables.length; i++) {
    let varName = updateClass.instanceVariables[i].name;
    updateVariables.push(varName);
  }

  for (var i = 0; i < updateVariables.length; i++) {
    if (existingVariables.indexOf(updateVariables[i]) === -1) {
      toAddVariables.push(updateVariables[i]);
    }
  }
  existingVariables.push(...toAddVariables);

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
