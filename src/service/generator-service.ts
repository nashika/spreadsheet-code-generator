import electron = require("electron");
import _ = require("lodash");

import {BaseService} from "./base-service";
import {GeneratorProcess} from "../generator/generator-process";
import {ISheetMeta, ISheet, TSheetData} from "../component/app-component";

export class GeneratorService extends BaseService {

  public errorQuestionFlag: boolean = false;

  public generate(): void {
    if (!this.app.saveBaseDir || _.some(this.app.sheetMetas,
        (sheetMeta: ISheetMeta) => {
          return sheetMeta.modified;
        })) {
      alert(`Please save files before generate.`);
      return;
    }

    log.debug(`Load sheets was started.`);
    let sheets: {[sheetName: string]: ISheet} = this.app.services.sheet.loadAllForGenerate();
    if (!sheets) {
      alert(`Load sheets was failed.`);
      return;
    }
    log.debug(`Load sheets was finished.`);

    log.debug(`Load sheet data was started.`);
    let sheetDatas: {[sheetName: string]: TSheetData} = this.app.services.data.loadAllForGenerate();
    if (!sheetDatas) {
      alert(`Load sheet data was failed.`);
      return;
    }
    log.debug(`Load sheet data was finished.`);

    let codeNames: string[] = this.app.services.code.list();
    let process: GeneratorProcess = new GeneratorProcess(this.app.saveBaseDir, sheets, sheetDatas, codeNames);
    let result: number;
    try {
      result = process.main();
    } catch (e) {
      if (_.isString(e)) {
        alert(e);
      } else {
        if (!electron.remote.getCurrentWebContents().isDevToolsOpened()) {
          alert(e.stack || e);
        }
        this.app.services.generator.developerToolQuestion();
        throw e;
      }
      result = -1;
    }

    if (result != -1)
      alert(`Generate finished, write ${result} files.`);
  }

  public developerToolQuestion(): void {
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
