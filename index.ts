import {GeneratorNode as GeneratorNode_} from "./src/generator/generator-node";

declare global {
  export namespace scg {
    export var GeneratorNode: typeof GeneratorNode_;
  }
}

import "./src/main";
