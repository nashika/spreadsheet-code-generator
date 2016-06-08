import Component from "vue-class-component";

import {BaseComponent} from "./base-component";
import {ISheetDefinition} from "./app-component";
import {templateLoader} from "./template-loader";

@Component({
  template: templateLoader("sheets"),
  props: ["sheetNames", "currentSheetDefinition"],
})
export class SheetsComponent extends BaseComponent {

  currentSheetDefinition:ISheetDefinition;
  newName:string;

  data() {
    return {
      newName: "",
    }
  }

  onSelect(sheetName:string):void {
    this.$root.$broadcast("before-change-sheet", sheetName);
  }

  onAdd():void {
    this.$root.services.sheetIo.add(this.newName);
  }

  onDelete():void {
    this.$root.services.sheetIo.remove();
  }

}
