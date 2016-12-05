import Component from "vue-class-component";

import {BaseComponent} from "./base-component";
import {templateLoader} from "./template-loader";

@Component({
  template: templateLoader("menu"),
  components: {
    "button-group": require("vue-strap").buttonGroup,
    radio: require("vue-strap").radio,
  },
  props: ["mode"],
})
export class MenuComponent extends BaseComponent {

  mode: string;

  data() {
    return {};
  }

  generate() {
    this.$root.services.generator.generate();
  }

}
