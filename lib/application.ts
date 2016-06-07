import * as fs from "fs";
import * as path from "path";
import {ColumnEditor} from "./component/column-editor";
import {DefinitionSelector} from "./component/definition-selector";
import {Spreadsheet} from "./component/spreadsheet";

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

  public container:Element;
  public storeDir:string;
  public definitionDir:string;
  public dataDir:string;
  public definitionNames:string[];

  public definitionSelector:DefinitionSelector;
  public columnEditor:ColumnEditor;
  public spreadsheet:Spreadsheet;

  public currentDefinitionName:string;
  public currentDefinition:IDefinition;

  constructor() {
    this.container = document.getElementById('spreadsheet');
    this.storeDir = path.join(__dirname, "../sample");
    this.definitionDir = path.join(this.storeDir, "definition");
    this.dataDir = path.join(this.storeDir, "data");
    let definitionFiles:string[] = fs.readdirSync(this.definitionDir);
    this.definitionNames = [];
    for (let definitionFile of definitionFiles) this.definitionNames.push(definitionFile.replace(/\.json$/, ""));

    this.definitionSelector = new DefinitionSelector(this);
    this.columnEditor = new ColumnEditor(this);
    this.spreadsheet = new Spreadsheet(this);
  }

  public loadData():any[] {
    let filePath:string = path.join(this.dataDir, `${this.currentDefinitionName}.json`);
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath).toString());
    } else {
      return [];
    }
  };

  public saveData():void {
    fs.writeFileSync(path.join(this.dataDir, `${this.currentDefinitionName}.json`), JSON.stringify(this.spreadsheet.jsonData, null, "  "));
  };

  public changeDefinition(definitionName:string):void {
    if (this.spreadsheet.isLoaded) {
      this.saveData();
    }

    this.currentDefinitionName = definitionName;
    this.currentDefinition = require(path.join(this.definitionDir, `${this.currentDefinitionName}.json`));

    let data:any[] = this.loadData();
    this.spreadsheet.changeDefinition(data);
  }
  
}
