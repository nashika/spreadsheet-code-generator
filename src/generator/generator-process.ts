import _ = require("lodash");
import * as log from "loglevel";

import {GeneratorNode} from "./generator-node";
import {GeneratorNodeDefinition} from "./generator-node-definition";
import {ISheet, TSheetData} from "../service/hub.service";
import {RecordExtender} from "../util/record-extender";

export class GeneratorProcess {

  unitIndent = 4;
  writeCount = 0;

  constructor(public saveBaseDir: string,
              protected sheets: {[sheetName: string]: ISheet},
              protected datas: {[sheetName: string]: TSheetData}) {
  }

  main(): number {
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

    log.debug(`Create node definition tree was started.`);
    let rootNodeDefinition: GeneratorNodeDefinition = new GeneratorNodeDefinition(this, this.sheets["root"], null);
    let createNodeDefinitionRecursive = (currentNodeDefinition: GeneratorNodeDefinition) => {
      _.forIn(this.sheets, (sheet: ISheet) => {
        if (_.camelCase(sheet.parent) != currentNodeDefinition.name) return;
        let childNodeDefinition = new GeneratorNodeDefinition(this, sheet, currentNodeDefinition);
        currentNodeDefinition.addChild(childNodeDefinition);
        createNodeDefinitionRecursive(childNodeDefinition);
      });
    };
    createNodeDefinitionRecursive(rootNodeDefinition);
    log.debug(`Create node definition tree was finished.`);

    log.debug('Create node tree was started.');
    let rootNode: GeneratorNode = new rootNodeDefinition.GeneratorNodeClass({root: "root"});
    let createNodeElementRecursive = (currentNodeDefinition: GeneratorNodeDefinition) => {
      log.debug(`Create ${_.join(currentNodeDefinition.path, ".")} records...`);
      let recordExtender = new RecordExtender(this.datas[currentNodeDefinition.name], this.sheets[currentNodeDefinition.name]);
      let currentData: TSheetData = recordExtender.getRecords() || [];
      _.forEach(currentData, (record: {[columnName: string]: any}) => {
        let childNodeElement: GeneratorNode = new currentNodeDefinition.GeneratorNodeClass(record);
        rootNode.__add(childNodeElement);
      });
      _.forIn(currentNodeDefinition.children, (childNodeDefinition: GeneratorNodeDefinition) => {
        createNodeElementRecursive(childNodeDefinition);
      });
    };
    createNodeElementRecursive(rootNodeDefinition);
    log.debug(`Create node element tree was finished.`);

    this.unitIndent = 4;
    this.writeCount = 0;
    log.debug(`Generate process was started.`);
    rootNode.call();
    log.debug(`Generate process was finished.`);

    log.debug(`Generate process was done. Write ${this.writeCount} files.`);
    return this.writeCount;
  }

}

(<any>window).GeneratorNode = GeneratorNode;
