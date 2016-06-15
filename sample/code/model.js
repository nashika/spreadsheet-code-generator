module.exports = ($) => { return {

  main: () => {
    let source = $.source(`
export class ${$.this["model"]} {
}
`);
    return [{
      path: `./generated/${$.this["model"]}.txt`,
      data: source,
    }];
  },

}};
