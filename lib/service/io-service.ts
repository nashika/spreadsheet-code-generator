import * as fs from "fs";
import * as path from "path";

import {BaseService} from "./base-service";
import {AppComponent} from "../component/app-component";

export class IoService extends BaseService {

  protected static DIR_NAME:string = "";
  protected static EXT:string = "json";

  protected get saveDir():string {
    return path.join(this.app.saveBaseDir, (<typeof IoService>this.constructor).DIR_NAME);
  }

  protected filePath(sheetName:string):string {
    return path.join(this.saveDir, `${sheetName}.${(<typeof IoService>this.constructor).EXT}`);
  }

  protected checkDir():boolean {
    if (!fs.existsSync(this.saveDir)) {
      alert(`"${this.saveDir}" is not found.`);
      return false;
    } else if (fs.statSync(this.saveDir).isDirectory()) {
      return true;
    } else {
      alert(`"${this.saveDir}" is not directory, please remove it.`);
      return false;
    }

  }

  protected checkAndCreateDir():boolean {
    if (!fs.existsSync(this.saveDir)) {
      fs.mkdirSync(this.saveDir);
      return true;
    } else if (fs.statSync(this.saveDir).isDirectory()) {
      return true;
    } else {
      alert(`"${this.saveDir}" is not directory, please remove it.`);
      return false;
    }
  }

  protected list():string[] {
    let regexp = new RegExp(`\\.${(<typeof IoService>this.constructor).EXT}$`);
    return fs.readdirSync(this.saveDir)
      .filter((f) => f.match(regexp) ? true : false)
      .map((f) => f.replace(regexp, ""));
  }

  protected load(sheetName:string):any {
    let filePath:string = this.filePath(sheetName);
    console.log(`Loadig ${filePath}.`);
    if (fs.existsSync(filePath)) {
      let data:string = fs.readFileSync(filePath).toString();
      if ((<typeof IoService>this.constructor).EXT == "json")
        return JSON.parse(data);
      else
        return data;
    } else {
      return null;
    }
  }

  protected save(sheetName:string, data:any):void {
    let filePath:string = this.filePath(sheetName);
    console.log(`Saving ${filePath}.`);
    let writeData:string;
    if ((<typeof IoService>this.constructor).EXT == "json")
      writeData = JSON.stringify(data, null, "  ");
    else
      writeData = data;
    fs.writeFileSync(filePath, writeData);
  }

  protected unlink(sheetName:string):void {
    let filePath:string = this.filePath(sheetName);
    console.log(`Removing ${filePath}.`);
    fs.unlinkSync(filePath);
  }

}
