import Component from "vue-class-component";

import BaseComponent from "./base-component";
import {HubService} from "../service/hub.service";
import {container} from "../inversify.config";

@Component({})
export default class SearchComponent extends BaseComponent {

  hubService: HubService =  container.get(HubService);

  query: string = "";

  search() {
    if (!this.query) return;
    this.hubService.$vm.$emit("search", this.query);
  }

}
