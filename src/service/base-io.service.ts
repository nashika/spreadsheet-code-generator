import * as fs from "fs";
import * as path from "path";

import * as log from "loglevel";
import {injectable} from "inversify";

import {HubService} from "./hub.service";
import {BaseHubService} from "./base-hub.service";

@injectable()
export abstract class BaseIoService extends BaseHubService {

  protected static DIR_NAME: string = "";
  protected static EXT: string = "json";

  constructor(protected hubService: HubService) {
    super(hubService);
  }

  get Class(): typeof BaseIoService {
    return <typeof BaseIoService>this.constructor;
  }

  protected get saveDir(): string {
    return path.join(this.$hub.saveBaseDir, this.Class.DIR_NAME);
  }

  protected filePath(sheetName: string): string {
    return path.join(this.saveDir, `${sheetName}.${this.Class.EXT}`);
  }

  protected checkDir(): boolean {
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

  protected checkAndCreateDir(): boolean {
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

  list(): string[] {
    let regexp = new RegExp(`\\.${this.Class.EXT}$`);
    return fs.readdirSync(this.saveDir)
      .filter((f) => f.match(regexp) ? true : false)
      .map((f) => f.replace(regexp, ""));
  }

  abstract newAll(): void;

  abstract loadAll(): void;

  protected load(sheetName: string): any {
    let filePath: string = this.filePath(sheetName);
    log.debug(`Loadig ${filePath}.`);
    if (fs.existsSync(filePath)) {
      let data: string = fs.readFileSync(filePath).toString();
      if (this.Class.EXT == "json")
        return JSON.parse(data);
      else
        return data;
    } else {
      return null;
    }
  }

  abstract saveAll(): void;

  protected save(sheetName: string, data: any): void {
    let filePath: string = this.filePath(sheetName);
    log.debug(`Saving ${filePath}.`);
    let writeData: string;
    if (this.Class.EXT == "json")
      writeData = JSON.stringify(data, null, "  ");
    else
      writeData = data;
    fs.writeFileSync(filePath, writeData);
  }

  protected unlink(sheetName: string): void {
    let filePath: string = this.filePath(sheetName);
    console.log(`Removing ${filePath}.`);
    fs.unlinkSync(filePath);
  }

}