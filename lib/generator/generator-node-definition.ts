import {TGeneratorSheetCodeObject} from "./generator-process";
import {ISheet, IColumn} from "../component/app-component";
import _ = require("lodash");

export class GeneratorNodeDefinition {

  protected _children:{[sheetName:string]:GeneratorNodeDefinition};
  protected _ancestors:{[sheetName:string]:GeneratorNodeDefinition};
  protected _descendants:{[sheetName:string]:GeneratorNodeDefinition};

  constructor(protected _sheet:ISheet,
              protected _sheetCodeObject:TGeneratorSheetCodeObject,
              protected _parent:GeneratorNodeDefinition) {
    this._children = {};
    this._descendants = {};
    this._ancestors = {};
    if (_parent) {
      this._ancestors[_parent.name] = _parent;
      _.assign(this._ancestors, _parent.ancestors);
    }
  }

  public get name():string {
    return this._sheet.name;
  }

  public get columns():IColumn[] {
    return this._sheet.columns;
  }

  public get parent():GeneratorNodeDefinition {
    return this._parent;
  }

  public get children():{[sheetName:string]:GeneratorNodeDefinition} {
    return this._children;
  }

  public get ancestors():{[sheetName:string]:GeneratorNodeDefinition} {
    return this._ancestors;
  }

  public get descendants():{[sheetName:string]:GeneratorNodeDefinition} {
    return this._descendants;
  }

  public get path():string[] {
    if (!this.parent) return [this.name];
    return _.concat(this.parent.path, [this.name]);
  }

  public getCode(propName:string):any {
    return this._sheetCodeObject[propName];
  }

  public addChild(nodeDefinition:GeneratorNodeDefinition):void {
    this._children[nodeDefinition.name] = nodeDefinition;
    this._descendants[nodeDefinition.name] = nodeDefinition;
    if (this.parent)
      this.parent._addDescendants(nodeDefinition);
  }

  protected _addDescendants(nodeDefinition:GeneratorNodeDefinition):void {
    this._descendants[nodeDefinition.name] = nodeDefinition;
    if (this.parent)
      this.parent._addDescendants(nodeDefinition);
  }

}
