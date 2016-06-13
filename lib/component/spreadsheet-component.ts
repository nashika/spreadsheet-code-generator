import Component from "vue-class-component";
import _ = require("lodash");

import {BaseComponent} from "./base-component";
import {ISheet, ISheetMeta} from "./app-component";
import {templateLoader} from "./template-loader";

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
  resizeTimer:any;

  data():any {
    return {
      hot: false,
      resizeTimer: null,
    }
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

  afterSelection(r:number, c:number, r2:number, c2:number):void {
    this.$root.$broadcast("select-column-header", c);
  }

  afterChange(changes:any[][]):void {
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
    for (let c of this.currentSheet.columns) {
      colHeaders.push(c.header);
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
