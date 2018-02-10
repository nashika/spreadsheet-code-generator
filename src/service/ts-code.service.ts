import _ = require("lodash");
import {injectable} from "inversify";

import {BaseIoService} from "./base-io.service";
import {HubService, ISheet} from "./hub.service";
import {SourceUtils} from "../util/source-utils";

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

  private saveTsCode(sheet: ISheet) {
    let source = SourceUtils.source(`
export default class ${_.upperFirst(_.camelCase(sheet.name))}GeneratorNodeGenerated extends scg.GeneratorNode {
}
`);
    super.save(sheet.name, source);
  }

  newAll(): void {
    throw new Error();
  }

  loadAll(): boolean {
    throw new Error();
  }

  saveAll(): boolean {
    if (!this.checkAndCreateDir()) return false;
    _.each(this.$hub.sheets, sheet => this.saveTsCode(sheet));
    _.each(_.difference(this.list(), _.keys(this.$hub.codes)), name => this.unlink(name));
    return true;
  }

}
