module.exports = class ModelGeneratorNode extends scg.GeneratorNode {

  main() {
    let source = this.source(`
export class ${this.data.model} {

${this.indent(1, _(this.children.field).map(field => field.definition()).join(""))}

  params = ${this.indent(1, JSON.stringify(_(this.children.field).mapValues(field => field.toObject()), null, 2), false)}
  
  initializeAssociation() {
${this.indent(2, _(this.children.association).map(association => association.main()).join(""))}
  }
  
}
`);
    this.write(`./generated/model/${this.data.model.toLowerCase()}.js`, source);
  }

}
