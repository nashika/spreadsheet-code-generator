import _ = require("lodash");
import {injectable} from "inversify";
import Vue from "vue";

import {IoService} from "./io.service";
import {HubService, ISheet, ISheetMeta} from "./hub.service";
import {DataService} from "./data.service";
import {CodeService} from "./code.service";
import {ColumnService} from "./column.service";

@injectable()
export class SheetService extends IoService {

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
    Vue.set(this.hubService.$vm.sheetMetas[sheetName], "modified", false);
  }

  public newAll(): void {
    this.hubService.$vm.sheets = {root: this.rootTemplate};
    this.hubService.$vm.sheetMetas = {
      root: this.sheetMetaTemplate,
    };
    this.hubService.$vm.currentSheet = this.hubService.$vm.sheets["root"];
    this.hubService.$vm.currentSheetMeta = this.hubService.$vm.sheetMetas["root"];
    this.dataService.newAll();
    this.codeService.newAll();
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

  public loadAll(): boolean {
    if (!this.checkDir()) return false;
    this.newAll();
    let names: string[] = this.list();
    for (let name of names) {
      Vue.set(this.hubService.$vm.sheets, name, this.load(name));
      Vue.set(this.hubService.$vm.sheetMetas, name, this.sheetMetaTemplate);
    }
    if (!this.dataService.loadAll()) return false;
    if (!this.codeService.loadAll()) return false;
    return true;
  }

  public saveAll(): boolean {
    if (!this.checkAndCreateDir()) return false;
    _.forIn(this.hubService.$vm.sheets, (sheet, name) => {
      this.save(name, sheet);
    });
    _.forEach(_.difference(this.list(), _.keys(this.hubService.$vm.sheets)), (name) => {
      this.unlink(name);
    });
    if (!this.dataService.saveAll()) return false;
    if (!this.codeService.saveAll()) return false;
    return true;
  }

  public select(sheet: ISheet) {
    this.hubService.$vm.currentSheet = sheet;
    this.hubService.$vm.currentSheetMeta = this.hubService.$vm.sheetMetas[sheet.name];
    this.hubService.$vm.currentData = this.hubService.$vm.datas[sheet.name];
    this.hubService.$vm.currentCode = this.hubService.$vm.codes[sheet.name];
  }

  public add(sheetName: string, parentSheetName: string): boolean {
    if (_.has(this.hubService.$vm.sheets, sheetName)) {
      alert(`Sheet "${sheetName}" already exists.`);
      return false;
    }
    let emptySheet: ISheet = {
      name: sheetName,
      columns: this.columnService.generateInitialColumns(sheetName, parentSheetName),
      parent: parentSheetName,
      freezeColumn: this.countSheetDepth(parentSheetName) + 1,
    };
    Vue.set(this.hubService.$vm.sheets, sheetName, emptySheet);
    Vue.set(this.hubService.$vm.sheetMetas, sheetName, {modified: true});
    Vue.set(this.hubService.$vm.datas, sheetName, _.times(10, () => {
      return {}
    }));
    Vue.set(this.hubService.$vm.codes, sheetName, this.codeService.defaultCode);
    return true;
  }

  public edit(oldSheetName: string, newSheetName: string, parentSheetName: string): boolean {
    if (oldSheetName != newSheetName && _.has(this.hubService.$vm.sheets, newSheetName)) {
      alert(`Sheet "${newSheetName}" already exists.`);
      return false;
    }
    this.hubService.$vm.sheets[oldSheetName].name = newSheetName;
    this.hubService.$vm.sheets[oldSheetName].parent = parentSheetName;
    this.hubService.$vm.sheetMetas[oldSheetName].modified = true;
    if (newSheetName == oldSheetName) return true;
    _.forIn(this.hubService.$vm.sheets, (sheet: ISheet) => {
      if (sheet.parent == oldSheetName)
        sheet.parent = newSheetName;
    });
    Vue.set(this.hubService.$vm.sheets, newSheetName, this.hubService.$vm.sheets[oldSheetName]);
    Vue.delete(this.hubService.$vm.sheets, oldSheetName);
    Vue.set(this.hubService.$vm.sheetMetas, newSheetName, this.hubService.$vm.sheetMetas[oldSheetName]);
    Vue.delete(this.hubService.$vm.sheetMetas, oldSheetName);
    Vue.set(this.hubService.$vm.datas, newSheetName, this.hubService.$vm.datas[oldSheetName]);
    Vue.delete(this.hubService.$vm.datas, oldSheetName);
    Vue.set(this.hubService.$vm.codes, newSheetName, this.hubService.$vm.codes[oldSheetName]);
    Vue.delete(this.hubService.$vm.codes, oldSheetName);
    return true;
  }

  public remove(): void {
    if (!this.hubService.$vm.currentSheet) {
      alert(`No selected sheet.`);
      return;
    }
    if (_.some(this.hubService.$vm.sheets, (sheet: ISheet) => this.hubService.$vm.currentSheet.name == sheet.parent)) {
      alert(`Sheet "${this.hubService.$vm.currentSheet.name}" have child sheet, please move or delete it.`);
      return;
    }
    if (!confirm(`Are you sure to delete sheet:"${this.hubService.$vm.currentSheet.name}"?`)) {
      return;
    }
    let sheetName: string = this.hubService.$vm.currentSheet.name;
    Vue.delete(this.hubService.$vm.sheets, sheetName);
    Vue.delete(this.hubService.$vm.sheetMetas, sheetName);
    Vue.delete(this.hubService.$vm.datas, sheetName);
    Vue.delete(this.hubService.$vm.codes, sheetName);
    this.hubService.$vm.sheetMetas["root"].modified = true;
    this.hubService.$vm.currentSheet = this.hubService.$vm.sheets["root"];
    this.hubService.$vm.currentData = null;
    this.hubService.$vm.currentCode = this.hubService.$vm.codes["root"];
  }

  public isParentRecursive(target: ISheet, parent: ISheet): boolean {
    if (target.parent == parent.name) return true;
    if (!target.parent) return false;
    return this.isParentRecursive(this.hubService.$vm.sheets[target.parent], parent);
  }

  public loadAllForGenerate(): {[sheetName: string]: ISheet} {
    let names: string[] = this.list();
    let result: {[sheetName: string]: ISheet} = {root: this.rootTemplate};
    for (let name of names) {
      result[_.camelCase(name)] = this.load(name);
    }
    return result;
  }

  protected countSheetDepth(sheetName: string): number {
    if (sheetName == "root") return 0;
    let sheet: ISheet = this.hubService.$vm.sheets[sheetName];
    return this.countSheetDepth(sheet.parent) + 1;
  }

}
