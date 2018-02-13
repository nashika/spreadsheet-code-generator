import RootGeneratorNode from "../code/root";
import ModelNode from "../code/model";

export interface IRootGeneratorNodeData {

}

type TRootGeneratorNodeChildren = {
  model: { [nodeName: string]: ModelNode};
}

export default class RootGeneratorNodeGenerated extends scg.GeneratorNode {

  readonly data: IRootGeneratorNodeData;
  readonly parent: null;
  readonly siblings: { [nodeName: string]: RootGeneratorNode };
  readonly children: TRootGeneratorNodeChildren;
  
  toObject(): IRootGeneratorNodeData {
    return <any>super.toObject();
  }

}
