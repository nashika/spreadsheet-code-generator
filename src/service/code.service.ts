import _ = require("lodash");
import {injectable} from "inversify";
import Vue from "vue";

import {BaseIoService} from "./base-io.service";
import {HubService} from "./hub.service";

@injectable()
export class CodeService extends BaseIoService {

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

  newAll(): void {
    this.$hub.codes = {root: ""};
    this.$hub.currentCode = "";
  }

  loadAll(): boolean {
    if (!this.checkDir()) return false;
    let names: string[] = this.list();
    this.$hub.codes = _.zipObject(names, names.map(name => this.load(name)));
    this.$hub.currentCode = this.$hub.codes["root"];
    return true;
  }

  saveAll(): boolean {
    if (!this.checkAndCreateDir()) return false;
    _.each(this.$hub.codes, (data, name) => this.save(name, data));
    _.each(_.difference(this.list(), _.keys(this.$hub.codes)), name => this.unlink(name));
    return true;
  }

  edit(sheetName: string, value: string) {
    Vue.set(this.$hub.codes, sheetName, value);
    this.$hub.currentCode = value;
    this.$hub.sheetMetas[sheetName].modified = true;
  }

  get defaultCode(): string {
    return `module.exports = {

  main: function() {
    
  },

};
`;

  }

}
