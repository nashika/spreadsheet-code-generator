import _ = require("lodash");

import {TGeneratorSheetCodeObject, IGeneratorResult} from "./generator-process";
import {GeneratorNodeElement} from "./generator-node-element";

type TGeneratorReturn = string|{[key:string]:any}|Array<any>|IGeneratorResult[];
type TSortDataType = {child:GeneratorNodeElement, result:TGeneratorReturn};

export class GeneratorAccessor {

  public _sheetCodeObjects:{[sheetName:string]:TGeneratorSheetCodeObject};
  public _currentNode:GeneratorNodeElement;
  public _unitIndent:number = 4;

  constructor() {
  }

  public generate(funcName:string = "main"):TGeneratorReturn {
    return this._currentNode.generate(funcName);
  }

  public generateChildren(childSheetName:string, funcName:string = "main", argJoinType:string = "auto",
                          sortFunc:(childA:any, childB:any) => number = null):TGeneratorReturn {
    let sortDatas:TSortDataType[] = [];
    let backupNode:GeneratorNodeElement = this._currentNode;
    let joinType:string = argJoinType;
    _.forIn(this._currentNode.getChildren(childSheetName), (childNode:GeneratorNodeElement) => {
      if (childNode.name == "*") return;
      this._currentNode = childNode;
      let childResult:TGeneratorReturn = childNode.generate(funcName);
      // auto decide join type
      if (joinType == "auto") {
        if (_.isString(childResult)) joinType = "string";
        else if (_.isArray(childResult)) {
          if (_.every(childResult, (childResultElement:any) => {
              return _.has(childResultElement, "data") && _.has(childResultElement, "path")
            })) joinType = "result";
          else joinType = "array";
        }
        else if (_.isObject(childResult)) joinType = "object";
        else this.throwErrorGenerateChildren(funcName, argJoinType, childResult, "auto join type failed");
      }
      // type check from join type
      switch (joinType) {
        case "string":
          if (!_.isString(childResult)) this.throwErrorGenerateChildren(funcName, argJoinType, childResult, "result expects string");
          break;
        case "array":
          if (!_.isArray(childResult)) this.throwErrorGenerateChildren(funcName, argJoinType, childResult, "result expects array");
          break;
        case "object":
          if (!_.isObject(childResult)) this.throwErrorGenerateChildren(funcName, argJoinType, childResult, "result expects object");
          break;
        case "result":
          if (!_.every(childResult, (childResultElement:any) => {
              return _.has(childResultElement, "data") && _.has(childResultElement, "path")}))
            this.throwErrorGenerateChildren(funcName, argJoinType, childResult, "result expects [{data: ... path: ...}, ...] object.");
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
    if (sortFunc)
      sortDatas.sort((a:TSortDataType, b:TSortDataType) => {
        return sortFunc(a.child.data, b.child.data);
      });
    switch (joinType) {
      case "string":
        let resultString:string = "";
        for (let sortData of sortDatas)
          resultString += sortData.result;
        return resultString;
      case "array":
      case "result":
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
