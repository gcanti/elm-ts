import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/mergeAll';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/startWith';
import { Cmd } from './Cmd';
import { Sub } from './Sub';
export declare type Dispatch<msg> = (msg: msg) => void;
export interface Program<model, msg> {
    dispatch: Dispatch<msg>;
    cmd$: Cmd<msg>;
    sub$: Sub<msg>;
    model$: Observable<model>;
}
export declare function program<model, msg>(init: [model, Cmd<msg>], update: (msg: msg, model: model) => [model, Cmd<msg>], subscriptions?: (model: model) => Sub<msg>): Program<model, msg>;
export declare function programWithFlags<flags, model, msg>(init: (flags: flags) => [model, Cmd<msg>], update: (msg: msg, model: model) => [model, Cmd<msg>], subscriptions?: (model: model) => Sub<msg>): (flags: flags) => Program<model, msg>;
export declare function run<model, msg>(program: Program<model, msg>): Observable<model>;
