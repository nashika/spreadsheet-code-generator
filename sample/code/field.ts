import { FieldNodeBase } from "../base/field";

export class FieldNode extends FieldNodeBase {
  definition(): string {
    return this.source(`
${this.data.field};
`);
  }
};
