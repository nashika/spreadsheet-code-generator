import * as fs from "fs";
import * as path from "path";

export interface IDefinition {
  columns:Array<IDefinitionColumn>;
  colHeaders:Array<string>;
}

export interface IDefinitionColumn {
  data:string;
  type:string;
  width:number;
}

export class Application {

  public container:Element;
  public storeDir:string;
  public definitionDir:string;
  public dataDir:string;
  public definitionNames:string[];

  public currentDefinitionName:string;
  public currentDefinition:IDefinition;
  public hot:ht.Methods;

  constructor() {
    this.container = document.getElementById('spreadsheet');
    this.storeDir = path.join(__dirname, "../sample");
    this.definitionDir = path.join(this.storeDir, "definition");
    this.dataDir = path.join(this.storeDir, "data");
    let definitionFiles:string[] = fs.readdirSync(this.definitionDir);
    this.definitionNames = [];
    for (let definitionFile of definitionFiles) this.definitionNames.push(definitionFile.replace(/\.json$/, ""));
    for (let definitionName of this.definitionNames) {
      let dom:JQuery = $(`<li class="list-group-item" definition="${definitionName}">${definitionName}</li>`);
      dom.on("click", this.changeDefinition);
      $("ul#explorer-list-group").append(dom);
    }
  }

  public changeDefinition = (event:JQueryEventObject) => {
    if (this.hot) {
      this.saveData();
      this.hot.destroy();
    }

    this.currentDefinitionName = event.target.getAttribute("definition");
    this.currentDefinition = require(path.join(this.definitionDir, `${this.currentDefinitionName}.json`));

    let data = this.loadData();

    this.hot = new Handsontable(this.container, {
      data: data,
      columns: this.currentDefinition.columns,
      rowHeaders: true,
      colHeaders: this.currentDefinition.colHeaders,
      contextMenu: true,
      currentRowClassName: 'currentRow',
      currentColClassName: 'currentCol',
      afterSelection: this.afterSelection,
    });
  };

  private afterSelection = (r:number, c:number, r2:number, c2:number):void => {
    if (r == 0 && r2 == this.hot.countRows() - 1) {
      let columnDefinition:IDefinitionColumn = this.currentDefinition.columns[c];
      let colHeader:string = this.currentDefinition.colHeaders[c];
      $("#column-header").val(colHeader);
      $("#column-data").val(columnDefinition.data);
      $("#column-type").val(columnDefinition.type);
      $("#column-width").val(columnDefinition.width);
    }
  };

  public loadData = ():any[] => {
    let filePath:string = path.join(this.dataDir, `${this.currentDefinitionName}.json`);
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath).toString());
    } else {
      return [];
    }
  };

  public saveData = () => {
    let records = this.hot.getData();
    let results:Array<Object> = [];
    for (let record of records) {
      let result:any = {};
      for (let i = 0; i < this.currentDefinition.columns.length; i++) {
        let currentColumn:IDefinitionColumn = this.currentDefinition.columns[i];
        let currentCellData:any = record[i];
        if (currentCellData !== null && currentCellData !== "") {
          result[currentColumn.data] = currentCellData;
        }
      }
      results.push(result);
    }
    fs.writeFileSync(path.join(this.dataDir, `${this.currentDefinitionName}.json`), JSON.stringify(results, null, "  "));
  };

}
