import * as vscode from "vscode";
import { Uri } from "vscode";
import { convertToHive } from "./convert-methods/convert-to-hive";
import { exec } from "child_process";
import { getRootPath } from "./utils/get-root-path";

//todo: open boxes should be made an instance with "open all boxes" & "open specific box" methods
export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "hive-object-converter.convert_to_hive",
      (uri: Uri) => {
        convertToHive(uri);
      }
    )
  );
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "hive-object-converter.get_generated_files",
      () => {
        let terminal: vscode.Terminal;
        if (vscode.window.terminals.length > 0) {
          terminal = vscode.window.terminals[0];
        } else {
          terminal = vscode.window.createTerminal("hive.g.files");
        }
        terminal.show(false);
        terminal.sendText(
          `flutter packages pub run build_runner build --delete-conflicting-outputs`
        );
        vscode.window.showInformationMessage(
          "Started get hive generated files"
        );
      }
    )
  );
}

export function deactivate() {}
