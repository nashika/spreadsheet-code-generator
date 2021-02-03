import { Vue } from "nuxt-property-decorator";

import { myStore } from "~/src/store";
import { logger } from "~/src/logger";

export abstract class BaseService {
  protected $myStore = myStore;
  protected $logger = logger;
  $root!: Vue;
}
