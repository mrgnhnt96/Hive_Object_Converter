import { readdir } from "fs-extra";
import * as vscode from "vscode";
import { Uri } from "vscode";
import { convertToHive } from "./convert-methods/convert-to-hive";
import { readSetting } from "./utils/vscode_easy";
import path = require("path");

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
      "hive-object-converter.convert_to_hive_models",
      (uri: Uri) => {
        readdir(uri.fsPath, async (err, files: string[]) => {
          const shouldInclude = (await readSetting(
            "useOnlyEnhancedFile"
          )) as boolean;
          const shouldIncludeName = (await readSetting(
            "useEnhancedFileName"
          )) as string;

          for (var file of files) {
            if (shouldInclude && !file.includes(shouldIncludeName)) {
              vscode.window.showWarningMessage("Skip file: " + file);
              continue;
            }

            // skip!! generated files
            if (file.includes(".g.")) {
              continue;
            }

            const p = path.join(uri.fsPath, file);
            const u = vscode.Uri.file(p);

            await convertToHive(u);
          }
        });
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
