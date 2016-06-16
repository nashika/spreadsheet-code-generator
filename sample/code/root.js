module.exports = {

  main: function() {
    this.generateChildren("model");
    //console.log(this.test());
    this.write("./generated/test.txt", "test");
  },
  
  test: function() {
    return "TEST";
  },

};
