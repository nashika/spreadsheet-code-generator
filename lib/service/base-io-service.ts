import * as fs from "fs";
import * as path from "path";

import {app} from "../application";

export class BaseIoService {

  protected saveDir:string;

  constructor(dirName:string) {
    this.saveDir = path.join(app.$data.saveBaseDir, dirName);
  }

  protected filePath(sheetName:string):string {
    return path.join(this.saveDir, `${sheetName}.json`);
  }

  public load(sheetName:string):any {
    let filePath:string = this.filePath(sheetName);
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath).toString());
    } else {
      return null;
    }
  }

  public save(sheetName:string, data:any):void {
    fs.writeFileSync(this.filePath(sheetName), JSON.stringify(data, null, "  "));
  }

  public remove(sheetName:string):void {
    fs.unlinkSync(this.filePath(sheetName));
  }

}
