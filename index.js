/* TODO: restore
import gn = require("./src/generator/generator-node");

declare global {
  export namespace scg {
    export import GeneratorNode = gn.GeneratorNode;
  }
}
 */

require("ts-node").register({
  compilerOptions: {
    module: "commonjs",
  },
});
require("./src/main");
