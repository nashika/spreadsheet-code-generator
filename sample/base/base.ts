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

  write(_argPath: string, _data: string, _option: { override?: boolean } = {}): void {
    throw new Error("Unexpected call.");
  }

  source(_argSource: string): string {
    throw new Error("Unexpected call.");
  }

  indent(_numIndent: number, _argSource: any, _noIndentFirstLine: boolean = false): string {
    throw new Error("Unexpected call.");
  }

  setIndent(_arg: number): void {
    throw new Error("Unexpected call.");
  }

  toObject(): Object {
    throw new Error("Unexpected call.");
  }
}
