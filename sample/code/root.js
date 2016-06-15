module.exports = ($) => { return {

  main: () => {
    let results = $.generateChildren("model");
    return [{
      path: "./generated/test.txt",
      data: "test",
    }].concat(results);
  },

}};
