import {templateLoader} from "./template-loader";

export var SheetsComponent = Vue.extend({
  template: templateLoader("sheets"),
  props: ["sheetNames"],
  data: () => { return {
    newName: "",
  }},
  methods: {
    onSelect: function (sheetName:string):void {
      this.$root.$refs.spreadsheet.changeSheet(sheetName);
    },
    onAdd: function () {
      let parentSheetName:string = this.$root.currentSheetName;
      let newSheetName:string = this.newName;
      this.$root.services.sheetIo.add(newSheetName, parentSheetName);
      this.reloadSheetList();
    },
    onDelete: function ():void {
      let sheetName:string = this.$root.currentSheetName;
      this.onChange(null);
      this.$root.services.sheetIo.remove(sheetName);
    },
  },

});
