The DOM class is static and needs to be called as `DOM.functionName(parameter)`.

Its main purpose is to simplify changing elements and contents in the DOM without needing other 3rd-party libraries.

The DOM (Document Object Model) is a very important part of your widget and dictates the general backbone of it.

If you currently don't know how exactly the DOM is structured or what DOM-manipulation is, we recommend learning the basics for that first, so you can understand the following sections.

[MDN Article - Introduction to the DOM](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Introduction)

# Querying selectors
One of the most common and basic task in widgets, is querying the DOM to alter styles, classes, texts and media.

That's what we have `find(selector)` and `findAll(selector)` for. You can pass any CSS selector as parameter and then get the matching element(s) returned.

`DOM.find("#myId")` is a wrapper for `document.querySelector("#myId")`[[MDN]](https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector) and only returns the first match as [Element](https://developer.mozilla.org/de/docs/Web/API/Element) object. So this function fits best for elements with unique ids or if only one of that kind exists.

This will return `null` if no matches were found.

`DOM.findAll(".myClass")` on the other hand is a wrapper for `document.querySelectorAll(".myClass")`[[MDN]](https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelectorAll) and returns a NodeList of matched elements.

Even if no element was found, this will always return a [NodeList](https://developer.mozilla.org/en-US/docs/Web/API/NodeList).

Also, an important note from the MDN docs: "If the specified selectors include a CSS pseudo-element, the returned list is always empty."

In case you want this to align more with the `DOM.find(selector)` results, we also provide `DOM.findAllOrNull(selector)`, which returns either a NodeList, with at least 1 element, or null if it is empty.

Also, all find functions accept a second parameter to limit the search to. This parameter has to be an element and can not be a selector.

```javascript
// Returns a NodeList including all elements matching the "red" class in the document.
DOM.findAll(".red");

// Returns a NodeList only including elements matching the "red" class found inside of the #myElement container. If #myElement doesn't exist, this defaults back to the whole document.
DOM.findAll(".red", DOM.find("#myElement"));
```

Most functions in this module accept both a CSS-selector as string and an `Element` object (the result of `find()` / `findAll()`) as their first parameter.

Except for getters, since they mostly return specific values of specific elements.

# Working With Query Results
The functions above already provide a good base for DOM-operations, but we can take this a little further.

What if, you wanted to change every class in a NodeList, without having to write your own loop?

Well, don't worry, we have `DOM.onEach(selector, exec)` for that.

So, let's say we wanted to change every element with the "red" class to an element with a "green" class:

```javascript
DOM.onEach(".red", (elem) => { DOM.swapClass(elem, "red", "green"); });
```

As the name suggests, this will iterate over the `NodeList` of all matching `Elements` (having a "red" class in this case) and call the function defined as second parameter on each (`DOM.swapClass()`).

The provided function will get the current `Element` passed as parameter, so make sure your function expects and handles it.

We also have `DOM.onFirst(selector, exec)`, which basically does the same, but only on the first matching element.

```javascript
// This will only affect the first matching element and stop after that
DOM.onFirst(".red", (elem) => { DOM.swapClass(elem, "red", "green"); });
```

# Altering Texts & Contents
Another common case, especially for widgets, is altering content based on events and (updated) data.

Sure, we could just do something like `DOM.find("#myElement").innerText = "Updated text";` and that would work if `#myElement` exists, but what if we wanted to do that on multiple elements?

We would have to write something like `DOM.onEach(".myClass", (elem) => { elem.innerText = "Updated text"; });`.

Here we needed two different approaches, depending on the selector range and we don't want that. We want a universal solution.

With `DOM.setText(selector, text)` we can unify both and don't have to worry about what range our selector has.

```javascript
DOM.setText("#myElement, .myClass", "Updated text");
```

This will iterate over each matching element and update the text accordingly.

If the selector doesn't exist, this will not throw an error and just do nothing.

We also provide `DOM.setHTML(selector, htmlString)`, if you need to update and render HTML, but in most cases you probably would want to use `DOM.setText()` instead.

Especially, if it is user-generated content.

# Changing Styles
There are multiple ways of changing the look of an element.

1. Add/Remove one or multiple classes and let these classes define the styling in your CSS.
2. Use inline-styles to override or add specific CSS declarations.

(Technically animations also count, but we won't go into that right now.)

In most cases, you should probably use the CSS classes and swap them around as you need.

However, if you only want to change one rule (like a font-color) the inline-styling would also be okay. Just don't overdo it.

## Classes
The helper functions to alter classes are pretty straight-forward:
```javascript
// Add a new class to #myElement
DOM.addClass("#myElement", "newClass");
// You can also add multiple classes if you pass an array as second parameter
DOM.addClass("#myElement", ["newClass1", "newClass2", "newClass3"]);

// Remove a single class from #myElement
DOM.removeClass("#myElement", "newClass");
// Remove multiple classes
DOM.removeClass("#myElement", ["newClass1", "newClass2", "newClass3"]);

// This removes the oldClass from #myElement and adds newClass afterwards
DOM.swapClass("#myElement", "oldClass", "newClass");
// Swapping multiple classes
DOM.swapClass("#myElement", ["oldClass1", "oldClass2", "oldClass3"], ["newClass1", "newClass2", "newClass3"]);
// You can also mix the parameter types if you only want to add one class but remove multiple or or the other way around.
DOM.swapClass("#myElement", ["oldClass1", "oldClass2", "oldClass3"], "newClass1");
```

## Inline-styles
Inline-styles have the highest priority and will override previous declarations.

So, for a better legibility of your code, you should try to avoid those whenever possible.

That being said, inline-styles are not necessarily and always bad.

There are some cases where you even have to use them. For example, chat-widgets with unique chatter colors or when you need to adjust absolute positioning.

For the first case we have `DOM.setCSSProp(selector, property, value)` to set a single property and `DOM.setCSS(selector, cssObj)` if you need to set multiple at once.

```javascript
// Adds a red color to the inline-style declaration of #chatMessage100
DOM.setCSSProp("#chatMessage100", "color", "red");

// This is a shorter form of
DOM.onEach("#chatMessage100", (elem) => { elem.style.color = "red"; });

// Adds multiple properties to the inline-style declaration of #myElement
DOM.setCSS("#myElement", { "top": "100px", "left": "123px", "maxWidth": "50%" });
```

Note, how we defined the CSS-property "max-width" as "maxWidth", as that is the correct syntax in JavaScript.

Both functions will try to convert the kebab-case to camel-case, if a `-` was found in the property, but for consistency you should always try to use the camel-case syntax from the start.

## Computed CSS
Getting CSS-properties is a little trickier depending on what you want to achieve.

Let's say, you gave `#myElement` a relative width of 75% and the parents all have relative widths too.

Just returning the value of 75% won't tell you how wide the element actually is, since that width also depends on the widths of the parent elements (which may also depend on other widths).

That's what we have computed values in JavaScript for. Those hold the calculated absolute values for elements with their according units.

```javascript
// This will get the computed value for the width of #myElement with units as string. "100px" for example.
DOM.getCSS("#myElement", "width");

// You can use the third parameter to access the properties of pseudo-elements of #myElement.
DOM.getCSS("#myElement", "content", ":before");
```

Not part of the official JS implementation, but made available through this class, is the special value of `*` for the selector to return every computed property as CSSStyleDeclaration[[MDN]](https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleDeclaration) object.

This is a little more performant, than calling `DOM.getCSS` for each property, if you need to handle multiple values of the same element.

```javascript
const props = DOM.getCSS("#myElement", "*");

console.log(props.getPropertyValue("width"));
console.log(props.getPropertyValue("height"));
console.log(props.getPropertyValue("color"));
```

By default, this returns a string, but in most cases you probably want the computed value as number to do your own calculations with.

For those cases we have `DOM.getCSSInt(selector, property, pseudoElement)` and `DOM.getCSSFloat(selector, property, pseudoElement)` which return (as the names suggest) integers or floats/decimals of the wanted property.

All of these functions will return `null`, if no matching element was found, or an empty string, if the requested property is not set on the element.

# MediaElements and sources
Another pretty common task for widgets is changing an overlays media, like images, audio or videos.

We'll call these 3 types of elements `MediaElements` from here on. (Even though technically only audio- and video-tags are considered HTMLMediaElements [[MDN]](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement))

Most media-actions (like changing the play-state) can be performed directly on the element:

```javascript
// Changing play-state of a video can be done directly on the returned element of DOM.find.
let video = DOM.find("#myVideo");
if(DOM.isVideoElement(video)) // Making sure we got a video-element
{
  video.play();
  video.pause();
  video.stop();
}

// For audio it's basically the same
let audio = DOM.find("#myAudio");
if(DOM.isAudioElement(audio)) // Making sure we got an audio-element
{
  audio.play();
  audio.pause();
  audio.stop();
}
```
Not used in the example, but also available are `DOM.isImageElement(node)` for img- & picture-elements and `DOM.isMediaElement(node)` for any of those media-elements.

For more specific or precise actions we have `DOM.setVolume(selector, volume)` and `DOM.updateSrc(selector, newSrc, type)`.

```javascript
// setVolume expects the new percentage value as integer and not as float like the volume attribute
DOM.setVolume("#myAudio, #myVideo", 50);

// is a shorter form of
let audio = DOM.find("#myAudio");
if(DOM.isAudioElement(audio)) { audio.volume = 0.5; }

let video = DOM.find("#myVideo");
if(DOM.isVideoElement(video)) { video.volume = 0.5; }
```

Updating the src attribute of MediaElements can usually be a bit tricky, but hopefully `DOM.updateSrc` makes handling this easier.

As a little background info: Sources can be defined in multiple ways in HTML.

```html
<!-- Images (Old way) -->
<img id="myImage" src="path/to/source.jpg" alt="" />

<!-- Images (New way) -->
<picture id="myImage">
  <source srcset="path/to/small_source.jpg"  media="(min-width: 640px)">
  <source srcset="path/to/medium_source.jpg" media="(min-width: 1280px)">
  <source srcset="path/to/large_source.jpg"  media="(min-width: 1920px)">
  <img src="path/to/fallback_source.jpg" alt="" />
</picture>

<!-- Audio (Old way) -->
<audio id="myAudio" src="path/to/source.mp3" controls></audio>

<!-- Audio (New way) -->
<audio id="myAudio">
  <source src="path/to/source.mp3" type="audio/mp3">
  <source src="path/to/source.ogg" type="audio/ogg">
</audio>

<!-- Videos (Old way) -->
<video id="myVideo" src="path/to/source.mp4" controls></video>

<!-- Videos (New way) -->
<video id="myVideo" controls>
  <source src="path/to/source.webm" type="video/webm">
  <source src="path/to/source.mp4"  type="video/mp4">
</video>
```

The "old ways" here don't necessarily mean outdated. They are just a fallback to support older browsers, but will still work in newer ones.

The concept behind `<source>` tags is to give browsers more options in dealing with supported media-files and is an optional best practice.

So, in the context of widgets you probably won't need them, but for real-world websites you should definitely get used to the concept.

That said `DOM.updateSrc` is designed to support both, so it doesn't matter which way you choose.

```javascript
// Will only update the source of type audio/mpeg. (New way)
DOM.updateSrc("#myAudio", "path/to/new/source.mp3", "audio/mpeg");

// Will update the src attribute on the audio-tag directly, without affecting any source-tags. (Old way)
DOM.updateSrc("#myAudio", "path/to/new/source.mp3");
```

# Attributes & Data

For now, we had a lof of helper functions to deal with specific attributes in special cases, but don't worry we also have more general ways to work with any attribute.

`DOM.hasAttr(selector, attrName)`, `DOM.getAttr(selector, attrName)`, `DOM.setAttr(selector, attrName, attrValue)` and `DOM.remAttr(selector, attrName)`.

They should be pretty self-explanatory, but we can still show some examples.

```javascript
// HTML before: <a href="https://example.com" title="Default title text" alt="">my cool link</a>
DOM.hasAttr("#myElement", "title"); // returns true
DOM.getAttr("#myElement", "title"); // returns "Default title text"

DOM.setAttr("#myElement", "title", "New title text");
// HTML after: <a href="https://example.com" title="New title text" alt="">my cool link</a>

DOM.remAttr("#myElement", "title");
// HTML after: <a href="https://example.com" alt="">my cool link</a>
```

Another special kind of attributes are data-attributes which can hold any arbitrary information as string without being evaluated.

The functions for these are almost identical to the ones from above:

`DOM.hasDataAttr(selector, dataName)`, `DOM.getDataAttr(selector, dataName)`, `DOM.setDataAttr(selector, dataName, dataValue)` and `DOM.remDataAttr(selector, dataName)`.

HTML elements can save multiple data-attributes at once and they can even be used as selectors.

```html
<div id="example1" data-color="red"   data-amount="1" data-text="example text"></div>
<div id="example2" data-color="green" data-amount="2" data-text="example text"></div>
<div id="example3" data-color="red"   data-amount="3" data-text="example text"></div>
<div id="example4" data-color="green" data-amount="4" data-text="example text"></div>
```

```javascript
// This will set the data-color attribute of all divs with the current value of red to green.
DOM.setDataAttr('div[data-color="red"]', "color", "green");

// You can also use the selector to get the value of another data-attribute on that element.
DOM.getDataAttr('div[data-amount="4"]', "color");// returns "green"
```

Keep in mind, that the returned type of data-attributes is always a string. Even if you stored an object or number.

```html
<div id="example1" data-object="{ 'a': 1, 'b': 2, 'c': 3 }"></div>
<div id="example2" data-number="42"></div>
```

```javascript
// You'll need to convert the object back to JSON to use it further.
const objString = DOM.getDataAttr('#example1', "object"); // returns "{ 'a': 1, 'b': 2, 'c': 3 }" as string
let obj = JSON.parse(objString); // parse it back to JSON
console.log(obj.a); // logs 1

const numberString = DOM.getDataAttr('#example2', "number"); // returns "42" as string
let num = parseInt(numberString); // or parseFloat(numberString) depending on what you need
```