import gn = require("./src/generator/generator-node");

declare global {
  export namespace scg {
    export import GeneratorNode = gn.GeneratorNode;
  }
}
