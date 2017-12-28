# Flavor Wheel

<img src="docs/readme-intro.png" alt="Screenshot demo" width=500>

## What and why

I like coffee a lot, and I found this cute book once, [_33 Cups of
Coffee_](https://www.33books.com/products/33-coffees), that I thought was
perfect for writing down notes on the different coffees that I try.

This project is a web version of the flavor wheels found in the journal and the
[other journals](https://www.33books.com/collections/books) 33 Books sells. I
made this to get better at understanding SVGs and D3 and the huge ecosystem that
is modern JavaScript.

Nothing really beats writing on the physical book itself, so if you like this, I
recommend getting buying one of 33 Books. (By the way, I have no relationship of
any sort with the publisher; just a happy customer.)

## Setup

Prerequisites: Node >= 6

`yarn install` (or `npm install`)

To build the minified bundle, run `npm run build`.

### Development server

1. `npm run webpack:dev`
2. Point your browser to http://localhost:8080/demo.html

This setup runs via webpack-dev-server, so any changes you make to JavaScript
or SCSS assets will trigger a browser refresh.

## Usage

A full usage example can be found in demo.html and app/js/main.js. See
instructions above for running the development server.

Documentation on how to create a FlavorWheel can be found in
app/js/flavor-wheel/flavor-wheel.js. A typical invocation might look something
like this:

```html
<svg id="wheel"></svg>
```

```js
const wheel = FlavorWheel.initialize("#wheel", {
  maxRating: 5,
  gridRadius: 250,
  viewWidth: 800,
  labels: ['smoky', 'berry\nfruit', 'bitter', 'sweet', 'sour', 'floral']
});

const data = [
  { label: 'smoky', value: 2 },
  { label: 'berry\nfruit', value: 3 },
  { label: 'bitter', valuej 4 },
  { label: 'sweet', value: 2 },
  { label: 'sour', value: 1 },
  { label: 'floral', value: 5 }
];
wheel.addData(data, '1');
```

## License

Licensed under the LGPLv3. See LICENSE.
