import * as path from "path";

import Component from "vue-class-component";
const electron = require('electron');
const remote = electron.remote;
const BrowserWindow = remote.BrowserWindow;

import {BaseComponent} from "./base-component";
import {ColumnComponent} from "./column-component";
import {SheetsComponent} from "./sheets-component";
import {SpreadsheetComponent} from "./spreadsheet-component";
import {DataIoService} from "../service/data-io-service";
import {SheetIoService} from "../service/sheet-io-service";
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
    sheetIo: SheetIoService,
    dataIo: DataIoService,
  };

  data():any {
    return {
      saveBaseDir: path.join(remote.app.getAppPath(), "./sample"),
      sheets: [],
      currentSheet: null,
      services: {
        sheetIo: null,
        dataIo: null,
      },
    };
  }

  onChangeSheet(sheetName:string):void {
    if (!sheetName) return;
    this.currentSheet = this.services.sheetIo.load(sheetName);
  }

}

let app:AppComponent = new (<any>AppComponent)({el: "#app"});

app.services.sheetIo = new SheetIoService(app);
app.services.dataIo = new DataIoService(app);
