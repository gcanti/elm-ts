"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Sub_1 = require("./Sub");
var platform = require("./Platform");
function map(f, ha) {
    return function (dispatch) { return ha(function (a) { return dispatch(f(a)); }); };
}
exports.map = map;
function program(init, update, view, subscriptions) {
    if (subscriptions === void 0) { subscriptions = function () { return Sub_1.none; }; }
    var _a = platform.program(init, update, subscriptions), dispatch = _a.dispatch, cmd$ = _a.cmd$, sub$ = _a.sub$, model$ = _a.model$;
    var html$ = model$.map(function (model) { return view(model); });
    return { dispatch: dispatch, cmd$: cmd$, sub$: sub$, model$: model$, html$: html$ };
}
exports.program = program;
function programWithFlags(init, update, view, subscriptions) {
    return function (flags) { return program(init(flags), update, view, subscriptions); };
}
exports.programWithFlags = programWithFlags;
function run(program, renderer) {
    var dispatch = program.dispatch, html$ = program.html$;
    html$.subscribe(function (html) { return renderer.render(html(dispatch)); });
    return platform.run(program);
}
exports.run = run;
//# sourceMappingURL=Html.js.map