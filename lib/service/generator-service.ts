import electron = require("electron");

import {BaseService} from "./base-service";
import {GeneratorProcess} from "../generator/generator-process";

export class GeneratorService extends BaseService {

  public errorQuestionFlag:boolean = false;

  public generate():void {
    if (!this.app.saveBaseDir) {
      alert(`Please save files before generate.`);
      return;
    }
    let process:GeneratorProcess = new GeneratorProcess(this.app);
    process.main();
  }

  public developerToolQuestion():void {
    if (!this.app.services.generator.errorQuestionFlag) {
      if (confirm(`Generate error occurred. show developper tool?`)) {
        electron.remote.getCurrentWindow().webContents.openDevTools();
      }
      this.app.services.generator.errorQuestionFlag = true;
    }
  }

}
