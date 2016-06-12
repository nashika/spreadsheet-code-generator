import Component from "vue-class-component";
import _ = require("lodash");

import {BaseComponent} from "./base-component";
import {templateLoader} from "./template-loader";

@Component({
  template: templateLoader("menu"),
  components: {
    "radio-group": require("vue-strap").radioGroup,
    radio: require("vue-strap").radioBtn,
  },
  props: ["mode"],
})
export class MenuComponent extends BaseComponent {

  mode:string;

  data() {
    return {
    };
  }

}
