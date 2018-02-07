module.exports = class AssociationGeneratorNode extends scg.GeneratorNode {

  main() {
    return this.source(`
this.setAssociation("${this.data.association}", {
  type: "${this.data.type}",
  model: "${this.data.target}",
  foreignKey: "${this.data.foreignKey}",
});
`);
  }

}
