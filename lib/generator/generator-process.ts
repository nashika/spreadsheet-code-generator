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

export type TGeneratorSheetCode = {[name:string]:(...args:any[]) => any};

export class GeneratorProcess {

  constructor(protected app:AppComponent) {
  }

  public main():number {
    try {
      return this.proceed();
    } catch (e) {
      if (_.isString(e)) {
        alert(e);
      } else {
        if (!electron.remote.getCurrentWebContents().isDevToolsOpened()) {
          alert(e.stack || e);
        }
        this.app.services.generator.developerToolQuestion();
        throw e;
      }
      return -1;
    }
  }

  protected proceed():number {
    let accessor:GeneratorAccessor = new GeneratorAccessor(this.app);
    let sheetCodes:{[sheetName:string]:TGeneratorSheetCode} = {};
    for (let sheetName of this.app.services.code.list()) {
      sheetCodes[sheetName] = this.requireSheetObject(sheetName);
      if (!sheetCodes[sheetName]) return;
    }
    accessor._sheetCodes = sheetCodes;

    log.debug(`Create node definition tree was started.`);
    let rootNodeDefinition:GeneratorNodeDefinition = new GeneratorNodeDefinition(this.app.sheets["root"], sheetCodes["root"], null);
    let createNodeDefinitionRecursive = (currentNodeDefinition:GeneratorNodeDefinition) => {
      _.forIn(this.app.sheets, (sheet:ISheet) => {
        if (sheet.parent != currentNodeDefinition.name) return;
        let childNodeDefinition = new GeneratorNodeDefinition(sheet, sheetCodes[sheet.name], currentNodeDefinition);
        currentNodeDefinition.addChild(childNodeDefinition);
        createNodeDefinitionRecursive(childNodeDefinition);
      });
    };
    createNodeDefinitionRecursive(rootNodeDefinition);
    log.debug(`Create node definition tree was finished.`);

    log.debug('Create node element tree was started.');
    let rootNodeElement:GeneratorNodeElement = new GeneratorNodeElement(rootNodeDefinition, {root: "root"});
    let createNodeElementRecursive = (currentNodeDefinition:GeneratorNodeDefinition) => {
      log.debug(`Create ${_.join(currentNodeDefinition.path, ".")} records...`);
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

    log.debug(`Generate process was started.`);
    accessor._currentNode = rootNodeElement;
    accessor._writeCount = 0;
    rootNodeElement.call(accessor);
    log.debug(`Generate process was finished.`);

    log.debug(`Generate process was done. Write ${accessor._writeCount} files.`);
    return accessor._writeCount;
  }

  protected requireSheetObject(sheetName:string):TGeneratorSheetCode {
    let codeDir:string = path.join(this.app.saveBaseDir, "./code/");
    let sheetCodePath:string = path.join(codeDir, `./${sheetName}.js`);
    if (originalRequire.cache[sheetCodePath])
      delete originalRequire.cache[sheetCodePath];
    let sheetCode:TGeneratorSheetCode;
    sheetCode = originalRequire(sheetCodePath);
    if (!_.isObject(sheetCode)) {
      throw `Sheet code "${sheetName}.js" exports type="${typeof sheetCode}" data.
Sheet code expects export type="object".\n\n${this.exampleCode}}`;
    }
    _.forEach(sheetCode, (prop:any, key:string) => {
      if (_.isFunction(prop)) {
        if (prop.toString().match(/^ *\(\) *=> *\{/)) {
          throw `Sheet code "${sheetName}.js" property "${key}" is maybe arrow function.
Please use normal function for custom "this".\n\n${this.exampleCode}`;
        }
      }
    });
    return sheetCode;
  }

  protected exampleCode = `[Example]
module.exports = {
  main: function () => { ... }
  funcA: function () => { ... }
  funcB: function () => { ... }
}`;

}
