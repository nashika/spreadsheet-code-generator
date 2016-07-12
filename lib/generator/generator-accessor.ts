import fs = require("fs");
import path = require("path");

import _ = require("lodash");

import {TGeneratorSheetCode} from "./generator-process";
import {GeneratorNodeElement} from "./generator-node-element";
import {AppComponent} from "../component/app-component";
import {GeneratorNodeDefinition} from "./generator-node-definition";

interface IGenerateChildrenOption {
  join?:string;
  sort?:(childA:any, childB:any) => number;
}

type TSortDataType = {child:GeneratorNodeElement, result:any};

export class GeneratorAccessor {

  public _sheetCodes:{[sheetName:string]:TGeneratorSheetCode};
  public _currentNode:GeneratorNodeElement;
  public _unitIndent:number = 4;
  public _writeCount:number = 0;

  protected _childrenCache:{[sheetName:string]:{[nodeName:string]:any}};
  protected _childrenCachedNode:GeneratorNodeElement;

  constructor(protected saveBaseDir:string) {
  }

  public get name():string {
    return this._currentNode.name;
  }

  public get data():any {
    return this._currentNode.data;
  }

  public get parent():any {
    return this._currentNode.parent.data;
  }

  public get columns():string[] {
    return _.map(this._currentNode.definition.columns, column => column.data);
  }

  public get children():{[sheetName:string]:{[nodeName:string]:any}} {
    if (this._currentNode == this._childrenCachedNode && this._childrenCache)
      return this._childrenCache;
    let result:{[sheetName:string]:{[nodeName:string]:any}} = {};
    _.forIn(this._currentNode.definition.children, (def:GeneratorNodeDefinition):void => {
      let sheetName:string = _.camelCase(def.name);
      result[sheetName] = {};
      _.forIn(this._currentNode.getChildren(sheetName), (node:GeneratorNodeElement):void => {
        if (node.name == "*") return;
        result[sheetName][node.name] = node.data;
      });
    });
    this._childrenCache = result;
    this._childrenCachedNode = this._currentNode;
    return result;
  }

  public get deleteLine():string {
    return "###DeleteLine###";
  }

  public get noNewLine():string {
    return "###NoNewLine###";
  }

  public call(funcName:string = "main", ...args:any[]):any {
    return this._currentNode.call(this, funcName, args);
  }

  public callChildren(childSheetName:string, funcName:string = "main", options:IGenerateChildrenOption = {},
                      ...args:any[]):any {
    let argJoinType:string = options.join || "auto";
    let argSortFunc:(childA:any, childB:any) => number = null;
    let sortDatas:TSortDataType[] = [];
    let backupNode:GeneratorNodeElement = this._currentNode;
    let joinType:string = argJoinType;
    _.forIn(this._currentNode.getChildren(childSheetName), (childNode:GeneratorNodeElement) => {
      if (childNode.name == "*") return;
      this._currentNode = childNode;
      let childResult:any = childNode.call(this, funcName, args);
      // auto decide join type
      if (joinType == "auto") {
        if (_.isUndefined(childResult)) joinType = "void";
        else if (_.isString(childResult)) joinType = "string";
        else if (_.isArray(childResult)) joinType = "array";
        else if (_.isObject(childResult)) joinType = "object";
        else this._throwErrorCallChildren(funcName, argJoinType, childResult, "auto join type failed");
      }
      // type check from join type
      switch (joinType) {
        case "void":
          if (!_.isUndefined(childResult)) this._throwErrorCallChildren(funcName, argJoinType, childResult, "result expects void");
          break;
        case "string":
          if (!_.isString(childResult)) this._throwErrorCallChildren(funcName, argJoinType, childResult, "result expects string");
          break;
        case "array":
          if (!_.isArray(childResult)) this._throwErrorCallChildren(funcName, argJoinType, childResult, "result expects array");
          break;
        case "object":
          if (!_.isObject(childResult)) this._throwErrorCallChildren(funcName, argJoinType, childResult, "result expects object");
          break;
        default:
          this._throwErrorCallChildren(funcName, argJoinType, childResult, "unknown join type");
      }
      sortDatas.push({
        child: childNode,
        result: childResult,
      });
    });
    this._currentNode = backupNode;
    if (argSortFunc)
      sortDatas.sort((a:TSortDataType, b:TSortDataType) => {
        return argSortFunc(a.child.data, b.child.data);
      });
    switch (joinType) {
      case "auto":
      case "void":
        return undefined;
      case "string":
        let resultString:string = "";
        for (let sortData of sortDatas)
          resultString += sortData.result;
        return resultString;
      case "array":
        let resultArray:any[] = [];
        for (let sortData of sortDatas)
          resultArray = _.concat(resultArray, <any[]>sortData.result)
        return resultArray;
      case "object":
        let resultObject:any = {};
        for (let sortData of sortDatas)
          resultObject = _.merge(resultObject, <any>sortData.result);
        return resultObject;
      default:
        this._throwErrorCallChildren(funcName, argJoinType, null, "unknown join type");
    }
  }

  protected _throwErrorCallChildren(funcName:string, argJoinType:string, childResult:any, message:string) {
    throw new Error(`callChildren error.
${message}
sheetName=${this._currentNode.definition.name}
nodeName=${this._currentNode.name}
funcName=${funcName}
argJoinType=${argJoinType}
result=${childResult}
resultType="${typeof childResult} is invalid return data.`);
  }

  public write = (argPath:string, data:string, option:{override?:boolean} = {}):void => {
    if (!_.isString(argPath))
      throw `Error in $.write(path, data, option). arg "path" must be string, but it is type="${typeof argPath}"`;
    if (!_.isString(data))
      throw `Error in $.write(path, data, option). arg "data" must be string, but it is type="${typeof data}"`;
    if (!_.isObject(option))
      throw `Error in $.write(path, data, option). arg "option" must be string, but it is type="${typeof option}"`;
    let writePath:string = path.isAbsolute(argPath) ? argPath
      : path.join(this.saveBaseDir, argPath);
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
    this._writeCount++;
  };

  public source(argSource:any):string {
    let result:string = "";
    let source:string = _.isString(argSource) ? argSource : _.toString(argSource);
    let lines:Array<string> = source.toString().split(/\n/g);
    if (lines[0] == "") lines.shift();
    if (lines[lines.length - 1] == "") lines.pop();
    lines.forEach((line:string) => {
      if (line.match(/###DeleteLine###/)) return;
      if (line.match(/###NoNewLine###/)) {
        line = line.replace(/###NoNewLine###/, "");
        result = result.replace(/\n$/m, "");
      }
      result += line + "\n";
    });
    return result;
  }

  public indent(numIndent:number, argSource:any, indentFirstLine:boolean = true):string {
    let result:string = "";
    let source:string = _.isString(argSource) ? argSource : _.toString(argSource);
    let lines:Array<string> = source.split(/\n/g);
    if (lines[lines.length - 1] == "") lines.pop();
    lines.forEach((line:string, index:number) => {
      let newLine:string = (index < lines.length - 1) ? "\n" : "";
      if (line && (index > 0 || indentFirstLine))
        result += _.repeat(" ", this._unitIndent * numIndent) + line + newLine;
      else
        result += line + newLine;
    });
    return result;
  }

  public setIndent(arg:number):void {
    this._unitIndent = arg;
  }

}
