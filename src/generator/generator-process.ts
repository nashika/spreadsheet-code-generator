import path = require("path");

import _ = require("lodash");
import * as log from "loglevel";

import {GeneratorNode} from "./generator-node";
import {GeneratorNodeElement} from "./generator-node-element";
import {GeneratorNodeDefinition} from "./generator-node-definition";
import {ISheet, TSheetData} from "../service/hub.service";
import {RecordExtender} from "../util/record-extender";

declare function originalRequire(path: string): any;
declare module originalRequire {
  var cache: {[path: string]: any};
}

export type TGeneratorSheetCode = {[name: string]: (...args: any[]) => any};

export class GeneratorProcess {

  constructor(protected saveBaseDir: string,
              protected sheets: {[sheetName: string]: ISheet},
              protected datas: {[sheetName: string]: TSheetData},
              protected codeNames: string[]) {
  }

  public main(): number {
    log.debug(`Parse sheet data was started.`);
    for (let sheetName in this.sheets) {
      if (sheetName == "root") continue;
      let sheet: ISheet = this.sheets[sheetName];
      let data: TSheetData = this.datas[sheetName];
      for (let record of data) {
        for (let column of sheet.columns) {
          if (!_.has(record, column.data)) continue;
          if (column.json || column.type == "numeric") {
            let jsonData: string = _.get(record, column.data, "");
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
    let sheetCodes: {[sheetName: string]: TGeneratorSheetCode} = {};
    for (let sheetName of this.codeNames) {
      sheetCodes[sheetName] = this.requireSheetObject(sheetName);
      if (!sheetCodes[sheetName]) return 0;
    }
    log.debug(`Initialize sheet code was finished.`);

    log.debug(`Create node definition tree was started.`);
    let rootNodeDefinition: GeneratorNodeDefinition = new GeneratorNodeDefinition(this.sheets["root"], sheetCodes["root"], null);
    let createNodeDefinitionRecursive = (currentNodeDefinition: GeneratorNodeDefinition) => {
      _.forIn(this.sheets, (sheet: ISheet) => {
        if (_.camelCase(sheet.parent) != currentNodeDefinition.name) return;
        let childNodeDefinition = new GeneratorNodeDefinition(sheet, sheetCodes[sheet.name], currentNodeDefinition);
        currentNodeDefinition.addChild(childNodeDefinition);
        createNodeDefinitionRecursive(childNodeDefinition);
      });
    };
    createNodeDefinitionRecursive(rootNodeDefinition);
    log.debug(`Create node definition tree was finished.`);

    log.debug('Create node element tree was started.');
    let rootNodeElement: GeneratorNodeElement = new GeneratorNodeElement(rootNodeDefinition, {root: "root"});
    let createNodeElementRecursive = (currentNodeDefinition: GeneratorNodeDefinition) => {
      log.debug(`Create ${_.join(currentNodeDefinition.path, ".")} records...`);
      let recordExtender = new RecordExtender(this.datas[currentNodeDefinition.name], this.sheets[currentNodeDefinition.name]);
      let currentData: TSheetData = recordExtender.getRecords() || [];
      _.forEach(currentData, (record: {[columnName: string]: any}) => {
        let childNodeElement: GeneratorNodeElement = new GeneratorNodeElement(currentNodeDefinition, record);
        rootNodeElement.add(childNodeElement);
      });
      _.forIn(currentNodeDefinition.children, (childNodeDefinition: GeneratorNodeDefinition) => {
        createNodeElementRecursive(childNodeDefinition);
      });
    };
    createNodeElementRecursive(rootNodeDefinition);
    log.debug(`Create node element tree was finished.`);

    log.debug(`Generate process was started.`);
    GeneratorNode.saveBaseDir = this.saveBaseDir;
    GeneratorNode.sheetCodes = sheetCodes;
    GeneratorNode.unitIndent = 4;
    GeneratorNode.writeCount = 0;
    rootNodeElement.call();
    log.debug(`Generate process was finished.`);

    log.debug(`Generate process was done. Write ${GeneratorNode.writeCount} files.`);
    return GeneratorNode.writeCount;
  }

  protected requireSheetObject(sheetName: string): TGeneratorSheetCode {
    let codeDir: string = path.join(this.saveBaseDir, "./code/");
    let sheetCodePath: string = path.join(codeDir, `./${sheetName}.js`);
    if (originalRequire.cache[sheetCodePath])
      delete originalRequire.cache[sheetCodePath];
    let sheetCode: TGeneratorSheetCode;
    sheetCode = originalRequire(sheetCodePath);
    if (!_.isObject(sheetCode)) {
      throw `Sheet code "${sheetName}.js" exports type="${typeof sheetCode}" data.
Sheet code expects export type="object".\n\n${this.exampleCode}}`;
    }
    _.forEach(sheetCode, (prop: any, key: string) => {
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
