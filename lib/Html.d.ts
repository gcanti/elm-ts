import { Observable } from 'rxjs/Observable';
import { Cmd } from './Cmd';
import { Sub } from './Sub';
import * as platform from './Platform';
export declare type Html<dom, msg> = (dispatch: platform.Dispatch<msg>) => dom;
export interface Renderer<dom> {
    render(dom: dom): void;
}
export declare function map<dom, a, msg>(f: (a: a) => msg, ha: Html<dom, a>): Html<dom, msg>;
export interface Program<model, msg, dom> extends platform.Program<model, msg> {
    html$: Observable<Html<dom, msg>>;
}
export declare function program<model, msg, dom>(init: [model, Cmd<msg>], update: (msg: msg, model: model) => [model, Cmd<msg>], view: (model: model) => Html<dom, msg>, subscriptions?: (model: model) => Sub<msg>): Program<model, msg, dom>;
export declare function programWithFlags<flags, model, msg, dom>(init: (flags: flags) => [model, Cmd<msg>], update: (msg: msg, model: model) => [model, Cmd<msg>], view: (model: model) => Html<dom, msg>, subscriptions?: (model: model) => Sub<msg>): (flags: flags) => Program<model, msg, dom>;
export declare function run<model, msg, dom>(program: Program<model, msg, dom>, renderer: Renderer<dom>): Observable<model>;
