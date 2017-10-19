import _ = require("lodash");
import {injectable} from "inversify";
import {Vue} from "vue/types/vue";

import {IoService} from "./io.service";
import {HubService, TSheetData} from "./hub.service";

@injectable()
export class DataService extends IoService {

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

    data = data.map((record) => {
      let result: any = {};
      for (let column of this.hubService.$vm.sheets[sheetName].columns) {
        let columnData: any = _.get(record, column.data);
        if (_.isNull(columnData)) continue;
        if (_.isUndefined(columnData)) continue;
        if (columnData === "") continue;
        _.set(result, column.data, columnData);
      }
      return result;
    });
    super.save(sheetName, data);
  }

  public newAll(): void {
    this.hubService.$vm.datas = {};
    this.hubService.$vm.currentData = null;
  }

  public loadAll(): boolean {
    if (!this.checkDir()) return false;
    let names: string[] = this.list();
    for (let name of names)
      Vue.set(this.hubService.$vm.datas, name, this.load(name));
    return true;
  }

  public saveAll(): boolean {
    if (!this.checkAndCreateDir()) return false;
    _.forIn(this.hubService.$vm.datas, (data, name) => {
      this.save(name, data);
    });
    _.forEach(_.difference(this.list(), _.keys(this.hubService.$vm.datas)), (name) => {
      this.unlink(name);
    });
    return true;
  }

  public loadAllForGenerate(): {[sheetName: string]: TSheetData} {
    if (!this.checkDir()) return null;
    let names: string[] = this.list();
    let result: {[sheetName: string]: TSheetData} = {};
    for (let name of names)
      result[_.camelCase(name)] = this.load(name);
    return result;
  }

}
