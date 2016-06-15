import {TGeneratorSheetCodeObject} from "./generator-process";
import {ISheet, IColumn} from "../component/app-component";

export class GeneratorNodeDefinition {

  protected childrenNodeDefinition:{[sheetName:string]:GeneratorNodeDefinition};
  
  constructor(protected _sheet:ISheet,
              protected _sheetCodeObject:TGeneratorSheetCodeObject,
              protected _parentNodeDefinition:GeneratorNodeDefinition) {
    this.childrenNodeDefinition = {};
  }

  public get name():string {
    return this._sheet.name;
  }

  public get columns():IColumn[] {
    return this._sheet.columns;
  }
  
  public get parent():GeneratorNodeDefinition {
    return this._parentNodeDefinition;
  }
  
  public getCode(propName:string):any {
    return this._sheetCodeObject[propName];
  }
  
  public addChild(nodeDefinition:GeneratorNodeDefinition):void {
    this.childrenNodeDefinition[nodeDefinition.name] = nodeDefinition;
  }

}
