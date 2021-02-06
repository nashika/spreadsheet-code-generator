export class Tag {

  id;
  name;
  created;
  modified;

  params = {
    "id": {
      "model": "Tag",
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
      "model": "Tag",
      "field": "name",
      "label": "Name",
      "type": "string"
    },
    "created": {
      "model": "Tag",
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
      "model": "Tag",
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

  initializeAssociation() {

  }

}
