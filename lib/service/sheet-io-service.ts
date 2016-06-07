import * as fs from "fs";

import {Application, ISheetDefinition} from "../application";
import {BaseIoService} from "./base-io-service";

export class SheetIoService extends BaseIoService {
  
  public sheetNames:string[];
  
  constructor(app:Application) {
    super(app, "sheet");
    this.reload();
  }

  public load(sheetName:string):ISheetDefinition {
    return super.load(sheetName);
  }
  
  public save(sheetName:string, data:ISheetDefinition) {
    super.save(sheetName, data);
  }
  
  private reload() {
    let sheetFiles:string[] = fs.readdirSync(this.saveDir);
    this.sheetNames = [];
    for (let sheetFile of sheetFiles) this.sheetNames.push(sheetFile.replace(/\.json$/, ""));
  }
  
}
