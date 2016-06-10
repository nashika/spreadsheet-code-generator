import Component from "vue-class-component";
import _ = require("lodash");

import {BaseComponent} from "./base-component";
import {IColumn, ISheet} from "./app-component";
import {templateLoader} from "./template-loader";

@Component({
  template: templateLoader("spreadsheet"),
  props: ["currentSheet", "currentData"],
  watch: {
    "currentSheet": {
      handler: SpreadsheetComponent.prototype.watchCurrentSheet,
      deep: true,
    }
  },
})
export class SpreadsheetComponent extends BaseComponent {

  currentSheet:ISheet;
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
      columns.push({
        data: c.data,
        type: c.type,
        width: c.width,
      });
    }
    this.hot = new Handsontable(container, {
      data: data,
      columns: columns,
      rowHeaders: true,
      colHeaders: colHeaders,
      contextMenu: true,
      currentRowClassName: 'currentRow',
      currentColClassName: 'currentCol',
      afterSelection: this.onAfterSelection,
    });
  }

}
