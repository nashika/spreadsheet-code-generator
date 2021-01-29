module.exports = class RootGeneratorNode extends scg.GeneratorNode {

  main() {
    this.setIndent(2);
    _(this.children.model).each(model => model.main());
    this.write("./generated/test.txt", "test");
    console.log(this.test());
  }

  test() {
    return "TEST";
  }

}
