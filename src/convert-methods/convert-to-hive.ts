import { lstatSync, readFileSync } from "fs";
import { QuickPickOptions, Uri, window } from "vscode";
import { getClasses } from "../utils/dart";
import { getRootPath } from "../utils/get-root-path";
import { updateClass } from "./update-class";
import { generateHiveFieldIds } from "./generate-hive-field-ids";
import { generateHiveHelper } from "./generate-hive-helper";
import * as _ from "lodash";

export async function convertToHive(uri: Uri) {
  const extendHiveObjectResponse = await promptForExtendHiveObject();
  if (extendHiveObjectResponse === undefined) {
    return;
  }
  const extendHiveObject =
    extendHiveObjectResponse === "Yes, extend class with HiveObject";

  let hiveObjectDirectory;
  if (_.isNil(_.get(uri, "fsPath")) || !lstatSync(uri.fsPath).isFile) {
    window.showErrorMessage(
      "Unable to convert, Please select a file *.dart to convert."
    );
    return;
  } else {
    hiveObjectDirectory = uri.fsPath;
  }

  let hiveHelperDirectory = getRootPath() + "/lib/hive_helper";
  if (_.isNil(hiveHelperDirectory)) {
    window.showErrorMessage(
      "Was not able to get lib directory, please try again."
    );
    return;
  }

  let classesFileContent = readFileSync(hiveObjectDirectory, "utf8");
  const classes = await getClasses(classesFileContent);

  await generateHiveHelper(hiveHelperDirectory, hiveObjectDirectory, classes);
  await generateHiveFieldIds(hiveHelperDirectory, classes);

  await updateClass(
    classes,
    hiveObjectDirectory,
    hiveHelperDirectory,
    extendHiveObject
  );

  window.showInformationMessage(`Successfully Generated helper`);
  window.showInformationMessage(`Hello World from Hive Object Converter!`);
}

function promptForExtendHiveObject(): Thenable<string | undefined> {
  const extendHiveObjectValues: string[] = [
    "No, Don't extend class with HiveObject",
    "Yes, extend class with HiveObject",
  ];
  const extendHiveObjectOptions: QuickPickOptions = {
    placeHolder:
      "Do you want to use the Equatable Package in this bloc to override equality comparisons?",
    canPickMany: false,
  };
  return window.showQuickPick(extendHiveObjectValues, extendHiveObjectOptions);
}
