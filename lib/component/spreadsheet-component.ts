import Component from "vue-class-component";
import _ = require("lodash");

import {BaseComponent} from "./base-component";
import {ISheet, ISheetMeta, IColumn} from "./app-component";
import {templateLoader} from "./template-loader";

type THandsontableChange = [number, string, any, any];

interface IMyHandsontable extends ht.Methods {
  search:{
    query(q:string):any;
  };
}

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
  events: {
    "search": SpreadsheetComponent.prototype.onSearch,
  },
  ready: SpreadsheetComponent.prototype.onReady,
  beforeDestroy: SpreadsheetComponent.prototype.onBeforeDestroy,
})
export class SpreadsheetComponent extends BaseComponent {

  currentSheet:ISheet;
  currentSheetMeta:ISheetMeta;
  currentData:any[];

  hot:IMyHandsontable;
  columnMap:{[key:string]:IColumn};
  currentRow:number;
  currentCol:number;
  resizeTimer:any;

  data():any {
    return {
      hot: false,
      columnMap: null,
      currentRow: 0,
      currentCol: 0,
      resizeTimer: null,
    };
  }

  onSearch(query:string) {
    if (!this.hot) return;
    let queryResults = this.hot.search.query(query);
    if (!queryResults.length) return;
    let queryResultSelect:any;
    for (let queryResult of queryResults) {
      if (this.currentRow > queryResult.row) continue;
      if (this.currentRow == queryResult.row) {
        if (this.currentCol >= queryResult.col) continue;
      }
      queryResultSelect = queryResult;
      break;
    }
    if (!queryResultSelect) queryResultSelect = queryResults[0];
    this.hot.selectCell(queryResultSelect.row, queryResultSelect.col);
    this.hot.render();
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
    this.currentRow = r;
    this.currentCol = c;
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
        column.invalidCellClassName = "invalid-cell";
        column.allowInvalid = true;
      }
      _.assign(column, {
        data: c.data,
        width: c.width,
      });
      columns.push(column);
    }
    this.hot = <IMyHandsontable>new Handsontable(container, {
      data: data,
      width: this.$el.offsetWidth - 1,
      height: this.$el.offsetHeight - 1,
      columns: columns,
      rowHeaders: true,
      colHeaders: colHeaders,
      contextMenu: true,
      wordWrap: false,
      manualColumnFreeze: true,
      search: <any>{
        searchResultClass: "search-cell",
      },
      currentRowClassName: 'current-row',
      currentColClassName: 'current-col',
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
