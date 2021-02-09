import path from "path";
import fs from "fs";

import _ from "lodash";
import { Action, Module, Mutation } from "vuex-module-decorators";

import { assertIsDefined } from "~/src/util/assert";
import { logger } from "~/src/logger";
import { myStore } from "~/src/store/index";
import { BaseStore } from "~/src/store/base";
import { eventNames } from "~/src/util/event-names";
import { templates } from "~/src/util/templates";

export interface ISheet {
  name: string;
  parent: string;
  freezeColumn: number;
  columns: IColumn[];
  meta: ISheetMeta;
  data: TSheetData;
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
  tsType?: string;
}

export interface ISheetMeta {
  modified: boolean;
  colOffset?: number;
  rowOffset?: number;
}

export type TSheetData = { [columnName: string]: any }[];

class IoManager {
  // eslint-disable-next-line no-useless-constructor
  constructor(
    protected dirName: string,
    protected ext: "json" | "ts" | "ts" = "json"
  ) {}

  get saveDir(): string {
    return path.join(myStore.menu.config.saveBaseDir, this.dirName);
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
    logger.debug(`Loading ${filePath}.`);
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

  exist(sheetName: string): boolean {
    return fs.existsSync(this.filePath(sheetName));
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
  code: new IoManager("code", "ts"),
  base: new IoManager("base", "ts"),
};

function _rootSheetTemplate(): ISheet {
  return Object.assign(templates.sheet(), { name: "root" });
}

function _load(sheetName: string): ISheet {
  let sheet: ISheet;
  if (sheetName === "root") sheet = _rootSheetTemplate();
  else
    sheet = Object.assign(templates.sheet(), ioManagers.sheet.load(sheetName));
  sheet.meta = templates.sheetMeta();
  sheet.columns = _initializeColumns(sheet.columns);
  sheet.data = ioManagers.data.load(sheetName) ?? [];
  return sheet;
}

function _save(sheet: ISheet, sheets: { [name: string]: ISheet }) {
  if (sheet.name !== "root") {
    ioManagers.sheet.save(sheet.name, _.omit(sheet, ["data", "code", "meta"]));
    ioManagers.data.save(sheet.name, _parseData(sheet));
  }
  if (!ioManagers.code.exist(sheet.name)) {
    ioManagers.code.save(sheet.name, templates.code(sheet));
  }
  ioManagers.base.save(sheet.name, templates.baseCode(sheet, sheets));
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
    return Object.assign(templates.column(99), column);
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
      // tsType: "",
    },
  ];
  const emptyColumns: IColumn[] = _.times(5, templates.column);
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
    // tsType: "",
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

  get g_loadAllForGenerate(): () => { [sheetName: string]: ISheet } {
    return () => {
      const names: string[] = ioManagers.sheet.list();
      const result: { [sheetName: string]: ISheet } = {
        root: _rootSheetTemplate(),
      };
      for (const name of names) {
        result[_.camelCase(name)] = _load(name);
      }
      return result;
    };
  }

  @Mutation
  private m_setSheet(payload: { name: string; value: ISheet }) {
    this.sheets[payload.name] = payload.value;
  }

  @Mutation
  private m_mergeSheet(payload: {
    name?: string;
    value: MyDeepPartial<ISheet>;
  }) {
    const name = payload.name ?? this.currentSheet.name;
    _.merge(this.sheets[name], payload.value);
  }

  @Mutation
  private m_setCurrentSheet(name: string) {
    this.currentSheet = this.sheets[name];
  }

  @Mutation
  private m_removeSheet(name: string) {
    delete this.sheets[name];
  }

  @Mutation
  private m_setColumns(columns: IColumn[]) {
    this.currentSheet.columns = columns;
  }

  @Mutation
  private m_setColumn(payload: { index: number; column: IColumn }) {
    this.currentSheet.columns[payload.index] = payload.column;
  }

  @Mutation
  private m_removeColumn(index: number) {
    this.currentSheet.columns.splice(index, 1);
  }

  @Action
  a_setModified(payload: { name?: string; value: boolean }): void {
    const name = payload.name ?? this.currentSheet.name;
    this.m_mergeSheet({
      name,
      value: { meta: { modified: payload.value } },
    });
  }

  @Action
  a_setOffset(payload: {
    name?: string;
    colOffset?: number;
    rowOffset?: number;
  }): void {
    const name = payload.name ?? this.currentSheet.name;
    this.m_mergeSheet({
      name,
      value: {
        meta: { colOffset: payload.colOffset, rowOffset: payload.rowOffset },
      },
    });
  }

