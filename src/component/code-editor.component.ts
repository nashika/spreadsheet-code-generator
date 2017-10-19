import Component from "vue-class-component";

import BaseComponent from "./base-component";
import {CodeService} from "../service/code.service";
import {container} from "../inversify.config";
import {ISheet} from "../service/hub.service";

@Component({
  props: {
    currentSheet: Object,
    currentCode: String,
  },
  watch: {
    "currentSheet": CodeEditorComponent.prototype.onChangeCurrentSheet,
  },
})
export default class CodeEditorComponent extends BaseComponent {

  codeService: CodeService = container.get(CodeService);

  currentSheet: ISheet;
  currentCode: string;

  beforeSheetName: string = "";
  beforeCode: string = "";
  changeTimer: any = null;
  editor: AceAjax.Editor = null;

  created() {
    this.$on("search", this.onSearch);
  }

  onSearch(query: string): void {
    this.editor.find(query);
  }

  ready() {
    let container: HTMLElement = <HTMLElement>this.$el.querySelector("#code-editor");
    this.editor = ace.edit(container);
    //this.editor.setTheme("ace/theme/chrome");
    this.editor.getSession().setMode("ace/mode/javascript");
    this.editor.setOptions({
      enableBasicAutocompletion: true,
      enableSnippets: true,
      enableLiveAutocompletion: true,
    });
    this.editor.getSession().setTabSize(2);
    this.editor.$blockScrolling = Infinity;
    (<any>this.editor).on("change", this.change);
    this.changeSheet();
  }

  onChangeCurrentSheet() {
    this.changeSheet();
  }

  beforeDestroy() {
    this.editor.destroy();
  }

  change() {
    clearTimeout(this.changeTimer);
    this.changeTimer = setTimeout(() => {
      let modifiedCode: string = this.editor.getValue();
      if (this.beforeCode != modifiedCode)
        this.codeService.edit(this.beforeSheetName, modifiedCode);
    }, 200);
  }

  changeSheet() {
    this.beforeSheetName = this.currentSheet.name;
    this.beforeCode = this.currentCode;
    this.editor.setValue(this.currentCode, -1);
  }

}
