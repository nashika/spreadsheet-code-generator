import fs = require("fs");
import path = require("path");

import * as _ from "lodash";
import * as log from "loglevel";

import {TGeneratorSheetCode} from "./generator-process";
import {GeneratorNodeDefinition} from "./generator-node-definition";

interface IGenerateChildrenOption {
  sort?: (childA: any, childB: any) => number;
}

type TSortDataType = { child: GeneratorNode, result: any };
type TCallChildrenJoinType = "void" | "string" | "array" | "object" | "concat" | "merge";

export class GeneratorNode {

  static unitIndent: number;
  static writeCount: number;
  static saveBaseDir: string;
  static sheetCodes: { [sheetName: string]: TGeneratorSheetCode };

  parent: GeneratorNode;
  data: { [columnName: string]: any };

  private __childrenMap: { [sheetName: string]: { [nodeName: string]: GeneratorNode } };
  private __childrenCache: { [sheetName: string]: { [nodeName: string]: any } };

  constructor(public definition: GeneratorNodeDefinition,
              _dataRecord: { [columnName: string]: any }) {
    this.data = _.cloneDeep(_dataRecord);
    this.parent = null;
    this.__childrenMap = {};
    _.forIn(definition.children, (childDefinition: GeneratorNodeDefinition) => {
      let childSheetName: string = _.camelCase(childDefinition.name);
      this.__childrenMap[childSheetName] = {};
    });
  }

  get Class(): typeof GeneratorNode {
    return <typeof GeneratorNode>this.constructor;
  }

  get name(): string {
    return this.data[this.definition.name];
  }

  get siblings(): { [nodeName: string]: GeneratorNode } {
    return _(this.parent.getChildren(this.definition.name)).omit(["*", this.name]).value();
  }

  get root(): GeneratorNode {
    return this.parent ? this.parent.root : this;
  }

  get path(): Array<[string, string]> {
    return <any>_.concat(this.parent ? this.parent.path : [], [[this.definition.name, this.name]])
  }

  get columns(): string[] {
    return _.map(this.definition.columns, column => column.data);
  }

  get children(): { [sheetName: string]: { [nodeName: string]: any } } {
    if (this.__childrenCache) return this.__childrenCache;
    let result: { [sheetName: string]: { [nodeName: string]: any } } = {};
    _.forIn(this.definition.children, def => {
      let sheetName: string = _.camelCase(def.name);
      result[sheetName] = {};
      _.forIn(this.getChildren(sheetName), node => {
        if (node.name == "*") return;
        result[sheetName][node.name] = node.data;
      });
    });
    this.__childrenCache = result;
    return result;
  }

  get deleteLine(): string {
    return "###DeleteLine###";
  }

  get noNewLine(): string {
    return "###NoNewLine###";
  }

  call(funcName: string = "main", ...args: any[]): any {
    return (<any>this)[funcName](...args);
  }

  callChildren(childSheetName: string, funcName: string = "main", joinType: TCallChildrenJoinType = "void", options: IGenerateChildrenOption = {}, ...args: any[]): any {
    let sortDatas: TSortDataType[] = [];
    for (let childNode of _.values(this.getChildren(childSheetName))) {
      let childResult: any = childNode.call(funcName, ...args);
      // type check from join type
      switch (joinType) {
        case "void":
          if (!_.isUndefined(childResult)) this._throwErrorCallChildren(funcName, joinType, childResult, "result expects void");
          break;
        case "string":
          if (!_.isString(childResult)) this._throwErrorCallChildren(funcName, joinType, childResult, "result expects string");
          break;
        case "array":
        case "object":
          break;
        case "concat":
          if (!_.isArray(childResult)) this._throwErrorCallChildren(funcName, joinType, childResult, "result expects array");
          break;
        case "merge":
          if (!_.isObject(childResult)) this._throwErrorCallChildren(funcName, joinType, childResult, "result expects object");
          break;
        default:
          this._throwErrorCallChildren(funcName, joinType, childResult, "unknown join type");
      }
      sortDatas.push({
        child: childNode,
        result: childResult,
      });
    }
    if (options.sort)
      sortDatas.sort((a: TSortDataType, b: TSortDataType) => {
        return options.sort(a.child.data, b.child.data);
      });
    switch (joinType) {
      case "void":
        return undefined;
      case "string":
        let resultString: string = "";
        for (let sortData of sortDatas)
          resultString += sortData.result;
        return resultString;
      case "array":
        let resultArray: any[] = [];
        for (let sortData of sortDatas)
          resultArray.push(<any[]>sortData.result);
        return resultArray;
      case "object":
        let resultObject: any = {};
        for (let sortData of sortDatas)
          resultObject = _.set(resultObject, sortData.child.name, <any>sortData.result);
        return resultObject;
      case "concat":
        let resultConcat: any[] = [];
        for (let sortData of sortDatas)
          resultConcat = _.concat(resultConcat, <any>sortData.result);
        return resultConcat;
      case "merge":
        let resultMerge: any = {};
        for (let sortData of sortDatas)
          resultMerge = _.merge(resultMerge, <any>sortData.result);
        return resultMerge;
      default:
        this._throwErrorCallChildren(funcName, joinType, null, "unknown join type");
    }
  }

