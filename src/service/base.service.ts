import { myStore } from "~/src/store";

export abstract class BaseService {
  protected $myStore = myStore;
}
