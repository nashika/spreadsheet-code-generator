export class Category {

  id;
  name;
  created;
  modified;

  params = {
    "id": {
      "model": "Category",
      "field": "id",
      "label": "ID",
      "type": "number",
      "width": 40,
      "display": {
        "list": true,
        "view": true,
        "edit": false
      }
    },
    "name": {
      "model": "Category",
      "field": "name",
      "label": "Name",
      "type": "string"
    },
    "created": {
      "model": "Category",
      "field": "created",
      "label": "Created",
      "type": "datetime",
      "format": "YYYY/MM/DD",
      "width": 120,
      "display": {
        "list": false,
        "view": true,
        "edit": false
      }
    },
    "modified": {
      "model": "Category",
      "field": "modified",
      "label": "Updated",
      "type": "datetime",
      "format": "YYYY/MM/DD",
      "width": 120,
      "display": {
        "list": false,
        "view": true,
        "edit": false
      }
    }
  }

}
