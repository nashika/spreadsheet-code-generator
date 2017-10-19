<template lang="pug">
  div.panel.panel-default
    div.panel-heading #[i.fa.fa-cube] Menu
    ul.list-group
      li.list-group-item
        button-group.btn-group-justified(:value.sync="$hub.mode", type="default")
          radio(value="data") #[i.fa.fa-database] Data
          radio(value="code") #[i.fa.fa-file-text-o] Code
      li.list-group-item
        button.btn.btn-block.btn-primary(@click="generate") #[i.fa.fa-industry] Generate
</template>

<script lang="ts" src="./menu.component.ts"></script>
