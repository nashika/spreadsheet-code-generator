"use strict";
var fs = require("fs");
var path = require("path");
var Application = (function () {
    function Application() {
        var _this = this;
        this.changeDefinition = function (event) {
            if (_this.hot) {
                _this.saveData();
                _this.hot.destroy();
            }
            _this.currentDefinitionName = event.target.getAttribute("definition");
            _this.currentDefinition = require(path.join(_this.definitionDir, _this.currentDefinitionName + ".json"));
            var adata = [
                ["", "Kia", "Nissan", "Toyota", "Honda"],
                ["2008", 10, 11, 12, 13],
                ["2009", 20, 11, 14, 13],
                ["2010", 30, 15, 12, 13]
            ];
            var data = _this.loadData();
            _this.hot = new Handsontable(_this.container, {
                data: data,
                columns: _this.currentDefinition.columns,
                rowHeaders: true,
                colHeaders: _this.currentDefinition.colHeaders,
                contextMenu: true,
                currentRowClassName: 'currentRow',
                currentColClassName: 'currentCol',
            });
        };
        this.loadData = function () {
            var filePath = path.join(_this.dataDir, _this.currentDefinitionName + ".json");
            if (fs.existsSync(filePath)) {
                return JSON.parse(fs.readFileSync(filePath).toString());
            }
            else {
                return [];
            }
        };
        this.saveData = function () {
            var records = _this.hot.getData();
            var results = [];
            for (var _i = 0, records_1 = records; _i < records_1.length; _i++) {
                var record = records_1[_i];
                var result = {};
                for (var i = 0; i < _this.currentDefinition.columns.length; i++) {
                    var currentColumn = _this.currentDefinition.columns[i];
                    var currentCellData = record[i];
                    if (currentCellData !== null && currentCellData !== "") {
                        result[currentColumn.data] = currentCellData;
                    }
                }
                results.push(result);
            }
            fs.writeFileSync(path.join(_this.dataDir, _this.currentDefinitionName + ".json"), JSON.stringify(results, null, "  "));
        };
        this.container = document.getElementById('spreadsheet');
        this.storeDir = path.join(__dirname, "../sample");
        this.definitionDir = path.join(this.storeDir, "definition");
        this.dataDir = path.join(this.storeDir, "data");
        var definitionFiles = fs.readdirSync(this.definitionDir);
        this.definitionNames = [];
        for (var _i = 0, definitionFiles_1 = definitionFiles; _i < definitionFiles_1.length; _i++) {
            var definitionFile = definitionFiles_1[_i];
            this.definitionNames.push(definitionFile.replace(/\.json$/, ""));
        }
        for (var _a = 0, _b = this.definitionNames; _a < _b.length; _a++) {
            var definitionName = _b[_a];
            var dom = $("<li class=\"list-group-item\" definition=\"" + definitionName + "\">" + definitionName + "</li>");
            dom.on("click", this.changeDefinition);
            $("ul#explorer-list-group").append(dom);
        }
    }
    return Application;
}());
exports.Application = Application;
//# sourceMappingURL=application.js.map