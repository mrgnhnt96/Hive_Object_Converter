import { existsSync, readFileSync } from "fs";
import { getRegisterAdaptersTemplate } from "../templates/register-adapters";
import { setFileData } from "../utils/set-file-data";
import { getUpdatedAdapterFile } from "../utils/get-updated-adapter-file";

export async function createRegisterAdapterTemplate(
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
