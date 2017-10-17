import Component from "vue-class-component";
import _ = require("lodash");

import {BaseComponent} from "./base-component";
import {ISheet, ISheetMeta, IColumn} from "./app.component";
import {templateLoader} from "./template-loader";
import {InheritRecords} from "../util/inherit-records";

declare global {
  var Handsontable: any;
}

type THandsontableChange = [number, string, any, any];

interface IMyHandsontable extends Handsontable.Core {
  search: {
    query(q: string): any;
  };
  scrollViewportTo: (row: number, column: number)=>boolean;
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
    "insert": SpreadsheetComponent.prototype.onInsert,
  },
  beforeDestroy: SpreadsheetComponent.prototype.onBeforeDestroy,
})
export class SpreadsheetComponent extends BaseComponent {

  currentSheet: ISheet;
  currentSheetMeta: ISheetMeta;
  currentData: any[];

  columnMap: {[key: string]: IColumn};
  currentRow: number;
  currentCol: number;
  resizeTimer: any;

  hot: IMyHandsontable;
  inheritRecords: InheritRecords;

  data(): any {
    return {
      columnMap: null,
      currentRow: 0,
      currentCol: 0,
      resizeTimer: null,
    };
  }

  created() {
  }

  onSearch(query: string) {
    if (!this.hot) return;
    let queryResults = this.hot.search.query(query);
    if (!queryResults.length) return;
    let queryResultSelect: any;
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

  onInsert() {
    this.hot.alter("insert_row", this.currentRow);
  }

  ready() {
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

  jsonValidator(value: string, callback: (result: boolean) => void): void {
    if (value == "") return callback(true);
    try {
      JSON.parse(value);
    } catch (e) {
      return callback(false);
    }
    return callback(true);
  }

  afterSelection(r: number, c: number, r2: number, c2: number): void {
    this.currentRow = r;
    this.currentCol = c;
    setTimeout(() => {
      this.$root.$broadcast("select-column", c);
    }, 0);
  }

  afterChange(changes: THandsontableChange[]): void {
    if (changes) {
      this.currentSheetMeta.modified = true;
    }
  }

  afterScroll(): void {
    this.currentSheetMeta.colOffset = this.hot.colOffset();
    this.currentSheetMeta.rowOffset = this.hot.rowOffset();
  }

  rebuildSpreadsheet(): void {
    if (this.hot) {
      this.hot.destroy();
      this.hot = null;
    }
    if (this.currentSheet.name == "root") return;
    this.inheritRecords = new InheritRecords(this.currentData, this.currentSheet.columns);
    let container: Element = this.$el.querySelector("#spreadsheet");
    let sheetName: string = this.currentSheet.name;
    if (!sheetName) return;
    let data: any[] = this.currentData;
    let colHeaders: string[] = _.map(this.currentSheet.columns, c => c.header);
    let colWidths: number[] = _.map(this.currentSheet.columns, c => c.width);
    let columns: any[] = _.map(this.currentSheet.columns, (c: IColumn) => {
      let column: any = {};
      switch (c.type) {
        case "select":
          column.editor = "select";
          column.selectOptions = c.options;
          break;
        default:
          column.type = c.type;
          break;
      }
      if (c.json) {
        column.validator = this.jsonValidator;
        column.invalidCellClassName = "invalid-cell";
        column.allowInvalid = true;
      }
      column.data = c.data;
      return column;
    });
    this.hot = <IMyHandsontable>new Handsontable(container, {
      data: data,
      width: this.$el.offsetWidth - 1,
      height: this.$el.offsetHeight - 1,
      columns: columns,
      rowHeaders: true,
      colHeaders: colHeaders,
      colWidths: colWidths,
      contextMenu: true,
      wordWrap: false,
      manualColumnFreeze: true,
      fixedColumnsLeft: this.currentSheet.freezeColumn || 0,
      search: <any>{
        searchResultClass: "search-cell",
      },
      currentRowClassName: 'current-row',
      currentColClassName: 'current-col',
      afterChange: this.afterChange,
      afterSelection: this.afterSelection,
      afterScrollHorizontally: this.afterScroll,
      afterScrollVertically: this.afterScroll,
      autoRowSize: false,
      autoColumnSize: false,
      cells: (_row: number, _col: number, _prop: any) => {
        let cellProperties: Handsontable.Options = {};
        cellProperties.renderer = this.customRenderer;
        return cellProperties;
      },
    });
    this.hot.scrollViewportTo(this.currentSheetMeta.rowOffset, this.currentSheetMeta.colOffset);
  }

  watchShowMenu(): void {
    if (this.hot) {
      this.rebuildSpreadsheet();
    }
  }

  protected customRenderer(instance: IMyHandsontable, td: HTMLTableDataCellElement, row: number, col: number, prop: string, value: any, cellProperties: any) {
    if (_.isNull(value) || value === "") {
      let extendsStr: string = instance.getDataAtRowProp(row, "extends");
      if (extendsStr) {
        let data: any = this.inheritRecords.get(extendsStr, prop);
        if (data === false) {
          td.style.backgroundColor = "#fbb";
        } else if (!_.isUndefined(data)) {
          value = data;
          td.style.color = "#bbf";
        }
      }
    }
    switch (cellProperties.type) {
      case "text":
      case "select":
        (<any>Handsontable).renderers.TextRenderer.apply(this, [instance, td, row, col, prop, value, cellProperties]);
        break;
      case "numeric":
        (<any>Handsontable).renderers.NumericRenderer.apply(this, [instance, td, row, col, prop, value, cellProperties]);
        break;
      default:
        throw new Error();
    }
  }

}
