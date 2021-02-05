import { setBaseStoreMyService } from "~/src/store/base";
import { setBaseServiceMyService } from "~/src/service/base.service";

export interface IMyService {}

export const myService: IMyService = {};
setBaseStoreMyService(myService);
setBaseServiceMyService(myService);
