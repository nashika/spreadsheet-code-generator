module.exports = {

  main: function () {
    let source = this.source(`
export class ${this.data.model} {

${this.indent(1, this.callChildren("field", "definition", "string"))}

  params = ${this.indent(1, JSON.stringify(this.callChildren("field", "data", "object"), null, 2), false)}
  
  initializeAssociation() {
${this.indent(2, this.callChildren("association", "main", "string"))}
  }
  
}
`);
    this.write(`./generated/model/${this.data.model.toLowerCase()}.js`, source);
  },

};
