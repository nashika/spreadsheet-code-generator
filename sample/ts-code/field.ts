import FieldGeneratorNode from "../code/field";
import ModelGeneratorNode from "../code/model";

type TFieldGeneratorNodeChildren = {
}

export default class FieldGeneratorNodeGenerated extends scg.GeneratorNode {

  readonly parent: ModelGeneratorNode;
  readonly siblings: { [nodeName: string]: FieldGeneratorNode };
  readonly children: TFieldGeneratorNodeChildren;

}
