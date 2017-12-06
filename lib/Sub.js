"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Observable_1 = require("rxjs/Observable");
require("rxjs/add/observable/merge");
require("rxjs/add/observable/empty");
require("rxjs/add/operator/map");
function map(f, sub) {
    return sub.map(f);
}
exports.map = map;
function batch(arr) {
    return Observable_1.Observable.merge.apply(Observable_1.Observable, arr);
}
exports.batch = batch;
exports.none = Observable_1.Observable.empty();
//# sourceMappingURL=Sub.js.map