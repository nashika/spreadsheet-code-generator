import fs = require("fs");
import path = require("path");

import electron = require("electron");

import {AppComponent} from "../component/app-component";
import {GeneratorAccessor} from "./generator-accessor";

declare function originalRequire(path:string):any;
declare module originalRequire {
  var cache:{[path:string]:any};
}

export interface IGeneratorResult {
  data:string,
  path:string,
  override?:boolean,
}

export type TGeneratorSheetCode = ($:GeneratorAccessor) => TGeneratorSheetObject;
export type TGeneratorSheetObject = {[name:string]:(...args:any[]) => any};

export class GeneratorProcess {

  constructor(protected app:AppComponent) {}

  public main() {
    try {
      let accessor:GeneratorAccessor = new GeneratorAccessor();
      let sheetObjects:{[sheetName:string]:TGeneratorSheetObject} = {};
      for (let sheetName of this.app.services.code.list()) {
        sheetObjects[sheetName] = this.requireSheetObject(sheetName, accessor);
        if (!sheetObjects[sheetName]) return;
      }
      accessor._sheetObjects = sheetObjects;

      /*
      console.log('Load CSV files was started.');
      let readRecordsMap:TReadRecordsMap = {};
      let readText:string;
      for (let definitionName of DefinitionRegistry.keys) {
        for (let fileName of [definitionName, `multi-${definitionName}`]) {
          let filePath:string = path.join(`${DefinitionRegistry.CSV_DIR}/${fileName}.csv`);
          if (fs.existsSync(filePath)) {
            console.log(`Loading ${filePath} ...`);
            readText = fs.readFileSync(filePath, "utf-8");
            readRecordsMap[fileName] = parse(readText, {columns: true});
          }
        }
      }*/

      //console.log(result.generate());
    } catch (e) {
      this.app.services.generator.developerToolQuestion();
      alert(e.stack || e);
      throw e;
    }
  }

  protected requireSheetObject(sheetName:string, accessor:GeneratorAccessor):TGeneratorSheetObject {
    let codeDir:string = path.join(this.app.saveBaseDir, "./code/");
    let sheetCodePath:string = path.join(codeDir, `./${sheetName}.js`);
    if (originalRequire.cache[sheetCodePath])
      delete originalRequire.cache[sheetCodePath];
    let sheetCode:TGeneratorSheetCode;
      sheetCode = originalRequire(sheetCodePath);
    if (typeof sheetCode != "function") {
      throw new Error(`Sheet code "${sheetName}.js" exports type="${typeof sheetCode}" data.
Sheet code expects export type="function".\n\n${this.sheetCodeExample}`);
    }
    let sheetObject:TGeneratorSheetObject;
    try {
      sheetObject = sheetCode(accessor);
    } catch (e) {
      throw new Error(`Sheet code "${sheetName}.js" initialize error.
Sheet code expects export function, one argument and return object.\n\n${this.sheetCodeExample}`);
    }
    if (typeof sheetObject != "object") {
      throw new Error(`Sheet code require("${sheetName}.js")($) return type="${typeof sheetCode}".
Expects return type="object".\n\n${this.sheetCodeExample}`);
    }
    return sheetObject;
  }

  protected sheetCodeExample:string = `[Example]
module.exports = ($) => { return {
  main: ...
  funcA: ...
  funcB: ...
}};`;

}
