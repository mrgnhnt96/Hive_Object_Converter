## Hive Object Converter

The hive object converter will convert your plain class into a hive object with annotation. Note, that it is important to only have one class in that file.

Example:

```dart
class MyComplexTodo {
  String title;
  bool done;
  String assignee;
  Color color;
  List<String> field1;
  Map<String, dynamic> field2;
}
```
will be converted to 

```dart
import 'package:hive/hive.dart';
import 'package:example_project/hive_helper/hive_types.dart';
import 'package:example_project/hive_helper/hive_adapters.dart';
import 'package:example_project/hive_helper/fields/my_complex_todo_fields.dart';

part 'todo.model.g.dart';

@HiveType(typeId: HiveTypes.myComplexTodo, adapterName: HiveAdapters.myComplexTodo)
class MyComplexTodo extends HiveObject {
  @HiveField(MyComplexTodoFields.title)
  String title;
  @HiveField(MyComplexTodoFields.done)
  bool done;
  @HiveField(MyComplexTodoFields.assignee)
  String assignee;
  @HiveField(MyComplexTodoFields.color)
  Color color;
  @HiveField(MyComplexTodoFields.field1)
  List<String> field1;
  @HiveField(MyComplexTodoFields.field2)
  Map<String, dynamic> field2;
}
```

## How to use it

This extension allows right click on a dart file and then choose between two options.
1. `[Hive] Convert To Hive`
2. `[Hive] Get Hive Generated Files`
3. `[Hive] Convert *.model.dart in folder to Hive`

The 1. will convert the class like in the example above. 
The 2. command will start the build run command, to generate the `*.g.dart` file.
The 3. command will appear, when right click on a folder.



The extension will create subfolder `hive_helper` to store all the hive helpers: 
1. Register the hive adapter
2. Specify the hive type of the annotated class
3. Specify the hive adapter name
4. creates a folder for the fields of the annotated class.



## Settings
There are several settings, that can be modified:

1. *useExtendsHiveObject* [boolean]:
If `MyComplexTodo` class should extends the HiveObject or not.

2. *hiveObjectImportPath* [string]:
The import path of the HiveObject. Defaults to `import 'package:hive/hive.dart';`. Specify different location, if the `MyComplexTodo` should extends a modified version of the HiveObject.

3. *customHiveObjectName* [string]:
Specify the name of the modified version of the HiveObject. It defaults to HiveObject


** Only in the context, when right click on the folder **

4. *useOnlyEnhancedFile* [boolean]
This is very useful to only use files with an specified filename enhancement. For example. if set to true, the extension will only convert files with the extension `.model.` like in `my_complex_todo.model.dart` and will skip all other files.

5. *useEnhancedFileName* [string]
Specify the file enhancement. It defaults to `.model.`. If the setting `useOnlyEnhancedFile` is set to true, the file enhancement, that is specified here, will be used by the extension.




## Fixes:
Path related issues on windows machines, seems to be resolved.
