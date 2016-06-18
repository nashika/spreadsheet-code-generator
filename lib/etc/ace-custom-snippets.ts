let snippetText = require("./ace-custom-snippets.snippets");
let snippetManager = ace.require("ace/snippets").snippetManager;
let config = ace.require("ace/config");
config.loadModule("ace/snippets/javascript", function (m:any) {
  if (m) {
    //snippetManager.files.php = m;
    m.snippets = snippetManager.parseSnippetFile(m.snippetText + snippetText);
    /*m.snippets.push({
      content: "class ${1:Example}{\n\t${2:// Class}\n}",
      name: "new class",
      tabTrigger: "cls"
    });
    m.snippets.push({
      content: "public function ${1:world}(){\n\t${2:// Function}\n}",
      name: "public function",
      tabTrigger: "pubfunc"
    });
    m.snippets.push({
      content: "private function ${1:world}(){\n\t${2:// Function}\n}",
      name: "private function",
      tabTrigger: "privfunc"
    });
    m.snippets.push({
      content: "\\$player = \\$${1:event}->getPlayer();\n",
      name: "getPlayer",
      tabTrigger: "getPlayer"
    });*/
    snippetManager.register(m.snippets, m.scope);
  }
});
