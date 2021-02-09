import { NodeBase } from "./base";
import { AssociationNode } from "../code/association";
import { ModelNode } from "../code/model";

type TAssociationNodeChildren = {
}

export interface IAssociationNodeData {
  model: string;
  association: string;
  type: "belongsTo" | "hasMany" | "hasOne" | "belongsToMany";
  target: string;
  foreignKey: string;
}

export interface IAssociationNodeExport {
  model: string;
  association: string;
  type: "belongsTo" | "hasMany" | "hasOne" | "belongsToMany";
  target: string;
  foreignKey: string;
}

export class AssociationNodeBase extends NodeBase {
  readonly data!: IAssociationNodeData;
  readonly parent!: ModelNode;
  readonly siblings!: { [nodeName: string]: AssociationNode };
  readonly children!: TAssociationNodeChildren;

  toObject(): IAssociationNodeExport {
    return <any>super.toObject();
  }
}
