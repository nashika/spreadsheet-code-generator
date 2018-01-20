import Component from "vue-class-component";
import _ = require("lodash");

import BaseComponent from "./base.component";
import {RecordExtender} from "../util/record-extender";
import {IColumn} from "../service/hub.service";

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
  watch: {
    "$hub.currentSheet": {
      handler: SpreadsheetComponent.prototype.rebuildSpreadsheet,
      deep: true,
    },
    "showMenu": SpreadsheetComponent.prototype.watchShowMenu,
  },
  beforeDestroy: SpreadsheetComponent.prototype.onBeforeDestroy,
})
export default class SpreadsheetComponent extends BaseComponent {

  private currentRow: number = 0;
  private currentCol: number = 0;
  private resizeTimer: any = null;

  private hot: IMyHandsontable;
  private recordExtender: RecordExtender;

  created() {
    this.$hub.$on("search", this.onSearch);
    this.$hub.$on("insert", this.onInsert);
  }

  mounted() {
    window.addEventListener("resize", this.resize);
    this.rebuildSpreadsheet();
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

  private afterSelection(r: number, c: number, _r2: number, _c2: number): void {
    this.currentRow = r;
    this.currentCol = c;
    setTimeout(() => {
      this.$hub.$emit("select-column", c);
    }, 0);
  }

  private afterChange(changes: THandsontableChange[]): void {
    if (changes) {
      this.$hub.currentSheetMeta.modified = true;
    }
    if (changes && changes.length > 0) {
      this.setReloadRecordExtenderTimer();
    }
  }

  private reloadRecordExtenderTimer: any;
  private setReloadRecordExtenderTimer(): void {
    if (this.reloadRecordExtenderTimer) clearTimeout(this.reloadRecordExtenderTimer);
    this.reloadRecordExtenderTimer = setTimeout(() => {
      this.recordExtender = new RecordExtender(this.$hub.currentData, this.$hub.currentSheet);
      this.hot.render();
    }, 1000);
  }

  private afterScroll(): void {
    this.$hub.currentSheetMeta.colOffset = this.hot.colOffset();
    this.$hub.currentSheetMeta.rowOffset = this.hot.rowOffset();
  }

  private rebuildSpreadsheet(): void {
    if (this.hot) {
      this.hot.destroy();
      this.hot = null;
    }
    if (this.$hub.currentSheet.name == "root") return;
    this.recordExtender = new RecordExtender(this.$hub.currentData, this.$hub.currentSheet);
    let container: Element = this.$el.querySelector("#spreadsheet");
    let sheetName: string = this.$hub.currentSheet.name;
    if (!sheetName) return;
    let data: any[] = this.$hub.currentData;
    let colHeaders: string[] = _.map(this.$hub.currentSheet.columns, c => c.header);
    let colWidths: number[] = _.map(this.$hub.currentSheet.columns, c => c.width);
    let columns: any[] = _.map(this.$hub.currentSheet.columns, (c: IColumn) => {
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
      fixedColumnsLeft: this.$hub.currentSheet.freezeColumn || 0,
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
    this.hot.scrollViewportTo(this.$hub.currentSheetMeta.rowOffset, this.$hub.currentSheetMeta.colOffset);
  }

  private watchShowMenu(): void {
    if (this.hot) {
      this.rebuildSpreadsheet();
    }
  }

  private customRenderer(instance: IMyHandsontable, td: HTMLTableDataCellElement, row: number, col: number, prop: string, value: any, cellProperties: any) {
    if (_.isNull(value) || value === "") {
      let parentPathStr: string = instance.getDataAtRowProp(row, "extends");
      if (parentPathStr) {
        let data: any = this.recordExtender.get(parentPathStr, prop);
        if (data === false) data = this.recordExtender.get(parentPathStr + "." + instance.getDataAtRowProp(row, this.recordExtender.lastPathField), prop);
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
