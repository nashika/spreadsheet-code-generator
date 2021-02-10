import RootNode from "../code/root";
import ModelNode from "../code/model";
import NodeBase from "./base";

type TRootNodeChildren = {
  model: { [nodeName: string]: ModelNode };
};

export interface IRootNodeData {}

export interface IRootNodeExport {}

export default class RootNodeBase extends NodeBase {
  readonly data!: IRootNodeData;
  readonly parent!: null;
  readonly siblings!: { [nodeName: string]: RootNode };
  readonly children!: TRootNodeChildren;

  toObject(): IRootNodeExport {
    return <any>super.toObject();
  }
}
