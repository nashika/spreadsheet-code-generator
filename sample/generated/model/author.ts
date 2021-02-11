export class Author {
  id!: number;
  username!: string;
  password!: string;
  name!: string;
  nickname!: string;
  admin!: boolean;
  created!: Date;
  modified!: Date;

  params = {
    name: "Author",
    label: "Author",
    fields: {
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
    },
    association: {
      "articles": {
        "model": "Author",
        "association": "articles",
        "type": "hasMany",
        "target": "Article",
        "foreignKey": "author_id"
      },
      "comments": {
        "model": "Author",
        "association": "comments",
        "type": "hasMany",
        "target": "Comment",
        "foreignKey": "author_id"
      }
    },
  };
}
