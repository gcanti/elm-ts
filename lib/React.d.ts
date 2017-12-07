/// <reference types="react" />
import { Observable } from 'rxjs/Observable';
import { ReactElement } from 'react';
import { Cmd } from './Cmd';
import { Sub } from './Sub';
import * as html from './Html';
export declare type dom = ReactElement<any>;
export declare type Html<msg> = html.Html<dom, msg>;
export declare function map<a, msg>(f: (a: a) => msg, ha: Html<a>): Html<msg>;
export interface Program<model, msg> extends html.Program<model, msg, dom> {
}
export declare function program<model, msg>(init: [model, Cmd<msg>], update: (msg: msg, model: model) => [model, Cmd<msg>], view: (model: model) => html.Html<dom, msg>, subscriptions?: (model: model) => Sub<msg>): Program<model, msg>;
export declare function programWithFlags<flags, model, msg>(init: (flags: flags) => [model, Cmd<msg>], update: (msg: msg, model: model) => [model, Cmd<msg>], view: (model: model) => html.Html<dom, msg>, subscriptions?: (model: model) => Sub<msg>): (flags: flags) => Program<model, msg>;
export declare function run<model, msg>(program: Program<model, msg>, renderer: html.Renderer<dom>): Observable<model>;
export declare function render(node: HTMLElement): html.Renderer<dom>;
