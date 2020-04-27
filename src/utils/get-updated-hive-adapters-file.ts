import { DartClass } from "./dart";
import * as changeCase from "change-case";

//todo: add visual for depricated
export function getUpdatedHiveAdapterFile(
  file: string,
  adapter: string,
  existingClass: DartClass
): string {
  let existingVariables: Array<string> = [];

  for (var i = 0; i < existingClass.otherMethods.length; i++) {
    let varName = existingClass.otherMethods[i].name;
    let adapterName = changeCase.pascalCase(varName);
    existingVariables.push(adapterName);
  }

  if (existingVariables.indexOf(adapter) === -1) {
    existingVariables.push(adapter);
  }

  let variables: Array<string> = [];
  for (var i = 0; i < existingVariables.length; i++) {
    let varName = changeCase.camelCase(existingVariables[i]);
    variables.push(
      `\tstatic const String ${varName} = '${existingVariables[i]}Adapter';`
    );
  }

  return `class ${existingClass.className} {
${variables.join("\n")}
}
`;
}