  protected _throwErrorCallChildren(funcName: string, argJoinType: string, childResult: any, message: string) {
    throw new Error(`callChildren error.
${message}
sheetName=${this.definition.name}
nodeName=${this.name}
funcName=${funcName}
argJoinType=${argJoinType}
result=${childResult}
resultType="${typeof childResult} is invalid return data.`);
  }

  write(argPath: string, data: string, option: { override?: boolean } = {}): void {
    if (!_.isString(argPath))
      throw `Error in this.write(path, data, option). arg "path" must be string, but it is type="${typeof argPath}"`;
    if (!_.isString(data))
      throw `Error in this.write(path, data, option). arg "data" must be string, but it is type="${typeof data}"`;
    if (!_.isObject(option))
      throw `Error in this.write(path, data, option). arg "option" must be object, but it is type="${typeof option}"`;
    let writePath: string = path.isAbsolute(argPath) ? argPath
      : path.join(this.Class.saveBaseDir, argPath);
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
    this.Class.writeCount++;
  }

  source(argSource: any): string {
    let result: string = "";
    let source: string = _.isString(argSource) ? argSource : _.toString(argSource);
    let lines: Array<string> = source.toString().split(/\n/g);
    if (lines[0] == "") lines.shift();
    if (lines[lines.length - 1] == "") lines.pop();
    lines.forEach((line: string) => {
      if (line.match(/###DeleteLine###/)) return;
      if (line.match(/###NoNewLine###/)) {
        line = line.replace(/###NoNewLine###/, "");
        result = result.replace(/\n$/m, "");
      }
      result += line + "\n";
    });
    return result;
  }

  indent(numIndent: number, argSource: any, indentFirstLine: boolean = true): string {
    let result: string = "";
    let source: string = _.isString(argSource) ? argSource : _.toString(argSource);
    let lines: Array<string> = source.split(/\n/g);
    if (lines[lines.length - 1] == "") lines.pop();
    lines.forEach((line: string, index: number) => {
      let newLine: string = (index < lines.length - 1) ? "\n" : "";
      if (line && (index > 0 || indentFirstLine))
        result += _.repeat(" ", this.Class.unitIndent * numIndent) + line + newLine;
      else
        result += line + newLine;
    });
    return result;
  }

  setIndent(arg: number): void {
    this.Class.unitIndent = arg;
  }

  getChild(sheetName: string, nodeName: string): GeneratorNode {
    sheetName = _.camelCase(sheetName);
    return this.__childrenMap[sheetName] && this.__childrenMap[sheetName][nodeName];
  }

  addChild(childNode: GeneratorNode): void {
    let sheetName = _.camelCase(childNode.definition.name);
    if (childNode.name) {
      this.__childrenMap[sheetName][childNode.name] = childNode;
      childNode.parent = this;
    }
  }

  getChildren(sheetName: string): { [nodeName: string]: GeneratorNode } {
    sheetName = _.camelCase(sheetName);
    if (!_.has(this.__childrenMap, sheetName))
      throw new Error(`Can not find child node. sheetName="${sheetName}".`);
    return this.__childrenMap[sheetName];
  }

  add(node: GeneratorNode): void {
    if (_.isEmpty(node.data)) return;
    if (this.definition == node.definition.parent) {
      if (this.definition.name == "root" || this.name == node.data[this.definition.name])
        this.addChild(node);
    } else {
      if (_.includes(this.definition.descendants, node.definition)) {
        for (let childDefinition of _.values(this.definition.children)) {
          if (_.includes(childDefinition.descendants, node.definition)) {
            let childNode = this.getChild(childDefinition.name, node.data[childDefinition.name]);
            if (childNode)
              childNode.add(node);
          }
        }
      }
    }
  }

}
