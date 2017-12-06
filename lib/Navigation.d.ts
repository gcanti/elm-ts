import 'rxjs/add/observable/of';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/skip';
import 'rxjs/add/operator/take';
import { Cmd } from './Cmd';
import { Sub } from './Sub';
import { Html, Program } from './Html';
import { Location as HistoryLocation } from 'history';
export declare type Location = HistoryLocation;
export declare function push<msg>(url: string): Cmd<msg>;
export interface Component<flags, model, msg, dom> {
    init: (flags: flags, location: Location) => [model, Cmd<msg>];
    update: (msg: msg, model: model) => [model, Cmd<msg>];
    view: (model: model) => Html<dom, msg>;
}
export declare function programWithFlags<flags, model, msg, dom>(locationToMessage: (location: Location) => msg, component: Component<flags, model, msg, dom>, flags: flags, subscriptions?: (model: model) => Sub<msg>): Program<model, msg, dom>;
