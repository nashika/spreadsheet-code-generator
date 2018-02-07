module.exports = class RootGeneratorNode extends scg.GeneratorNode {

  main() {
    this.setIndent(2);
    this.callChildren("model");
    this.write("./generated/test.txt", "test");
    console.log(this.test());
  }

  test() {
    return "TEST";
  }

}
