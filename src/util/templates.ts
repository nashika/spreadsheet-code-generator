import _ from "lodash";

import { sourceUtils } from "~/src/util/source-utils";
import { IColumn, ISheet, ISheetMeta } from "~/src/store/sheet";
import { assertIsDefined } from "~/src/util/assert";

export const templates = {
  sheet(): ISheet {
    return {
      name: "",
      parent: "",
      freezeColumn: 0,
      columns: [],
      meta: this.sheetMeta(),
      data: [],
    };
  },

  sheetMeta(): ISheetMeta {
    return {
      modified: false,
      rowOffset: 0,
      colOffset: 0,
    };
  },

  column(no: number): IColumn {
    return {
      header: `Col${no}`,
      data: `data${no}`,
      type: "text",
      json: undefined,
      options: undefined,
      width: 80,
      required: false,
      export: true,
      // tsType: "",
    };
  },

  code(sheet: ISheet): string {
    /* eslint-disable prettier/prettier */
    return sourceUtils.source(`
import ${_.upperFirst(_.camelCase(sheet.name))}NodeBase from "../base/${sheet.name}";

export default class ${_.upperFirst(_.camelCase(sheet.name))}Node extends ${_.upperFirst(_.camelCase(sheet.name))}NodeBase {
  main(): void {
  }
}
  `);
    /* eslint-enable prettier/prettier */
  },

  baseCode(sheet: ISheet, sheets: { [name: string]: ISheet }): string {
    const parentSheet = _(sheets).find((sh) => sh.name === sheet.parent);
    const childSheets = _(sheets)
      .filter((sh) => sh.parent === sheet.name)
      .value();
    const any = "<any>";
    /* eslint-disable prettier/prettier */
    return sourceUtils.source(`
import NodeBase from "./base";
import ${_.upperFirst(_.camelCase(sheet.name))}Node from "../code/${sheet.name}";
${parentSheet ? `import ${_.upperFirst(_.camelCase(parentSheet.name))}Node from "../code/${parentSheet.name}";` : sourceUtils.deleteLine}
${childSheets.length > 0 ? _(childSheets).map(childSheet => `import ${_.upperFirst(_.camelCase(childSheet.name))}Node from "../code/${childSheet.name}";`).join("\n") : sourceUtils.deleteLine}

type T${_.upperFirst(_.camelCase(sheet.name))}NodeChildren = {
${childSheets.length > 0 ? sourceUtils.indent(2, 1, _(childSheets).map(childSheet => `${_.camelCase(childSheet.name)}: { [nodeName: string]: ${_.upperFirst(_.camelCase(childSheet.name))}Node };`).join("\n")) : sourceUtils.deleteLine}
};

export interface I${_.upperFirst(_.camelCase(sheet.name))}NodeData ${this.columnDataTypes(sheet.columns)}

export interface I${_.upperFirst(_.camelCase(sheet.name))}NodeExport ${this.columnDataTypes(sheet.columns, true)}

export default class ${_.upperFirst(_.camelCase(sheet.name))}NodeBase extends NodeBase {
  readonly data!: I${_.upperFirst(_.camelCase(sheet.name))}NodeData;
  readonly parent!: ${parentSheet ? `${_.upperFirst(_.camelCase(parentSheet.name))}Node` : "null"};
  readonly siblings!: { [nodeName: string]: ${_.upperFirst(_.camelCase(sheet.name))}Node };
  readonly children!: T${_.upperFirst(_.camelCase(sheet.name))}NodeChildren;

  toObject(): I${_.upperFirst(_.camelCase(sheet.name))}NodeExport {
    return ${any}super.toObject();
  }
}
`);
    /* eslint-enable prettier/prettier */
  },

  columnDataTypes(columns: IColumn[], isExport: boolean = false): string {
    type TDefElement = [string, boolean] | TDefTree;
    type TDefTree = { [columnKey: string]: TDefElement };
    const columnDataType = (column: IColumn): string => {
      if (column.tsType) return column.tsType;
      switch (column.type) {
        case "text":
          return column.json ? "any" : "string";
        case "select":
          assertIsDefined(column.options);
          return column.json
            ? "any"
            : column.options.map((op) => `"${op}"`).join(" | ");
        case "numeric":
          return "number";
        default:
          throw new Error("Unknown type");
      }
    };
    const isRequired = (elm: TDefElement): boolean => {
      if (_.isArray(elm)) return elm[1];
      return _.some(elm, (culElm: TDefElement) => isRequired(culElm));
    };
    const recursive = (tree: TDefTree): string => {
      return (
        "{\n" +
        _(tree)
          .map((elm: TDefElement, key: string) =>
            sourceUtils.indent(
              2,
              1,
              `${key}${isRequired(elm) ? "" : "?"}: ${
                _.isArray(elm) ? elm[0] : recursive(elm)
              };`
            )
          )
          .join("\n") +
        "\n}"
      );
    };
    const tree: TDefTree = {};
    for (const column of columns) {
      if (isExport && !column.export) continue;
      _.set(tree, column.data, [columnDataType(column), column.required]);
    }
    delete tree.extends;
    return recursive(tree);
  },

  baseCodeStub(): string {
    const errMsg = '"Unexpected call."';
    return sourceUtils.source(`
export default class NodeBase {
  readonly data!: Object;
  readonly parent!: Object | null;
  readonly siblings!: { [nodeName: string]: Object };
  readonly children!: { [nodeName: string]: Object };
  readonly root!: Object;

  readonly name!: string;
  readonly columns!: string[];
  readonly deleteLine!: string;
  readonly noNewLine!: string;

  write(argPath: string, data: string, option: { override?: boolean } = {}): void {
    throw new Error(${errMsg});
  }

  source(argSource: string): string {
    throw new Error(${errMsg});
  }

  indent(
    numIndent: number,
    argSource: any,
    noIndentFirstLine: boolean = false
  ): string {
    throw new Error(${errMsg});
  }

  setIndent(arg: number): void {
    throw new Error(${errMsg});
  }

  toObject(): Object {
    throw new Error(${errMsg});
  }
}
`);
  },
};
