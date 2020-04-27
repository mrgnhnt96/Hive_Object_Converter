import { getAdapter } from "./get-adapter";
import { getPackageImport } from "./get-package-import";

export function getUpdatedAdapterFile(
  file: string,
  importDirectory: string,
  adapterName: string
): string {
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

  if (!file.includes(importString)) {
    updatedFile = updatedFile.replace(
      ";\n\n",
      `;
${importString}

`
    );
  }

  return updatedFile;
}