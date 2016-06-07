import {Application} from "../application";

export class SheetsComponent {

  private $sheets:JQuery;

  constructor(private app:Application) {
    this.$sheets = $("ul#sheets");
    this.reloadSheetList();
  }

  private reloadSheetList() {
    this.$sheets.empty();
    for (let sheetName of this.app.sheetIoService.sheetNames) {
      let $sheet:JQuery = $(`<li class="list-group-item" sheet="${sheetName}">${sheetName}</li>`);
      let $add:JQuery = $(`<button class="pull-right btn btn-xs btn-primary">Add</button>`);
      let $delete:JQuery = $(`<button class="pull-right btn btn-xs btn-danger">Delete</button>`);
      $sheet.append($delete);
      $sheet.append($add);
      $sheet.on("click", this.onChange);
      $add.on("click", this.onAdd);
      $delete.on("click", this.onDelete);
      this.$sheets.append($sheet);
    }
  }

  private onChange = (event:JQueryEventObject) => {
    let sheetName:string = event.target.getAttribute("sheet");
    this.app.spreadsheetComponent.changeSheet(sheetName);
  };

  private onAdd = (event:JQueryEventObject) => {
    let sheetName:string = $(event.target).parent().attr("sheet");

    event.stopPropagation();
  };

  private onDelete = (event:JQueryEventObject) => {
    let sheetName:string = $(event.target).parent().attr("sheet");
    if (confirm(`Are you sure to delete sheet:"${sheetName}"?`)) {
      console.log("delete");
    }
    event.stopPropagation();
  };

}
