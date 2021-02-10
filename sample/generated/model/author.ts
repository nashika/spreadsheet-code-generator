export class Author {

  id;
  username;
  password;
  name;
  nickname;
  admin;
  created;
  modified;

  params = {
    "id": {
      "model": "Author",
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
    "username": {
      "model": "Author",
      "field": "username",
      "label": "Username",
      "type": "string"
    },
    "password": {
      "model": "Author",
      "field": "password",
      "label": "Password",
      "type": "string"
    },
    "name": {
      "model": "Author",
      "field": "name",
      "label": "Name",
      "type": "string"
    },
    "nickname": {
      "model": "Author",
      "field": "nickname",
      "label": "Nickname",
      "type": "string"
    },
    "admin": {
      "model": "Author",
      "field": "admin",
      "label": "Admin",
      "type": "boolean"
    },
    "created": {
      "model": "Author",
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
      "model": "Author",
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
    this.setAssociation("articles", {
      type: "hasMany",
      model: "Article",
      foreignKey: "author_id",
    });
    this.setAssociation("comments", {
      type: "hasMany",
      model: "Comment",
      foreignKey: "author_id",
    });
  }

}
