import { Option } from 'fp-ts/lib/Option';
import { Either } from 'fp-ts/lib/Either';
import { Time } from './Time';
import { Decoder, JSON } from './Decode';
import { Cmd } from './Cmd';
export declare type Method = 'GET' | 'POST' | 'PUT' | 'DELETE';
export declare type Request<a> = {
    method: Method;
    headers: {
        [key: string]: string;
    };
    url: string;
    body?: any;
    expect: Expect<a>;
    timeout: Option<Time>;
    withCredentials: boolean;
};
export declare type Expect<a> = (value: JSON) => Either<string, a>;
export declare function expectJson<a>(decoder: Decoder<a>): Expect<a>;
export declare class BadUrl {
    readonly value: string;
    readonly _tag: 'BadUrl';
    constructor(value: string);
}
export declare class Timeout {
    readonly _tag: 'Timeout';
}
export declare class NetworkError {
    readonly value: string;
    readonly _tag: 'NetworkError';
    constructor(value: string);
}
export declare class BadStatus {
    readonly response: Response<string>;
    readonly _tag: 'BadStatus';
    constructor(response: Response<string>);
}
export declare class BadPayload {
    readonly value: string;
    readonly response: Response<string>;
    readonly _tag: 'BadPayload';
    constructor(value: string, response: Response<string>);
}
export declare type HttpError = BadUrl | Timeout | NetworkError | BadStatus | BadPayload;
export declare type Response<body> = {
    url: string;
    status: {
        code: number;
        message: string;
    };
    headers: {
        [key: string]: string;
    };
    body: body;
};
export declare function send<a, msg>(f: (e: Either<HttpError, a>) => msg, req: Request<a>): Cmd<msg>;
export declare function get<a>(url: string, decoder: Decoder<a>): Request<a>;
export declare function post<a>(url: string, body: any, decoder: Decoder<a>): Request<a>;
