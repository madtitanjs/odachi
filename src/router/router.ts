import { METHODS, IncomingMessage, ServerResponse, Server } from "http";
import { Http2ServerRequest, Http2ServerResponse } from "http2";
import { 
    RouteNode, 
    RouteType, 
    requestInitializer, 
    responseInitializer, 
    url,
    RouteHandler, 
    Route, 
    RouterConfiguration 
} from '../';

import debug = require('debug');
import assert = require("assert");
import { Method } from "../constants";
const troubleshoot = debug('odachi:router');

export class Router {
    top: RouteNode;
    private notfoundHandler: RouteHandler;

    // Configuration variables
    private caseSensitive: boolean;

    constructor(configuration?: RouterConfiguration) {
        this.top = new RouteNode('/', RouteType.PARAMETERIC, null, [], null); 
        configuration = configuration ? configuration : {};
        this.notfoundHandler = (req, res) => {
            res.statusCode = 404;
            res.end('Path not found');
        }
        this.caseSensitive = configuration.caseSensitive ? configuration.caseSensitive : false;
    }

    use = (path: string, handler: RouteHandler) => this.register('HEAD', path, handler);
    get = (path: string, handler: RouteHandler) => this.register('GET', path, handler);
    post = (path: string, handler: RouteHandler) => this.register('POST', path, handler);
    put = (path: string, handler: RouteHandler) => this.register('PUT', path, handler);
    delete = (path: string, handler: RouteHandler) => this.register('DELETE', path, handler);
    head = (path: string, handler: RouteHandler) => this.register('HEAD', path, handler);
    options = (path: string, handler: RouteHandler) => this.register('OPTIONS', path, handler);
    setNotFoundRoute = (handler: RouteHandler) => this.notfoundHandler = handler;

    // manage the string
    register(method: Method, path: string, handler: Function) {
        let pathLen = path.length;

        const parameters: string[] = [];
        // index for the start of a parameter name
        // e.g. '/user/:id
        // paramStartRefIndex = 7
        let paramStartRefIndex = 0;


        // try to find parameteric route
        for(let paramRefIndex = 0; paramRefIndex < pathLen; paramRefIndex++) {
            // check if segment contains : which denotes a parameter
            if(path.charCodeAt(paramRefIndex) === 58) {
                paramStartRefIndex = paramRefIndex + 1;
                // cut path until ":" and insert it into the tree
                let static_segment = path.slice(0, paramRefIndex); 
                this.insert(static_segment, RouteType.FIXED, [], method, null);

                // adjust paramRefIndex to get parameter name
                // lookup string from static_segments end until '/'
                while(path.charCodeAt(paramRefIndex) !== 47 && paramRefIndex < pathLen) paramRefIndex++;

                let parameterName = path.slice(paramStartRefIndex, paramRefIndex);
                parameters.push(parameterName);

                // modify path to get rid of parameter name so the node gets registered with :
                // e.g. /user/:id/edit => /user/:/edit
                path = path.slice(0, paramStartRefIndex) + path.slice(paramRefIndex);
                pathLen = path.length;

                // adjust paramRefIndex to the start of the paramater name
                // since path was adjust to remove paramater name
                paramRefIndex = paramStartRefIndex
               
                // Check if path has been fully processed so we can add the parameteric node
                if(paramRefIndex === pathLen) {
                    let parameteric_segment = path.slice(0, paramRefIndex);
                    // do some lower case stuff here
                    this.insert(parameteric_segment, RouteType.PARAMETERIC, parameters, method, handler);
                    return;
                }
                let temp = path.slice(0, paramRefIndex);
                this.insert(temp, RouteType.PARAMETERIC, parameters, method, null);
                paramRefIndex--;
            }
        }

        // insert static 
        this.insert(path, RouteType.FIXED, parameters, method, handler);
    }

