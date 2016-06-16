import fs = require("fs");
import path = require("path");

import _ = require("lodash");

import {TGeneratorSheetCode, IGeneratorResult} from "./generator-process";
import {GeneratorNodeElement} from "./generator-node-element";
import {AppComponent} from "../component/app-component";

interface IGenerateChildrenOption {
  join?:string;
  sort?:(childA:any, childB:any) => number;
}

type TGeneratorReturn = string|{[key:string]:any}|Array<any>|IGeneratorResult[];
type TSortDataType = {child:GeneratorNodeElement, result:TGeneratorReturn};

export class GeneratorAccessor {

  public _sheetCodes:{[sheetName:string]:TGeneratorSheetCode};
  public _currentNode:GeneratorNodeElement;
  public _unitIndent:number = 4;
  public _writeCount:number = 0;

  constructor(protected app:AppComponent) {
  }

  public generate(funcName:string = "main", ...args:any[]):TGeneratorReturn {
    return this._currentNode.generate(this, funcName, args);
  }

  public call(func:Function, args:any[]):any {
    return func.apply(this, args);
  }

  public generateChildren(childSheetName:string, funcName:string = "main", options:IGenerateChildrenOption = {},
                          ...args:any[]):TGeneratorReturn {
    let argJoinType:string = options.join || "auto";
    let argSortFunuc:(childA:any, childB:any) => number = null;
    let sortDatas:TSortDataType[] = [];
    let backupNode:GeneratorNodeElement = this._currentNode;
    let joinType:string = argJoinType;
    _.forIn(this._currentNode.getChildren(childSheetName), (childNode:GeneratorNodeElement) => {
      if (childNode.name == "*") return;
      this._currentNode = childNode;
      let childResult:TGeneratorReturn = childNode.generate(this, funcName, args);
      // auto decide join type
      if (joinType == "auto") {
        if (_.isUndefined(childResult)) joinType = "void";
        else if (_.isString(childResult)) joinType = "string";
        else if (_.isArray(childResult)) joinType = "array";
        else if (_.isObject(childResult)) joinType = "object";
        else this.throwErrorGenerateChildren(funcName, argJoinType, childResult, "auto join type failed");
      }
      // type check from join type
      switch (joinType) {
        case "void":
          if (!_.isUndefined(childResult)) this.throwErrorGenerateChildren(funcName, argJoinType, childResult, "result expects void");
          break;
        case "string":
          if (!_.isString(childResult)) this.throwErrorGenerateChildren(funcName, argJoinType, childResult, "result expects string");
          break;
        case "array":
          if (!_.isArray(childResult)) this.throwErrorGenerateChildren(funcName, argJoinType, childResult, "result expects array");
          break;
        case "object":
          if (!_.isObject(childResult)) this.throwErrorGenerateChildren(funcName, argJoinType, childResult, "result expects object");
          break;
        default:
          this.throwErrorGenerateChildren(funcName, argJoinType, childResult, "unknown join type");
      }
      sortDatas.push({
        child: childNode,
        result: childResult,
      });
    });
    this._currentNode = backupNode;
    if (argSortFunuc)
      sortDatas.sort((a:TSortDataType, b:TSortDataType) => {
        return argSortFunuc(a.child.data, b.child.data);
      });
    switch (joinType) {
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
        this.throwErrorGenerateChildren(funcName, argJoinType, null, "unknown join type");
    }
  }

  public write = (argPath:string, data:string, option:{override?:boolean} = {}):void => {
    if (!_.isString(argPath))
      throw `Error in $.write(path, data, option). arg "path" must be string, but it is type="${typeof argPath}"`;
    if (!_.isString(data))
      throw `Error in $.write(path, data, option). arg "data" must be string, but it is type="${typeof data}"`;
    if (!_.isObject(option))
      throw `Error in $.write(path, data, option). arg "option" must be string, but it is type="${typeof option}"`;
    let writePath:string = path.isAbsolute(argPath) ? argPath
      : path.join(this.app.saveBaseDir, argPath);
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

  protected throwErrorGenerateChildren(funcName:string, argJoinType:string, childResult:any, message:string) {
    throw new Error(`generateChildren error.
${message}
sheetName=${this._currentNode.definition.name}
nodeName=${this._currentNode.name}
funcName=${funcName}
argJoinType=${argJoinType}
result=${childResult}
resultType="${typeof childResult} is invalid return data.`);
  }

  public get this():any {
    return this._currentNode.data;
  }

  public source(source:string):string {
    let result:string = "";
    let lines:Array<string> = source.split(/\n/g);
    if (lines[0] == "") lines.shift();
    if (lines[lines.length - 1] == "") lines.pop();
    lines.forEach((line:string) => {
      if (line.match(/###Delete###/)) return;
      if (line.match(/###NoNewline###/)) {
        line = line.replace(/###NoNewline###/, "");
        result = result.replace(/\n$/m, "");
      }
      result += line + "\n";
    });
    return result;
  }

  public indent(numIndent:number, source:string):string {
    let result:string = "";
    let lines:Array<string> = source.split(/\n/g);
    lines.pop();
    lines.forEach((line:string, index:number) => {
      let newline:string = (index < lines.length - 1) ? "\n" : "";
      if (line)
        result += _.repeat(" ", this._unitIndent * numIndent) + line + newline;
      else
        result += line + newline;
    });
    return result;
  }

  public delete(flag:boolean = true):string {
    if (flag)
      return "###Delete###";
    else
      return "";
  }

  public noNewline():string {
    return "###NoNewline###";
  }

}
