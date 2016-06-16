module.exports = {

  main: function () {
    let source = this.source(`
export class ${this.data.model} {

${this.indent(1, this.callChildren("field", "definition"))}

}
`);
    this.write(`./generated/${this.data.model}.ts`, source);
  },

};
