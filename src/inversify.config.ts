import {Container} from "inversify";

import {CodeService} from "./service/code.service";
import {ColumnService} from "./service/column.service";
import {ConfigService} from "./service/config.service";
import {DataService} from "./service/data.service";
import {GeneratorService} from "./service/generator.service";
import {HubService} from "./service/hub.service";
import {MenuService} from "./service/menu.service";
import {SheetService} from "./service/sheet.service";
import {TsCodeService} from "./service/ts-code.service";

export const container = new Container();

container.bind<CodeService>(CodeService).toSelf().inSingletonScope();
container.bind<ColumnService>(ColumnService).toSelf().inSingletonScope();
container.bind<ConfigService>(ConfigService).toSelf().inSingletonScope();
container.bind<DataService>(DataService).toSelf().inSingletonScope();
container.bind<GeneratorService>(GeneratorService).toSelf().inSingletonScope();
container.bind<HubService>(HubService).toSelf().inSingletonScope();
container.bind<MenuService>(MenuService).toSelf().inSingletonScope();
container.bind<SheetService>(SheetService).toSelf().inSingletonScope();
container.bind<TsCodeService>(TsCodeService).toSelf().inSingletonScope();
