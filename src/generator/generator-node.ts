import fs = require("fs");
import path = require("path");

import * as _ from "lodash";
import * as log from "loglevel";

import {GeneratorNodeDefinition} from "./generator-node-definition";
import {SourceUtils} from "../util/source-utils";

interface IGenerateChildrenOption {
  sort?: (childA: any, childB: any) => number;
}

type TSortDataType = { child: GeneratorNode, result: any };
type TCallChildrenJoinType = "void" | "string" | "array" | "object" | "concat" | "merge";

export class GeneratorNode {

  static definition: GeneratorNodeDefinition;

  parent: GeneratorNode;
  data: { [columnName: string]: any };

  private __childrenMap: { [sheetName: string]: { [nodeName: string]: GeneratorNode } };

  constructor(_dataRecord: { [columnName: string]: any }) {
    this.data = _.cloneDeep(_dataRecord);
    this.parent = null;
    this.__childrenMap = {};
    for (let childDefinition of _.values(this.Class.definition.children)) {
      let childSheetName: string = _.camelCase(childDefinition.name);
      this.__childrenMap[childSheetName] = {};
    }
  }

  get Class(): typeof GeneratorNode {
    return <typeof GeneratorNode>this.constructor;
  }

  get name(): string {
    return this.data[this.Class.definition.name];
  }

  get siblings(): { [nodeName: string]: GeneratorNode } {
    return _(this.parent.getChildren(this.Class.definition.name)).omit(["*", this.name]).value();
  }

  get root(): GeneratorNode {
    return this.parent ? this.parent.root : this;
  }

  get path(): Array<[string, string]> {
    return <any>_.concat(this.parent ? this.parent.path : [], [[this.Class.definition.name, this.name]])
  }

  get columns(): string[] {
    return _.map(this.Class.definition.columns, column => column.data);
  }

  get children(): { [sheetName: string]: { [nodeName: string]: GeneratorNode } } {
    return this.__childrenMap;
  }

  get deleteLine(): string {
    return SourceUtils.deleteLine;
  }

  get noNewLine(): string {
    return SourceUtils.noNewLine;
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
sheetName=${this.Class.definition.name}
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

  indent(numIndent: number, argSource: any, indentFirstLine: boolean = true): string {
    return SourceUtils.indent(numIndent, argSource, this.Class.definition.process.unitIndent, indentFirstLine);
  }

  setIndent(arg: number): void {
    this.Class.definition.process.unitIndent = arg;
  }

  getChild(sheetName: string, nodeName: string): GeneratorNode {
    sheetName = _.camelCase(sheetName);
    return this.__childrenMap[sheetName] && this.__childrenMap[sheetName][nodeName];
  }

  getChildren(sheetName: string): { [nodeName: string]: GeneratorNode } {
    sheetName = _.camelCase(sheetName);
    if (!_.has(this.__childrenMap, sheetName))
      throw new Error(`Can not find child node. sheetName="${sheetName}".`);
    return this.__childrenMap[sheetName];
  }

  toObject(): { [columnName: string]: any } {
    return _.cloneDeep(this.data);
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
            let childNode = this.getChild(childDefinition.name, node.data[childDefinition.name]);
            if (childNode)
              childNode.__add(node);
          }
        }
      }
    }
  }

  private __addChild(childNode: GeneratorNode): void {
    let sheetName = _.camelCase(childNode.Class.definition.name);
    if (childNode.name) {
      this.__childrenMap[sheetName][childNode.name] = childNode;
      childNode.parent = this;
    }
  }

}
