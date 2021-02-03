import path from "path";
import fs from "fs";

import _ from "lodash";
import { Action, Module, Mutation } from "vuex-module-decorators";

import { assertIsDefined } from "~/src/util/assert";
import { TSheetData } from "~/src/store/hub";
import { logger } from "~/src/logger";
import { myStore } from "~/src/store/index";
import { BaseStore } from "~/src/store/base";
import { eventNames } from "~/src/util/event-names";

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
    logger.info(`Removing ${filePath}.`);
    fs.unlinkSync(filePath);
  }
}

const ioManagers = {
  sheet: new IoManager("sheet"),
  data: new IoManager("data"),
  code: new IoManager("code", "js"),
};

function _rootSheetTemplate(): ISheet {
  return {
    name: "root",
    parent: "",
    freezeColumn: 0,
    columns: [],
    meta: _sheetMetaTemplate(),
    data: [],
    code: "",
  };
}

function _load(sheetName: string): ISheet {
  let sheet: ISheet;
  if (sheetName === "root") sheet = _rootSheetTemplate();
  else sheet = ioManagers.sheet.load(sheetName);
  sheet.meta = _sheetMetaTemplate();
  sheet.columns = _initializeColumns(sheet.columns);
  sheet.data = ioManagers.data.load(sheetName) ?? [];
  sheet.code = ioManagers.code.load(sheetName) ?? "";
  return sheet;
}

function _save(sheetName: string, sheet: ISheet) {
  if (sheetName !== "root") {
    ioManagers.sheet.save(sheetName, sheet);
    ioManagers.data.save(sheetName, _parseData(sheet));
  }
  ioManagers.code.save(sheetName, sheet.code);
}

export function loadAllForGenerate(): { [sheetName: string]: ISheet } {
  const names: string[] = ioManagers.sheet.list();
  const result: { [sheetName: string]: ISheet } = {
    root: _rootSheetTemplate(),
  };
  for (const name of names) {
    result[_.camelCase(name)] = _load(name);
  }
  return result;
}

function _countSheetDepth(
  sheetName: string,
  sheets: { [sheetName: string]: ISheet }
): number {
  if (sheetName === "root") return 0;
  const sheet: ISheet = sheets[sheetName];
  return _countSheetDepth(sheet.parent, sheets) + 1;
}

function _initializeColumns(columns: IColumn[]): IColumn[] {
  return columns.map((column) => {
    return Object.assign(_columnTemplate(99), column);
  });
}

function _generateInitialColumns(
  sheetName: string,
  parentSheetName: string,
  sheets: { [sheetName: string]: ISheet }
): IColumn[] {
  const treeColumns: IColumn[] = _generateInitialTreeColumns(
    sheetName,
    parentSheetName,
    sheets
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
  const emptyColumns: IColumn[] = _.times(5, _columnTemplate);
  return _.concat(treeColumns, extendsColumns, emptyColumns);
}

function _generateInitialTreeColumns(
  sheetName: string,
  parentSheetName: string,
  sheets: { [sheetName: string]: ISheet }
): IColumn[] {
  if (sheetName === "root") return [];
  const parentSheet = sheets[parentSheetName];
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
    _generateInitialTreeColumns(parentSheet.name, parentSheet.parent, sheets),
    [sheetColumn]
  );
}

