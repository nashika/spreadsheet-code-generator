import path from "path";
import fs from "fs";

import _ from "lodash";
import { Action, Module, Mutation } from "vuex-module-decorators";

import { assertIsDefined } from "~/src/util/assert";
import { TSheetData } from "~/src/store/hub";
import { BaseStore } from "~/src/store/base";
import { logger } from "~/src/logger";
import { myStore } from "~/src/store/index";

export interface ISheet {
  name: string;
  parent: string;
  freezeColumn: number;
  columns: IColumn[];
  meta: ISheetMeta;
  data: TSheetData;
  code: string;
}

export interface IColumn {
  header: string;
  data: string;
  type: "text" | "select" | "numeric";
  json?: boolean;
  options?: string[];
  width: number;
  required: boolean;
  export: boolean;
  tsType: string;
}

export interface ISheetMeta {
  modified: boolean;
  colOffset?: number;
  rowOffset?: number;
}

class IoManager {
  // eslint-disable-next-line no-useless-constructor
  constructor(
    protected dirName: string,
    protected ext: "json" | "js" = "json"
  ) {}

  get saveDir(): string {
    return path.join(myStore.config.config.saveBaseDir, this.dirName);
  }

  filePath(sheetName: string): string {
    return path.join(this.saveDir, `${sheetName}.${this.ext}`);
  }

  checkDir(): boolean {
    if (!fs.existsSync(this.saveDir)) {
      alert(`"${this.saveDir}" is not found.`);
      return false;
    } else if (fs.statSync(this.saveDir).isDirectory()) {
      return true;
    } else {
      alert(`"${this.saveDir}" is not directory, please remove it.`);
      return false;
    }
  }

  checkAndCreateDir(): boolean {
    if (!fs.existsSync(this.saveDir)) {
      fs.mkdirSync(this.saveDir);
      return true;
    } else if (fs.statSync(this.saveDir).isDirectory()) {
      return true;
    } else {
      alert(`"${this.saveDir}" is not directory, please remove it.`);
      return false;
    }
  }

  list(): string[] {
    const regexp = new RegExp(`\\.${this.ext}$`);
    return fs
      .readdirSync(this.saveDir)
      .filter((f) => !!f.match(regexp))
      .map((f) => f.replace(regexp, ""));
  }

  load(sheetName: string): any {
    const filePath: string = this.filePath(sheetName);
    logger.debug(`Loadig ${filePath}.`);
    if (fs.existsSync(filePath)) {
      const data: string = fs.readFileSync(filePath).toString();
      if (this.ext === "json") return JSON.parse(data);
      else return data;
    } else {
      return null;
    }
  }

  save(sheetName: string, data: any): void {
    const filePath: string = this.filePath(sheetName);
    logger.debug(`Saving ${filePath}.`);
    let writeData: string;
    if (this.ext === "json") writeData = JSON.stringify(data, null, "  ");
    else writeData = data;
    fs.writeFileSync(filePath, writeData);
  }

  unlink(sheetName: string): void {
    const filePath: string = this.filePath(sheetName);
    console.log(`Removing ${filePath}.`);
    fs.unlinkSync(filePath);
  }
}

const ioManagers = {
  sheet: new IoManager("sheet"),
  data: new IoManager("data"),
  code: new IoManager("code", "js"),
};

@Module({
  name: "sheet",
  stateFactory: true,
  namespaced: true,
})
export default class SheetStore extends BaseStore {
  sheets: { [sheetName: string]: ISheet } = {};
  currentSheet?: ISheet;

  @Mutation
  SET_SHEET(sheetName: string, value: ISheet) {
    this.sheets[sheetName] = value;
  }

  @Mutation
  SET_CURRENT_SHEET(sheetName: string) {
    this.currentSheet = this.sheets[sheetName];
  }

  @Mutation
  REMOVE_SHEET(sheetName: string) {
    delete this.sheets[sheetName];
  }

