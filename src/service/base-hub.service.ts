import {injectable} from "inversify";
import {HubService, HubServiceEventBus} from "./hub.service";
import {BaseService} from "./base.service";

@injectable()
export abstract class BaseHubService extends BaseService {

  constructor(protected hubService: HubService) {
    super();
  }

  protected get $hub(): HubServiceEventBus {
    return this.hubService.$vm;
  }

}
