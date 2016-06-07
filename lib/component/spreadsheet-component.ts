import * as path from "path";

import {Application, IDefinitionColumn} from "../application";

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

  public changeSheet(definitionName:string):void {
    if (this.hot) {
      this.app.dataIoService.save(this.jsonData);
      this.hot.destroy();
    }

    this.app.currentDefinitionName = definitionName;
    this.app.currentDefinition = require(path.join(this.app.definitionDir, `${this.app.currentDefinitionName}.json`));

    let data:any[] = this.app.dataIoService.load();
    this.hot = new Handsontable(this.container, {
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
      this.app.columnComponent.selectColumn(c);
    }
  };

}
