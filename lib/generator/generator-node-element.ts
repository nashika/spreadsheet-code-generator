import {GeneratorNodeDefinition} from "./generator-node-definition";

export class GeneratorNodeElement {

  public name:string;
  public data:{[columnName:string]:any};

  protected _childrenMap:{[sheetName:string]:{[nodeName:string]:GeneratorNodeElement}};

  constructor(public definition:GeneratorNodeDefinition) {
    this._childrenMap = {};
  }

  public getChild(sheetName:string, nodeName:string):GeneratorNodeElement {
    return this._childrenMap[sheetName][nodeName];
  };

  public setChild(sheetName:string, nodeName:string, node:GeneratorNodeElement):void {
    this._childrenMap[sheetName][nodeName] = node;
  };

  public getChildren(sheetName:string):{[nodeName:string]:GeneratorNodeElement} {
    return this._childrenMap[sheetName];
  }

  public setChildren(sheetName:string, nodes:{[nodeName:string]:GeneratorNodeElement}) {
    this._childrenMap[sheetName] = nodes;
  }

  public generate(funcName:string) {
    let generateFunc:Function = this.definition.getCode(funcName);
    if (typeof generateFunc == "function") {
      return generateFunc();
    } else if (generateFunc === undefined) {
      throw new Error(`Generate function ${this.definition.name}.${funcName} is undefined.`)
    } else {
      throw new Error(`Generate function ${this.definition.name}${funcName} is not function.`);
    }
  }

}
