import _ = require("lodash");
import {injectable} from "inversify";

import {BaseIoService} from "./base-io.service";
import {HubService, TSheetData} from "./hub.service";

@injectable()
export class DataService extends BaseIoService {

  protected static DIR_NAME: string = "data";

  constructor(protected hubService: HubService) {
    super(hubService);
  }

  protected load(sheetName: string): TSheetData {
    let data: any[] = super.load(sheetName);
    return data ? data : [];
  }

  protected save(sheetName: string, data: TSheetData) {
    if (name == "root") return;

    data = data.map(record => {
      let result: any = {};
      for (let column of this.$hub.sheets[sheetName].columns) {
        let columnData: any = _.get(record, column.data);
        if (_.isNull(columnData)) continue;
        if (_.isUndefined(columnData)) continue;
        if (columnData === "") continue;
        switch (column.type) {
          case "text":
          case "select":
            if (!_.isString(columnData)) columnData = _.toString(columnData);
            break;
          case "numeric":
            if (!_.isNumber(columnData)) columnData = _.toNumber(columnData);
            break;
        }
        _.set(result, column.data, columnData);
      }
      return result;
    });
    super.save(sheetName, data);
  }

  newAll(): void {
    this.$hub.datas = {};
    this.$hub.currentData = null;
  }

  loadAll(): boolean {
    if (!this.checkDir()) return false;
    let names: string[] = this.list();
    this.$hub.datas = _.zipObject(names, names.map(name => this.load(name)));
    return true;
  }

  saveAll(): boolean {
    if (!this.checkAndCreateDir()) return false;
    _.each(this.$hub.datas, (data, name) => this.save(name, data));
    _.each(_.difference(this.list(), _.keys(this.$hub.datas)), (name) => this.unlink(name));
    return true;
  }

  loadAllForGenerate(): {[sheetName: string]: TSheetData} {
    if (!this.checkDir()) return null;
    let names= this.list();
    let result: {[sheetName: string]: TSheetData} = _.zipObject(names, _.map(names, name => this.load(name)));
    result["root"] = [];
    return result;
  }

}
