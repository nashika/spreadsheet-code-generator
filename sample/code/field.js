module.exports = {

  definition: function() {
    return this.source(`
${this.data.field}:${this.data.type};
`);
  },

};
