import Component from "vue-class-component";

import {BaseComponent} from "./base-component";
import {ISheet, ISheetMeta} from "./app-component";
import {templateLoader} from "./template-loader";

@Component({
  template: templateLoader("sheets"),
  props: ["currentSheet", "sheets", "sheetMetas"],
})
export class SheetsComponent extends BaseComponent {

  currentSheet:ISheet;
  sheets:ISheet[];
  sheetMetas:ISheetMeta[];

  newName:string;

  data() {
    return {
      newName: "",
    }
  }

  select(sheet:ISheet):void {
    this.$root.services.sheet.select(sheet);
  }

  add():void {
    this.$root.services.sheet.add(this.newName);
    this.newName = "";
  }

  remove():void {
    this.$root.services.sheet.remove();
  }

}
