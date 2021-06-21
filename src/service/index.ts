import { setBaseStoreMyService } from "~/src/store/base";
import { setBaseServiceMyService } from "~/src/service/base.service";
import { GeneratorService } from "~/src/service/generator.service";
import { RegisterService } from "~/src/service/register.service";

export interface IMyService {
  generator: GeneratorService;
  register: RegisterService;
}

export const myService: IMyService = {
  generator: new GeneratorService(),
  register: new RegisterService(),
};
setBaseStoreMyService(myService);
setBaseServiceMyService(myService);
