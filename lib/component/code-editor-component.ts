import Component from "vue-class-component";

import {BaseComponent} from "./base-component";
import {templateLoader} from "./template-loader";

@Component({
  template: templateLoader("code-editor"),
  ready: CodeEditorComponent.prototype.onReady,
})
export class CodeEditorComponent extends BaseComponent {

  data() {
    return {
    };
  }

  onReady() {
    let container:HTMLElement = <HTMLElement>this.$el.querySelector("#code-editor");
    let editor = ace.edit(container);
    editor.setTheme("ace/theme/chrome");
    editor.getSession().setMode("ace/mode/javascript");
  }

}
