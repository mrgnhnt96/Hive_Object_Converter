## Hive Object Converter

Easily convert your class models into hive!

## Added:
* Right Click on folder, to convert all dart files into Hive objects
* added vscode settings:
  * if hive objects should extend HiveObject (does not prompt user anymore and is fixed for all)
  * specify path, where the hive files should be generated
  * for batch: check if the files should have some sort of extended file name like `todo.model.dart` to only generate hive objects which includes that extension.
  * specify preferred extension. The filename could have everything. Also like `todo.hive.dart` to only generate files which have `.hive.`


## Fixes:

Had problems on my windows machine, when trying to generate the hive files.
-> fixed path related issues, on windows => need to check against linux/mac?





## TODO:

[ ] Check path to let it work on all machine
[ ] Fix complex 