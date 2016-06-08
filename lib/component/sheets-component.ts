import {templateLoader} from "./template-loader";

export var SheetsComponent = Vue.extend({
  template: templateLoader("sheets"),
  props: ["sheetNames", "currentSheetName"],
  data: () => { return {
    newName: "",
  }},
  methods: {
    onSelect: function (sheetName:string):void {
      this.$root.$broadcast("change-sheet", sheetName);
    },
    onAdd: function () {
      let parentSheetName:string = this.currentSheetName;
      let newSheetName:string = this.newName;
      this.$root.services.sheetIo.add(newSheetName, parentSheetName);
      this.reloadSheetList();
    },
    onDelete: function ():void {
      let sheetName:string = this.currentSheetName;
      this.onChange(null);
      this.$root.services.sheetIo.remove(sheetName);
    },
  },

});
