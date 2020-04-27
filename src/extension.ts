import * as vscode from "vscode";
import { Uri } from "vscode";
import { convertToHive } from "./convert-methods/convert-to-hive";
import { exec } from "child_process";
import { getRootPath } from "./utils/get-root-path";

//todo: open boxes should be made an instance with "open all boxes" & "open specific box" methods
export function activate(context: vscode.ExtensionContext) {
  console.log(
    'Congratulations, your extension "hive-object-converter" is now active!'
  );

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
        let rootPath = getRootPath();
        rootPath = rootPath?.split(" ").join("\\ ");
        // const output = vscode.window.createOutputChannel("gen_hive_files");
        // output.show(false);

        // exec(
        //   `cd ${rootPath} && flutter packages pub run build_runner build --delete-conflicting-outputs`,

        //   (error, stdout, stderr) => {
        //     if (error) {
        //       output.append(`${error.message}`);
        //       console.error(`exec error: ${error}`);
        //       return;
        //     }
        //     output.append(stdout);
        //     output.append(stderr);
        //     output.append("complete");
        //     console.log(`stdout: ${stdout}`);
        //     console.error(`stderr: ${stderr}`);
        //   }
        // );
        let terminal: vscode.Terminal;
        if (vscode.window.terminals.length > 0) {
          terminal = vscode.window.terminals[0];
        } else {
          terminal = vscode.window.createTerminal("hive.g.files");
        }
        terminal.show(false);
        terminal.sendText(
          `cd ${rootPath} && flutter packages pub run build_runner build --delete-conflicting-outputs`
        );
        vscode.window.showInformationMessage(
          "Started get hive generated files"
        );
      }
    )
  );
}

export function deactivate() {}
