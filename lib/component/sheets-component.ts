import Component from "vue-class-component";

import {BaseComponent} from "./base-component";
import {ISheet} from "./app-component";
import {templateLoader} from "./template-loader";

@Component({
  template: templateLoader("sheets"),
  props: ["sheets", "currentSheet"],
})
export class SheetsComponent extends BaseComponent {

  sheets:ISheet[];
  currentSheet:ISheet;
  
  newName:string;

  data() {
    return {
      newName: "",
    }
  }

  select(sheetName:string):void {
    this.$root.$broadcast("before-change-sheet", sheetName);
  }

  add():void {
    this.$root.services.sheet.add(this.newName);
  }

  remove():void {
    this.$root.services.sheet.remove();
  }

}
