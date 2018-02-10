import Component from "vue-class-component";
import _ = require("lodash");

import BaseComponent from "./base.component";
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
  newSheetParent: string = "";
  newSheetName: string = "";

  mounted() {
    this.watchSheets();
  }

  select(sheet: ISheet): void {
    this.sheetService.select(sheet);
  }

  showAddModal(): void {
    this.newSheetParent = this.$hub.currentSheet.name;
    this.newSheetName = "";
  }

  okAddModal(e: Event): void {
    if (!this.sheetService.add(this.newSheetName, this.$hub.currentSheet.name)) {
      e.preventDefault();
    }
  }

  showEditModal(): void {
    this.newSheetParent = this.$hub.currentSheet.parent;
    this.newSheetName = this.$hub.currentSheet.name;
  }

  okEditModal(e: Event): void {
    if (!this.sheetService.edit(this.$hub.currentSheet.name, this.newSheetName, this.newSheetParent)) {
      e.preventDefault();
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
    let result: ITreeSheet[] = _(this.$hub.sheets)
      .filter(sheet => sheet.parent == parentSheetName)
      .map(sheet => ({sheet: sheet, level: level}))
      .sortBy("sheet.name")
      .value();
    return _.flatMap(result, (treeSheet: ITreeSheet) => {
      return _.concat([treeSheet], this.treeSheetRecursive(treeSheet.sheet.name, level + 1));
    });
  }

}
