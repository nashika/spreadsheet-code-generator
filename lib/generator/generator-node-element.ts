import _ = require("lodash");

import {GeneratorNodeDefinition} from "./generator-node-definition";

export class GeneratorNodeElement {

  public data:{[columnName:string]:any};
  public parent:GeneratorNodeElement;

  protected _childrenMap:{[sheetName:string]:{[nodeName:string]:GeneratorNodeElement}};

  constructor(public definition:GeneratorNodeDefinition,
              _dataRecord:{[columnName:string]:any}) {
    this.data = _.cloneDeep(_dataRecord);
    this.parent = null;
    this._childrenMap = {};
    _.forIn(definition.children, (childDefinition:GeneratorNodeDefinition) => {
      this._childrenMap[childDefinition.name] = {};
    });
  }

  public get name():string {
    return this.data[this.definition.name];
  }

  public getChild(sheetName:string, nodeName:string):GeneratorNodeElement {
    return this._childrenMap[sheetName][nodeName];
  }

  protected addChild(node:GeneratorNodeElement):void {
    if (node.name) {
      this._childrenMap[node.definition.name][node.name] = node;
      node.parent = this;
    }
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

  public applyInheritsRecursive() {
    _.forIn(this.definition.children, (childNodeDefinition:GeneratorNodeDefinition) => {
      _.forIn(this.getChildren(childNodeDefinition.name), (childNodeElement:GeneratorNodeElement) => {
        childNodeElement.applyInheritsRecursive();
      });
    });
    this.applyInherits();
  }

  public applyInherits() {
    // if "extends" column empty, do nothing
    let extendsStr:string = this.data["extends"];
    if (!extendsStr) return;
    // search inherit node from "extends" column data
    let splitExtendsStr:Array<string> = extendsStr.split(".");
    let inheritNodeElement:GeneratorNodeElement;
/*    let searchTarget:{[key:string]:BaseDefinition};
    let searchKey:string;
    if (splitExtendsStr.length == 1) {
      searchTarget = this.root.templates[MyInflection.pluralize((<typeof BaseDefinition>this.constructor).myName)];
      searchKey = extendsStr;
      inheritNodeElement = searchTarget[searchKey];
    }
    if (!inheritNodeElement) {
      let searchNode:BaseDefinition = this;
      let keys:Array<string> = [];
      for (let i = 0; i < splitExtendsStr.length; i++) {
        keys.unshift(MyInflection.pluralize((<typeof BaseDefinition>searchNode.constructor).myName));
        searchNode = searchNode.parent;
        if (!searchNode)
          throw new Error(`Too many dots.`);
      }
      for (let i = 0; i < splitExtendsStr.length; i++) {
        searchNode = searchNode.getChild(keys[i])[splitExtendsStr[i]];
        if (!searchNode)
          throw new Error(`Cant find extends parent. target=${extendsStr}`);
      }
      inheritNodeElement = searchNode;
    }
    if (!inheritNodeElement)
      throw new Error(`Cant find extend target. target=${extendsStr}`);*/

    // if inherit node "extends" column is not empty, do inherit node first.
    if (inheritNodeElement.data["extends"])
      inheritNodeElement.applyInherits();

    // merge this node and inherit node
    this.inheritNode(this.data, inheritNodeElement.data);
    // remove "extends" column data to notice finished
    delete this.data["extends"];
  }

  private inheritNode(data:any, inheritData:any) {
    for (let paramName in inheritData) {
      if (inheritData[paramName] instanceof Object) {
        if (data[paramName] === undefined) {
          data[paramName] = {};
          this.inheritNode(data[paramName], inheritData[paramName]);
        } else if (data[paramName] instanceof Object) {
          this.inheritNode(data[paramName], inheritData[paramName]);
        }
      } else {
        if (data[paramName] === undefined)
          data[paramName] = inheritData[paramName];
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
