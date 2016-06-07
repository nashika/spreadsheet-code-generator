import * as path from "path";

import {Application, IColumnDefinition} from "../application";

export class SpreadsheetComponent {

  private container:Element;
  private hot:ht.Methods;

  constructor(private app:Application) {
    this.container = document.getElementById('spreadsheet');
  }

  get isLoaded():boolean {
    return this.hot != null;
  }

  private get jsonData():any[] {
    let records = this.hot.getData();
    let results:any[] = [];
    for (let record of records) {
      let result:any = {};
      for (let i = 0; i < this.app.currentSheetDefinition.columns.length; i++) {
        let currentColumn:IColumnDefinition = this.app.currentSheetDefinition.columns[i];
        let currentCellData:any = record[i];
        if (currentCellData !== null && currentCellData !== "") {
          result[currentColumn.data] = currentCellData;
        }
      }
      results.push(result);
    }
    return results;
  }

  public changeSheet(definitionName:string):void {
    if (this.hot) {
      this.app.dataIoService.save(this.jsonData);
      this.hot.destroy();
    }

    this.app.currentSheetName = definitionName;
    this.app.currentSheetDefinition = require(path.join(this.app.definitionDir, `${this.app.currentSheetName}.json`));

    let data:any[] = this.app.dataIoService.load();
    this.hot = new Handsontable(this.container, {
      data: data,
      columns: this.app.currentSheetDefinition.columns,
      rowHeaders: true,
      colHeaders: this.app.currentSheetDefinition.colHeaders,
      contextMenu: true,
      currentRowClassName: 'currentRow',
      currentColClassName: 'currentCol',
      afterSelection: this.onAfterSelection,
    });
  }

  private onAfterSelection = (r:number, c:number, r2:number, c2:number):void => {
    if (r == 0 && r2 == this.hot.countRows() - 1) {
      this.app.columnComponent.selectColumn(c);
    }
  };

}
