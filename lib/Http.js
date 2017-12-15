"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var axios_1 = require("axios");
var Option_1 = require("fp-ts/lib/Option");
var Either_1 = require("fp-ts/lib/Either");
var Task_1 = require("fp-ts/lib/Task");
var Task_2 = require("./Task");
var function_1 = require("fp-ts/lib/function");
function expectJson(decoder) {
    return decoder.decode;
}
exports.expectJson = expectJson;
var BadUrl = /** @class */ (function () {
    function BadUrl(value) {
        this.value = value;
        this._tag = 'BadUrl';
    }
    return BadUrl;
}());
exports.BadUrl = BadUrl;
var Timeout = /** @class */ (function () {
    function Timeout() {
        this._tag = 'Timeout';
    }
    return Timeout;
}());
exports.Timeout = Timeout;
var NetworkError = /** @class */ (function () {
    function NetworkError(value) {
        this.value = value;
        this._tag = 'NetworkError';
    }
    return NetworkError;
}());
exports.NetworkError = NetworkError;
var BadStatus = /** @class */ (function () {
    function BadStatus(response) {
        this.response = response;
        this._tag = 'BadStatus';
    }
    return BadStatus;
}());
exports.BadStatus = BadStatus;
var BadPayload = /** @class */ (function () {
    function BadPayload(value, response) {
        this.value = value;
        this.response = response;
        this._tag = 'BadPayload';
    }
    return BadPayload;
}());
exports.BadPayload = BadPayload;
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
    return expect(res.data).mapLeft(function (errors) { return new BadPayload(errors, axiosResponseToResponse(res)); });
}
function axiosErrorToEither(e) {
    if (e instanceof Error) {
        if (e.code === 'ECONNABORTED') {
            return Either_1.left(new Timeout());
        }
        return Either_1.left(new NetworkError(e.message));
    }
    var res = e.response;
    switch (res.status) {
        case 404:
            return Either_1.left(new BadUrl(res.config.url));
        default:
            return Either_1.left(new BadStatus(axiosResponseToResponse(res)));
    }
}
function getPromiseAxiosResponse(config) {
    return axios_1.default(config);
}
function requestToTask(req) {
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
function send(f, req) {
    return Task_2.attempt(f, requestToTask(req));
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
function post(url, body, decoder) {
    return {
        method: 'POST',
        headers: {},
        url: url,
        body: body,
        expect: expectJson(decoder),
        timeout: Option_1.none,
        withCredentials: false
    };
}
exports.post = post;
//# sourceMappingURL=Http.js.map