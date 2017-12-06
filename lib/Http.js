"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var axios_1 = require("axios");
var Option_1 = require("fp-ts/lib/Option");
var Either_1 = require("fp-ts/lib/Either");
var Task_1 = require("./Task");
var function_1 = require("fp-ts/lib/function");
function expectJson(decoder) {
    return decoder.decode;
}
exports.expectJson = expectJson;
function axiosResponseToResponse(res) {
    return {
        url: res.config.url,
        status: {
            code: res.status,
            message: res.statusText
        },
        headers: res.headers,
        body: res.request.responseText
    };
}
function axiosResponseToEither(res, expect) {
    return expect(res.data).mapLeft(function (errors) {
        return ({
            type: 'BadPayload',
            value: errors,
            response: axiosResponseToResponse(res)
        });
    });
}
function axiosErrorToEither(e) {
    if (e instanceof Error) {
        if (e.code === 'ECONNABORTED') {
            return Either_1.left({ type: 'Timeout' });
        }
        return Either_1.left({ type: 'NetworkError', value: e.message });
    }
    var res = e.response;
    switch (res.status) {
        case 404:
            return Either_1.left({ type: 'BadUrl', value: res.config.url });
        default:
            return Either_1.left({ type: 'BadStatus', response: axiosResponseToResponse(res) });
    }
}
function getPromiseAxiosResponse(config) {
    return axios_1.default(config);
}
function toTask(req) {
    return new Task_1.Task(function () {
        return getPromiseAxiosResponse({
            method: req.method,
            headers: req.headers,
            url: req.url,
            data: req.body,
            timeout: req.timeout.fold(function () { return undefined; }, function_1.identity),
            withCredentials: req.withCredentials
        })
            .then(function (res) { return axiosResponseToEither(res, req.expect); })
            .catch(function (e) { return axiosErrorToEither(e); });
    });
}
exports.toTask = toTask;
function send(f, req) {
    return Task_1.attempt(f, toTask(req));
}
exports.send = send;
function get(url, decoder) {
    return {
        method: 'GET',
        headers: {},
        url: url,
        body: undefined,
        expect: expectJson(decoder),
        timeout: Option_1.none,
        withCredentials: false
    };
}
exports.get = get;
//# sourceMappingURL=Http.js.map