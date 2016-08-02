export function templateLoader(componentName:string):string {
  return require(`./${componentName}-component.jade`);
}
