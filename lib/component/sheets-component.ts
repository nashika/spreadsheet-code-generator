import {Application} from "../application";

export class SheetsComponent {

  private $sheets:JQuery;
  private $sheetAdd:JQuery;
  private $sheetAddName:JQuery;
  private $sheetDelete:JQuery;

  constructor(private app:Application) {
    this.$sheets = $("ul#sheets");
    this.$sheetAdd = $("#sheet-add");
    this.$sheetAddName = $("#sheet-add-name");
    this.$sheetDelete = $("#sheet-delete");
    this.$sheetAdd.on("click", this.onAdd);
    this.$sheetDelete.on("click", this.onDelete);
    this.reloadSheetList();
  }

  private reloadSheetList() {
    this.$sheets.empty();
    for (let sheetName of this.app.sheetIoService.sheetNames) {
      let $sheet:JQuery = $(`<li class="list-group-item" sheet="${sheetName}">${sheetName}</li>`);
      $sheet.on("click", this.onChange);
      this.$sheets.append($sheet);
    }
  }

  private onChange = (event:JQueryEventObject) => {
    let sheetName:string = event.target.getAttribute("sheet");
    this.app.spreadsheetComponent.changeSheet(sheetName);
    this.$sheets.find(`li.list-group-item`).removeClass("list-group-item-info");
    this.$sheets.find(`li[sheet=${sheetName}]`).addClass("list-group-item-info");
  };

  private onAdd = (event:JQueryEventObject) => {
    let parentSheetName:string = this.app.currentSheetName;
    let newSheetName:string = this.$sheetAddName.val();
    this.app.sheetIoService.add(newSheetName, parentSheetName);
    this.reloadSheetList();
    event.stopPropagation();
  };

  private onDelete = (event:JQueryEventObject) => {
    let sheetName:string = this.app.currentSheetName;
    this.app.sheetIoService.remove(sheetName);
    this.reloadSheetList();
    event.stopPropagation();
  };

}
