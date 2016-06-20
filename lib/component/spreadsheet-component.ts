import Component from "vue-class-component";
import _ = require("lodash");

import {BaseComponent} from "./base-component";
import {ISheet, ISheetMeta, IColumn} from "./app-component";
import {templateLoader} from "./template-loader";

type THandsontableChange = [number, string, any, any];

@Component({
  template: templateLoader("spreadsheet"),
  props: ["currentSheet", "currentSheetMeta", "currentData", "showMenu"],
  watch: {
    "currentSheet": {
      handler: SpreadsheetComponent.prototype.rebuildSpreadsheet,
      deep: true,
    },
    "showMenu": SpreadsheetComponent.prototype.watchShowMenu,
  },
  ready: SpreadsheetComponent.prototype.onReady,
  beforeDestroy: SpreadsheetComponent.prototype.onBeforeDestroy,
})
export class SpreadsheetComponent extends BaseComponent {

  currentSheet:ISheet;
  currentSheetMeta:ISheetMeta;
  currentData:any[];

  hot:ht.Methods;
  columnMap: {[key:string]:IColumn};
  resizeTimer:any;

  data():any {
    return {
      hot: false,
      columnMap: null,
      resizeTimer: null,
    };
  }

  onReady() {
    window.addEventListener("resize", this.resize);
    this.rebuildSpreadsheet();
  }

  onBeforeDestroy() {
    window.removeEventListener("resize", this.resize);
  }

  resize() {
    clearTimeout(this.resizeTimer);
    this.resizeTimer = setTimeout(() => {
      this.rebuildSpreadsheet();
    }, 200);
  }

  jsonValidator(value:string, callback:(result:boolean) => void):void {
    if (value == "") return callback(true);
    try {
      JSON.parse(value);
    } catch (e){
      return callback(false);
    }
    return callback(true);
  }

  afterSelection(r:number, c:number, r2:number, c2:number):void {
    setTimeout(() => {
      this.$root.$broadcast("select-column", c);
    }, 0);
  }

  afterChange(changes:THandsontableChange[]):void {
    if (changes) {
      this.currentSheetMeta.modified = true;
    }
  }

  rebuildSpreadsheet():void {
    if (this.hot) {
      this.hot.destroy();
      this.hot = null;
    }
    if (this.currentSheet.name == "root") return;
    let container:Element = this.$el.querySelector("#spreadsheet");
    let sheetName:string = this.currentSheet.name;
    if (!sheetName) return;
    let data:any[] = this.currentData;
    let colHeaders:string[] = [];
    let columns:any[] = [];
    this.columnMap = {};
    for (let c of this.currentSheet.columns) {
      colHeaders.push(c.header);
      this.columnMap[c.data] = c;
      let column:any;
      switch (c.type) {
        case "select":
          column = {
            editor: "select",
            selectOptions: _.split(c.options, /\n/),
          };
          break;
        default:
          column = {
            type: c.type,
          };
          break;
      }
      if (c.json) {
        column.validator = this.jsonValidator;
        column.invalidCellClassName = "invalidCell";
        column.allowInvalid = true;
      }
      _.assign(column, {
        data: c.data,
        width: c.width,
      });
      columns.push(column);
    }
    this.hot = new Handsontable(container, {
      data: data,
      width: this.$el.offsetWidth - 1,
      height: this.$el.offsetHeight - 1,
      columns: columns,
      rowHeaders: true,
      colHeaders: colHeaders,
      contextMenu: true,
      wordWrap: false,
      currentRowClassName: 'currentRow',
      currentColClassName: 'currentCol',
      afterChange: this.afterChange,
      afterSelection: this.afterSelection,
    });
  }

  watchShowMenu():void {
    if (this.hot) {
      this.rebuildSpreadsheet();
    }
  }

}
