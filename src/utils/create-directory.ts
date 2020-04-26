import { mkdir } from "fs";

export function createDirectory(targetDirectory: string): Promise<void> {
  return new Promise((resolve, reject) => {
    mkdir(targetDirectory, (error: any) => {
      if (error) {
        return reject(error);
      }
      resolve();
    });
  });
}
