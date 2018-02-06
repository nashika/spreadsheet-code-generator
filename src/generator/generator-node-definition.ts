import * as path from "path";

import _ = require("lodash");

import {IColumn, ISheet} from "../service/hub.service";
import {GeneratorNode} from "./generator-node";
import {GeneratorProcess} from "./generator-process";

declare function originalRequire(path: string): any;

declare module originalRequire {
  var cache: { [path: string]: any };
}

export class GeneratorNodeDefinition {

  GeneratorNodeClass: typeof GeneratorNode;

  private _children: { [sheetName: string]: GeneratorNodeDefinition };
  private _ancestors: { [sheetName: string]: GeneratorNodeDefinition };
  private _descendants: { [sheetName: string]: GeneratorNodeDefinition };

  constructor(public process: GeneratorProcess,
              private sheet: ISheet,
              private _parent: GeneratorNodeDefinition) {
    this._children = {};
    this._descendants = {};
    this._ancestors = {};
    if (_parent) {
      this._ancestors[_parent.name] = _parent;
      _.assign(this._ancestors, _parent.ancestors);
    }
    this.GeneratorNodeClass = this.requireSheetObject(sheet.name);
    this.GeneratorNodeClass.definition = this;
  }

  get name(): string {
    return _.camelCase(this.sheet.name);
  }

  get columns(): IColumn[] {
    return this.sheet.columns;
  }

  get parent(): GeneratorNodeDefinition {
    return this._parent;
  }

  get children(): { [sheetName: string]: GeneratorNodeDefinition } {
    return this._children;
  }

  get ancestors(): { [sheetName: string]: GeneratorNodeDefinition } {
    return this._ancestors;
  }

  get descendants(): { [sheetName: string]: GeneratorNodeDefinition } {
    return this._descendants;
  }

  get depth(): number {
    return this.parent ? this.parent.depth + 1 : 0;
  }

  get path(): string[] {
    if (!this.parent) return [this.name];
    return _.concat(this.parent.path, [this.name]);
  }

  addChild(nodeDefinition: GeneratorNodeDefinition): void {
    this._children[nodeDefinition.name] = nodeDefinition;
    this._descendants[nodeDefinition.name] = nodeDefinition;
    if (this.parent)
      this.parent.addDescendants(nodeDefinition);
  }

  private addDescendants(nodeDefinition: GeneratorNodeDefinition): void {
    this._descendants[nodeDefinition.name] = nodeDefinition;
    if (this.parent)
      this.parent.addDescendants(nodeDefinition);
  }

  private requireSheetObject(sheetName: string): typeof GeneratorNode {
    let codeDir: string = path.join(this.process.saveBaseDir, "./code/");
    let sheetCodePath: string = path.join(codeDir, `./${sheetName}.js`);
    if (originalRequire.cache[sheetCodePath])
      delete originalRequire.cache[sheetCodePath];
    let sheetCode: typeof GeneratorNode;
    sheetCode = originalRequire(sheetCodePath);
    if (!GeneratorNode.isPrototypeOf(sheetCode)) {
      throw `Sheet code "${sheetName}.js" exports type="${typeof sheetCode}" data.
Sheet code expects export Class that extends GeneratorNode.`;
    }
    return sheetCode;
  }

}
