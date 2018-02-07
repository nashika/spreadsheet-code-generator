module.exports = class FieldGeneratorNode extends scg.GeneratorNode {

  definition() {
    return this.source(`
${this.data.field};
`);
  }

}
