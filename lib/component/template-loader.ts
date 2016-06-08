import * as fs from "fs";
import * as path from "path";

export function templateLoader(componentName:string):string {
  let filePath:string = path.join(__dirname, `./template/${componentName}-component.html`);
  return fs.readFileSync(filePath).toString();
}
