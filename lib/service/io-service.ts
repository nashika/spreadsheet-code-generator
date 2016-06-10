import * as fs from "fs";
import * as path from "path";

import {BaseService} from "./base-service";
import {AppComponent} from "../component/app-component";

export class IoService extends BaseService {

  protected saveDir:string;

  constructor(app:AppComponent, dirName:string) {
    super(app);
    this.saveDir = path.join(this.app.saveBaseDir, dirName);
  }

  protected filePath(sheetName:string):string {
    return path.join(this.saveDir, `${sheetName}.json`);
  }

  public load(sheetName:string):any {
    let filePath:string = this.filePath(sheetName);
    console.log(`Loadig ${filePath}.`);
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath).toString());
    } else {
      return null;
    }
  }

  public save(sheetName:string, data:any):void {
    let filePath:string = this.filePath(sheetName);
    console.log(`Saving ${filePath}.`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, "  "));
  }

  public remove(sheetName:string):void {
    let filePath:string = this.filePath(sheetName);
    console.log(`Removing ${filePath}.`);
    fs.unlinkSync(filePath);
  }

}
