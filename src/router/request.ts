import { IncomingMessage } from "http";
import { url, defineGetter } from '../helpers';
import { Http2ServerRequest } from "http2";

export interface Request extends IncomingMessage {
    addParameter: (key: string, value: any) => boolean;
    setParameters: (parameters: {}) => boolean;
    removeParameter: (key: string) => boolean;
    params: any;
    query: any;
}

export function requestInitializer(request: IncomingMessage | Http2ServerRequest): Request {
    let req: any = {};
    req = request;
    req._params = {}
    defineGetter(req, 'params', () => {
        return {...req._params};
    })
    defineGetter(req, 'query', () => {
        if(typeof req.url === 'undefined') return {};
        return url.getQuery(req.url);
    })
    req.addParameter = (key: string, value: any) => {
        req._params[key] = value;
        return true
    };

    req.setParameters = (parameters: {}) => {
        req._params = parameters;
        return true;
    };

    req.removeParameter = (key: string) => {
        delete req._params[key];
        return true;
    };
    return req;
}