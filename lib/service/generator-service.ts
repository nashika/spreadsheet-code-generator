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
    let process:GeneratorProcess = new GeneratorProcess(this.app);
    if (process.main())
      alert("Generate finished.");
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
