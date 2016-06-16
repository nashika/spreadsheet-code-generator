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
      "width": 40
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
      "width": 120
    },
    "modified": {
      "model": "Author",
      "field": "modified",
      "label": "Updated",
      "type": "datetime",
      "format": "YYYY/MM/DD",
      "width": 120
    }
  }

}
