/// <reference types="react" />
import { Observable } from 'rxjs/Observable';
import { ReactElement } from 'react';
import { Sub } from './Sub';
import * as html from './Html';
export declare type Dom = ReactElement<any>;
export declare type Html<msg> = html.Html<Dom, msg>;
export declare function map<a, msg>(f: (a: a) => msg, ha: Html<a>): Html<msg>;
export interface Program<model, msg> extends html.Program<model, msg, Dom> {
}
export interface Component<flags, model, msg> extends html.Component<flags, model, msg, Dom> {
}
export declare function programWithFlags<flags, model, msg>(component: Component<flags, model, msg>, flags: flags, subscriptions?: (model: model) => Sub<msg>): Program<model, msg>;
export declare function run<model, msg>(program: Program<model, msg>, renderer: html.Renderer<Dom>): Observable<model>;
export declare function render(node: HTMLElement): html.Renderer<Dom>;
