import {TGeneratorSheetCodeObject} from "./generator-process";
import {ISheet, IColumn} from "../component/app-component";

export class GeneratorNodeDefinition {

  constructor(protected sheet:ISheet,
              public sheetCodeObject:TGeneratorSheetCodeObject) {}

  public get name():string {
    return this.sheet.name;
  }
  
  public get columns():IColumn[] {
    return this.sheet.columns;
  }
  
}
