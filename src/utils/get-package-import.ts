import { workspace } from "vscode";
import * as path from 'path';


export function getPackageImport(importDirectory: string): string {
  let projectName;
  let formattedDirectory;

  if (workspace.workspaceFolders && workspace.workspaceFolders.length > 0) {
    projectName = workspace.workspaceFolders[0].name;
    let pp = workspace.workspaceFolders[0].uri.path.substr(1);

    const pn = path.normalize(pp);
    const pn2 = path.normalize(importDirectory);
    formattedDirectory = path.relative(pn, pn2);
    formattedDirectory = formattedDirectory.replace(/\\/g, "/");
    formattedDirectory = formattedDirectory.replace(/lib\//g, "");

  } else {
    // todo: get relative location
    projectName = "";
  }

  return `import 'package:${projectName}/${formattedDirectory}';`;
}