    // manage the nodes
    insert(path: string, type: RouteType, parameters: string[], method: Method, handler: Function | null) {
        // start from top and proceed downwards the tree
        let workingNode = this.top;
        let pathLen = path.length;
        let segment = '';
        let segmentLen = 0;
        let childNode: RouteNode | null = null;
        while(true) {
            segment = workingNode.segment;
            segmentLen = segment.length;
            let pathIndex = 0;
            // adjust pathIndex to the longest common segment and proceed path check from that
            let commonLen = pathLen < segmentLen ? pathLen : segmentLen;
            while(pathIndex < commonLen && path[pathIndex] === segment[pathIndex]) pathIndex++;

            // there are still available paths on the segment create a new one from the current path
            // create a copy of the existing node
            // reset the node to use the longest common segment
            // adjust the copy to use the segment difference and add it as a child
            if(pathIndex < segmentLen) {
                // create a new node from the existing one and split so that the 
                // segments starts at the pathIndex
                childNode = new RouteNode(segment.slice(pathIndex), type, workingNode.handlers, parameters, workingNode.children);

                // re instantiate the working node and use the common segment found
                workingNode.init(segment.slice(0, pathIndex), type);
                workingNode.addChild(childNode);


                // if the pathIndex is at the end of the original path
                // add a listener to the workingNode instead else create a new node and add to that
                if(pathIndex === pathLen) {
                    // TODO: add handler here
                    workingNode.addHandler(method, handler);
                } else {
                    childNode = new RouteNode(path.slice(pathIndex), type, null, parameters);
                    childNode.addHandler(method, handler);
                    workingNode.addChild(childNode);
                }
            }

            // If there are still available segments in the path
            // use a segment that starts from the current pathIndex
            // check if a child exist if not create a new child
            else if(pathIndex < pathLen) {
                // remove the segment from the path using (pathIndex)
                path = path.slice(pathIndex);
                childNode = workingNode.getChildByIdentifier(path[0]);
                
                // if a child exist assign this as the workingNode and continue the loop
                if(childNode) {
                    workingNode = childNode;
                    continue;
                }
                // if child doesn't exist create a new one and add it to the working node
                childNode = new RouteNode(path, type, null, parameters);
                childNode.addHandler(method, handler);
                workingNode.addChild(childNode);
            }
            // The pathIndex is equal to pathLength
            // The pathIndex is grater than the current segment
            else {
                // TODO: attach handler
                workingNode.addHandler(method, handler);
            }
            break;
        }
        return;
    }

    find(method: Method, path: string) {
        // start from top and work downwards
        let workingNode = this.top;
        let pathRef = path;
        let pathRefLen = path.length;
        let pathRefIndex = 0;
        let childNode: RouteNode | null = null;
        let parameterValues: string[] = [];
        let paramRefIndex = 0;
        while(true) {
            let pathLen = path.length;
            let segment = workingNode.segment;
            let segmentLen = segment.length;
            // whats dis
            let len = 0;
            let prevPath = path;

            // reached end of tree or found match
            if(pathLen === 0 || path === segment) {
                let handler = workingNode.getHandler(method);
                if(handler !== null && handler !== undefined) {
                    let paramObj = {};
                    for(let pIndex = 0; pIndex < workingNode.parameters_len; pIndex++) {
                        paramObj[workingNode.parameters[pIndex]] = parameterValues[pIndex];
                    }
                    return {
                        handler: handler,
                        param: paramObj
                    };
                }
            }

            // adjust pathIndex to the longest common segment and proceed path check from that
            let commonLen = pathLen < segmentLen ? pathLen : segmentLen;
            while(len < commonLen && path.charCodeAt(len) === segment.charCodeAt(len)) len++


            // adjust pathRef index to move with len
            if(len === segmentLen) {
                path = path.slice(len)
                pathLen = path.length;
                pathRefIndex += len;
            }

            childNode = workingNode.getChildByIdentifier(path[0]);
            if(childNode === null) childNode = workingNode.getChildByIdentifier(':');

            
            if(childNode === null) {
                if(pathRef.indexOf('/' + prevPath) === -1) {
                    let pathDiff =  pathRef.slice(0, pathRefLen - pathLen);
                    prevPath = pathDiff.slice(pathDiff.lastIndexOf('/') + 1, pathDiff.length) + path;
                }
                pathRefIndex = pathRefIndex - prevPath.length - pathLen;
                path = prevPath;
                pathLen = prevPath.length;
                len = segmentLen
            }

            if(childNode === null) { throw new Error('Node not found')}
            let nodeType = workingNode.type;

            if(nodeType === RouteType.FIXED) {
                workingNode = childNode;
                continue;
            }

            if(nodeType === RouteType.PARAMETERIC) {
                workingNode = childNode;
                let paramEndIndex = path.indexOf('/');
                if(paramEndIndex === -1) paramEndIndex = pathLen;

                // TODO, support special uri characters e.g. %20
                let paramValue = pathRef.slice(pathRefIndex, pathRefIndex + paramEndIndex);
                parameterValues[paramRefIndex] = paramValue;
                paramRefIndex++;
                // adjust path to skip over parameter name
                path = path.slice(paramEndIndex)
                pathLen = path.length;
                pathRefIndex += paramEndIndex;
                continue;
            }
            if(workingNode === null) return null;
        }
        
        
    }

    remove(path) {

    }

    locate = (request: any, response: any) => {
        let path = url.sanitize(request.url);
        let handle = this.find(request.method, path)
        if(handle === null || typeof handle === 'undefined') return this.notfoundHandler(request, response);
        return handle.handler(request, response);
    }
}