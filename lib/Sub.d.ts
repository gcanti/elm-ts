import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/merge';
import 'rxjs/add/observable/empty';
import 'rxjs/add/operator/map';
export declare type Sub<msg> = Observable<msg>;
export declare function map<a, msg>(f: (a: a) => msg, sub: Sub<a>): Sub<msg>;
export declare function batch<msg>(arr: Array<Sub<msg>>): Sub<msg>;
export declare const none: Sub<any>;
