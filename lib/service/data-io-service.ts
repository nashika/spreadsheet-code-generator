import {Application} from "../application";
import {BaseIoService} from "./base-io-service";

export class DataIoService extends BaseIoService {
  
  constructor(app:Application) {
    super(app, "data");
  }

  public load(sheetName:string):any[] {
    return super.load(sheetName);
  }
  
  public save(sheetName:string, data:any[]) {
    super.save(sheetName, data);
  }
  
}
