import ModelGeneratorNode from "../code/model";
import RootGeneratorNode from "../code/root";
import AssociationNode from "../code/association";
import FieldNode from "../code/field";

type TModelGeneratorNodeChildren = {
  association: { [nodeName: string]: AssociationNode};
field: { [nodeName: string]: FieldNode};
}

export default class ModelGeneratorNodeGenerated extends scg.GeneratorNode {

  readonly parent: RootGeneratorNode;
  readonly siblings: { [nodeName: string]: ModelGeneratorNode };
  readonly children: TModelGeneratorNodeChildren;

}
