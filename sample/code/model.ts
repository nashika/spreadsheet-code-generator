import _ from "lodash";

import ModelNodeBase from "../base/model";

export default class ModelNode extends ModelNodeBase {
  main(): void {
    const source = this.source(`
export class ${this.data.model} {
${this.indent(
  1,
  _(this.children.field)
    .map((field) => field.definition())
    .join("")
)}

  params = {
    name: "${this.data.model}",
    label: "${this.data.label}",
    view: "${this.data.view ?? this.deleteLine}",
    fields: ${this.indent(
      2,
      JSON.stringify(
        _(this.children.field).mapValues((field) => field.toObject()),
        null,
        2
      ),
      true
    )},
    association: ${this.indent(
      2,
      JSON.stringify(
        _(this.children.association).mapValues((association) => association.toObject()),
        null,
        2
      ),
      true
    )},
  };
}
`);
    this.write(`./generated/model/${this.data.model.toLowerCase()}.ts`, source);
  }
}
