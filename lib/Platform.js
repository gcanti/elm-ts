"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var BehaviorSubject_1 = require("rxjs/BehaviorSubject");
require("rxjs/add/operator/switchMap");
require("rxjs/add/operator/mergeAll");
require("rxjs/add/operator/distinctUntilChanged");
require("rxjs/add/operator/share");
require("rxjs/add/operator/startWith");
var Sub_1 = require("./Sub");
function modelCompare(x, y) {
    return x === y || x[0] === y[0];
}
function cmdCompare(x, y) {
    return x === y || x[1] === y[1];
}
function program(init, update, subscriptions) {
    if (subscriptions === void 0) { subscriptions = function () { return Sub_1.none; }; }
    var state$ = new BehaviorSubject_1.BehaviorSubject(init);
    var dispatch = function (msg) { return state$.next(update(msg, state$.value[0])); };
    var cmd$ = state$
        .distinctUntilChanged(cmdCompare)
        .map(function (state) { return state[1]; })
        .mergeAll();
    var model$ = state$
        .distinctUntilChanged(modelCompare)
        .map(function (state) { return state[0]; })
        .share()
        .startWith(init[0]);
    var sub$ = model$.switchMap(function (model) { return subscriptions(model); });
    return { dispatch: dispatch, cmd$: cmd$, sub$: sub$, model$: model$ };
}
exports.program = program;
function programWithFlags(init, update, subscriptions) {
    if (subscriptions === void 0) { subscriptions = function () { return Sub_1.none; }; }
    return function (flags) { return program(init(flags), update, subscriptions); };
}
exports.programWithFlags = programWithFlags;
function run(program) {
    var dispatch = program.dispatch, cmd$ = program.cmd$, sub$ = program.sub$, model$ = program.model$;
    cmd$.subscribe(function (task) { return task.run().then(function (o) { return o.map(dispatch); }); });
    sub$.subscribe(dispatch);
    return model$;
}
exports.run = run;
//# sourceMappingURL=Platform.js.map