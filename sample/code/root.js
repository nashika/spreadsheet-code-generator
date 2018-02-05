class RootGeneratorNode extends GeneratorNode {

  main() {
    this.setIndent(2);
    this.callChildren("model");
    this.write("./generated/test.txt", "test");
    console.log(this.call("test"));
  }

  test() {
    return "TEST";
  }

}

module.exports = RootGeneratorNode;
