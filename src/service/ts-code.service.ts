import _ = require("lodash");
import {injectable} from "inversify";

import {BaseIoService} from "./base-io.service";
import {HubService, IColumn, ISheet} from "./hub.service";
import {SourceUtils} from "../util/source-utils";

@injectable()
export class TsCodeService extends BaseIoService {

  protected static DIR_NAME: string = "ts-code";
  protected static EXT: string = "generated.ts";

  constructor(protected hubService: HubService) {
    super(hubService);
  }

  protected load(_sheetName: string): void {
    throw new Error();
  }

  private saveTsCode(sheet: ISheet) {
    let parentSheet = _(this.$hub.sheets).find(sh => sh.name == sheet.parent);
    let childSheets = _(this.$hub.sheets).filter(sh => sh.parent == sheet.name).value();
    let source = SourceUtils.source(`
import ${_.upperFirst(_.camelCase(sheet.name))}GeneratorNode from "../code/${sheet.name}";
${parentSheet ? `import ${_.upperFirst(_.camelCase(parentSheet.name))}GeneratorNode from "../code/${parentSheet.name}";` : SourceUtils.deleteLine}
${childSheets.length > 0 ? _(childSheets).map(childSheet => `import ${_.upperFirst(_.camelCase(childSheet.name))}Node from "../code/${childSheet.name}";`).join("\n") : SourceUtils.deleteLine}

export interface I${_.upperFirst(_.camelCase(sheet.name))}GeneratorNodeData ${this.columnDataTypes(sheet.columns)}

export interface I${_.upperFirst(_.camelCase(sheet.name))}GeneratorNodeExport ${this.columnDataTypes(sheet.columns, true)}

type T${_.upperFirst(_.camelCase(sheet.name))}GeneratorNodeChildren = {
  ${childSheets.length > 0 ? _(childSheets).map(childSheet => `${_.camelCase(childSheet.name)}: { [nodeName: string]: ${_.upperFirst(_.camelCase(childSheet.name))}Node};`).join("\n") : SourceUtils.deleteLine}
}

export default class ${_.upperFirst(_.camelCase(sheet.name))}GeneratorNodeGenerated extends scg.GeneratorNode {

  readonly data: I${_.upperFirst(_.camelCase(sheet.name))}GeneratorNodeData;
  readonly parent: ${parentSheet ? `${_.upperFirst(_.camelCase(parentSheet.name))}GeneratorNode` : "null"};
  readonly siblings: { [nodeName: string]: ${_.upperFirst(_.camelCase(sheet.name))}GeneratorNode };
  readonly children: T${_.upperFirst(_.camelCase(sheet.name))}GeneratorNodeChildren;
  
  toObject(): I${_.upperFirst(_.camelCase(sheet.name))}GeneratorNodeExport {
    return <any>super.toObject();
  }

}
`);
    super.save(sheet.name, source);
  }

  private columnDataTypes(columns: IColumn[], isExport: boolean = false): string {
    type TDefElement = [string, boolean] | TDefTree;
    type TDefTree = { [columnKey: string]: TDefElement };
    let columnDataType = (column: IColumn): string => {
      switch (column.type) {
        case "text":
        case "select":
          return column.json ? "any" : "string";
        case "numeric":
          return "number";
        default:
          throw Error();
      }
    };
    let isRequired = (elm: TDefElement): boolean => {
      if (_.isArray(elm)) return elm[1];
      return _.some(elm, (celm: TDefElement) => isRequired(celm));
    };
    let recursive = (tree: TDefTree): string => {
      return "{\n" + _(tree).map((elm: TDefElement, key: string) => SourceUtils.indent(2, 1, `${key}${isRequired(elm) ? "" : "?"}: ${_.isArray(elm) ? elm[0] : recursive(elm)};`)).join("\n") + "\n}";
    };
    let tree: TDefTree = {};
    for (let column of columns) {
      if (isExport && !column.export) continue;
      _.set(tree, column.data, [columnDataType(column), column.required]);
    }
    delete tree.extends;
    return recursive(tree);
  }

  newAll(): void {
    throw new Error();
  }

  loadAll(): boolean {
    throw new Error();
  }

  saveAll(): boolean {
    if (!this.checkAndCreateDir()) return false;
    _.each(this.$hub.sheets, sheet => this.saveTsCode(sheet));
    _.each(_.difference(this.list(), _.keys(this.$hub.sheets)), name => this.unlink(name));
    return true;
  }

}
