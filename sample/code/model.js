module.exports = {

  main: function () {
    let source = this.source(`
export class ${this.this.model} {
}
`);
    this.write(`./generated/${this.this.model}.txt`, source);
  },

};
