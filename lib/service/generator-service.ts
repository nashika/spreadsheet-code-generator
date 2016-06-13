import fs = require("fs");
import path = require("path");

import electron = require("electron");

declare function originalRequire(path:string):any;
declare module originalRequire {
  var cache:{[path:string]:any};
}

import {BaseService} from "./base-service";

export class GeneratorService extends BaseService {

  errorQuestionFlag:boolean = false;

  public generate():void {
    if (!this.app.saveBaseDir) {
      alert(`Please save files before generate.`);
      return;
    }
    let codeDir:string = path.join(this.app.saveBaseDir, "./code/");
    let rootPath:string = path.join(codeDir, "./root.js");
    delete originalRequire.cache[rootPath];
    let result:any;
    try {
      result = originalRequire(rootPath);
    } catch (e) {
      if (!this.errorQuestionFlag) {
        if (confirm(`Generate error occurred. show developper tool?`)) {
          electron.remote.getCurrentWindow().webContents.openDevTools();
        }
        this.errorQuestionFlag = true;
      }
      throw e;
    }
    console.log(result.generate());
  }

}
