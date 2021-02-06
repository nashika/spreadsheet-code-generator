module.exports = class FieldGeneratorNode {

  definition() {
    return this.source(`
${this.data.field};
`);
  }

}
