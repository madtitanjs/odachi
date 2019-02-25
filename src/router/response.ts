import { ServerResponse } from "http";
import { Http2ServerResponse } from "http2";
export interface Response extends ServerResponse {
    json: (json: any, cb?: (() => void) | undefined) => void;
    send: (content: any) => Promise<void>;
}

export function responseInitializer(response: ServerResponse | Http2ServerResponse): Response {
    let res: any = {};
    res = response;
    res.send = async (content: any) => {
        return new Promise((resolve) => {
            res.end(content, () => {
                resolve();
            });
        })
    }

    res.json = async (json: any, cb?: (() => void) | undefined) => {
        const stringified = JSON.stringify(json);
        res.setHeader('Content-Type', 'application/json');
        res.statusCode = 200;
        res.end(stringified, cb);
    }

    return res;
}