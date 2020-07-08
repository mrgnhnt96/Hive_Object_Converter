import { writeFile } from "fs-extra";

export async function setFileData(targetPath: string, content: string) {
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
