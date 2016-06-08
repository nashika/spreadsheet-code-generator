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

export var app = new Vue({
  el: "#app",
  data: {
    saveBaseDir: path.join(__dirname, "../sample"),
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
});

app.$data.services.sheetIo = new SheetIoService();
app.$data.services.dataIo = new DataIoService();
