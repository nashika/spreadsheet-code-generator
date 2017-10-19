import Component from "vue-class-component";
import _ = require("lodash");

import BaseComponent from "./base-component";
import {SheetService} from "../service/sheet.service";
import {container} from "../inversify.config";
import {ISheet} from "../service/hub.service";

interface ITreeSheet {
  sheet: ISheet,
  level: number,
}

@Component({
  watch: {
    "$hub.sheets": {
      handler: SheetsComponent.prototype.watchSheets,
      deep: true,
    },
  },
})
export default class SheetsComponent extends BaseComponent {

  sheetService: SheetService = container.get(SheetService);

  treeSheets: ITreeSheet[] = [];
  addModal: boolean = false;
  editModal: boolean = false;
  newSheetParent: string = "";
  newSheetName: string = "";

  ready() {
    this.watchSheets();
  }

  select(sheet: ISheet): void {
    this.sheetService.select(sheet);
  }

  add(): void {
    if (this.sheetService.add(this.newSheetName, this.$hub.currentSheet.name)) {
      this.newSheetName = "";
      this.addModal = false;
    }
  }

  edit(): void {
    let newSheetParent: string = this.newSheetParent || this.$hub.currentSheet.parent;
    if (this.sheetService.edit(this.$hub.currentSheet.name, this.newSheetName, newSheetParent)) {
      this.newSheetName = "";
      this.newSheetParent = "root";
      this.editModal = false;
    }
  }

  remove(): void {
    this.sheetService.remove();
  }

  notSelfOrChildTreeSheets(treeSheets: ITreeSheet[]): ITreeSheet[] {
    return _.filter(treeSheets, treeSheet => {
      let sheetName = treeSheet.sheet.name;
      if (sheetName == this.$hub.currentSheet.name) return false;
      if (!this.$hub.sheets[sheetName]) return true;
      return !this.sheetService.isParentRecursive(this.$hub.sheets[sheetName], this.$hub.currentSheet);
    });
  }

  watchSheets(): void {
    this.treeSheets = this.treeSheetRecursive("", 0);
  }

  treeSheetRecursive(parentSheetName: string, level: number): ITreeSheet[] {
    let result: ITreeSheet[] = [];
    _.forIn(this.$hub.sheets, (sheet: ISheet) => {
      if (sheet.parent == parentSheetName)
        result.push({sheet: sheet, level: level});
    });
    result = _.sortBy(result, "sheet.name");
    return _.flatMap(result, (treeSheet: ITreeSheet) => {
      return _.concat([treeSheet], this.treeSheetRecursive(treeSheet.sheet.name, level + 1));
    });
  }

}
