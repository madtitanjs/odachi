process.env.DEBUG_HIDE_DATE = 'true';
process.env.DEBUG_COLORS = 'true';
process.env.DEBUG_SHOW_HIDDEN = 'true';
process.env.DEBUG_DEPTH = 'true';
process.env.DEBUG = '*';
import { Router } from "./router/router";
import { createServer } from 'http';
import { paths } from "./mock/paths";
const router = new Router();

router.get('/api/hello', (req, res) => {
    res.write('this path is: hello');
    res.end();
});

router.post('/api/hello/wewu', (req, res) => {
    res.write('this path is: hello wewu');
    res.end();
});

router.get('/api/user/new', (req, res) => {
    res.end('static node qwe')
});

router.get('/api/user/:username', (req, res) => {
    console.log('is me');
    res.end(req.url);
});

router.get('/api/user/:username/:uid', (req, res) => {
    console.log('is me 2');
    res.end(req.url);
});

router.get('/api/user/settings', (req, res) => {
    res.end('static node statis')
});

router.register('GET','/abc/def/ghi/lmn/opq/rst/uvz', (req, res) => {
    res.end('long static route');
});

paths.forEach(path => {
    router.get(path, (req,res) => {
        res.write('this path is: ' + path);
        res.end();
    });
})



createServer(router.locate).listen(3000);
