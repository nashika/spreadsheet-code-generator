import _ = require("lodash");
import {injectable} from "inversify";
import Vue from "vue";

import {BaseIoService} from "./base-io.service";
import {HubService} from "./hub.service";

@injectable()
export class TsCodeService extends BaseIoService {

  protected static DIR_NAME: string = "ts-code";
  protected static EXT: string = "ts";

  constructor(protected hubService: HubService) {
    super(hubService);
  }

  protected load(_sheetName: string): void {
    throw new Error();
  }

  protected save(sheetName: string) {
    let sheet = this.$hub.sheets[sheetName];

    super.save(sheetName, source);
  }

  newAll(): void {
    throw new Error();
  }

  loadAll(): boolean {
    throw new Error();
  }

  saveAll(): boolean {
    if (!this.checkAndCreateDir()) return false;
    _.each(this.list(), name => this.save(name));
    _.each(_.difference(this.list(), _.keys(this.$hub.codes)), name => this.unlink(name));
    return true;
  }

}
