
import { Request, Response } from '../';

export interface RouteHandler {
    (request: Request, response: Response )
}
export interface Route {
    handler: RouteHandler;
    parameters: {};
}
export interface RouterConfiguration {
    caseSensitive? : boolean;
}