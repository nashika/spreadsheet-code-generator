import { setBaseStoreMyService } from "~/src/store/base";
import { setBaseServiceMyService } from "~/src/service/base.service";
import { GeneratorService } from "~/src/service/generator.service";

export interface IMyService {
  generator: GeneratorService;
}

export const myService: IMyService = {
  generator: new GeneratorService(),
};
setBaseStoreMyService(myService);
setBaseServiceMyService(myService);
