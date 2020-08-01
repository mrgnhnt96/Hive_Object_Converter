import { existsSync, readFileSync } from "fs-extra";
import { getPackageImport } from "../utils/get-package-import";
import { getClasses, EntityType, DartClass } from "../utils/dart";
import { getHiveTypesTemplate } from "../templates/hive-types";
import { getUpdatedHiveTypesFile } from "../utils/get-updated-hive-types-file";
import { getHiveAdapterTemplate } from "../templates/hive-adapters";
import { getUpdatedHiveAdapterFile } from "../utils/get-updated-hive-adapters-file";
import { setFileData } from "../utils/set-file-data";
import * as changeCase from "change-case";
import { readSetting } from "../utils/vscode_easy";

export async function updateClass(
  classes: Array<DartClass>,
  targetPath: string,
  hiveHelperDirectory: string
) {
  let fileContents = "";

  if (!classes || classes.length === 0) {
    console.error('classes are undefined', classes);
    return false;
  }

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
    const hiveAdapterImportString = `${getPackageImport(hiveAdapterPath)}\n`;

    //get file name
    const targetPathSplit = targetPath.split(/[\\/]/);
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

      const hiveFieldImport = `${hiveHelperDirectory}/fields/${classSnakeCasedName}_fields.dart`;
      const hiveFieldImportString = `${getPackageImport(hiveFieldImport)}\n`;

      const isInstance = line.entityType === EntityType.InstanceVariable;

      // test on override
      const hasOverride = (line.entityType === EntityType.OverrideMethod && !line.line.includes('@override'));


      if (isInstance || hasOverride) {
        let lineSplit = line.line.split(" ");
        let fieldName = lineSplit[lineSplit.length - 1];
        
        // Trim: length does not return only the visible char, also \n!
        let length = fieldName.trim().length - 1;


        let fieldName_ = fieldName.slice(0, length);
        hiveFieldString = `\t@HiveField(${hiveClass.className}Fields.${fieldName_})`;
        convertedClass.push(hiveFieldString + '\n' + line.line);
      } else {
        convertedClass.push(line.line);
      }

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
    let beginningStringSplit: string[] = [];

    if (beginningString !== "") {
      beginningStringSplit = beginningString.split("\n");
    }

    const hiveObjectName = readSetting('customHiveObjectName') as string;
    const customImport = readSetting('hiveObjectImportPath') as string;


    beginningStringSplit = beginningStringSplit.filter((l) => {

      if (l === "") return false;
      if (l.includes(hivePartString)) return false;
      if (l.includes("@Hive")) return false;
      if (l.includes(customImport)) return false;
      if (l.includes(hiveObjectName)) return false;
      return true;
    }
    );

    const extendsHiveObject = readSetting('extendsHiveObject') as boolean;
    var extendClass = "";
    if (extendsHiveObject) {
      beginningStringSplit.push(customImport);
      extendClass = `extends ${hiveObjectName}`;
    }

    imports += beginningStringSplit.join("\n");

    // ensure uniqueness
    let imp = imports.split('\n').map(e => e.trim());
    let temp = [...new Set(imp)];
    imports = temp.join('\n')



    let classString = `class ${hiveClass.className} ${extendClass}`;
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
        "\n\n" +
        hivePartString +
        "\n\n" +
        hiveTypeString +
        classString +
        convertedClassString;
    }
  }

  await setFileData(targetPath, fileContents);
  return true;
}
