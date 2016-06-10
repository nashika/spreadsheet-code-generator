import Component from "vue-class-component";

import {BaseComponent} from "./base-component";
import {templateLoader} from "./template-loader";

@Component({
  template: templateLoader("file"),
  props: [],
})
export class FileComponent extends BaseComponent {

  data() {
    return {
    }
  }

  load():void {
    alert("now construction"); // TODO
    //this.$root.services.sheet.loadAll();
  }

  save():void {
    alert("now construction"); // TODO
    //this.$root.services.sheet.saveAll();
  }

}
