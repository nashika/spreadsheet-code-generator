import fs = require("fs");
import path = require("path");

import * as _ from "lodash";
import * as log from "loglevel";

import {GeneratorNodeDefinition} from "./generator-node-definition";
import {SourceUtils} from "../util/source-utils";

export class GeneratorNode {

  static definition: GeneratorNodeDefinition;

  parent: GeneratorNode;
  data: { [columnName: string]: any };

  private __children: { [sheetName: string]: { [nodeName: string]: GeneratorNode } };

  constructor(_dataRecord: { [columnName: string]: any }) {
    this.data = _.cloneDeep(_dataRecord);
    this.parent = null;
    this.__children = {};
    for (let childDefinition of _.values(this.Class.definition.children)) {
      let childSheetName: string = _.camelCase(childDefinition.name);
      this.__children[childSheetName] = {};
    }
  }

  get Class(): typeof GeneratorNode {
    return <typeof GeneratorNode>this.constructor;
  }

  get name(): string {
    return this.data[this.Class.definition.name];
  }

  get siblings(): { [nodeName: string]: GeneratorNode } {
    return _(this.parent.__getChildren(this.Class.definition.name)).omit(["*", this.name]).value();
  }

  get root(): GeneratorNode {
    return this.parent ? this.parent.root : this;
  }

  get columns(): string[] {
    return _.map(this.Class.definition.columns, column => column.data);
  }

  get children(): { [sheetName: string]: { [nodeName: string]: GeneratorNode } } {
    return this.__children;
  }

  get deleteLine(): string {
    return SourceUtils.deleteLine;
  }

  get noNewLine(): string {
    return SourceUtils.noNewLine;
  }

  main() {
  }

  write(argPath: string, data: string, option: { override?: boolean } = {}): void {
    if (!_.isString(argPath))
      throw `Error in this.write(path, data, option). arg "path" must be string, but it is type="${typeof argPath}"`;
    if (!_.isString(data))
      throw `Error in this.write(path, data, option). arg "data" must be string, but it is type="${typeof data}"`;
    if (!_.isObject(option))
      throw `Error in this.write(path, data, option). arg "option" must be object, but it is type="${typeof option}"`;
    let writePath: string = path.isAbsolute(argPath) ? argPath
      : path.join(this.Class.definition.process.saveBaseDir, argPath);
    if (!_.isUndefined(option.override) && !option.override) {
      if (fs.existsSync(writePath)) {
        log.debug(`Skip ${writePath}. File exists.`);
        return;
      }
    }
    let recursiveCreateDir = (dir: string) => {
      if (fs.existsSync(dir)) return;
      recursiveCreateDir(path.join(dir, ".."));
      fs.mkdirSync(dir);
    };
    recursiveCreateDir(path.dirname(writePath));
    log.debug(`Writing ${writePath} ...`);
    fs.writeFileSync(writePath, data);
    this.Class.definition.process.writeCount++;
  }

  source(argSource: any): string {
    return SourceUtils.source(argSource);
  }

  indent(numIndent: number, argSource: any, noIndentFirstLine: boolean = false): string {
    return SourceUtils.indent(this.Class.definition.process.unitIndent, numIndent, argSource, noIndentFirstLine);
  }

  setIndent(arg: number): void {
    this.Class.definition.process.unitIndent = arg;
  }

  get(key: string): any {
    return _.get(this.data, key);
  }

  toObject(): { [columnName: string]: any } {
    let result = {};
    for (let column of this.Class.definition.columns) {
      if (!column.export) continue;
      let value = this.get(column.data);
      if (_.isUndefined(value)) continue;
      _.set(result, column.data, value);
    }
    return result;
  }

  __add(node: GeneratorNode): void {
    if (_.isEmpty(node.data)) return;
    if (this.Class.definition == node.Class.definition.parent) {
      if (this.Class.definition.name == "root" || this.name == node.data[this.Class.definition.name])
        this.__addChild(node);
    } else {
      if (_.includes(this.Class.definition.descendants, node.Class.definition)) {
        for (let childDefinition of _.values(this.Class.definition.children)) {
          if (_.includes(childDefinition.descendants, node.Class.definition)) {
            let childNode = this.__getChild(childDefinition.name, node.data[childDefinition.name]);
            if (childNode)
              childNode.__add(node);
          }
        }
      }
    }
  }

  private __getChild(sheetName: string, nodeName: string): GeneratorNode {
    sheetName = _.camelCase(sheetName);
    return this.__children[sheetName] && this.__children[sheetName][nodeName];
  }

  private __getChildren(sheetName: string): { [nodeName: string]: GeneratorNode } {
    sheetName = _.camelCase(sheetName);
    if (!_.has(this.__children, sheetName))
      throw new Error(`Can not find child node. sheetName="${sheetName}".`);
    return this.__children[sheetName];
  }

  private __addChild(childNode: GeneratorNode): void {
    let sheetName = _.camelCase(childNode.Class.definition.name);
    if (childNode.name) {
      this.__children[sheetName][childNode.name] = childNode;
      childNode.parent = this;
    }
  }

}
