import _ from "lodash";

import FieldNodeBase from "../base/field";

export default class FieldNode extends FieldNodeBase {
  definition(): string {
    return this.source(`
${_.camelCase(this.data.field)}!: ${this.tsType()};
`);
  }

  tsType(): string {
    switch (this.data.type) {
      case "number":
      case "string":
      case "boolean":
        return this.data.type;
      case "datetime":
        return "Date";
      case "division":
        return "number";
      case "belongsTo":
        return "Object";
    }
  }
}
