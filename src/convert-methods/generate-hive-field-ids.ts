import { DartClass, getClasses } from "../utils/dart";
import { existsSync, readFileSync } from "fs";
import { createDirectory } from "../utils/create-directory";
import { getHiveFieldsTemplate } from "../templates/hive-fields";
import { setFileData } from "../utils/set-file-data";
import { getUpdatedHiveFieldsFile } from "../utils/get-updated-hive-fields-file";
import * as changeCase from "change-case";

export async function generateHiveFieldIds(
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
