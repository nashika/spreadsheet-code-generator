import * as path from "path";
import {ColumnComponent} from "./column-component";
import {SheetsComponent} from "./sheets-component";
import {SpreadsheetComponent} from "./spreadsheet-component";
import {DataIoService} from "../service/data-io-service";
import {SheetIoService} from "../service/sheet-io-service";
import {templateLoader} from "./template-loader";

export interface ISheetDefinition {
  columns:Array<IColumnDefinition>;
  colHeaders:Array<string>;
}

export interface IColumnDefinition {
  data:string;
  type:string;
  width:number;
}

let app = new Vue({
  el: "#app",
  template: templateLoader("app"),
  data: {
    saveBaseDir: path.join(__dirname, "../../sample"),
    currentSheetName: "",
    currentSheetDefinition: null,
    sheetNames: [],
    services: {
      sheetIo: null,
      dataIo: null,
    },
  },
  components: {
    "sheets-component": SheetsComponent,
    "column-component": ColumnComponent,
    "spreadsheet-component": SpreadsheetComponent,
  },
  events: {
    "change-sheet": function (sheetName:string):void {
      this.currentSheetName = sheetName;
      if (!sheetName) return;
      this.currentSheetDefinition = this.services.sheetIo.load(sheetName);
    },
  },
});

app.$data.services.sheetIo = new SheetIoService(app);
app.$data.services.dataIo = new DataIoService(app);
