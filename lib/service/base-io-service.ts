import * as fs from "fs";
import * as path from "path";

import {Application} from "../application";

export class BaseIoService {
  
  protected saveDir:string;
  
  constructor(protected app:Application, dirName:string) {
    this.saveDir = path.join(this.app.saveBaseDir, dirName);
  }

  public load(sheetName:string):any {
    let filePath:string = path.join(this.saveDir, `${sheetName}.json`);
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath).toString());
    } else {
      return null;
    }
  };

  public save(sheetName:string, data:any):void {
    fs.writeFileSync(path.join(this.saveDir, `${sheetName}.json`), JSON.stringify(data, null, "  "));
  };

}
