import RootGeneratorNode from "../code/root";
import ModelNode from "../code/model";

type TRootGeneratorNodeChildren = {
  model: { [nodeName: string]: ModelNode};
}

export default class RootGeneratorNodeGenerated extends scg.GeneratorNode {

  readonly parent: null;
  readonly siblings: { [nodeName: string]: RootGeneratorNode };
  readonly children: TRootGeneratorNodeChildren;

}
