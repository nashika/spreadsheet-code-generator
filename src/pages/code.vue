<template lang="pug">
section.code
  .code-area
    div#code-editor
</template>

<script lang="ts">
import { Component } from "nuxt-property-decorator";
import Ace from "brace";
import "brace/ext/language_tools";
import "brace/theme/chrome";
import "brace/mode/javascript";
import "brace/snippets/javascript";

import { BaseComponent } from "~/src/components/base.component";
import { assertIsDefined } from "~/src/util/assert";
import { eventNames } from "~/src/util/event-names";

@Component
export default class CodeComponent extends BaseComponent {
  beforeSheetName: string = "";
  beforeCode: string = "";
  changeTimer: any = null;
  editor: Ace.Editor | null = null;

  async created() {
    this.$root.$on(eventNames.search, (query: string) => this.search(query));
    this.$root.$on(eventNames.sheet.change, () => this.changeSheet());
    await Promise.resolve();
  }

  async mounted() {
    const container: HTMLElement | null = this.$el.querySelector(
      "#code-editor"
    );
    assertIsDefined(container);
    this.editor = Ace.edit(container);
    this.editor.setTheme("ace/theme/chrome");
    this.editor.getSession().setMode("ace/mode/javascript");
    this.editor.getSession().setTabSize(2);
    this.editor.setOptions({
      enableBasicAutocompletion: true,
      enableSnippets: true,
      enableLiveAutocompletion: true,
    });
    this.editor.$blockScrolling = Infinity;
    this.editor.on("change", this.change);
    this.changeSheet();
    await Promise.resolve();
  }

  async beforeDestroy() {
    assertIsDefined(this.editor);
    this.editor.destroy();
    await Promise.resolve();
  }

  search(query: string): void {
    assertIsDefined(this.editor);
    this.editor.find(query);
  }

  onChangeCurrentSheet() {
    this.changeSheet();
  }

  change() {
    clearTimeout(this.changeTimer);
    this.changeTimer = setTimeout(() => {
      assertIsDefined(this.editor);
      const modifiedCode: string = this.editor.getValue();
      if (this.beforeCode !== modifiedCode)
        this.$myStore.sheet.a_setCode({
          name: this.beforeSheetName,
          code: modifiedCode,
        });
    }, 200);
  }

  changeSheet() {
    assertIsDefined(this.editor);
    this.beforeSheetName = this.$myStore.sheet.currentSheet.name;
    this.beforeCode = this.$myStore.sheet.currentSheet.code;
    this.editor.setValue(this.$myStore.sheet.currentSheet.code, -1);
  }
}
</script>

<style lang="scss">
section.code {
  width: 100%;
  height: 100%;
}

.code-area {
  width: 100%;
  height: 100%;
}

#code-editor {
  width: 100%;
  height: 100%;
}
</style>
