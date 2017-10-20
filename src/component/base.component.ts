import Vue from "vue";

import {HubService, HubServiceEventBus} from "../service/hub.service";
import {container} from "../inversify.config";

export default abstract class BaseComponent extends Vue {

  hubService: HubService = container.get(HubService);

  get $hub(): HubServiceEventBus {
    return this.hubService.$vm;
  }

  beforeCreate?(): void;
  created?(): void;
  beforeDestroy?(): void;
  destroyed?(): void;
  beforeMount?(): void;
  mounted?(): void;
  beforeUpdate?(): void;
  updated?(): void;
  activated?(): void;
  deactivated?(): void;
  errorCaptured?(): boolean | void;

}
