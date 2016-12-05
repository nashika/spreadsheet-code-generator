import Component from "vue-class-component";

import {ISheet} from "./app-component";
import {BaseComponent} from "./base-component";
import {templateLoader} from "./template-loader";

@Component({
  template: templateLoader("code-editor"),
  props: ["currentSheet", "currentCode"],
  watch: {
    "currentSheet": CodeEditorComponent.prototype.onChangeCurrentSheet,
  },
  events: {
    "search": CodeEditorComponent.prototype.onSearch,
  },
  beforeDestroy: CodeEditorComponent.prototype.onBeforeDestroy,
})
export class CodeEditorComponent extends BaseComponent {

  currentSheet: ISheet;
  currentCode: string;

  beforeSheetName: string;
  beforeCode: string;
  changeTimer: any;
  editor: AceAjax.Editor;

  data(): any {
    return {
      beforeSheetName: "",
      beforeCode: "",
      changeTimer: null,
      editor: null,
    };
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

  onBeforeDestroy() {
    this.editor.destroy();
  }

  change() {
    clearTimeout(this.changeTimer);
    this.changeTimer = setTimeout(() => {
      let modifiedCode: string = this.editor.getValue();
      if (this.beforeCode != modifiedCode)
        this.$root.services.code.edit(this.beforeSheetName, modifiedCode);
    }, 200);
  }

  changeSheet() {
    this.beforeSheetName = this.currentSheet.name;
    this.beforeCode = this.currentCode;
    this.editor.setValue(this.currentCode, -1);
  }

}
