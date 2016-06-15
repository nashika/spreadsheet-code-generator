import fs = require("fs");
import path = require("path");

import electron = require("electron");
import _ = require("lodash");

import {AppComponent, ISheet, TSheetData} from "../component/app-component";
import {GeneratorAccessor} from "./generator-accessor";
import {GeneratorNodeElement} from "./generator-node-element";
import {GeneratorNodeDefinition} from "./generator-node-definition";

declare function originalRequire(path:string):any;
declare module originalRequire {
  var cache:{[path:string]:any};
}

export interface IGeneratorResult {
  data:string,
  path:string,
  override?:boolean,
}

export type TGeneratorSheetCode = ($:GeneratorAccessor) => TGeneratorSheetCodeObject;
export type TGeneratorSheetCodeObject = {[name:string]:(...args:any[]) => any};

export class GeneratorProcess {

  constructor(protected app:AppComponent) {}

  public main() {
    try {
      let accessor:GeneratorAccessor = new GeneratorAccessor();
      let sheetCodeObjects:{[sheetName:string]:TGeneratorSheetCodeObject} = {};
      for (let sheetName of this.app.services.code.list()) {
        sheetCodeObjects[sheetName] = this.requireSheetObject(sheetName, accessor);
        if (!sheetCodeObjects[sheetName]) return;
      }
      accessor._sheetCodeObjects = sheetCodeObjects;

      log.debug(`Create node definition tree was started.`);
      let rootNodeDefinition:GeneratorNodeDefinition = new GeneratorNodeDefinition(this.app.sheets["root"], sheetCodeObjects["root"], null);
      let createNodeDefinitionRecursive = (currentNodeDefinition:GeneratorNodeDefinition) => {
        _.forIn(this.app.sheets, (sheet:ISheet) => {
          if (sheet.parent != currentNodeDefinition.name) return;
          let childNodeDefinition = new GeneratorNodeDefinition(sheet, sheetCodeObjects[sheet.name], currentNodeDefinition);
          currentNodeDefinition.addChild(childNodeDefinition);
          createNodeDefinitionRecursive(childNodeDefinition);
        });
      };
      createNodeDefinitionRecursive(rootNodeDefinition);
      log.debug(`Create node definition tree was finished.`);

      log.debug('Create node element tree was started.');
      let rootNodeElement:GeneratorNodeElement = new GeneratorNodeElement(rootNodeDefinition, {});
      let createNodeElementRecursive = (currentNodeDefinition:GeneratorNodeDefinition) => {
        console.log(`Create ${_.join(currentNodeDefinition.path, ".")} records...`);
        let currentData:TSheetData = this.app.datas[currentNodeDefinition.name] || [];
        _.forEach(currentData, (record:{[columnName:string]:any}) => {
          let childNodeElement:GeneratorNodeElement = new GeneratorNodeElement(currentNodeDefinition, record);
          rootNodeElement.add(childNodeElement);
        });
        _.forIn(currentNodeDefinition.children, (childNodeDefinition:GeneratorNodeDefinition) => {
          createNodeElementRecursive(childNodeDefinition);
        });
      };
      createNodeElementRecursive(rootNodeDefinition);
      log.debug(`Create node element tree was finished.`);

      log.debug(`Apply inherits was started.`);
      rootNodeElement.applyInheritsRecursive();
      log.debug(`Apply inherits was finished.`);

      //console.log(result.generate());
    } catch (e) {
      this.app.services.generator.developerToolQuestion();
      alert(e.stack || e);
      throw e;
    }
  }

  protected requireSheetObject(sheetName:string, accessor:GeneratorAccessor):TGeneratorSheetCodeObject {
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
    let sheetObject:TGeneratorSheetCodeObject;
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
