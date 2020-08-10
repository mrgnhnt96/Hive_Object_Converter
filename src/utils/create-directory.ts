import { mkdir } from "fs-extra";
import * as vscode from "vscode";


export function createDirectory(targetDirectory: string): Promise<void> {
  return new Promise((resolve, reject) => {
    mkdir(targetDirectory, (error: any) => {
      if (error) {
        vscode.window.showInformationMessage(
          "Error: " + error
        );
        return reject(error);
      }
      resolve();
    });
  });
}
