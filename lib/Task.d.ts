import 'rxjs/add/observable/of';
import { Cmd } from './Cmd';
import { Task } from 'fp-ts/lib/Task';
import { Either } from 'fp-ts/lib/Either';
export { Task };
export declare function perform<a, msg>(f: (a: a) => msg, task: Task<a>): Cmd<msg>;
export declare function sequence<a>(tasks: Array<Task<a>>): Task<Array<a>>;
export declare function attempt<e, a, msg>(f: (e: Either<e, a>) => msg, task: Task<Either<e, a>>): Cmd<msg>;
