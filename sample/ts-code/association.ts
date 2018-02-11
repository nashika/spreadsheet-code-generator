import AssociationGeneratorNode from "../code/association";
import ModelGeneratorNode from "../code/model";

type TAssociationGeneratorNodeChildren = {
}

export default class AssociationGeneratorNodeGenerated extends scg.GeneratorNode {

  readonly parent: ModelGeneratorNode;
  readonly siblings: { [nodeName: string]: AssociationGeneratorNode };
  readonly children: TAssociationGeneratorNodeChildren;

}
