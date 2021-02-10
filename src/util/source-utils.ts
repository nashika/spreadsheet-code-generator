import _ from "lodash";

export const sourceUtils = {
  get deleteLine(): string {
    return "###DeleteLine###";
  },

  get noNewLine(): string {
    return "###NoNewLine###";
  },

  source(argSource: string): string {
    let result: string = "";
    const lines: string[] = argSource.toString().split(/\n/g);
    if (lines[0] === "") lines.shift();
    lines.forEach((line, index) => {
      if (line.match(/###DeleteLine###/)) return;
      if (line.match(/###NoNewLine###/)) {
        line = line.replace(/###NoNewLine###/, "");
        result += line;
        return;
      }
      result += line + (index !== lines.length - 1 ? "\n" : "");
    });
    return result;
  },

  indent(
    unitIndent: number,
    numIndent: number,
    argSource: string,
    noIndentFirstLine: boolean = false
  ): string {
    let result: string = "";
    const lines: string[] = argSource.split(/\n/g);
    if (lines[lines.length - 1] === "") lines.pop();
    lines.forEach((line: string, index: number) => {
      const newLine: string = index < lines.length - 1 ? "\n" : "";
      if (line && (index > 0 || !noIndentFirstLine))
        result += _.repeat(" ", unitIndent * numIndent) + line + newLine;
      else result += line + newLine;
    });
    return result;
  },
};