function _parseData(sheet: ISheet): TSheetData {
  return sheet.data.map((record) => {
    const result: any = {};
    for (const column of sheet.columns) {
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

function _sheetMetaTemplate(): ISheetMeta {
  return {
    modified: false,
    rowOffset: 0,
    colOffset: 0,
  };
}

function _columnTemplate(no: number): IColumn {
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

function _codeTemplate(): string {
  return `module.exports = {

  main: function() {

  },

};
`;
}

@Module({
  name: "sheet",
  stateFactory: true,
  namespaced: true,
})
export default class SheetStore extends BaseStore {
  sheets: { [sheetName: string]: ISheet } = {};
  currentSheet: ISheet = <any>{};

  get g_isParentRecursive(): (target: ISheet, parent: ISheet) => boolean {
    return (target, parent) => {
      if (target.parent === parent.name) return true;
      if (!target.parent) return false;
      return this.g_isParentRecursive(this.sheets[target.parent], parent);
    };
  }

  @Mutation
  m_setSheet(payload: { name: string; value: ISheet }) {
    this.sheets[payload.name] = payload.value;
  }

  @Mutation
  m_mergeSheet(payload: { name?: string; value: MyDeepPartial<ISheet> }) {
    const name = payload.name ?? this.currentSheet.name;
    _.merge(this.sheets[name], payload.value);
  }

  @Mutation
  m_setCurrentSheet(name: string) {
    this.currentSheet = this.sheets[name];
  }

  @Mutation
  m_removeSheet(name: string) {
    delete this.sheets[name];
  }

  @Action
  a_setModified(payload: { name?: string; value: boolean }) {
    const name = payload.name ?? this.currentSheet.name;
    this.m_mergeSheet({
      name,
      value: { meta: { modified: payload.value } },
    });
  }

  @Action
  a_newAll(): void {
    for (const name in this.sheets) this.m_removeSheet(name);
    this.m_setSheet({ name: "root", value: _rootSheetTemplate() });
    this.m_setCurrentSheet("root");
  }

  @Action
  a_loadAll(): boolean {
    for (const io of _.toArray(ioManagers)) {
      if (!io.checkDir()) return false;
    }
    this.a_newAll();
    const names: string[] = ["root", ...ioManagers.sheet.list()];
    for (const name of names) {
      this.m_setSheet({ name, value: _load(name) });
    }
    this.a_select("root");
    this.$root.$emit(eventNames.sheet.reload);
    return true;
  }

  @Action
  a_saveAll(): boolean {
    for (const io of _.toArray(ioManagers)) {
      if (!io.checkAndCreateDir()) return false;
    }
    for (const name in this.sheets) {
      _save(name, this.sheets[name]);
      this.a_setModified({ name, value: false });
    }
    _.difference(ioManagers.sheet.list(), Object.keys(this.sheets)).forEach(
      (name) => {
        ioManagers.sheet.unlink(name);
      }
    );
    return true;
  }

  @Action
  a_select(target: ISheet | string) {
    if (typeof target === "string") {
      this.m_setCurrentSheet(target);
    } else {
      this.m_setCurrentSheet(target.name);
    }
  }

  @Action
  a_add(payload: { name: string; parentName: string }): boolean {
    if (this.sheets[payload.name]) {
      alert(`Sheet "${payload.name}" already exists.`);
      return false;
    }
    const emptySheet: ISheet = {
      name: payload.name,
      columns: _generateInitialColumns(
        payload.name,
        payload.parentName,
        this.sheets
      ),
      parent: payload.parentName,
      freezeColumn: _countSheetDepth(payload.parentName, this.sheets) + 1,
      meta: { modified: true },
      data: _.times(10, () => ({})),
      code: _codeTemplate(),
    };
    this.m_setSheet({ name: payload.name, value: emptySheet });
    return true;
  }

  @Action
  a_edit(payload: {
    oldName: string;
    newName: string;
    parentName: string;
  }): boolean {
    if (payload.oldName !== payload.newName && this.sheets[payload.newName]) {
      alert(`Sheet "${payload.newName}" already exists.`);
      return false;
    }
    assertIsDefined(this.sheets[payload.oldName]);
    const oldSheet = this.sheets[payload.oldName];
    if (payload.newName !== payload.oldName) {
      _.forIn(this.sheets, (s: ISheet, n: string) => {
        if (s.parent === payload.oldName) {
          this.m_mergeSheet({ name: n, value: { parent: payload.newName } });
        }
      });
      this.m_removeSheet(payload.oldName);
      this.m_setSheet({ name: payload.newName, value: oldSheet });
    }
    this.m_mergeSheet({
      name: payload.newName,
      value: {
        name: payload.newName,
        parent: payload.parentName,
        meta: { modified: true },
      },
    });
    return true;
  }

  @Action
  a_remove(): void {
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
    const name: string = this.currentSheet.name;
    this.m_removeSheet(name);
    this.a_setModified({ name, value: true });
    this.m_setCurrentSheet("root");
  }
}
