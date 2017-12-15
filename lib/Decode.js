"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var io_ts_1 = require("io-ts");
var PathReporter_1 = require("io-ts/lib/PathReporter");
function decodeJSON(decoder, value) {
    return decoder.decode(value);
}
exports.decodeJSON = decodeJSON;
function map(f, fa) {
    return {
        decode: function (value) { return fa.decode(value).map(f); }
    };
}
exports.map = map;
function fromType(type) {
    return {
        decode: function (value) { return io_ts_1.validate(value, type).mapLeft(function (errors) { return PathReporter_1.failure(errors).join('\n'); }); }
    };
}
exports.fromType = fromType;
//# sourceMappingURL=Decode.js.map