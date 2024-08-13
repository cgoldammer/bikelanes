const { JSDOM } = require("jsdom");

const jsDomString = "<!doctype html><html><body></body></html>";
const jsDomOptions = { url: "http://localhost/" };
const jsdom = new JSDOM(jsDomString, jsDomOptions);
const { window } = jsdom;

function copyProps(src, target) {
  const props = Object.getOwnPropertyNames(src)
    .filter((prop) => typeof target[prop] === "undefined")
    .reduce(
      (result, prop) => ({
        ...result,
        [prop]: Object.getOwnPropertyDescriptor(src, prop),
      }),
      {}
    );
  Object.defineProperties(target, props);
}

// window.$RefreshReg$ = () => {};
// window.$RefreshSig$ = () => () => {};
global.window = window;
global.document = window.document;
global.navigator = {
  userAgent: "node.js",
};
copyProps(window, global);
