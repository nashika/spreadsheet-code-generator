import Component from "vue-class-component";

import BaseComponent from "./base-component";
import {container} from "../inversify.config";
import {GeneratorService} from "../service/generator.service";

@Component({
  props: {
    mode: String,
  }
})
export default class MenuComponent extends BaseComponent {

  generatorService: GeneratorService = container.get(GeneratorService);

  mode: string;

  generate() {
    this.generatorService.generate();
  }

}
