import * as fs from "fs";
import * as path from "path";
import {ColumnComponent} from "./component/column-component";
import {SheetsComponent} from "./component/sheets-component";
import {SpreadsheetComponent} from "./component/spreadsheet-component";
import {DataIoService} from "./service/data-io-service";
import {SheetIoService} from "./service/sheet-io-service";

export interface ISheetDefinition {
  columns:Array<IColumnDefinition>;
  colHeaders:Array<string>;
}

export interface IColumnDefinition {
  data:string;
  type:string;
  width:number;
}

export class Application {

  // common data
  public saveBaseDir:string;
  public currentSheetName:string;
  public currentSheetDefinition:ISheetDefinition;

  // services
  public sheetIoService:SheetIoService;
  public dataIoService:DataIoService;

  // components
  public sheetsComponent:SheetsComponent;
  public columnComponent:ColumnComponent;
  public spreadsheetComponent:SpreadsheetComponent;

  constructor() {
    this.saveBaseDir = path.join(__dirname, "../sample");

    this.sheetIoService = new SheetIoService(this);
    this.dataIoService = new DataIoService(this);

    this.sheetsComponent = new SheetsComponent(this);
    this.columnComponent = new ColumnComponent(this);
    this.spreadsheetComponent = new SpreadsheetComponent(this);
  }

}
