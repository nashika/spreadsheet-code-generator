import fs = require("fs");
import path = require("path");

import * as _ from "lodash";
import * as log from "loglevel";

import {TGeneratorSheetCode} from "./generator-process";
import {GeneratorNodeElement} from "./generator-node-element";
import {GeneratorNodeDefinition} from "./generator-node-definition";

interface IGenerateChildrenOption {
  sort?: (childA: any, childB: any) => number;
}

type TSortDataType = {child: GeneratorNodeElement, result: any};

export class GeneratorAccessor {

  static unitIndent: number;
  static writeCount: number;
  static saveBaseDir: string;
  static sheetCodes: {[sheetName: string]: TGeneratorSheetCode};

  protected __childrenCache: {[sheetName: string]: {[nodeName: string]: any}};
  protected __childrenCachedNode: GeneratorNodeElement;

  constructor(protected __currentNode: GeneratorNodeElement) {
  }

  get Class(): typeof GeneratorAccessor {
    return <typeof GeneratorAccessor>this.constructor;
  }

  get name(): string {
    return this.__currentNode.name;
  }

  get data(): any {
    return this.__currentNode.data;
  }

  get parent(): GeneratorAccessor {
    return new GeneratorAccessor(this.__currentNode.parent);
  }

  get siblings(): {[nodeName: string]: GeneratorAccessor} {
    return _(this.__currentNode.parent.getChildren(this.__currentNode.definition.name))
      .omit(["*", this.__currentNode.name])
      .mapValues(childNode => new GeneratorAccessor(childNode))
      .value();
  }

  get columns(): string[] {
    return _.map(this.__currentNode.definition.columns, column => column.data);
  }

  public get children(): {[sheetName: string]: {[nodeName: string]: any}} {
    if (this.__currentNode == this.__childrenCachedNode && this.__childrenCache)
      return this.__childrenCache;
    let result: {[sheetName: string]: {[nodeName: string]: any}} = {};
    _.forIn(this.__currentNode.definition.children, (def: GeneratorNodeDefinition): void => {
      let sheetName: string = _.camelCase(def.name);
      result[sheetName] = {};
      _.forIn(this.__currentNode.getChildren(sheetName), (node: GeneratorNodeElement): void => {
        if (node.name == "*") return;
        result[sheetName][node.name] = node.data;
      });
    });
    this.__childrenCache = result;
    this.__childrenCachedNode = this.__currentNode;
    return result;
  }

  public get deleteLine(): string {
    return "###DeleteLine###";
  }

  public get noNewLine(): string {
    return "###NoNewLine###";
  }

  public call(funcName: string = "main", ...args: any[]): any {
    return this.__currentNode.call(funcName, args);
  }

  public callChildren(childSheetName: string, funcName: string = "main", joinType = "void", options: IGenerateChildrenOption = {},
                      ...args: any[]): any {
    let sortDatas: TSortDataType[] = [];
    let backupNode: GeneratorNodeElement = this.__currentNode;
    _.forIn(this.__currentNode.getChildren(childSheetName), (childNode: GeneratorNodeElement) => {
      if (childNode.name == "*") return;
      this.__currentNode = childNode;
      let childResult: any = childNode.call(funcName, args);
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
    });
    this.__currentNode = backupNode;
    if (options.sort)
      sortDatas.sort((a: TSortDataType, b: TSortDataType) => {
        return options.sort(a.child.data, b.child.data);
      });
    switch (joinType) {
      case "auto":
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
sheetName=${this.__currentNode.definition.name}
nodeName=${this.__currentNode.name}
funcName=${funcName}
argJoinType=${argJoinType}
result=${childResult}
resultType="${typeof childResult} is invalid return data.`);
  }

  public write = (argPath: string, data: string, option: {override?: boolean} = {}): void => {
    if (!_.isString(argPath))
      throw `Error in $.write(path, data, option). arg "path" must be string, but it is type="${typeof argPath}"`;
    if (!_.isString(data))
      throw `Error in $.write(path, data, option). arg "data" must be string, but it is type="${typeof data}"`;
    if (!_.isObject(option))
      throw `Error in $.write(path, data, option). arg "option" must be string, but it is type="${typeof option}"`;
    let writePath: string = path.isAbsolute(argPath) ? argPath
      : path.join(this.Class.saveBaseDir, argPath);
    if (!_.isUndefined(option.override) && !option.override) {
      if (fs.existsSync(writePath)) {
        log.debug(`Skip ${writePath}. File exists.`);
        return;
      }
    }
    if (!fs.existsSync(path.dirname(writePath))) {
      throw `Error. Destination directory not found.
destinationPath="${writePath}"
destinationDir="${path.dirname(writePath)}`;
    }
    log.debug(`Writing ${writePath} ...`);
    fs.writeFileSync(writePath, data);
    this.Class.writeCount++;
  };

  public source(argSource: any): string {
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

  public indent(numIndent: number, argSource: any, indentFirstLine: boolean = true): string {
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

  public setIndent(arg: number): void {
    this.Class.unitIndent = arg;
  }

}
