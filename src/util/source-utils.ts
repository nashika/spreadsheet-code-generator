import * as _ from "lodash";

export class SourceUtils {

  static get deleteLine(): string {
    return "###DeleteLine###";
  }

  static get noNewLine(): string {
    return "###NoNewLine###";
  }

  static source(argSource: any): string {
    let result: string = "";
    let source: string = _.isString(argSource) ? argSource : _.toString(argSource);
    let lines: Array<string> = source.toString().split(/\n/g);
    if (lines[0] == "") lines.shift();
    if (lines[lines.length - 1] == "") lines.pop();
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

  static indent(numIndent: number, argSource: any, unitIndent: number, indentFirstLine: boolean = true): string {
    let result: string = "";
    let source: string = _.isString(argSource) ? argSource : _.toString(argSource);
    let lines: string[] = source.split(/\n/g);
    if (lines[lines.length - 1] == "") lines.pop();
    lines.forEach((line: string, index: number) => {
      let newLine: string = (index < lines.length - 1) ? "\n" : "";
      if (line && (index > 0 || indentFirstLine))
        result += _.repeat(" ", unitIndent * numIndent) + line + newLine;
      else
        result += line + newLine;
    });
    return result;
  }

}
