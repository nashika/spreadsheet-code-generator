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
      handler: SpreadsheetComponent.prototype.watchCurrentSheet,
      deep: true,
    },
    "showMenu": SpreadsheetComponent.prototype.watchShowMenu,
  },
})
export class SpreadsheetComponent extends BaseComponent {

  currentSheet:ISheet;
  currentSheetMeta:ISheetMeta;
  currentData:any[];

  hot:ht.Methods;

  data() {
    return {
      hot: false,
    }
  }

  onAfterSelection(r:number, c:number, r2:number, c2:number):void {
    this.$root.$broadcast("select-column-header", c);
  }

  onAfterChange(changes:any[][]):void {
    if (changes) {
      this.currentSheetMeta.modified = true;
    }
  }

  watchCurrentSheet(now:ISheet, prev:ISheet):void {
    if (this.hot) {
      this.hot.destroy();
      this.hot = null;
    }
    let container:Element = this.$el.querySelector("#spreadsheet");
    let sheetName:string = now && now.name;
    if (!sheetName) return;
    let data:any[] = this.currentData;
    let colHeaders:string[] = [];
    let columns:any[] = [];
    for (let c of now.columns) {
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
      columns: columns,
      rowHeaders: true,
      colHeaders: colHeaders,
      contextMenu: true,
      currentRowClassName: 'currentRow',
      currentColClassName: 'currentCol',
      afterChange: this.onAfterChange,
      afterSelection: this.onAfterSelection,
    });
  }

  watchShowMenu():void {
    if (this.hot) {
      this.hot.render();
    }
  }

}
