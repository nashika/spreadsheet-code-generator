module.exports = class FieldGeneratorNode extends GeneratorNode {

  definition() {
    return this.source(`
${this.data.field};
`);
  }

}
