"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Platform_1 = require("./Platform");
function map(f, ha) {
    return function (dispatch) { return ha(function (a) { return dispatch(f(a)); }); };
}
exports.map = map;
function programWithFlags(component, flags, subscriptions) {
    var _a = Platform_1.programWithFlags(component, flags, subscriptions), dispatch = _a.dispatch, cmd$ = _a.cmd$, sub$ = _a.sub$, model$ = _a.model$;
    var html$ = model$.map(function (model) { return component.view(model); });
    return { dispatch: dispatch, cmd$: cmd$, sub$: sub$, model$: model$, html$: html$ };
}
exports.programWithFlags = programWithFlags;
function run(program, renderer) {
    var dispatch = program.dispatch, html$ = program.html$;
    html$.subscribe(function (html) { return renderer.render(html(dispatch)); });
    return Platform_1.run(program);
}
exports.run = run;
//# sourceMappingURL=Html.js.map