import Component from "vue-class-component";

import {BaseComponent} from "./base-component";
import {templateLoader} from "./template-loader";

@Component({
  template: templateLoader("code-editor"),
})
export class CodeEditorComponent extends BaseComponent {

  data() {
    return {
    };
  }

}
