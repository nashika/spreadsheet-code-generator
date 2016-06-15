import _ = require("lodash");

import {GeneratorNodeDefinition} from "./generator-node-definition";

export class GeneratorNodeElement {

  public data:{[columnName:string]:any};

  protected _childrenMap:{[sheetName:string]:{[nodeName:string]:GeneratorNodeElement}};

  constructor(public definition:GeneratorNodeDefinition,
              _dataRecord:{[columnName:string]:any}) {
    this._childrenMap = {};
    _.forIn(definition.children, (childDefinition:GeneratorNodeDefinition) => {
      this._childrenMap[childDefinition.name] = {};
    });
    this.data = _.cloneDeep(_dataRecord)
  }

  public get name():string {
    return this.data[this.definition.name];
  }

  public getChild(sheetName:string, nodeName:string):GeneratorNodeElement {
   return this._childrenMap[sheetName][nodeName];
  }

  protected addChild(node:GeneratorNodeElement):void {
    if (node.name)
      this._childrenMap[node.definition.name][node.name] = node;
  }

  /*public setChild(sheetName:string, nodeName:string, node:GeneratorNodeElement):void {
   this._childrenMap[sheetName][nodeName] = node;
   };*/

  public getChildren(sheetName:string):{[nodeName:string]:GeneratorNodeElement} {
    return this._childrenMap[sheetName];
  }

  /*public setChildren(sheetName:string, nodes:{[nodeName:string]:GeneratorNodeElement}) {
   this._childrenMap[sheetName] = nodes;
   }*/

  public add(node:GeneratorNodeElement):void {
    if (this.definition == node.definition.parent) {
      if (node.data[this.definition.name] == this.name)
        this.addChild(node);
    } else {
      if (_.includes(this.definition.descendants, node.definition)) {
        _.forEach(this.definition.children, (childDefinition:GeneratorNodeDefinition) => {
          if (_.includes(childDefinition.descendants, node.definition)) {
            let childNode:GeneratorNodeElement = this.getChild(childDefinition.name, node.data[childDefinition.name]);
            if (childNode)
              childNode.add(node);
          }
        });
      }
    }
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
