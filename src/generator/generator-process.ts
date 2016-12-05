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

  constructor(protected saveBaseDir:string,
              protected sheets:{[sheetName:string]:ISheet},
              protected datas:{[sheetName:string]:TSheetData},
              protected codeNames:string[]) {
  }

  public main():number {
    log.debug(`Parse sheet data was started.`);
    for (let sheetName in this.sheets) {
      if (sheetName == "root") continue;
      let sheet:ISheet = this.sheets[sheetName];
      let data:TSheetData = this.datas[sheetName];
      for (let record of data) {
        for (let column of sheet.columns) {
          if (!_.has(record, column.data)) continue;
          if (column.json) {
            let jsonData:string = _.get(record, column.data, "");
            try {
              _.set(record, column.data, JSON.parse(jsonData));
            } catch (e) {
              throw `JSON parse error. sheet="${sheetName}", column="${column.data}", record="${JSON.stringify(record)}"`;
            }
          }
        }
      }
    }
    log.debug(`Parse sheet data was finished.`);

    log.debug(`Initialize sheet code was started.`);
    let accessor:GeneratorAccessor = new GeneratorAccessor(this.saveBaseDir);
    let sheetCodes:{[sheetName:string]:TGeneratorSheetCode} = {};
    for (let sheetName of this.codeNames) {
      sheetCodes[sheetName] = this.requireSheetObject(sheetName);
      if (!sheetCodes[sheetName]) return;
    }
    accessor._sheetCodes = sheetCodes;
    log.debug(`Initialize sheet code was finished.`);

    log.debug(`Create node definition tree was started.`);
    let rootNodeDefinition:GeneratorNodeDefinition = new GeneratorNodeDefinition(this.sheets["root"], sheetCodes["root"], null);
    let createNodeDefinitionRecursive = (currentNodeDefinition:GeneratorNodeDefinition) => {
      _.forIn(this.sheets, (sheet:ISheet) => {
        if (_.camelCase(sheet.parent) != currentNodeDefinition.name) return;
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
      let currentData:TSheetData = this.datas[currentNodeDefinition.name] || [];
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
    let codeDir:string = path.join(this.saveBaseDir, "./code/");
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
