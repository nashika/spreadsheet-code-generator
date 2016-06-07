import * as fs from "fs";
import * as path from "path";
import {ColumnComponent} from "./component/column-component";
import {SheetsComponent} from "./component/sheets-component";
import {SpreadsheetComponent} from "./component/spreadsheet-component";
import {DataIoService} from "./service/data-io-service";

export interface IDefinition {
  columns:Array<IDefinitionColumn>;
  colHeaders:Array<string>;
}

export interface IDefinitionColumn {
  data:string;
  type:string;
  width:number;
}

export class Application {

  public storeDir:string;
  public definitionDir:string;
  public dataDir:string;
  public definitionNames:string[];
  public currentDefinitionName:string;
  public currentDefinition:IDefinition;

  // services
  public dataIoService:DataIoService;

  // components
  public sheetsComponent:SheetsComponent;
  public columnComponent:ColumnComponent;
  public spreadsheetComponent:SpreadsheetComponent;

  constructor() {
    this.storeDir = path.join(__dirname, "../sample");
    this.definitionDir = path.join(this.storeDir, "definition");
    this.dataDir = path.join(this.storeDir, "data");
    let definitionFiles:string[] = fs.readdirSync(this.definitionDir);
    this.definitionNames = [];
    for (let definitionFile of definitionFiles) this.definitionNames.push(definitionFile.replace(/\.json$/, ""));

    this.dataIoService = new DataIoService(this);

    this.sheetsComponent = new SheetsComponent(this);
    this.columnComponent = new ColumnComponent(this);
    this.spreadsheetComponent = new SpreadsheetComponent(this);
  }

}
