import { workspace } from "vscode";

export function getHiveHelperPath(): string | undefined {
  if (workspace.workspaceFolders && workspace.workspaceFolders.length > 0) {
    return `${workspace.workspaceFolders[0].uri.path}/lib/hive_helper`;
  }
}
