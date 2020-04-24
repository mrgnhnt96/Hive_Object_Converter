import { workspace } from "vscode";
import { getPackageImport } from "../utils/get-package-import";
import { getAdapter } from "../utils/get-adapter";

export function getUpdatedFile(
  file: string,
  importDirectory: string,
  adapterName: string
): string | undefined {
  let importString = getPackageImport(importDirectory);
  let adapterString = getAdapter(adapterName);

  if (file.includes(adapterString)) {
    return file;
  }

  let updatedFile = file.replace(
    "}",
    `\t${adapterString}
}`
  );

  updatedFile = updatedFile.replace(
    ";\n\n",
    `;
${importString}

`
  );

  return updatedFile;
}
