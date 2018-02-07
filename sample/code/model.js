module.exports = class ModelGeneratorNode extends scg.GeneratorNode {

  main() {
    let source = this.source(`
export class ${this.data.model} {

${this.indent(1, this.callChildren("field", "definition", "string"))}

  params = ${this.indent(1, JSON.stringify(this.callChildren("field", "toObject", "object"), null, 2), false)}
  
  initializeAssociation() {
${this.indent(2, this.callChildren("association", "main", "string"))}
  }
  
}
`);
    this.write(`./generated/model/${this.data.model.toLowerCase()}.js`, source);
  }

}
