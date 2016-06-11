import {BaseService} from "./base-service";
import {AppComponent} from "../component/app-component";

export class ConfigService extends BaseService {

  constructor(app:AppComponent) {
    super(app);
    this.load();
  }

  public load():void {
    
  }

}
