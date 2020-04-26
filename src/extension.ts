import * as changeCase from "change-case";
import { existsSync, lstatSync, mkdir, readFileSync, writeFile } from "fs";
import * as _ from "lodash";
import * as vscode from "vscode";
import { QuickPickOptions, Uri, window } from "vscode";
import { getRegisterAdaptersTemplate } from "./templates/register-adapters";
import { DartClass, EntityType, getClasses } from "./utils/dart";
import { getHiveHelperPath } from "./utils/get-root-path";
import { getUpdatedAdapterFile } from "./utils/get-updated-adapter-file";
import { getHiveFieldsTemplate } from "./templates/hive-fields";
import { getUpdatedHiveFieldsFile } from "./utils/get-updated-hive-fields-file";
import { createDirectory } from "./utils/create-directory";
import { getPackageImport } from "./utils/get-package-import";
import { getHiveTypesTemplate } from "./templates/hive-types";
import { getUpdatedHiveTypesFile } from "./utils/get-updated-hive-types-file";
import { getUpdatedHiveAdapterFile } from "./utils/get-updated-hive-adapters-file";
import { getHiveAdapterTemplate } from "./templates/hive-adapters";

//todo: open boxes should be made an instance with "open all boxes" & "open specific box" methods
export function activate(context: vscode.ExtensionContext) {
  console.log(
    'Congratulations, your extension "hive-object-converter" is now active!'
  );
  //TODO: CREATE FILE ACCORDING TO HIVE OBJECT AND STORE ALL HIVE FIELD #'s
  //TODO: CREATE FILE OF TYPE ID's
  let disposable = vscode.commands.registerCommand(
    "hive-object-converter.helloWorld",
    async (uri: Uri) => {
      // const editor = vscode.window.activeTextEditor;
      // if (!editor) {
      //   return; // No open text editor
      // }

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

      let hiveHelperDirectory = getHiveHelperPath();
      if (_.isNil(hiveHelperDirectory)) {
        window.showErrorMessage(
          "Was not able to get lib directory, please try again."
        );
        return;
      }

      let classesFileContent = readFileSync(hiveObjectDirectory, "utf8");
      const classes = await getClasses(classesFileContent);
      console.log(classes);

      await generateHiveHelper(
        hiveHelperDirectory,
        hiveObjectDirectory,
        classes
      );
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
  );

  context.subscriptions.push(disposable);
}

async function updateClass(
  classes: Array<DartClass>,
  targetPath: string,
  hiveHelperDirectory: string,
  extendHiveObject: boolean
) {
  let fileContents = "";
  let originalFile = classes[0].fileContents;
  const hiveImport = "import 'package:hive/hive.dart';\n";

  for (let i = 0; i < classes.length; i++) {
    const hiveClass = classes[i];
    let convertedClass: Array<string> = [];
    let imports: string = "";
    let classSnakeCasedName = changeCase.snakeCase(hiveClass.className);
    let classCamelCasedName = changeCase.camelCase(hiveClass.className);

    if (
      originalFile.indexOf(hiveImport) < 0 &&
      fileContents.indexOf(hiveImport) < 0 &&
      imports.indexOf(hiveImport) < 0
    ) {
      imports += hiveImport;
    }

    //get hive type string
    const hiveTypesPath = `${hiveHelperDirectory}/hive_types.dart`;
    const hiveTypesImportString = `${getPackageImport(hiveTypesPath)}\n`;

    const hiveTypeString = `@HiveType(typeId: HiveTypes.${classCamelCasedName}, adapterName: HiveAdapters.${classCamelCasedName})\n`;

    //get hive type string
    const hiveAdapterPath = `${hiveHelperDirectory}/hive_adapters.dart`;
    const hiveAdapterImportString = `${getPackageImport(hiveTypesPath)}\n`;

    //get file name
    const targetPathSplit = targetPath.split("/");
    const targetFileName = targetPathSplit[
      targetPathSplit.length - 1
    ].substring(0, targetPathSplit[targetPathSplit.length - 1].length - 5);

    const hivePartString = `part '${targetFileName}.g.dart';`;

    // setting hive type
    let dataToSet: string;
    if (!existsSync(hiveTypesPath)) {
      dataToSet = getHiveTypesTemplate(hiveClass.className);
      await setFileData(hiveTypesPath, dataToSet);
    } else {
      let hiveTypesFile = readFileSync(hiveTypesPath, "utf8");
      const existingHiveClass = await getClasses(hiveTypesFile);

      dataToSet = getUpdatedHiveTypesFile(
        hiveTypesFile,
        hiveClass.className,
        // there will always only be one
        existingHiveClass[0]
      );

      await setFileData(hiveTypesPath, dataToSet);
    }

    //setting hive adapters
    dataToSet = "";
    if (!existsSync(hiveAdapterPath)) {
      dataToSet = getHiveAdapterTemplate(hiveClass.className);
      await setFileData(hiveAdapterPath, dataToSet);
    } else {
      let hiveAdapterFile = readFileSync(hiveAdapterPath, "utf8");
      const existingHiveClass = await getClasses(hiveAdapterFile);

      dataToSet = getUpdatedHiveAdapterFile(
        hiveAdapterFile,
        hiveClass.className,
        // there will always only be one
        existingHiveClass[0]
      );

      await setFileData(hiveAdapterPath, dataToSet);
    }

    // adding type import
    if (
      originalFile.indexOf(hiveTypesImportString) < 0 &&
      fileContents.indexOf(hiveTypesImportString) < 0 &&
      imports.indexOf(hiveTypesImportString) < 0
    ) {
      imports += hiveTypesImportString;
    }

    //adding adapter import
    if (
      originalFile.indexOf(hiveAdapterImportString) < 0 &&
      fileContents.indexOf(hiveAdapterImportString) < 0 &&
      imports.indexOf(hiveAdapterImportString) < 0
    ) {
      imports += hiveAdapterImportString;
    }

    for (let i = 0; i < hiveClass.lines.length; i++) {
      const line = hiveClass.lines[i];
      //defaulted to nothing
      let hiveFieldString = "";
      const hiveFieldImport = `{${hiveHelperDirectory}/fields/${classSnakeCasedName}_fields.dart`;
      const hiveFieldImportString = `${getPackageImport(hiveFieldImport)}\n`;

      if (line.entityType === EntityType.InstanceVariable) {
        let lineSplit = line.line.split(" ");
        let fieldName = lineSplit[lineSplit.length - 1];
        fieldName = fieldName.substring(0, fieldName.length - 1);
        hiveFieldString = `\t@HiveField(${hiveClass.className}Fields.${fieldName})\n`;
      }
      convertedClass.push(`${hiveFieldString}${line.line}`);

      if (
        originalFile.indexOf(hiveFieldImportString) < 0 &&
        fileContents.indexOf(hiveFieldImportString) < 0 &&
        imports.indexOf(hiveFieldImportString) < 0
      ) {
        imports += hiveFieldImportString;
      }
    }

    let convertedClassString = convertedClass.join("\n");
    let beginningString = originalFile.substring(0, hiveClass.classOffset);
    const beginningStringSplit = beginningString.split("\n");

    //optimize so that it doesn't have to run every time
    for (var x = 0; x < beginningStringSplit.length; x++) {
      if (beginningStringSplit[x] === "") {
        beginningStringSplit.splice(x, 1);
      }
      if (beginningStringSplit[x].includes(hivePartString)) {
        beginningStringSplit.splice(x, 1);
      }
      if (beginningStringSplit[x].includes("@Hive")) {
        beginningStringSplit.splice(x, 1);
      }
    }
    imports += beginningStringSplit.join("\n");

    let classString = `class ${hiveClass.className} ${
      extendHiveObject ? "extends HiveObject " : ""
    }`;
    let endString = originalFile.substring(hiveClass.closeCurlyOffset + 1);

    // imports += "\n\n";

    if (i > 0) {
      fileContents +=
        "\n\n" +
        hiveTypeString +
        classString +
        convertedClassString +
        endString;
    } else {
      fileContents +=
        imports +
        hivePartString +
        "\n\n" +
        hiveTypeString +
        classString +
        convertedClassString;
    }

    console.log(fileContents);
  }

  await setFileData(targetPath, fileContents);
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
  classes: Array<DartClass>
) {
  if (!existsSync(hiveHelperDirectory)) {
    await createDirectory(hiveHelperDirectory);
  }

  for (var i = 0; i <= classes.length - 1; i++) {
    await Promise.all([
      createRegisterAdapterTemplate(
        hiveHelperDirectory,
        importDirectory,
        classes[i].className
      ),
    ]);
  }
}
async function generateHiveFieldIds(
  hiveHelperDirectory: string,
  classes: Array<DartClass>
) {
  for (var i = 0; i <= classes.length - 1; i++) {
    let classCasedName = changeCase.snakeCase(classes[i].className);
    let targetDirectory = `${hiveHelperDirectory}/fields`;
    if (!existsSync(targetDirectory)) {
      await createDirectory(targetDirectory);
    }

    let targetPath = `${targetDirectory}/${classCasedName}_fields.dart`;
    let dataToSet: string;
    if (!existsSync(targetPath)) {
      dataToSet = getHiveFieldsTemplate(classes[i]);
      await setFileData(targetPath, dataToSet);
    } else {
      let hiveFieldsFile = readFileSync(targetPath, "utf8");
      const existingHiveClass = await getClasses(hiveFieldsFile);

      dataToSet = getUpdatedHiveFieldsFile(
        hiveFieldsFile,
        classes[i],
        // there will always only be one
        existingHiveClass[0]
      );

      await setFileData(targetPath, dataToSet);
    }
  }
}

async function createRegisterAdapterTemplate(
  targetDirectory: string,
  importDirectory: string,
  adapterName: string
) {
  const targetPath = `${targetDirectory}/register_adapters.dart`;
  let dataToSet: string;
  if (!existsSync(targetPath)) {
    dataToSet = getRegisterAdaptersTemplate(importDirectory, adapterName);
    await setFileData(targetPath, dataToSet);
  } else {
    let registerAdaptersFile = readFileSync(targetPath, "utf8");
    dataToSet = getUpdatedAdapterFile(
      registerAdaptersFile,
      importDirectory,
      adapterName
    );
    await setFileData(targetPath, dataToSet);
  }
}

async function setFileData(targetPath: string, content: string) {
  return new Promise(async (resolve, reject) => {
    writeFile(targetPath, content, "utf8", (error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
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