  @Action
  a_setData(payload: { name?: string; data: TSheetData }): void {
    const name = payload.name ?? this.currentSheet.name;
    this.m_mergeSheet({
      name,
      value: { data: payload.data },
    });
    this.a_setModified({ name, value: true });
  }

  @Action
  a_selectCurrentSheet(name: string): void {
    this.m_setCurrentSheet(name);
    this.$root.$emit(eventNames.sheet.change);
  }

  @Action
  a_newAll(): void {
    for (const name in this.sheets) this.m_removeSheet(name);
    this.m_setSheet({ name: "root", value: _rootSheetTemplate() });
    this.m_setCurrentSheet("root");
    this.$root.$emit(eventNames.sheet.reload);
  }

  @Action
  async a_loadAll(): Promise<boolean> {
    for (const io of _.toArray(ioManagers)) {
      if (!io.checkDir()) return false;
    }
    this.a_newAll();
    const names: string[] = ["root", ...ioManagers.sheet.list()];
    for (const name of names) {
      this.m_setSheet({ name, value: _load(name) });
    }
    this.m_setCurrentSheet("root");
    this.$root.$emit(eventNames.sheet.reload);
    return true;
  }

  @Action
  async a_saveAll(): Promise<boolean> {
    for (const io of _.toArray(ioManagers)) {
      if (!io.checkAndCreateDir()) return false;
    }
    for (const name in this.sheets) {
      _save(this.sheets[name], this.sheets);
      this.a_setModified({ name, value: false });
    }
    _.difference(ioManagers.sheet.list(), Object.keys(this.sheets)).forEach(
      (name) => {
        ioManagers.sheet.unlink(name);
      }
    );
    ioManagers.base.save("base", templates.baseCodeStub());
    return true;
  }

  // eslint-disable-next-line require-await
  @Action
  async a_add(payload: { name: string; parentName: string }): Promise<boolean> {
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
    };
    this.m_setSheet({ name: payload.name, value: emptySheet });
    return true;
  }

  @Action
  async a_edit(payload: {
    oldName: string;
    newName: string;
    parentName: string;
  }): Promise<boolean> {
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

  @Action
  a_addColumn(index: number): void {
    const columns = this.currentSheet.columns;
    this.m_setColumns(
      _.concat(
        _.slice(columns, 0, index),
        [templates.column(columns.length)],
        _.slice(columns, index)
      )
    );
    this.a_setModified({ value: true });
    this.$root.$emit(eventNames.sheet.change);
  }

  @Action
  a_modifyColumn(payload: { index: number; column: IColumn }): void {
    if (
      this.currentSheet.columns[payload.index]?.data !== payload.column.data &&
      _.find(this.currentSheet.columns, { data: payload.column.data })
    ) {
      alert(`data="${payload.column.data}" is already exists.`);
      return;
    }
    const oldColumn = this.currentSheet.columns[payload.index];
    if (payload.column.data !== oldColumn.data) {
      const data = _.cloneDeep(this.currentSheet.data);
      for (const record of data) {
        const cellData = _.get(record, oldColumn.data);
        if (cellData !== undefined)
          _.set(record, payload.column.data, cellData);
        _.unset(record, oldColumn.data);
      }
      this.a_setData({ data });
    }
    if (payload.column.type !== "select") payload.column.options = undefined;
    if (!_.includes(["text", "select"], payload.column.type))
      payload.column.json = undefined;
    this.m_setColumn(payload);
    this.a_setModified({ value: true });
    this.$root.$emit(eventNames.sheet.change);
  }

  @Action
  a_moveColumn(payload: { index: number; right: boolean }): void {
    const columns: IColumn[] = this.currentSheet.columns;
    if (payload.right) {
      this.m_setColumns(
        _.concat(
          _.take(columns, payload.index),
          [columns[payload.index + 1], columns[payload.index]],
          _.takeRight(columns, columns.length - payload.index - 2)
        )
      );
    } else {
      this.m_setColumns(
        _.concat(
          _.take(columns, payload.index - 1),
          [columns[payload.index], columns[payload.index - 1]],
          _.takeRight(columns, columns.length - payload.index - 1)
        )
      );
    }
    this.a_setModified({ value: true });
    this.$root.$emit(eventNames.sheet.change);
  }

  @Action
  a_removeColumn(index: number): void {
    this.m_removeColumn(index);
    this.a_setModified({ value: true });
    this.$root.$emit(eventNames.sheet.change);
  }

  @Action
  a_freezeColumn(index: number): void {
    this.m_mergeSheet({ value: { freezeColumn: index } });
    this.a_setModified({ value: true });
    this.$root.$emit(eventNames.sheet.change);
  }
}
