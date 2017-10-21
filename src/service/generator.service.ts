import electron = require("electron");
import _ = require("lodash");
import * as log from "loglevel";
import {injectable} from "inversify";

import {GeneratorProcess} from "../generator/generator-process";
import {HubService, ISheet, ISheetMeta, TSheetData} from "./hub.service";
import {CodeService} from "./code.service";
import {SheetService} from "./sheet.service";
import {DataService} from "./data.service";
import {BaseHubService} from "./base-hub.service";

@injectable()
export class GeneratorService extends BaseHubService {

  public errorQuestionFlag: boolean = false;

  constructor(protected hubService: HubService,
              protected sheetService: SheetService,
              protected dataService: DataService,
              protected codeService: CodeService) {
    super(hubService);
  }

  public generate(): void {
    if (!this.$hub.saveBaseDir || _.some(this.$hub.sheetMetas,
        (sheetMeta: ISheetMeta) => {
          return sheetMeta.modified;
        })) {
      alert(`Please save files before generate.`);
      return;
    }

    log.debug(`Load sheets was started.`);
    let sheets: {[sheetName: string]: ISheet} = this.sheetService.loadAllForGenerate();
    if (!sheets) {
      alert(`Load sheets was failed.`);
      return;
    }
    log.debug(`Load sheets was finished.`);

    log.debug(`Load sheet data was started.`);
    let sheetDatas: {[sheetName: string]: TSheetData} = this.dataService.loadAllForGenerate();
    if (!sheetDatas) {
      alert(`Load sheet data was failed.`);
      return;
    }
    log.debug(`Load sheet data was finished.`);

    let codeNames: string[] = this.codeService.list();
    let process: GeneratorProcess = new GeneratorProcess(this.$hub.saveBaseDir, sheets, sheetDatas, codeNames);
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
        this.developerToolQuestion();
        throw e;
      }
      result = -1;
    }

    if (result != -1)
      alert(`Generate finished, write ${result} files.`);
  }

  public developerToolQuestion(): void {
    if (!this.errorQuestionFlag) {
      if (!electron.remote.getCurrentWebContents().isDevToolsOpened()) {
        if (confirm(`Generate error occurred. show developper tool?`)) {
          electron.remote.getCurrentWindow().webContents.openDevTools();
        }
      }
      this.errorQuestionFlag = true;
    }
  }

}
