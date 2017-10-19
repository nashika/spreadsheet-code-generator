<template lang="pug">
  .menu-component
    b-card(no-body)
      .h6(slot="header") #[i.fa.fa-cube] Menu
      b-list-group(flush)
        b-list-group-item
          b-form-radio-group(buttons, button-variant="outline-primary", v-model="$hub.data",
          :options="[{text: 'Data', value: 'data'}, {text: 'Code', value: 'code'}]")
        b-list-group-item
          b-button(variant="primary", block, @click="generate") #[i.fa.fa-industry] Generate
</template>

<script lang="ts" src="./menu.component.ts"></script>
