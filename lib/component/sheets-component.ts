import Component from "vue-class-component";

import {templateLoader} from "./template-loader";

@Component({
  template: templateLoader("sheets"),
  props: ["sheetNames", "currentSheetName"],
})
export class SheetsComponent {

  $root:any;
  currentSheetName:string;
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
    let parentSheetName:string = this.currentSheetName;
    let newSheetName:string = this.newName;
    this.$root.services.sheetIo.add(newSheetName, parentSheetName);
    //this.reloadSheetList();
  }

  onDelete():void {
    let sheetName:string = this.currentSheetName;
    //this.onChange(null);
    this.$root.services.sheetIo.remove(sheetName);
  }

}
