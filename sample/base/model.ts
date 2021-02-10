import ModelNode from "../code/model";
import RootNode from "../code/root";
import AssociationNode from "../code/association";
import FieldNode from "../code/field";
import NodeBase from "./base";

type TModelNodeChildren = {
  association: { [nodeName: string]: AssociationNode };
  field: { [nodeName: string]: FieldNode };
};

export interface IModelNodeData {
  model: string;
  label: string;
  view?: string;
}

export interface IModelNodeExport {
  model: string;
  label: string;
  view?: string;
}

export default class ModelNodeBase extends NodeBase {
  readonly data!: IModelNodeData;
  readonly parent!: RootNode;
  readonly siblings!: { [nodeName: string]: ModelNode };
  readonly children!: TModelNodeChildren;

  toObject(): IModelNodeExport {
    return <any>super.toObject();
  }
}
