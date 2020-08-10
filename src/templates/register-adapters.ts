import { getAdapter } from "../utils/get-adapter";
import { getPackageImport } from "../utils/get-package-import";

export function getRegisterAdaptersTemplate(
  importDirectory: string,
  adapterName: string
): string {
  let packageImport = getPackageImport(importDirectory);
  let adapter = getAdapter(adapterName).trim();

  return `import 'package:hive/hive.dart';
${packageImport}

void registerAdapters() {
\t${adapter}
}
`;
}
