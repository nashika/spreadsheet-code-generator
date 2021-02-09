export class NodeBase {
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
    throw new Error("Unexpected call.");
  }

  source(argSource: string): string {
    throw new Error("Unexpected call.");
  }

  indent(
    numIndent: number,
    argSource: any,
    noIndentFirstLine: boolean = false
  ): string {
    throw new Error("Unexpected call.");
  }

  setIndent(arg: number): void {
    throw new Error("Unexpected call.");
  }

  toObject(): Object {
    throw new Error("Unexpected call.");
  }
}
