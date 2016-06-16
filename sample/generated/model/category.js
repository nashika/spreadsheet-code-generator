export class Category {

  id;
  name;
  created;
  modified;

  params = {
    "id": {
      "model": "Category",
      "field": "id",
      "label": null,
      "type": null,
      "width": null
    },
    "name": {
      "model": "Category",
      "field": "name",
      "label": "Name",
      "type": "string",
      "width": null,
      "extends": ""
    },
    "created": {
      "model": "Category",
      "field": "created",
      "label": null,
      "type": null,
      "width": null,
      "format": "YYYY/MM/DD"
    },
    "modified": {
      "model": "Category",
      "field": "modified",
      "label": null,
      "type": null,
      "width": null,
      "format": "YYYY/MM/DD"
    }
  }

}
