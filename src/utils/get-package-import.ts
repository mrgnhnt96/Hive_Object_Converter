import { workspace } from "vscode";

export function getPackageImport(importDirectory: string): string {
  let projectName;
  if (workspace.workspaceFolders && workspace.workspaceFolders.length > 0) {
    projectName = workspace.workspaceFolders[0].name;
  } else {
    // todo: get relative location
    projectName = "";
  }

  let splitImportDirectory = importDirectory.split("/lib/");
  let formattedDirectory =
    splitImportDirectory[splitImportDirectory.length - 1];

  return `import 'package:${projectName}/${formattedDirectory}';`;
}
