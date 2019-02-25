import debug = require('debug');
const troubleshoot = debug('odachi:helpers:url');
export module url {
    
    export function getQuery(path: string): {} {
        const querystring = getQueryString(path);
        const query = {};
        const queries = querystring.split('&');
        troubleshoot(queries);
        queries.forEach(q => {
            const keyvalpair = q.split('=');
            query[keyvalpair[0]] = keyvalpair[1];
        });
        return query;
    }

    export function parse(path: string) {
        const pathname = sanitize(path);
        const querystring = getQueryString(path);
        const query = getQuery(path);
        return {
            path: path,
            pathname: pathname,
            querystring: querystring,
            query: query
        }
    }

    export function sanitize(path: string): string {
        for (var i = 0, len = path.length; i < len; i++) {
            var charCode = path.charCodeAt(i)
            if (charCode === 63 || charCode === 59 || charCode === 35) {
              return path.slice(0, i)
            }
        }
        return path;
    }

    export function getQueryString(path: string): string {
        const index = getQuerySeparatorIndex(path);
        return path.slice(index + 1);
    }

    export function getQuerySeparatorIndex(path: string): number {
        const char = path.split('');
        const index = char.findIndex(a => a.charCodeAt(0) === 63  || a.charCodeAt(0) === 59 || a.charCodeAt(0) === 35);
        return index;
    }

    /**
     * Removes trailing slash of a path
     * @param path original path
     * 
     */
    export function removeTrailingSlash(path: string): string {
        // remove last character if equal to /
        if(path.charCodeAt(path.length - 1) === 47) path = path.slice(0, path.length - 1);
        return path;
    }
}
