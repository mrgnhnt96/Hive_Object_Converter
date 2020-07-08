import { lstatSync, readFileSync } from "fs-extra";
import * as vscode from "vscode";
import { getClasses } from "../utils/dart";
import { getRootPath } from "../utils/get-root-path";
import { updateClass } from "./update-class";
import { generateHiveFieldIds } from "./generate-hive-field-ids";
import { generateHiveHelper } from "./generate-hive-helper";
import * as _ from "lodash";
import { readSetting } from "../utils/vscode_easy";

export async function convertToHive(uri: vscode.Uri) {
  const extendHiveObject: boolean = await readSetting('use_HiveObject') as boolean || true;

  let hiveObjectDirectory;
  if (_.isNil(_.get(uri, "fsPath")) || !lstatSync(uri.fsPath).isFile) {
    vscode.window.showErrorMessage(
      "Unable to convert, Please select a file *.dart to convert."
    );
    return;
  } else {
    hiveObjectDirectory = uri.fsPath;
  }

  let root = getRootPath();

  if (root && root[0] === '/') {
    root = root.slice(1);
  }

  let folder = await readSetting('folder_of_created_files') as string;
  let hiveHelperDirectory = root + "/lib/" + folder;
  if (_.isNil(hiveHelperDirectory)) {
    vscode.window.showErrorMessage(
      "Was not able to get lib directory, please try again."
    );
    return;
  }

  let classesFileContent = readFileSync(hiveObjectDirectory, "utf8").trim();
  const classes = await getClasses(classesFileContent);

  await generateHiveHelper(hiveHelperDirectory, hiveObjectDirectory, classes);
  await generateHiveFieldIds(hiveHelperDirectory, classes);

  const res = await updateClass(
    classes,
    hiveObjectDirectory,
    hiveHelperDirectory,
    extendHiveObject
  );

  if (res) {
    vscode.window.showInformationMessage(`Successfully converted class to hive for ${hiveObjectDirectory}`);
  } else {
    vscode.window.showErrorMessage(`Could not create hive class for ${hiveObjectDirectory}`);
  }
}

// function promptForExtendHiveObject(): Thenable<string | undefined> {
//   const extendHiveObjectValues: string[] = [
//     "No, Don't extend class with HiveObject",
//     "Yes, extend class with HiveObject",
//   ];
//   const extendHiveObjectOptions: QuickPickOptions = {
//     placeHolder:
//       "Do you want to use the Equatable Package in this bloc to override equality comparisons?",
//     canPickMany: false,
//   };
//   return window.showQuickPick(extendHiveObjectValues, extendHiveObjectOptions);
// }
