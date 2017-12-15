import 'rxjs/add/observable/interval';
import 'rxjs/add/operator/map';
import { Task } from 'fp-ts/lib/Task';
import { Sub } from './Sub';
export declare type Time = number;
export declare function now(): Task<Time>;
export declare function every<msg>(time: Time, f: (time: Time) => msg): Sub<msg>;
