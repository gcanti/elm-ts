"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_dom_1 = require("react-dom");
var html = require("./Html");
function map(f, ha) {
    return html.map(f, ha);
}
exports.map = map;
function program(init, update, view, subscriptions) {
    return html.program(init, update, view, subscriptions);
}
exports.program = program;
function programWithFlags(init, update, view, subscriptions) {
    return function (flags) { return program(init(flags), update, view, subscriptions); };
}
exports.programWithFlags = programWithFlags;
function run(program, renderer) {
    return html.run(program, renderer);
}
exports.run = run;
function render(node) {
    return {
        render: function (dom) {
            return react_dom_1.render(dom, node);
        }
    };
}
exports.render = render;
//# sourceMappingURL=React.js.map