  @Action
  setModified(sheetName: string, modified: boolean) {
    const sheet = this.sheets[sheetName];
    sheet.meta.modified = modified;
    this.SET_SHEET(sheetName, sheet);
  }

  @Action
  newAll(): void {
    this.SET_SHEET("root", this._rootSheetTemplate());
    this.SET_CURRENT_SHEET("root");
  }

  @Action
  loadAll(): boolean {
    for (const io of _.toArray(ioManagers)) {
      if (!io.checkDir()) return false;
    }
    this.newAll();
    const names: string[] = ["root", ...ioManagers.sheet.list()];
    for (const name of names) {
      this.SET_SHEET(name, this._load(name));
    }
    return true;
  }

  @Action
  saveAll(): boolean {
    for (const io of _.toArray(ioManagers)) {
      if (!io.checkAndCreateDir()) return false;
    }
    for (const name in this.sheets) {
      this._save(name, this.sheets[name]);
      this.setModified(name, false);
    }
    _.difference(ioManagers.sheet.list(), Object.keys(this.sheets)).forEach(
      (name) => {
        ioManagers.sheet.unlink(name);
      }
    );
    return true;
  }

  @Action
  select(sheet: ISheet) {
    this.SET_CURRENT_SHEET(sheet.name);
  }

  @Action
  add(sheetName: string, parentSheetName: string): boolean {
    if (this.sheets[sheetName]) {
      alert(`Sheet "${sheetName}" already exists.`);
      return false;
    }
    const emptySheet: ISheet = {
      name: sheetName,
      columns: this._generateInitialColumns(sheetName, parentSheetName),
      parent: parentSheetName,
      freezeColumn: this._countSheetDepth(parentSheetName) + 1,
      meta: { modified: true },
      data: _.times(10, () => ({})),
      code: this._codeTemplate(),
    };
    this.SET_SHEET(sheetName, emptySheet);
    return true;
  }

  @Action
  edit(
    oldSheetName: string,
    newSheetName: string,
    parentSheetName: string
  ): boolean {
    if (oldSheetName !== newSheetName && this.sheets[newSheetName]) {
      alert(`Sheet "${newSheetName}" already exists.`);
      return false;
    }
    assertIsDefined(this.sheets[oldSheetName]);
    const sheet = this.sheets[oldSheetName];
    sheet.name = newSheetName;
    sheet.parent = parentSheetName;
    sheet.meta.modified = true;
    if (newSheetName !== oldSheetName) {
      _.forIn(this.sheets, (s: ISheet, n: string) => {
        if (s.parent === oldSheetName) {
          s.parent = newSheetName;
          this.SET_SHEET(n, s);
        }
      });
      this.REMOVE_SHEET(oldSheetName);
    }
    this.SET_SHEET(newSheetName, sheet);
    return true;
  }

  @Action
  remove(): void {
    if (!this.currentSheet) {
      alert(`No selected sheet.`);
      return;
    }
    if (
      _.some(
        this.sheets,
        (sheet: ISheet) => this.currentSheet?.name === sheet.parent
      )
    ) {
      alert(
        `Sheet "${this.currentSheet.name}" have child sheet, please move or delete it.`
      );
      return;
    }
    if (!confirm(`Are you sure to delete sheet:"${this.currentSheet.name}"?`)) {
      return;
    }
    const sheetName: string = this.currentSheet.name;
    this.REMOVE_SHEET(sheetName);
    this.setModified(sheetName, true);
    this.SET_CURRENT_SHEET("root");
  }

  protected _load(sheetName: string): ISheet {
    const sheet = ioManagers.sheet.load(sheetName);
    sheet.meta = this._sheetMetaTemplate();
    sheet.columns = this._initializeColumns(sheet.columns);
    sheet.data = ioManagers.data.load(sheetName) ?? [];
    sheet.code = ioManagers.code.load(sheetName) ?? "";
    return sheet;
  }

