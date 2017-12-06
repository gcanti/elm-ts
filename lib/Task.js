"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Observable_1 = require("rxjs/Observable");
require("rxjs/add/observable/of");
var Task_1 = require("fp-ts/lib/Task");
exports.Task = Task_1.Task;
var task = require("fp-ts/lib/Task");
var Option_1 = require("fp-ts/lib/Option");
var Traversable_1 = require("fp-ts/lib/Traversable");
var array = require("fp-ts/lib/Array");
function perform(f, task) {
    return Observable_1.Observable.of(task.map(function (a) { return Option_1.some(f(a)); }));
}
exports.perform = perform;
function sequence(tasks) {
    return Traversable_1.sequence(task, array)(tasks);
}
exports.sequence = sequence;
function attempt(f, task) {
    return perform(f, task);
}
exports.attempt = attempt;
//# sourceMappingURL=Task.js.map