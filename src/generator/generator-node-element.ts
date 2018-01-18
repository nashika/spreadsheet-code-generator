import _ = require("lodash");

import {GeneratorNodeDefinition} from "./generator-node-definition";
import {GeneratorAccessor} from "./generator-accessor";

export class GeneratorNodeElement {

  public data: {[columnName: string]: any};
  public parent: GeneratorNodeElement;

  protected _childrenMap: {[sheetName: string]: {[nodeName: string]: GeneratorNodeElement}};

  constructor(public definition: GeneratorNodeDefinition,
              _dataRecord: {[columnName: string]: any}) {
    this.data = _.cloneDeep(_dataRecord);
    this.parent = null;
    this._childrenMap = {};
    _.forIn(definition.children, (childDefinition: GeneratorNodeDefinition) => {
      let childSheetName: string = _.camelCase(childDefinition.name);
      this._childrenMap[childSheetName] = {};
    });
  }

  public get name(): string {
    return this.data[this.definition.name];
  }

  public get root(): GeneratorNodeElement {
    return this.parent ? this.parent.root : this;
  }

  public get path(): Array<[string, string]> {
    return <any>_.concat(this.parent ? this.parent.path : [], [[this.definition.name, this.name]])
  }

  public getChild(sheetName: string, nodeName: string): GeneratorNodeElement {
    sheetName = _.camelCase(sheetName);
    return this._childrenMap[sheetName] && this._childrenMap[sheetName][nodeName];
  }

  protected addChild(node: GeneratorNodeElement): void {
    let sheetName = _.camelCase(node.definition.name);
    if (node.name) {
      this._childrenMap[sheetName][node.name] = node;
      node.parent = this;
    }
  }

  /*public setChild(sheetName:string, nodeName:string, node:GeneratorNodeElement):void {
   this._childrenMap[sheetName][nodeName] = node;
   };*/

  public getChildren(sheetName: string): {[nodeName: string]: GeneratorNodeElement} {
    sheetName = _.camelCase(sheetName);
    if (!_.has(this._childrenMap, sheetName))
      throw new Error(`Can not find child node. sheetName="${sheetName}".`);
    return this._childrenMap[sheetName];
  }

  /*public setChildren(sheetName:string, nodes:{[nodeName:string]:GeneratorNodeElement}) {
   this._childrenMap[sheetName] = nodes;
   }*/

  public add(node: GeneratorNodeElement): void {
    if (_.isEmpty(node.data)) return;
    if (this.definition == node.definition.parent) {
      if (this.definition.name == "root" || this.name == node.data[this.definition.name])
        this.addChild(node);
    } else {
      if (_.includes(this.definition.descendants, node.definition)) {
        _.forEach(this.definition.children, (childDefinition: GeneratorNodeDefinition) => {
          if (_.includes(childDefinition.descendants, node.definition)) {
            let childNode: GeneratorNodeElement = this.getChild(childDefinition.name, node.data[childDefinition.name]);
            if (childNode)
              childNode.add(node);
          }
        });
      }
    }
  }

  public call(funcName: string = "main", args: any[] = []): any {
    let generateFunc: Function = this.definition.getCode(funcName);
    if (funcName == "data" && !generateFunc) {
      return _.cloneDeep(this.data);
    }
    if (typeof generateFunc == "function") {
      return generateFunc.apply(new GeneratorAccessor(this), args);
    } else if (generateFunc === undefined) {
      this.throwError(`Generate function ${this.definition.name}.${funcName} is undefined.`);
    } else {
      this.throwError(`Generate function ${this.definition.name}${funcName} is not function.`);
    }
  }

  protected throwError(msg: string, showStack: boolean = true): void {
    let text: string = `path="${JSON.stringify(this.path)}"`;
    if (showStack) {
      throw new Error(`Node element error. ${msg}\n${text}`);
    } else {
      throw `Error. ${msg}\n${text}`;
    }
  }

}
