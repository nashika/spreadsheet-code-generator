export function templateLoader(componentName:string):string {
  return require(`../template/${componentName}-component.jade`);
}
