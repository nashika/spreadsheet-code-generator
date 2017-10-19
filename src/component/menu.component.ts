import Component from "vue-class-component";

import BaseComponent from "./base-component";
import {container} from "../inversify.config";
import {GeneratorService} from "../service/generator.service";

@Component({})
export default class MenuComponent extends BaseComponent {

  generatorService: GeneratorService = container.get(GeneratorService);

  generate() {
    this.generatorService.generate();
  }

}
