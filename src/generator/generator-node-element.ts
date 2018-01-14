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
      let wildcardData: {[columnName: string]: any} = {};
      _.forEach(_.drop(childDefinition.path), (pathSheetName: string) => {
        wildcardData[pathSheetName] = "*";
      });
      let wildcardNode: GeneratorNodeElement = new GeneratorNodeElement(childDefinition, wildcardData);
      this.addChild(wildcardNode);
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
      if (this.definition.name == "root" || _.includes([this.name, "*"], node.data[this.definition.name]))
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

  public applyInheritsRecursive() {
    _.forIn(this.definition.children, (childNodeDefinition: GeneratorNodeDefinition) => {
      _.forIn(this.getChildren(childNodeDefinition.name), (childNodeElement: GeneratorNodeElement) => {
        childNodeElement.applyInheritsRecursive();
      });
    });
    this.applyInherits();
  }

  public applyInherits() {
    // if "extends" column empty, do nothing
    let extendsStr: string = this.data["extends"];
    if (!extendsStr) return;
    // search inherit node from "extends" column data
    let extendsPath: string[] = extendsStr.split(".");
    // search base node with wildcard
    let wildcardDepth = this.definition.depth - extendsPath.length;
    if (wildcardDepth < 0) this.throwError(`extends="${extendsStr}" is invalid, maybe too many dots.`, false);
    if (wildcardDepth >= this.definition.depth) this.throwError(`extends="${extendsStr}" is invalid. unknown depth.`, false);
    let searchBaseRecursive = (node: GeneratorNodeElement, depth: number, currentDepth: number = 0): GeneratorNodeElement => {
      if (currentDepth == depth) return node;
      if (!node) return node;
      let nextSheetName: string = this.definition.path[currentDepth + 1];
      return searchBaseRecursive(node.getChild(nextSheetName, "*"), depth, currentDepth + 1);
    };
    let searchBaseNode: GeneratorNodeElement = searchBaseRecursive(this.root, wildcardDepth);
    // search node from search base
    let searchTargetRecursive = (node: GeneratorNodeElement, depth: number, path: string[]): GeneratorNodeElement => {
      if (path.length == 0) return node;
      if (!node) return node;
      let nextNode: GeneratorNodeElement = node.getChild(this.definition.path[depth + 1], path[0]);
      return searchTargetRecursive(nextNode, depth + 1, _.drop(path));
    };
    // search node form
    let inheritNodeElement: GeneratorNodeElement = searchTargetRecursive(searchBaseNode, wildcardDepth, extendsPath);
    if (!inheritNodeElement)
      this.throwError(`Cant find extend target. extends="${extendsStr}"`, false);
    // if inherit node "extends" column is not empty, do inherit node first.
    if (inheritNodeElement.data["extends"])
      inheritNodeElement.applyInherits();
    // merge this node and inherit node
    this.inheritData(inheritNodeElement.data);
    // remove "extends" column data to notice finished
    delete this.data["extends"];
  }

  private inheritData(inheritData: any) {
    let newData: {[columnName: string]: any} = {};
    for (let column of this.definition.columns) {
      let key: string = column.data;
      if (_.has(this.data, key)) {
        _.set(newData, key, _.get(this.data, key));
      } else if (_.has(inheritData, key)) {
        _.set(newData, key, _.get(inheritData, key));
      }
    }
    this.data = newData;
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
