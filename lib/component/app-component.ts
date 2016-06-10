import * as path from "path";

import Component from "vue-class-component";
const electron = require('electron');
const remote = electron.remote;
const BrowserWindow = remote.BrowserWindow;

import {BaseComponent} from "./base-component";
import {ColumnComponent} from "./column-component";
import {SheetsComponent} from "./sheets-component";
import {SpreadsheetComponent} from "./spreadsheet-component";
import {SheetService} from "../service/sheet-service";
import {ColumnService} from "../service/column-service";
import {DataService} from "../service/data-service";
import {templateLoader} from "./template-loader";

export interface ISheet {
  name:string;
  columns:Array<IColumn>;
}

export interface IColumn {
  header:string;
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
export class AppComponent extends BaseComponent {

  saveBaseDir:string;
  sheets:ISheet[];
  currentSheet:ISheet;
  services:{
    sheet: SheetService,
    column: ColumnService,
    data: DataService,
  };

  data():any {
    return {
      saveBaseDir: path.join(remote.app.getAppPath(), "./sample"),
      sheets: [],
      currentSheet: null,
      services: {
        sheet: null,
        column: null,
        data: null,
      },
    };
  }

  onChangeSheet(sheetName:string):void {
    if (!sheetName) return;
    this.currentSheet = this.services.sheet.load(sheetName);
  }

}

let app:AppComponent = new (<any>AppComponent)({el: "#app"});

app.services.sheet = new SheetService(app);
app.services.column = new ColumnService(app);
app.services.data = new DataService(app);
