import Component from "vue-class-component";
import _ = require("lodash");

import {BaseComponent} from "./base-component";
import {ISheet, ISheetMeta} from "./app.component";
import {templateLoader} from "./template-loader";

interface ITreeSheet {
  sheet: ISheet,
  level: number,
}

@Component({
  template: templateLoader("sheets"),
  components: {
    dropdown: require("vue-strap").dropdown,
    modal: require("vue-strap").modal,
  },
  props: ["currentSheet", "sheets", "sheetMetas"],
  watch: {
    "sheets": {
      handler: SheetsComponent.prototype.watchSheets,
      deep: true,
    },
  },
})
export class SheetsComponent extends BaseComponent {

  currentSheet: ISheet;
  sheets: {[sheetName: string]: ISheet};
  sheetMetas: {[sheetName: string]: ISheetMeta};

  treeSheets: ITreeSheet[];
  addModal: boolean;
  editModal: boolean;
  newSheetParent: string;
  newSheetName: string;

  data(): any {
    return {
      treeSheets: [],
      addModal: false,
      editModal: false,
      newSheetParent: "",
      newSheetName: "",
    }
  }

  ready() {
    this.watchSheets();
  }

  select(sheet: ISheet): void {
    this.$root.services.sheet.select(sheet);
  }

  add(): void {
    if (this.$root.services.sheet.add(this.newSheetName, this.currentSheet.name)) {
      this.newSheetName = "";
      this.addModal = false;
    }
  }

  edit(): void {
    let newSheetParent: string = this.newSheetParent || this.currentSheet.parent;
    if (this.$root.services.sheet.edit(this.currentSheet.name, this.newSheetName, newSheetParent)) {
      this.newSheetName = "";
      this.newSheetParent = "root";
      this.editModal = false;
    }
  }

  remove(): void {
    this.$root.services.sheet.remove();
  }

  notSelfOrChildTreeSheets(treeSheets: ITreeSheet[]): ITreeSheet[] {
    return _.filter(treeSheets, treeSheet => {
      let sheetName = treeSheet.sheet.name;
      if (sheetName == this.currentSheet.name) return false;
      if (!this.sheets[sheetName]) return true;
      return !this.$root.services.sheet.isParentRecursive(this.sheets[sheetName], this.currentSheet);
    });
  }

  watchSheets(): void {
    this.treeSheets = this.treeSheetRecursive("", 0);
  }

  treeSheetRecursive(parentSheetName: string, level: number): ITreeSheet[] {
    let result: ITreeSheet[] = [];
    _.forIn(this.sheets, (sheet: ISheet) => {
      if (sheet.parent == parentSheetName)
        result.push({sheet: sheet, level: level});
    });
    result = _.sortBy(result, "sheet.name");
    return _.flatMap(result, (treeSheet: ITreeSheet) => {
      return _.concat([treeSheet], this.treeSheetRecursive(treeSheet.sheet.name, level + 1));
    });
  }

}
