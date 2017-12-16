"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var html = require("./Html");
var Reader_1 = require("fp-ts/lib/Reader");
exports.Reader = Reader_1.Reader;
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
//# sourceMappingURL=React.js.map