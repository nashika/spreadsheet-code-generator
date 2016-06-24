module.exports = {

  main: function() {
    this.setIndent(2);
    this.callChildren("model");
    this.write("./generated/test.txt", "test");
    console.log(this.call("test"));
  },

  test: function() {
    return "TEST";
  },

};
