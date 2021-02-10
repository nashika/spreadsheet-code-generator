import _ from "lodash";

import RootNodeBase from "../base/root";

export default class RootNode extends RootNodeBase {
  main(): void {
    this.setIndent(2);
    _(this.children.model).each((model) => model.main());
    this.write("./generated/test.txt", "test");
    console.log(this.test());
  }

  test() {
    return "TEST";
  }
}
