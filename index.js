require("ts-node").register({
  compilerOptions: {
    module: "commonjs",
  },
});
console.log("Compiling typescript.");
require("./src/main");
