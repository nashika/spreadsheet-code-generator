module.exports = ($) => { return {

  main: () => {
    //$.callChildren("model");
    console.log(this.test());
    $.write("./generated/test.txt", "test");
  },
  
  test: () => {
    return "TEST";
  },

}};
