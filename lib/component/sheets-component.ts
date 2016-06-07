import {Application} from "../application";

export class SheetsComponent {

  constructor(private app:Application) {
    for (let definitionName of this.app.definitionNames) {
      let dom:JQuery = $(`<li class="list-group-item" definition="${definitionName}">${definitionName}</li>`);
      dom.on("click", this.onChange);
      $("ul#sheets").append(dom);
    }
  }

  private onChange = (event:JQueryEventObject) => {
    let definitionName:string = event.target.getAttribute("definition");
    this.app.spreadsheetComponent.changeSheet(definitionName);
  };

}
