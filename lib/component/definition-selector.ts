import * as path from "path";

import {Application} from "../application";

export class DefinitionSelector {
  
  constructor(private app:Application) {
    for (let definitionName of this.app.definitionNames) {
      let dom:JQuery = $(`<li class="list-group-item" definition="${definitionName}">${definitionName}</li>`);
      dom.on("click", this.onChangeDefinition);
      $("ul#explorer-list-group").append(dom);
    }
  }

  private onChangeDefinition = (event:JQueryEventObject) => {
    let definitionName:string = event.target.getAttribute("definition");
    this.app.changeDefinition(definitionName);
  };

}
