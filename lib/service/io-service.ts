import * as fs from "fs";
import * as path from "path";

import {BaseService} from "./base-service";
import {AppComponent} from "../component/app-component";

export class IoService extends BaseService {

  protected static DIR_NAME:string = "";
  
  protected get saveDir():string {
    return path.join(this.app.saveBaseDir, (<typeof IoService>this.constructor).DIR_NAME);
  }

  protected filePath(sheetName:string):string {
    return path.join(this.saveDir, `${sheetName}.json`);
  }

  protected list():string[] {
    return fs.readdirSync(this.saveDir)
      .filter((f) => f.match(/\.json$/) ? true : false)
      .map((f) => f.replace(/\.json$/, ""));
  }

  protected load(sheetName:string):any {
    let filePath:string = this.filePath(sheetName);
    console.log(`Loadig ${filePath}.`);
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath).toString());
    } else {
      return null;
    }
  }

  protected save(sheetName:string, data:any):void {
    let filePath:string = this.filePath(sheetName);
    console.log(`Saving ${filePath}.`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, "  "));
  }

  protected unlink(sheetName:string):void {
    let filePath:string = this.filePath(sheetName);
    console.log(`Removing ${filePath}.`);
    fs.unlinkSync(filePath);
  }

}
