import path from "path";
import fs from "fs";

import electron from "electron";
import _ from "lodash";

import { IColumn, ISheet, TSheetData } from "~/src/store/sheet";
import { BaseService } from "~/src/service/base.service";
import { logger } from "~/src/logger";
import { RecordExtender } from "~/src/util/record-extender";

declare function originalRequire(path: string): any;
// eslint-disable-next-line no-redeclare
declare module originalRequire {
  const cache: { [path: string]: any };
}

class SourceUtils {
  static get deleteLine(): string {
    return "###DeleteLine###";
  }

  static get noNewLine(): string {
    return "###NoNewLine###";
  }

  static source(argSource: any): string {
    let result: string = "";
    const source: string = _.isString(argSource)
      ? argSource
      : _.toString(argSource);
    const lines: Array<string> = source.toString().split(/\n/g);
    if (lines[0] === "") lines.shift();
    if (lines[lines.length - 1] === "") lines.pop();
    lines.forEach((line: string) => {
      if (line.match(/###DeleteLine###/)) return;
      if (line.match(/###NoNewLine###/)) {
        line = line.replace(/###NoNewLine###/, "");
        result = result.replace(/\n$/m, "");
      }
      result += line + "\n";
    });
    return result;
  }

  static indent(
    unitIndent: number,
    numIndent: number,
    argSource: any,
    noIndentFirstLine: boolean = false
  ): string {
    let result: string = "";
    const source: string = _.isString(argSource)
      ? argSource
      : _.toString(argSource);
    const lines: string[] = source.split(/\n/g);
    if (lines[lines.length - 1] === "") lines.pop();
    lines.forEach((line: string, index: number) => {
      const newLine: string = index < lines.length - 1 ? "\n" : "";
      if (line && (index > 0 || !noIndentFirstLine))
        result += _.repeat(" ", unitIndent * numIndent) + line + newLine;
      else result += line + newLine;
    });
    return result;
  }
}

class GeneratorProcess {
  unitIndent = 4;
  writeCount = 0;

  // eslint-disable-next-line no-useless-constructor
  constructor(
    public saveBaseDir: string,
    protected sheets: { [sheetName: string]: ISheet }
  ) {}

  main(): number {
    logger.debug(`Parse sheet data was started.`);
    for (const sheetName in this.sheets) {
      if (sheetName === "root") continue;
      const sheet: ISheet = this.sheets[sheetName];
      const data: TSheetData = this.sheets[sheetName].data;
      for (const record of data) {
        for (const column of sheet.columns) {
          if (!_.has(record, column.data)) continue;
          if (column.json || column.type === "numeric") {
            const jsonData: string = _.get(record, column.data, "");
            try {
              _.set(record, column.data, JSON.parse(jsonData));
            } catch (e) {
              throw new Error(
                `JSON parse error. sheet="${sheetName}", column="${
                  column.data
                }", record="${JSON.stringify(record)}"`
              );
            }
          }
        }
      }
    }
    logger.debug(`Parse sheet data was finished.`);
    logger.debug(`Create node definition tree was started.`);
    const rootNodeDefinition: GeneratorNodeDefinition = new GeneratorNodeDefinition(
      this,
      this.sheets.root,
      null
    );
    const createNodeDefinitionRecursive = (
      currentNodeDefinition: GeneratorNodeDefinition
    ) => {
      _.forIn(this.sheets, (sheet: ISheet) => {
        if (_.camelCase(sheet.parent) !== currentNodeDefinition.name) return;
        const childNodeDefinition = new GeneratorNodeDefinition(
          this,
          sheet,
          currentNodeDefinition
        );
        currentNodeDefinition.addChild(childNodeDefinition);
        createNodeDefinitionRecursive(childNodeDefinition);
      });
    };
    createNodeDefinitionRecursive(rootNodeDefinition);
    logger.debug(`Create node definition tree was finished.`);
    logger.debug("Create node tree was started.");
    const rootNode: GeneratorNode = new rootNodeDefinition.GeneratorNodeClass();
    rootNode.__initialize({ root: "root" });
    const createNodeElementRecursive = (
      currentNodeDefinition: GeneratorNodeDefinition
    ) => {
      logger.debug(
        `Create ${_.join(currentNodeDefinition.path, ".")} records...`
      );
      const recordExtender = new RecordExtender(
        this.sheets[currentNodeDefinition.name]
      );
      const currentData: TSheetData = recordExtender.getRecords() || [];
      _.forEach(currentData, (record: { [columnName: string]: any }) => {
        const childNodeElement: GeneratorNode = new currentNodeDefinition.GeneratorNodeClass();
        childNodeElement.__initialize(record);
        rootNode.add(childNodeElement);
      });
      _.forIn(
        currentNodeDefinition.children,
        (childNodeDefinition: GeneratorNodeDefinition) => {
          createNodeElementRecursive(childNodeDefinition);
        }
      );
    };
    createNodeElementRecursive(rootNodeDefinition);
    logger.debug(`Create node element tree was finished.`);
    this.unitIndent = 4;
    this.writeCount = 0;
    logger.debug(`Generate process was started.`);
    rootNode.main();
    logger.debug(`Generate process was finished.`);
    logger.debug(`Generate process was done. Write ${this.writeCount} files.`);
    return this.writeCount;
  }
}

export class GeneratorNode {
  static definition: GeneratorNodeDefinition;

  parent!: GeneratorNode | null;
  data!: { [columnName: string]: any };
  private __children!: {
    [sheetName: string]: { [nodeName: string]: GeneratorNode };
  };

  __initialize(dataRecord: { [columnName: string]: any }) {
    this.data = _.cloneDeep(dataRecord);
    this.parent = null;
    this.__children = {};
    for (const childDefinition of _.values(this.Class.definition.children)) {
      const childSheetName: string = _.camelCase(childDefinition.name);
      this.__children[childSheetName] = {};
    }
  }

  get Class(): typeof GeneratorNode {
    return <typeof GeneratorNode>this.constructor;
  }

  get name(): string {
    return this.data[this.Class.definition.name];
  }

  get siblings(): { [nodeName: string]: GeneratorNode } {
    if (!this.parent) return {};
    return _(this.parent.__getChildren(this.Class.definition.name))
      .omit(["*", this.name])
      .value();
  }

  get root(): GeneratorNode {
    return this.parent ? this.parent.root : this;
  }

  get columns(): string[] {
    return _.map(this.Class.definition.columns, (column) => column.data);
  }

  get children(): {
    [sheetName: string]: { [nodeName: string]: GeneratorNode };
  } {
    return this.__children;
  }

  get deleteLine(): string {
    return SourceUtils.deleteLine;
  }

  get noNewLine(): string {
    return SourceUtils.noNewLine;
  }

  main() {}

  write(
    argPath: string,
    data: string,
    option: { override?: boolean } = {}
  ): void {
    if (!_.isString(argPath))
      throw new Error(
        `Error in this.write(path, data, option). arg "path" must be string, but it is type="${typeof argPath}"`
      );
    if (!_.isString(data))
      throw new Error(
        `Error in this.write(path, data, option). arg "data" must be string, but it is type="${typeof data}"`
      );
    if (!_.isObject(option))
      throw new Error(
        `Error in this.write(path, data, option). arg "option" must be object, but it is type="${typeof option}"`
      );
    const writePath: string = path.isAbsolute(argPath)
      ? argPath
      : path.join(this.Class.definition.process.saveBaseDir, argPath);
    if (!_.isUndefined(option.override) && !option.override) {
      if (fs.existsSync(writePath)) {
        logger.debug(`Skip ${writePath}. File exists.`);
        return;
      }
    }
    const recursiveCreateDir = (dir: string) => {
      if (fs.existsSync(dir)) return;
      recursiveCreateDir(path.join(dir, ".."));
      fs.mkdirSync(dir);
    };
    recursiveCreateDir(path.dirname(writePath));
    logger.debug(`Writing ${writePath} ...`);
    fs.writeFileSync(writePath, data);
    this.Class.definition.process.writeCount++;
  }

  source(argSource: any): string {
    return SourceUtils.source(argSource);
  }

  indent(
    numIndent: number,
    argSource: any,
    noIndentFirstLine: boolean = false
  ): string {
    return SourceUtils.indent(
      this.Class.definition.process.unitIndent,
      numIndent,
      argSource,
      noIndentFirstLine
    );
  }

  setIndent(arg: number): void {
    this.Class.definition.process.unitIndent = arg;
  }

  get(key: string): any {
    return _.get(this.data, key);
  }

  toObject(): { [columnName: string]: any } {
    const result = {};
    for (const column of this.Class.definition.columns) {
      if (!column.export) continue;
      const value = this.get(column.data);
      if (_.isUndefined(value)) continue;
      _.set(result, column.data, value);
    }
    return result;
  }

  add(node: GeneratorNode): void {
    if (_.isEmpty(node.data)) return;
    if (this.Class.definition === node.Class.definition.parent) {
      if (
        this.Class.definition.name === "root" ||
        this.name === node.data[this.Class.definition.name]
      )
        this.__addChild(node);
    } else if (
      _.includes(this.Class.definition.descendants, node.Class.definition)
    ) {
      for (const childDefinition of _.values(this.Class.definition.children)) {
        if (_.includes(childDefinition.descendants, node.Class.definition)) {
          const childNode = this.__getChild(
            childDefinition.name,
            node.data[childDefinition.name]
          );
          if (childNode) childNode.add(node);
        }
      }
    }
  }

  private __getChild(sheetName: string, nodeName: string): GeneratorNode {
    sheetName = _.camelCase(sheetName);
    return this.__children[sheetName] && this.__children[sheetName][nodeName];
  }

  private __getChildren(
    sheetName: string
  ): { [nodeName: string]: GeneratorNode } {
    sheetName = _.camelCase(sheetName);
    if (!_.has(this.__children, sheetName))
      throw new Error(`Can not find child node. sheetName="${sheetName}".`);
    return this.__children[sheetName];
  }

  private __addChild(childNode: GeneratorNode): void {
    const sheetName = _.camelCase(childNode.Class.definition.name);
    if (childNode.name) {
      this.__children[sheetName][childNode.name] = childNode;
      childNode.parent = this;
    }
  }
}

class GeneratorNodeDefinition {
  GeneratorNodeClass: typeof GeneratorNode;

  private readonly _children: { [sheetName: string]: GeneratorNodeDefinition };
  private readonly _ancestors: { [sheetName: string]: GeneratorNodeDefinition };
  private readonly _descendants: {
    [sheetName: string]: GeneratorNodeDefinition;
  };

  constructor(
    public process: GeneratorProcess,
    private sheet: ISheet,
    private _parent: GeneratorNodeDefinition | null
  ) {
    this._children = {};
    this._descendants = {};
    this._ancestors = {};
    if (_parent) {
      this._ancestors[_parent.name] = _parent;
      _.assign(this._ancestors, _parent.ancestors);
    }
    this.GeneratorNodeClass = this.requireCode(sheet.name);
    this.GeneratorNodeClass.definition = this;
  }

  get name(): string {
    return _.camelCase(this.sheet.name);
  }

  get columns(): IColumn[] {
    return this.sheet.columns;
  }

  get parent(): GeneratorNodeDefinition | null {
    return this._parent;
  }

  get children(): { [sheetName: string]: GeneratorNodeDefinition } {
    return this._children;
  }

  get ancestors(): { [sheetName: string]: GeneratorNodeDefinition } {
    return this._ancestors;
  }

  get descendants(): { [sheetName: string]: GeneratorNodeDefinition } {
    return this._descendants;
  }

  get depth(): number {
    return this.parent ? this.parent.depth + 1 : 0;
  }

  get path(): string[] {
    if (!this.parent) return [this.name];
    return _.concat(this.parent.path, [this.name]);
  }

  addChild(nodeDefinition: GeneratorNodeDefinition): void {
    this._children[nodeDefinition.name] = nodeDefinition;
    this._descendants[nodeDefinition.name] = nodeDefinition;
    if (this.parent) this.parent.addDescendants(nodeDefinition);
  }

  private addDescendants(nodeDefinition: GeneratorNodeDefinition): void {
    this._descendants[nodeDefinition.name] = nodeDefinition;
    if (this.parent) this.parent.addDescendants(nodeDefinition);
  }

  private requireCode(sheetName: string): typeof GeneratorNode {
    const codeDir: string = path.join(this.process.saveBaseDir, "./code/");
    const sheetCodePath: string = path.join(codeDir, `./${sheetName}.js`);
    if (originalRequire.cache[sheetCodePath])
      delete originalRequire.cache[sheetCodePath];
    let SheetClass: any = originalRequire(sheetCodePath);
    // eslint-disable-next-line no-prototype-builtins
    if (SheetClass.hasOwnProperty("default")) SheetClass = SheetClass.default;
    // eslint-disable-next-line no-prototype-builtins
    if (!GeneratorNode.isPrototypeOf(SheetClass)) {
      // eslint-disable-next-line no-proto
      SheetClass.prototype.__proto__ = GeneratorNode.prototype;
      SheetClass.constructor = GeneratorNode.constructor;
    }
    return SheetClass;
  }
}

export class GeneratorService extends BaseService {
  errorQuestionFlag: boolean = false;

  generate(): void {
    if (
      !this.$myStore.menu.config.saveBaseDir ||
      _.some(this.$myStore.sheet.sheets, (sheet: ISheet) => {
        return sheet.meta.modified;
      })
    ) {
      alert(`Please save files before generate.`);
      return;
    }
    logger.debug(`Load sheets was started.`);
    const sheets: {
      [sheetName: string]: ISheet;
    } = this.$myStore.sheet.g_loadAllForGenerate();
    if (!sheets) {
      alert(`Load sheets was failed.`);
      return;
    }
    logger.debug(`Load sheets was finished.`);

    const process: GeneratorProcess = new GeneratorProcess(
      this.$myStore.menu.config.saveBaseDir,
      sheets
    );
    let result: number;
    try {
      result = process.main();
    } catch (e) {
      if (_.isString(e)) {
        alert(e);
      } else {
        if (!electron.remote.getCurrentWebContents().isDevToolsOpened()) {
          alert(e.stack || e);
        }
        this.developerToolQuestion();
        throw e;
      }
      result = -1;
    }

    if (result !== -1) alert(`Generate finished, write ${result} files.`);
  }

  developerToolQuestion(): void {
    if (!this.errorQuestionFlag) {
      if (!electron.remote.getCurrentWebContents().isDevToolsOpened()) {
        if (confirm(`Generate error occurred. show developer tool?`)) {
          electron.remote.getCurrentWindow().webContents.openDevTools();
        }
      }
      this.errorQuestionFlag = true;
    }
  }
}
