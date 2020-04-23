import * as changeCase from "change-case";
import { getPackageImport } from "../utils/get-package-import";
import { getAdapter } from "../utils/get-adapter";

export function getRegisterAdaptersTemplate(
  importDirectory: string,
  adapterName: string
): string {
  let packageImport = getPackageImport(importDirectory);
  let adapter = getAdapter(adapterName);

  return `import 'package:hive/hive.dart';
${packageImport}

  void registerAdapters() {
    ${adapter}
  }
`;
}
