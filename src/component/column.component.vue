<template lang="pug">
  .column-component
    b-card(no-body)
      h6(slot="header") #[i.fa.fa-columns] Manage Column
      b-list-group
        b-list-group-item
          b-button(variant="success", block, @click="add") #[i.fa.fa-plus] Add
        b-list-group-item(v-if="column")
          b-form(@submit="modify")
            b-form-group(label="Header")
              b-form-input(type="text", v-model="column.header", required)
            b-form-group(label="Data")
              b-form-input(type="text", v-model="column.data", required)
            b-form-group(label="Type")
              b-form-select(v-model="column.type")
                option(value="text") Text
                option(value="select") Select
                option(value="numeric") Numeric
            template(v-if="column.type == 'text' || column.type == 'select'")
              b-form-group(label="JSON")
                b-form-checkbox(v-model="column.json") as JSON
            template(v-if="column.type == 'select'")
              b-form-group(label="Options")
                b-form-textarea(:rows="5", v-model="optionsText", lazy)
            b-form-group(label="Width")
              b-form-input(type="number", v-model="column.width", required)
            b-button(type="submit", variant="primary", block) #[i.fa.fa-save] Modify
        b-list-group-item(v-if="column")
          .row
            .col-6
              b-button(variant="warning", block, @click="move(false)", :disabled="columnIndex == 0") #[i.fa.fa-arrow-left] Left
            .col-6
              b-button(variant="warning", block, @click="move(true)", :disabled="columnIndex == $hub.currentSheet.columns.length - 1") Right #[i.fa.fa-arrow-right]
        b-list-group-item(v-if="column")
          .row
            .col-12
              b-button(variant="danger", block, @click="remove()") #[i.fa.fa-trash] Delete
        b-list-group-item(v-if="column")
          .row
            .col-12
              b-button(variant="primary", block, @click="freeze()", :class="{'active': columnIndex + 1 == $hub.currentSheet.freezeColumn}") #[i.fa.fa-map-pin] Freeze Column
</template>

<script lang="ts" src="./column.component.ts"></script>
