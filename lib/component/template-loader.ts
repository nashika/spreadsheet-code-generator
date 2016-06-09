import * as fs from "fs";
import * as path from "path";

export function templateLoader(componentName:string):string {
  return require(`./template/${componentName}-component.jade`);
}
