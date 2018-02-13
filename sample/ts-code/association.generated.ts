import AssociationGeneratorNode from "../code/association";
import ModelGeneratorNode from "../code/model";

export interface IAssociationGeneratorNodeData {
  model: string;
  association: string;
  type: string;
  target: string;
  foreignKey: string;
}

type TAssociationGeneratorNodeChildren = {
}

export default class AssociationGeneratorNodeGenerated extends scg.GeneratorNode {

  readonly data: IAssociationGeneratorNodeData;
  readonly parent: ModelGeneratorNode;
  readonly siblings: { [nodeName: string]: AssociationGeneratorNode };
  readonly children: TAssociationGeneratorNodeChildren;
  
  toObject(): IAssociationGeneratorNodeData {
    return <any>super.toObject();
  }

}
