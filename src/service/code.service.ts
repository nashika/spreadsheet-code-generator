import _ = require("lodash");
import {injectable} from "inversify";
import Vue from "vue";

import {IoService} from "./io.service";
import {HubService} from "./hub.service";

@injectable()
export class CodeService extends IoService {

  protected static DIR_NAME: string = "code";
  protected static EXT: string = "js";

  constructor(protected hubService: HubService) {
    super(hubService);
  }

  protected load(sheetName: string): string {
    let data: string = super.load(sheetName);
    return data ? data : "";
  }

  protected save(sheetName: string, data: string) {
    super.save(sheetName, data);
  }

  public newAll(): void {
    this.hubService.$vm.codes = {root: ""};
    this.hubService.$vm.currentCode = "";
  }

  public loadAll(): boolean {
    if (!this.checkDir()) return false;
    let names: string[] = this.list();
    for (let name of names)
      Vue.set(this.hubService.$vm.codes, name, this.load(name));
    this.hubService.$vm.currentCode = this.hubService.$vm.codes["root"];
    return true;
  }

  public saveAll(): boolean {
    if (!this.checkAndCreateDir()) return false;
    _.forIn(this.hubService.$vm.codes, (data, name) => {
      this.save(name, data);
    });
    _.forEach(_.difference(this.list(), _.keys(this.hubService.$vm.codes)), (name) => {
      this.unlink(name);
    });
    return true;
  }

  public edit(sheetName: string, value: string) {
    Vue.set(this.hubService.$vm.codes, sheetName, value);
    this.hubService.$vm.currentCode = value;
    this.hubService.$vm.sheetMetas[sheetName].modified = true;
  }

  public get defaultCode(): string {
    return `module.exports = {

  main: function() {
    
  },

};
`;

  }

}
