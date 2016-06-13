import fs = require("fs");
import path = require("path");

import electron = require("electron");

import {AppComponent} from "../component/app-component";
import {GeneratorAccessor} from "./generator-accessor";

declare function originalRequire(path:string):any;
declare module originalRequire {
  var cache:{[path:string]:any};
}

export type TGeneratorSheetCode = ($:GeneratorAccessor) => TGeneratorSheetObject;
export type TGeneratorSheetObject = {[name:string]:(...args:any[]) => any};

export class GeneratorProcess {

  constructor(protected app:AppComponent) {}

  public main() {
    let accesor:GeneratorAccessor = new GeneratorAccessor();
    let sheetCodes:{[sheetName:string]:TGeneratorSheetCode} = {};
    for (let sheetName of this.app.services.code.list()) {
      sheetCodes[sheetName] = this.requireSheetCode(sheetName);
      if (!sheetCodes[sheetName]) return;
    }
    //console.log(result.generate());
  }

  protected requireSheetCode(sheetName:string):TGeneratorSheetCode {
    let codeDir:string = path.join(this.app.saveBaseDir, "./code/");
    let sheetCodePath:string = path.join(codeDir, `./${sheetName}.js`);
    if (originalRequire.cache[sheetCodePath])
      delete originalRequire.cache[sheetCodePath];
    let result:TGeneratorSheetCode;
    try {
      result = originalRequire(sheetCodePath);
    } catch (e) {
      this.app.services.generator.developerToolQuestion();
      throw e;
    }
    if (typeof result != "function") {
      alert(`"${sheetName}.js" exports type="${typeof result}" data.
Generator code expects export type="function".

[Example] 
module.exports = ($) => { return {
  main: ...
  funcA: ...
  funcB: ...
}};`);
      return null;
    }
    return result;
  }

}
