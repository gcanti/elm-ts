"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Observable_1 = require("rxjs/Observable");
require("rxjs/add/observable/interval");
require("rxjs/add/operator/map");
var Task_1 = require("./Task");
function now() {
    return new Task_1.Task(function () { return Promise.resolve(new Date().getTime()); });
}
exports.now = now;
function every(time, f) {
    return Observable_1.Observable.interval(time).map(function () { return f(new Date().getTime()); });
}
exports.every = every;
//# sourceMappingURL=Time.js.map