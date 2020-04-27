import { existsSync } from "fs";
import { DartClass } from "../utils/dart";
import { createDirectory } from "../utils/create-directory";
import { createRegisterAdapterTemplate } from "./create-register-adapter-template";

export async function generateHiveHelper(
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
