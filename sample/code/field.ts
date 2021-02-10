import FieldNodeBase from "../base/field";

export default class FieldNode extends FieldNodeBase {
  definition(): string {
    return this.source(`
${this.data.field};
`);
  }
}
