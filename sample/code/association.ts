import { AssociationNodeBase } from "../base/association";

export class AssociationNode extends AssociationNodeBase {
  main(): string {
    return this.source(`
this.setAssociation("${this.data.association}", {
  type: "${this.data.type}",
  model: "${this.data.target}",
  foreignKey: "${this.data.foreignKey}",
});
`);
  }
}
