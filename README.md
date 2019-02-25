# Odachi Router

This is still under development.

**Current Version**: ``1.0.1``

Framework independent, ``Compressed Trie`` based router.

Supports

* Multi-path registration (**TODO**)
* Parametric routing
* Query strings (**TODO**)
* Extensible handlers (can be used for both server and SPA routing)


## Installation

``npm install --save odachi`` or ``yarn add odachi``


## How to use with nodeJS

```js
TODO
```
## Benchmark Results
```
locate static route x 29,665,998 ops/sec ±3.98% (568 runs sampled)
locate dynamic route x 2,106,495 ops/sec ±3.84% (568 runs sampled)
locate long static route x 3,506,929 ops/sec ±1.06% (571 runs sampled)
locate long dynamic route x 1,706,538 ops/sec ±1.27% (575 runs sampled)
find static route x 23,351,805 ops/sec ±1.17% (583 runs sampled)
find dynamic route x 3,156,683 ops/sec ±1.07% (578 runs sampled)
find long static route x 6,250,583 ops/sec ±1.14% (564 runs sampled)
find long dynamic route x 2,419,068 ops/sec ±1.63% (569 runs sampled)
```

## Credits
Inspired by [find-my-way](https://github.com/delvedor/find-my-way)

This library was done out of curiousity on what Radix Tries are and how they perform vs simple array operations.

I learned alot while making this library especially on how "simple" operations toll heavily on performance. Even common string methods that behave the same have astronomical difference in performance when doing a benchmark with a minimum of 500 samples. Also found out that manually iterating on a string using a foor loop is much better compared to transforming it into an array using the ``split`` function.

```js
"hello".substr(1);
// ~60 million ops/sec

"hello".slice(1);
// ~700 million ops/sec
```