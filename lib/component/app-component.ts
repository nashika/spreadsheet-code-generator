import * as path from "path";

import Component from "vue-class-component";

import {BaseComponent, IRootVue} from "./base-component";
import {ColumnComponent} from "./column-component";
import {SheetsComponent} from "./sheets-component";
import {SpreadsheetComponent} from "./spreadsheet-component";
import {DataIoService} from "../service/data-io-service";
import {SheetIoService} from "../service/sheet-io-service";
import {templateLoader} from "./template-loader";

export interface ISheetDefinition{
  columns:Array<IColumnDefinition>;
  colHeaders:Array<string>;
}

export interface IColumnDefinition {
  data:string;
  type:string;
  width:number;
}

@Component({
  template: templateLoader("app"),
  components: {
    "sheets-component": SheetsComponent,
    "column-component": ColumnComponent,
    "spreadsheet-component": SpreadsheetComponent,
  },
  events: {
    "change-sheet": "onChangeSheet",
  },
})
export class App extends BaseComponent {

  saveBaseDir:string;
  currentSheetName:string;
  currentSheetDefinition:ISheetDefinition;
  sheetNames:string[];
  services:{
    sheetIo: SheetIoService,
    dataIo: DataIoService,
  };

  data():any {
    return {
      saveBaseDir: path.join(__dirname, "../../sample"),
      currentSheetName: "",
      currentSheetDefinition: null,
      sheetNames: [],
      services: {
        sheetIo: null,
        dataIo: null,
      },
    };
  }

  onChangeSheet(sheetName:string):void {
    this.currentSheetName = sheetName;
    if (!sheetName) return;
    this.currentSheetDefinition = this.services.sheetIo.load(sheetName);
  }

}

let app:IRootVue = new (<any>App)({el: "#app"});

app.services.sheetIo = new SheetIoService(app);
app.services.dataIo = new DataIoService(app);
