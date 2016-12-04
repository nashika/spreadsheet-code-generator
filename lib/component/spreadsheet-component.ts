import Component from "vue-class-component";
import _ = require("lodash");

import {BaseComponent} from "./base-component";
import {ISheet, ISheetMeta, IColumn} from "./app-component";
import {templateLoader} from "./template-loader";

type THandsontableChange = [number, string, any, any];

interface IMyHandsontable extends ht.Methods {
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
  inheritData: any;
  inheritPaths: string[];

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
    this.rebuildInherit();
    if (this.currentSheet.name == "root") return;
    let container: Element = this.$el.querySelector("#spreadsheet");
    let sheetName: string = this.currentSheet.name;
    if (!sheetName) return;
    let data: any[] = this.currentData;
    let colHeaders: string[] = [];
    let columns: any[] = [];
    this.columnMap = {};
    for (let c of this.currentSheet.columns) {
      colHeaders.push(c.header);
      this.columnMap[c.data] = c;
      let column: any;
      switch (c.type) {
        case "select":
          column = {
            editor: "select",
            selectOptions: c.options,
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
      cells: (_row: number, _col: number, _prop: any) => {
        let cellProperties: ht.Options = {};
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
    switch (cellProperties.type) {
      case "text":
      case "select":
        (<any>Handsontable).renderers.TextRenderer.apply(this, arguments);
        break;
      case "numeric":
        (<any>Handsontable).renderers.NumericRenderer.apply(this, arguments);
        break;
      default:
        throw new Error();
    }
    if (_.isNull(value) || value == "") {
      let extendsStr: string = instance.getDataAtRowProp(row, "extends");
      if (extendsStr) {
        let inheritKey: string = this.padInheritKey(extendsStr);
        if (this.inheritData[inheritKey]) {
          let data = this.inheritData[inheritKey][prop];
          if (!_.isUndefined(data)) {
            td.innerText = data;
            td.style.color = "#bbf";
          }
        }
      }
    }
  }

  protected rebuildInherit() {
    this.inheritData = {};
    let flag = true;
    this.inheritPaths = _(this.currentSheet.columns)
      .filter((column: IColumn) => (column.data == "extends") ? flag = false : flag)
      .map(column => column.data)
      .value();
    if (!_.find(this.currentSheet.columns, (column: IColumn) => column.data == "extends")) return;
    _.each(this.currentData, rowData => {
      if (_.find(this.inheritPaths, path => !rowData[path])) return;
      let key: string = _(this.inheritPaths)
        .map(path => rowData[path])
        .join(".");
      this.inheritData[key] = _.cloneDeep(rowData);
    });
    delete this.inheritData[_(this.inheritPaths).map(p => "*").join(".")];
    _.each(this.inheritData, record => this.applyInherit(record));
  }

  private padInheritKey(inheritKey: string): string {
    let wildcardCount: number = this.inheritPaths.length - _.split(inheritKey, ".").length;
    if (wildcardCount)
      inheritKey = _.times(wildcardCount, _.constant("*")).join(".") + "." + inheritKey;
    return inheritKey;
  }

  private applyInherit(record: any): any {
    let extendsStr: string = record["extends"];
    if (!extendsStr) return record;
    let parentInheritKey = this.padInheritKey(extendsStr);
    if (this.inheritData[parentInheritKey]) {
      let parentRecord = this.applyInherit(this.inheritData[parentInheritKey]);
      _.defaults(record, parentRecord);
      delete record["extends"];
    } else {
      //throw new Error();
    }
  }

}
