import { Vue } from "nuxt-property-decorator";
import _ from "lodash";
import "bootstrap-vue";

import { NuxtContext } from "~/src/types/nuxt";

export abstract class BaseComponent extends Vue {
  lodash = _;

  // インスタンスライフサイクルフックの定義
  async beforeCreate(): Promise<void> {}
  async created(): Promise<void> {}
  async beforeMount(): Promise<void> {}
  async mounted(): Promise<void> {}
  async beforeUpdate(): Promise<void> {}
  async updated(): Promise<void> {}
  async beforeDestroy(): Promise<void> {}
  async destroyed(): Promise<void> {}

  // nuxt独自の処理を定義
  async fetch(_context: NuxtContext): Promise<void> {}
  async asyncData(_context: NuxtContext): Promise<void> {}
}
