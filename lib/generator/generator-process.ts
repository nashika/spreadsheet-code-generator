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
    let accessor:GeneratorAccessor = new GeneratorAccessor();
    let sheetObjects:{[sheetName:string]:TGeneratorSheetObject} = {};
    for (let sheetName of this.app.services.code.list()) {
      sheetObjects[sheetName] = this.requireSheetObject(sheetName, accessor);
      if (!sheetObjects[sheetName]) return;
    }
    accessor._sheetObjects = sheetObjects;
    //console.log(result.generate());
  }

  protected requireSheetObject(sheetName:string, accessor:GeneratorAccessor):TGeneratorSheetObject {
    let codeDir:string = path.join(this.app.saveBaseDir, "./code/");
    let sheetCodePath:string = path.join(codeDir, `./${sheetName}.js`);
    if (originalRequire.cache[sheetCodePath])
      delete originalRequire.cache[sheetCodePath];
    let sheetCode:TGeneratorSheetCode;
    try {
      sheetCode = originalRequire(sheetCodePath);
    } catch (e) {
      alert(`Require error. file="${sheetCodePath}"\n\n${e.stack}`);
      this.app.services.generator.developerToolQuestion();
      throw e;
    }
    if (typeof sheetCode != "function") {
      alert(`Sheet code "${sheetName}.js" exports type="${typeof sheetCode}" data.
Sheet code expects export type="function".\n\n${this.sheetCodeExample}`);
      return null;
    }
    let sheetObject:TGeneratorSheetObject;
    try {
      sheetObject = sheetCode(accessor);
    } catch (e) {
      alert(`Sheet code "${sheetName}.js" initialize error.
Sheet code expects export function, one argument and return object.\n\n${this.sheetCodeExample}`);
      this.app.services.generator.developerToolQuestion();
      throw e;
    }
    if (typeof sheetObject != "object") {
      alert(`Sheet code require("${sheetName}.js")($) return type="${typeof sheetCode}".
Expects return type="object".\n\n${this.sheetCodeExample}`);
      return null;
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
