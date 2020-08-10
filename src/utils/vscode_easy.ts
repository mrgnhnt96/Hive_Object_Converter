import * as vscode from "vscode";

export function readSetting(key: string) {
    return vscode.workspace.getConfiguration().get('hive-object-converter.' + key);
}