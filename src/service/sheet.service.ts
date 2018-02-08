import _ = require("lodash");
import {injectable} from "inversify";
import Vue from "vue";

import {BaseIoService} from "./base-io.service";
import {HubService, ISheet, ISheetMeta} from "./hub.service";
import {DataService} from "./data.service";
import {CodeService} from "./code.service";
import {ColumnService} from "./column.service";

@injectable()
export class SheetService extends BaseIoService {

  protected static DIR_NAME: string = "sheet";

  constructor(protected hubService: HubService,
              protected dataService: DataService,
              protected codeService: CodeService,
              protected columnService: ColumnService) {
    super(hubService);
  }

  protected load(sheetName: string): ISheet {
    return super.load(sheetName);
  }

  protected save(sheetName: string, data: ISheet) {
    if (sheetName != "root")
      super.save(sheetName, data);
    Vue.set(this.$hub.sheetMetas[sheetName], "modified", false);
  }

  newAll(): void {
    this.$hub.sheets = {root: this.rootTemplate};
    this.$hub.sheetMetas = {
      root: this.sheetMetaTemplate,
    };
    this.$hub.currentSheet = this.$hub.sheets["root"];
    this.$hub.currentSheetMeta = this.$hub.sheetMetas["root"];
  }

  protected get rootTemplate(): ISheet {
    return {
      name: "root",
      columns: [],
      parent: "",
      freezeColumn: 0,
    };
  }

  protected get sheetMetaTemplate(): ISheetMeta {
    return {
      modified: false,
      rowOffset: 0,
      colOffset: 0,
    };
  }

  loadAll(): boolean {
    if (!this.checkDir()) return false;
    this.newAll();
    let names: string[] = this.list();
    this.$hub.sheets = _.zipObject(names, names.map(name => this.load(name)));
    this.$hub.sheetMetas = _.zipObject(names, names.map(() => this.sheetMetaTemplate));
    return true;
  }

  saveAll(): boolean {
    if (!this.checkAndCreateDir()) return false;
    _.forIn(this.$hub.sheets, (sheet, name) => {
      this.save(name, sheet);
    });
    _.forEach(_.difference(this.list(), _.keys(this.$hub.sheets)), (name) => {
      this.unlink(name);
    });
    return true;
  }

  select(sheet: ISheet) {
    this.$hub.currentSheet = sheet;
    this.$hub.currentSheetMeta = this.$hub.sheetMetas[sheet.name];
    this.$hub.currentData = this.$hub.datas[sheet.name];
    this.$hub.currentCode = this.$hub.codes[sheet.name];
  }

  add(sheetName: string, parentSheetName: string): boolean {
    if (_.has(this.$hub.sheets, sheetName)) {
      alert(`Sheet "${sheetName}" already exists.`);
      return false;
    }
    let emptySheet: ISheet = {
      name: sheetName,
      columns: this.columnService.generateInitialColumns(sheetName, parentSheetName),
      parent: parentSheetName,
      freezeColumn: this.countSheetDepth(parentSheetName) + 1,
    };
    Vue.set(this.$hub.sheets, sheetName, emptySheet);
    Vue.set(this.$hub.sheetMetas, sheetName, {modified: true});
    Vue.set(this.$hub.datas, sheetName, _.times(10, () => {
      return {}
    }));
    Vue.set(this.$hub.codes, sheetName, this.codeService.defaultCode);
    return true;
  }

  edit(oldSheetName: string, newSheetName: string, parentSheetName: string): boolean {
    if (oldSheetName != newSheetName && _.has(this.$hub.sheets, newSheetName)) {
      alert(`Sheet "${newSheetName}" already exists.`);
      return false;
    }
    this.$hub.sheets[oldSheetName].name = newSheetName;
    this.$hub.sheets[oldSheetName].parent = parentSheetName;
    this.$hub.sheetMetas[oldSheetName].modified = true;
    if (newSheetName == oldSheetName) return true;
    _.forIn(this.$hub.sheets, (sheet: ISheet) => {
      if (sheet.parent == oldSheetName)
        sheet.parent = newSheetName;
    });
    Vue.set(this.$hub.sheets, newSheetName, this.$hub.sheets[oldSheetName]);
    Vue.delete(this.$hub.sheets, oldSheetName);
    Vue.set(this.$hub.sheetMetas, newSheetName, this.$hub.sheetMetas[oldSheetName]);
    Vue.delete(this.$hub.sheetMetas, oldSheetName);
    Vue.set(this.$hub.datas, newSheetName, this.$hub.datas[oldSheetName]);
    Vue.delete(this.$hub.datas, oldSheetName);
    Vue.set(this.$hub.codes, newSheetName, this.$hub.codes[oldSheetName]);
    Vue.delete(this.$hub.codes, oldSheetName);
    return true;
  }

  remove(): void {
    if (!this.$hub.currentSheet) {
      alert(`No selected sheet.`);
      return;
    }
    if (_.some(this.$hub.sheets, (sheet: ISheet) => this.$hub.currentSheet.name == sheet.parent)) {
      alert(`Sheet "${this.$hub.currentSheet.name}" have child sheet, please move or delete it.`);
      return;
    }
    if (!confirm(`Are you sure to delete sheet:"${this.$hub.currentSheet.name}"?`)) {
      return;
    }
    let sheetName: string = this.$hub.currentSheet.name;
    Vue.delete(this.$hub.sheets, sheetName);
    Vue.delete(this.$hub.sheetMetas, sheetName);
    Vue.delete(this.$hub.datas, sheetName);
    Vue.delete(this.$hub.codes, sheetName);
    this.$hub.sheetMetas["root"].modified = true;
    this.$hub.currentSheet = this.$hub.sheets["root"];
    this.$hub.currentData = null;
    this.$hub.currentCode = this.$hub.codes["root"];
  }

  isParentRecursive(target: ISheet, parent: ISheet): boolean {
    if (target.parent == parent.name) return true;
    if (!target.parent) return false;
    return this.isParentRecursive(this.$hub.sheets[target.parent], parent);
  }

  loadAllForGenerate(): {[sheetName: string]: ISheet} {
    let names: string[] = this.list();
    let result: {[sheetName: string]: ISheet} = {root: this.rootTemplate};
    for (let name of names) {
      result[_.camelCase(name)] = this.load(name);
    }
    return result;
  }

  protected countSheetDepth(sheetName: string): number {
    if (sheetName == "root") return 0;
    let sheet: ISheet = this.$hub.sheets[sheetName];
    return this.countSheetDepth(sheet.parent) + 1;
  }

}
