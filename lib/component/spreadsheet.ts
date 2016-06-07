import * as path from "path";

import {Application, IDefinitionColumn} from "../application";

export class Spreadsheet {

  private hot:ht.Methods;

  constructor(private app:Application) {
  }

  get isLoaded():boolean {
    return this.hot != null;
  }

  get jsonData():any[] {
    let records = this.hot.getData();
    let results:any[] = [];
    for (let record of records) {
      let result:any = {};
      for (let i = 0; i < this.app.currentDefinition.columns.length; i++) {
        let currentColumn:IDefinitionColumn = this.app.currentDefinition.columns[i];
        let currentCellData:any = record[i];
        if (currentCellData !== null && currentCellData !== "") {
          result[currentColumn.data] = currentCellData;
        }
      }
      results.push(result);
    }
    return results;
  }

  public changeDefinition(data:any[]) {
    if (this.hot) this.hot.destroy();
    this.hot = new Handsontable(this.app.container, {
      data: data,
      columns: this.app.currentDefinition.columns,
      rowHeaders: true,
      colHeaders: this.app.currentDefinition.colHeaders,
      contextMenu: true,
      currentRowClassName: 'currentRow',
      currentColClassName: 'currentCol',
      afterSelection: this.onAfterSelection,
    });
  }

  private onAfterSelection = (r:number, c:number, r2:number, c2:number):void => {
    if (r == 0 && r2 == this.hot.countRows() - 1) {
      this.app.columnEditor.selectColumn(c);
    }
  };

}
