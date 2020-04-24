import * as vscode from "vscode";
import * as _ from "lodash";
import * as mkdirp from "mkdirp";

import {
  existsSync,
  lstatSync,
  writeFile,
  readFile,
  readFileSync,
  mkdir,
} from "fs";
import { getHiveHelperPath } from "./utils/get-root-path";
import { getUpdatedFile } from "./utils/get-updated-file";
import { getRegisterAdaptersTemplate } from "./templates/register-adapters";

import { getClasses } from "./utils/dart";

import {
  commands,
  ExtensionContext,
  InputBoxOptions,
  OpenDialogOptions,
  QuickPickOptions,
  Uri,
  window,
} from "vscode";

//todo: open boxes should be made an instance with "open all boxes" & "open specific box" methods
export function activate(context: vscode.ExtensionContext) {
  console.log(
    'Congratulations, your extension "hive-object-converter" is now active!'
  );

  let disposable = vscode.commands.registerCommand(
    "hive-object-converter.helloWorld",
    async (uri: Uri) => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        return; // No open text editor
      }
      const classes = await getClasses(editor);
      console.log(classes);

      const extendHiveObject =
        (await promptForExtendHiveObject()) ===
        "Yes, extend class with HiveObject";

      let hiveObjectDirectory;
      if (_.isNil(_.get(uri, "fsPath")) || !lstatSync(uri.fsPath).isFile) {
        window.showErrorMessage(
          "Unable to convert, Please select a file *.dart to convert."
        );
        return;
      } else {
        hiveObjectDirectory = uri.fsPath;
      }

      let hiveHelperDirectory = getHiveHelperPath();
      if (_.isNil(hiveHelperDirectory)) {
        window.showErrorMessage(
          "Was not able to get lib directory, please try again."
        );
        return;
      }

      await generateHiveHelper(
        hiveHelperDirectory,
        hiveObjectDirectory,
        classes[0].className
      );

      window.showInformationMessage(`Successfully Generated helper`);
      window.showInformationMessage(`Hello World from Hive Object Converter!`);
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}

function promptForExtendHiveObject(): Thenable<string | undefined> {
  const useEquatablePromptValues: string[] = [
    "No, Don't extend class with HiveObject",
    "Yes, extend class with HiveObject",
  ];
  const useEquatablePromptOptions: QuickPickOptions = {
    placeHolder:
      "Do you want to use the Equatable Package in this bloc to override equality comparisons?",
    canPickMany: false,
  };
  return window.showQuickPick(
    useEquatablePromptValues,
    useEquatablePromptOptions
  );
}

async function generateHiveHelper(
  hiveHelperDirectory: string,
  importDirectory: string,
  adapterName: string
) {
  if (!existsSync(hiveHelperDirectory)) {
    await createDirectory(hiveHelperDirectory);
  }

  await Promise.all([
    createRegisterAdapterTemplate(
      hiveHelperDirectory,
      importDirectory,
      adapterName
    ),
  ]);
}

function createDirectory(targetDirectory: string): Promise<void> {
  return new Promise((resolve, reject) => {
    mkdir(targetDirectory, (error: any) => {
      if (error) {
        return reject(error);
      }
      resolve();
    });
  });
}

function createRegisterAdapterTemplate(
  targetDirectory: string,
  importDirectory: string,
  adapterName: string
) {
  const targetPath = `${targetDirectory}/register_adapters.dart`;
  if (!existsSync(targetPath)) {
    return new Promise(async (resolve, reject) => {
      writeFile(
        targetPath,
        getRegisterAdaptersTemplate(importDirectory, adapterName),
        "utf8",
        (error) => {
          if (error) {
            reject(error);
            return;
          }
          resolve();
        }
      );
    });
  } else {
    return new Promise(async (resolve, reject) => {
      let registerAdaptersFile = readFileSync(targetPath, "utf8");

      writeFile(
        targetPath,
        getUpdatedFile(registerAdaptersFile, importDirectory, adapterName),
        "utf8",
        (error) => {
          if (error) {
            reject(error);
            return;
          }
          resolve();
        }
      );
    });
  }
}

//   const adapterName = await promptForBlocName();
//   if (
//     adapterName?.length === 0 ||
//     adapterName?.trim() === "" ||
//     _.isNil(adapterName)
//   ) {
//     window.showErrorMessage("The bloc name must not be empty");
//     return;
//   }

// function promptForBlocName(): Thenable<string | undefined> {
//   const blocNamePromptOptions: InputBoxOptions = {
//     prompt: "Bloc Name",
//     placeHolder: "counter",
//   };
//   return window.showInputBox(blocNamePromptOptions);
// }

// async function promptForTargetDirectory(): Promise<string | undefined> {
//   const options: OpenDialogOptions = {
//     canSelectMany: false,
//     openLabel: "Select a folder to create the bloc in",
//     canSelectFolders: true,
//   };

//   return window.showOpenDialog(options).then((uri) => {
//     if (_.isNil(uri) || _.isEmpty(uri)) {
//       return undefined;
//     }
//     return uri[0].fsPath;
//   });
// }
