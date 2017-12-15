"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Observable_1 = require("rxjs/Observable");
require("rxjs/add/observable/of");
require("rxjs/add/operator/map");
require("rxjs/add/operator/skip");
require("rxjs/add/operator/take");
var Subject_1 = require("rxjs/Subject");
var Task_1 = require("fp-ts/lib/Task");
var Option_1 = require("fp-ts/lib/Option");
var Sub_1 = require("./Sub");
var html = require("./Html");
var createHashHistory_1 = require("history/createHashHistory");
var history = createHashHistory_1.default();
var location$ = new Subject_1.Subject();
function getLocation() {
    return history.location;
}
history.listen(function (location) {
    location$.next(location);
});
function push(url) {
    return Observable_1.Observable.of(new Task_1.Task(function () {
        history.push(url);
        return Promise.resolve(Option_1.none);
    }));
}
exports.push = push;
function program(locationToMessage, init, update, view, subscriptions) {
    if (subscriptions === void 0) { subscriptions = function () { return Sub_1.none; }; }
    var onChangeLocation$ = location$.map(function (location) { return locationToMessage(location); });
    var subs = function (model) { return Sub_1.batch([subscriptions(model), onChangeLocation$]); };
    return html.program(init(getLocation()), update, view, subs);
}
exports.program = program;
function programWithFlags(locationToMessage, init, update, view, subscriptions) {
    if (subscriptions === void 0) { subscriptions = function () { return Sub_1.none; }; }
    return function (flags) { return program(locationToMessage, init(flags), update, view); };
}
exports.programWithFlags = programWithFlags;
//# sourceMappingURL=Navigation.js.map