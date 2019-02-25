'use strict'

const Benchmark = require('benchmark')
Benchmark.options.minSamples = 500

const suite = Benchmark.Suite()


const { Router } = require('./dist');
const router = new Router();


router.register('GET', '/', () => true)
router.register('GET', '/user/:id', () => true)
router.register('GET', '/user/:id/static', () => true)
router.register('GET', '/abc/def/ghi/lmn/opq/rst/uvz', () => true)

suite
.add('locate static route', function () {
  router.locate({ method: 'GET', url: '/', headers: {} }, null)
})
.add('locate dynamic route', function () {
  router.locate({ method: 'GET', url: '/user/tomas', headers: {} }, null)
})
.add('locate long static route', function () {
  router.locate({ method: 'GET', url: '/abc/def/ghi/lmn/opq/rst/uvz', headers: {} }, null)
})
.add('locate long dynamic route', function () {
  router.locate({ method: 'GET', url: '/user/qwertyuiopasdfghjklzxcvbnm/static', headers: {} }, null)
})
.add('find static route', function () {
  router.find('GET', '/', undefined)
})
.add('find dynamic route', function () {
  router.find('GET', '/user/tomas', undefined)
})
.add('find long static route', function () {
  router.find('GET', '/abc/def/ghi/lmn/opq/rst/uvz', undefined)
})
.add('find long dynamic route', function () {
  router.find('GET', '/user/qwertyuiopasdfghjklzxcvbnm/static', undefined)
})
.on('cycle', function (event) {
  console.log(String(event.target))
})
.on('complete', function () {})
.run()