  protected _save(sheetName: string, sheet: ISheet) {
    if (sheetName !== "root") {
      ioManagers.sheet.save(sheetName, sheet);
      ioManagers.data.save(sheetName, this._parseData(sheetName, sheet.data));
    }
    ioManagers.code.save(sheetName, sheet.code);
  }

  protected _loadAllForGenerate(): { [sheetName: string]: ISheet } {
    const names: string[] = ioManagers.sheet.list();
    const result: { [sheetName: string]: ISheet } = {
      root: this._rootSheetTemplate(),
    };
    for (const name of names) {
      result[_.camelCase(name)] = this._load(name);
    }
    return result;
  }

  protected _isParentRecursive(target: ISheet, parent: ISheet): boolean {
    if (target.parent === parent.name) return true;
    if (!target.parent) return false;
    return this._isParentRecursive(this.sheets[target.parent], parent);
  }

  protected _countSheetDepth(sheetName: string): number {
    if (sheetName === "root") return 0;
    const sheet: ISheet = this.sheets[sheetName];
    return this._countSheetDepth(sheet.parent) + 1;
  }

  protected _initializeColumns(columns: IColumn[]) {
    _(columns).each((column) => {
      _.defaults(column, this._columnTemplate(99));
    });
  }

  protected _generateInitialColumns(
    sheetName: string,
    parentSheetName: string
  ): IColumn[] {
    const treeColumns: IColumn[] = this._generateInitialTreeColumns(
      sheetName,
      parentSheetName
    );
    const extendsColumns: IColumn[] = [
      {
        header: "Extends",
        data: "extends",
        type: "text",
        width: 120,
        required: false,
        export: false,
        tsType: "",
      },
    ];
    const emptyColumns: IColumn[] = _.times(5, this._columnTemplate);
    return _.concat(treeColumns, extendsColumns, emptyColumns);
  }

  protected _generateInitialTreeColumns(
    sheetName: string,
    parentSheetName: string
  ): IColumn[] {
    if (sheetName === "root") return [];
    const parentSheet = this.sheets[parentSheetName];
    const sheetColumn: IColumn = {
      header: _.startCase(sheetName),
      data: _.camelCase(sheetName),
      type: "text",
      width: 120,
      required: true,
      export: true,
      tsType: "",
    };
    return _.concat(
      this._generateInitialTreeColumns(parentSheet.name, parentSheet.parent),
      [sheetColumn]
    );
  }

  protected _parseData(sheetName: string, data: TSheetData): TSheetData {
    return data.map((record) => {
      const result: any = {};
      for (const column of this.sheets[sheetName].columns) {
        let columnData: any = _.get(record, column.data);
        if (_.isNull(columnData)) continue;
        if (_.isUndefined(columnData)) continue;
        if (columnData === "") continue;
        switch (column.type) {
          case "text":
          case "select":
            if (!_.isString(columnData)) columnData = _.toString(columnData);
            break;
          case "numeric":
            if (!_.isNumber(columnData)) columnData = _.toNumber(columnData);
            break;
        }
        _.set(result, column.data, columnData);
      }
      return result;
    });
  }

  protected _rootSheetTemplate(): ISheet {
    return {
      name: "root",
      parent: "",
      freezeColumn: 0,
      columns: [],
      meta: this._sheetMetaTemplate(),
      data: [],
      code: "",
    };
  }

  protected _sheetMetaTemplate(): ISheetMeta {
    return {
      modified: false,
      rowOffset: 0,
      colOffset: 0,
    };
  }

  protected _columnTemplate(no?: number): IColumn {
    no = _.isUndefined(no) ? this.currentSheet?.columns.length : no;
    return {
      header: `Col${no}`,
      data: `data${no}`,
      type: "text",
      width: 80,
      required: false,
      export: true,
      tsType: "",
    };
  }

  protected _codeTemplate(): string {
    return `module.exports = {

  main: function() {

  },

};
`;
  }
}
