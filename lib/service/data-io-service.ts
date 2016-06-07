import * as fs from "fs";
import * as path from "path";

import {Application} from "../application";

export class DataIoService {
  
  constructor(private app:Application) {}

  public load():any[] {
    let filePath:string = path.join(this.app.dataDir, `${this.app.currentSheetName}.json`);
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath).toString());
    } else {
      return [];
    }
  };

  public save(data:any[]):void {
    fs.writeFileSync(path.join(this.app.dataDir, `${this.app.currentSheetName}.json`), JSON.stringify(data, null, "  "));
  };

}
