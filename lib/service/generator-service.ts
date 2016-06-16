import electron = require("electron");
import _ = require("lodash");

import {BaseService} from "./base-service";
import {GeneratorProcess} from "../generator/generator-process";
import {ISheetMeta} from "../component/app-component";

export class GeneratorService extends BaseService {

  public errorQuestionFlag:boolean = false;

  public generate():void {
    if (!this.app.saveBaseDir || _.some(this.app.sheetMetas,
        (sheetMeta:ISheetMeta) => { return sheetMeta.modified; })) {
      alert(`Please save files before generate.`);
      return;
    }
    if (!this.app.services.data.loadAll()) return;
    let process:GeneratorProcess = new GeneratorProcess(this.app);
    let result:number = process.main();
    if (result != -1)
      alert(`Generate finished, write ${result} files.`);
  }

  public developerToolQuestion():void {
    if (!this.app.services.generator.errorQuestionFlag) {
      if (!electron.remote.getCurrentWebContents().isDevToolsOpened()) {
        if (confirm(`Generate error occurred. show developper tool?`)) {
          electron.remote.getCurrentWindow().webContents.openDevTools();
        }
      }
      this.app.services.generator.errorQuestionFlag = true;
    }
  }

}
