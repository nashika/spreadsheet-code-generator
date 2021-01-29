import fs from "fs";
import path from "path";

import { logger } from "~/src/logger";
import { BaseStore } from "~/src/store/base";

export abstract class BaseIoStore extends BaseStore {
  protected static DIR_NAME: string = "";
  protected static EXT: string = "json";

  get Class(): typeof BaseIoStore {
    return <typeof BaseIoStore>this.constructor;
  }

  protected get saveDir(): string {
    return path.join(this.$myStore.hub.saveBaseDir, this.Class.DIR_NAME);
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
    const regexp = new RegExp(`\\.${this.Class.EXT}$`);
    return fs
      .readdirSync(this.saveDir)
      .filter((f) => !!f.match(regexp))
      .map((f) => f.replace(regexp, ""));
  }

  abstract newAll(): void;

  abstract loadAll(): void;

  protected load(sheetName: string): any {
    const filePath: string = this.filePath(sheetName);
    logger.debug(`Loadig ${filePath}.`);
    if (fs.existsSync(filePath)) {
      const data: string = fs.readFileSync(filePath).toString();
      if (this.Class.EXT === "json") return JSON.parse(data);
      else return data;
    } else {
      return null;
    }
  }

  abstract saveAll(): void;

  protected save(sheetName: string, data: any): void {
    const filePath: string = this.filePath(sheetName);
    logger.debug(`Saving ${filePath}.`);
    let writeData: string;
    if (this.Class.EXT === "json") writeData = JSON.stringify(data, null, "  ");
    else writeData = data;
    fs.writeFileSync(filePath, writeData);
  }

  protected unlink(sheetName: string): void {
    const filePath: string = this.filePath(sheetName);
    console.log(`Removing ${filePath}.`);
    fs.unlinkSync(filePath);
  }
}
