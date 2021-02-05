<template lang="pug">
section.code
  .code-area
    div#code-editor
</template>

<script lang="ts">
import { Component } from "nuxt-property-decorator";
import Ace from "ace-builds";
import "ace-builds/webpack-resolver";
// import "ace-builds/ext/language_tools";
// import "brace/theme/chrome";
// import "brace/mode/javascript";
// import "brace/snippets/javascript";

import { BaseComponent } from "~/src/components/base.component";
import { assertIsDefined } from "~/src/util/assert";
import { eventNames } from "~/src/util/event-names";

/* eslint no-template-curly-in-string: off */
const addSnippets: { name: string; content: string }[] = [
  { name: "${}", content: "${${0}}" },
  {
    name: "this.children",
    content: "this.children.${1:sheet_name}.${2:node_name}",
  },
  { name: "this.columns", content: "this.columns" },
  { name: "this.data", content: "this.data.${1:column_name}" },
  { name: "this.deleteLine", content: "this.deleteLine" },
  { name: "this.get", content: "this.get(${1:key})" },
  {
    name: "this.indent",
    content:
      "this.indent(${1:num_indent}, ${2:source}, ${3:indent_first_line})",
  },
  { name: "this.name", content: "this.name" },
  { name: "this.noNewLine", content: "this.noNewLine" },
  { name: "this.parent", content: "this.parent" },
  { name: "this.setIndent", content: "this.setIndent(${1:num_space})" },
  { name: "this.siblings", content: "this.siblings" },
  {
    name: "this.source",
    content: `this.source(\`
	$0
\`);`,
  },
  {
    name: "this.write",
    content: 'this.write("${1:./path/to/file.ext}", ${2:source})',
  },
];

Ace.config.loadModule("ace/ext/language_tools", function () {
  const snippetManager = Ace.require("ace/snippets").snippetManager;
  Ace.config.loadModule("ace/snippets/javascript", function (m) {
    if (m) {
      m.snippets = snippetManager.parseSnippetFile(m.snippetText);
      addSnippets.forEach((addSnippet) => m.snippets.push(addSnippet));
      snippetManager.register(m.snippets, m.scope);
    }
  });
});

@Component
export default class CodeComponent extends BaseComponent {
  beforeSheetName: string = "";
  beforeCode: string = "";
  changeTimer: any = null;
  editor: Ace.Ace.Editor | null = null;

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
    this.editor = Ace.edit(container, {
      theme: "ace/theme/chrome",
      mode: "ace/mode/javascript",
      tabSize: 2,
      enableAutoIndent: true,
    });
    this.editor.setOptions({
      enableBasicAutocompletion: true,
      enableSnippets: true,
      enableLiveAutocompletion: true,
    });
    // this.editor.$blockScrolling = Infinity;
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
