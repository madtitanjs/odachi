import { Method } from '../constants';

export enum RouteType {
    FIXED = 0,
    PARAMETERIC = 1
}
export class RouteNode {
    children = {};
    children_len = 0;
    segment: string = '/';
    handlers = {};
    type: RouteType = RouteType.FIXED;
    identifier: string = this.segment[0];
    parameters = {};
    parameters_len = 0;
    constructor(segment: string, type: RouteType, handlers?: any, parameters?: string[], children?: any) {
       this.init(segment, type, handlers, parameters, children);
    }

    addChild(node: RouteNode) {
        this.children[node.segment[0]] = node;
    }

    getChildByIdentifier(identifier: string) {
        const child = this.children[identifier];
        if(typeof child === 'undefined') return null;
        return child; 
    }

    addHandler(method: Method, handler: Function | null) {
        this.handlers[method] = handler;
    }

    getHandler(method: Method) {
        const handler = this.handlers[method];
        if(typeof handler === 'undefined') return null;
        return handler;
    }

    init(segment: string, type: RouteType, handlers?: any, parameters?: string[], children?: any) {
        this.segment = segment;
        this.type = type;
        this.identifier = segment[0];
        this.handlers = handlers || {};
        this.children =  children || {};
        this.parameters = parameters || [];
        this.parameters_len = parameters ? parameters.length : 0;
        this.children_len = children ? Object.keys(children).length : 0;
    }
}