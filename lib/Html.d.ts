import { Observable } from 'rxjs/Observable';
import { Sub } from './Sub';
import { Program as HeadlessProgram, Component as HeadlessComponent, Dispatch } from './Platform';
export declare type Html<dom, msg> = (dispatch: Dispatch<msg>) => dom;
export interface Renderer<dom> {
    render(dom: dom): void;
}
export declare function map<dom, a, msg>(f: (a: a) => msg, ha: Html<dom, a>): Html<dom, msg>;
export interface Program<model, msg, dom> extends HeadlessProgram<model, msg> {
    html$: Observable<Html<dom, msg>>;
}
export interface Component<flags, model, msg, dom> extends HeadlessComponent<flags, model, msg> {
    view: (model: model) => Html<dom, msg>;
}
export declare function programWithFlags<flags, model, msg, dom>(component: Component<flags, model, msg, dom>, flags: flags, subscriptions?: (model: model) => Sub<msg>): Program<model, msg, dom>;
export declare function run<model, msg, dom>(program: Program<model, msg, dom>, renderer: Renderer<dom>): Observable<model>;
