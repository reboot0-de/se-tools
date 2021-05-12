/**
 * @module DOM
 * @since 1.0.0
 */
export default class DOM
{
  /**
   * Finds and returns the first matching Node in the document.
   *
   * Returns either an `Element` or `null` if nothing was found.
   * @param selector {string} - The selector can be any valid CSS-selector, but no Element.
   * @param {Element|null} [inElement=null] - You can pass an HTMLElement as second parameter to perform the query only on that element.
   * @returns {Element|null}
   * @static
   * @since 1.0.0
   */
  static find(selector, inElement = null)
  {
    return (inElement === null) ? document.querySelector(selector) : inElement.querySelector(selector);
  }

  /**
   * Finds and returns all matching Nodes in the document.
   *
   * Always returns a `NodeListOf<Element>`. If no matches were found, this list will be empty.
   * @param selector {string} - The selector can be any valid CSS-selector, but no Element.
   * @param {Element|null} [inElement=null] - You can pass an HTMLElement as second parameter to perform the query only on that element.
   * @returns {NodeList}
   * @static
   * @since 1.0.0
   */
  static findAll(selector, inElement = null)
  {
    return (inElement === null) ? document.querySelectorAll(selector) : inElement.querySelectorAll(selector);
  }

  /**
   * Finds and returns all matching Nodes in the document.
   *
   * Returns a `NodeListOf<Element>` or `null` if no matches were found.
   *
   * This is an alternative to {@see DOM.findAll}, in case you need the same return value on not-found selectors as {@see DOM.find}.
   * @param selector {string} - The selector can be any valid CSS-selector, but no Element.
   * @param inElement {Element|null} [inElement=null] - You can pass an HTMLElement as second parameter to perform the query only on that element.
   * @return {NodeList|null}
   * @static
   * @since 1.0.0
   */
  static findAllOrNull(selector, inElement = null)
  {
    const find = DOM.findAll(selector, inElement);
    return (find.length > 0) ? find : null;
  }

  /**
   * Finds the first matching `Element` for the selector and executes the given function with it as parameter.
   *
   * If no matching element was found, the function will not be executed.
   *
   * Make sure your given function expects the passed `Element` as parameter.
   * @param selector {string|Element} - The selector can either be a valid CSS-selector or a DOM-Element.
   * @param exec {function} - The function to execute with the found element as first parameter.
   * @static
   * @since 1.0.0
   */
  static onFirst(selector, exec)
  {
    const element = (DOM.isHTMLElement(selector)) ? selector : DOM.find(selector);
    if(element !== null) { exec(element); }
  }

  /**
   * Finds a matching `NodeListOf<Element>` for the selector and executes the given function with each `Element` in the list as parameter.
   *
   * These will execute after each other, not all of them at once.
   *
   * If no matches were found, the function will not be executed.
   *
   * Make sure your given function expects the passed `Element` as parameter.
   * @param selector {string|NodeList} - The selector can either be a valid CSS-selector or a DOM-Element.
   * @param exec {function} - The function to execute on each element.
   * @static
   * @since 1.0.0
   */
  static onEach(selector, exec)
  {
    const elements = (typeof selector === "string") ? DOM.findAll(selector) : selector;
    if(elements !== null)
    {
      for(let element of elements)
      {
        exec(element);
      }
    }
  }

  /**
   * Returns whether the passed Node is an HTMLElement.
   * @param node {Node} - The Node object to check. Can not be a selector.
   * @returns {boolean}
   * @static
   * @since 1.0.0
   */
  static isHTMLElement(node)
  {
    return (node?.nodeType === 1);
  }

  /**
   * Returns whether the passed Element is an audio element.
   * @param element {Element} - The Element to check. Can not be a selector.
   * @returns {boolean}
   * @static
   * @since 1.0.0
   */
  static isAudioElement(element)
  {
    return (DOM.isHTMLElement(element) && element.nodeName?.toLowerCase() === "audio");
  }

  /**
   * Returns whether the passed Element is an img element.
   * @param element {Element} - The Element to check. Can not be a selector.
   * @return {boolean}
   * @static
   * @since 1.0.0
   */
  static isImgElement(element)
  {
    return (DOM.isHTMLElement(element) && element.nodeName?.toLowerCase() === "img");
  }

  /**
   * Returns whether the passed Element is a picture element.
   * @param element {Element} - The Element to check. Can not be a selector.
   * @return {boolean}
   * @static
   * @since 1.0.0
   */
  static isPictureElement(element)
  {
    return (DOM.isHTMLElement(element) && element.nodeName?.toLowerCase() === "picture");
  }

  /**
   * Returns whether the passed Element is either an img or picture element.
   * @param element {Element} - The Element to check. Can not be a selector.
   * @returns {boolean}
   * @static
   * @since 1.0.0
   */
  static isImageElement(element)
  {
    return (DOM.isImgElement(element) || DOM.isPictureElement(element));
  }

  /**
   * Returns whether the passed Element is a video element.
   * @param element {Element} - The Element to check. Can not be a selector.
   * @returns {boolean}
   * @static
   * @since 1.0.0
   */
  static isVideoElement(element)
  {
    return (DOM.isHTMLElement(element) && element.nodeName?.toLowerCase() === "video");
  }

  /**
   * Returns whether the passed Element is any type of media-node. This can either be an image, a video or an audio element.
   *
   * Checks for {@link DOM.isAudioElement}, {@link DOM.isImageElement} and {@link DOM.isVideoElement} internally.
   * @param element {Element} - The Element to check.
   * @returns {boolean}
   * @static
   * @since 1.0.0
   */
  static isMediaElement(element)
  {
    return (DOM.isAudioElement(element) || DOM.isImageElement(element) || DOM.isVideoElement(element));
  }

  /**
   * Updates the src attribute for image, audio and video elements.
   *
   * If an element has multiple sources for different types defined, only the matching type will be updated.
   *
   * The most commonly used types are video/mp4, video/webm, audio/mpeg & audio/ogg depending on the type of media you want to change.
   *
   * If the media-type mismatches the element-type (e.g. you try to update an audio source to video/mpeg) the function will just exit without changing anything.
   * @param selector {string|Element} - The selector can either be a valid CSS-selector or a DOM-Element.
   * @param newSrc {string} - The new source URL for the element
   * @param {string} [type=""] - Can be set to only update the matching source tags.
   * @static
   * @since 1.0.0
   */
  static updateSrc(selector, newSrc, type = "")
  {
    const element = (DOM.isHTMLElement(selector)) ? selector : DOM.find(selector);

    if(DOM.isImgElement(element))     { DOM.updateImgSrc(element,     newSrc);       }
    else if(DOM.isPictureElement(element)) { DOM.updatePictureSrc(element, newSrc, type); }
    else if(DOM.isAudioElement(element))   { DOM.updateAudioSrc(element,   newSrc, type); }
    else if(DOM.isVideoElement(element))   { DOM.updateVideoSrc(element,   newSrc, type); }
  }

  /**
   * Updates the src attribute of an `<img>` directly.
   *
   * NOTE: This is part of the {@see DOM.updateSrc} function and should not be called outside of that, unless you validated the parameters yourself before.
   * @param element {Element} - The DOM-Element you want to update the source of.
   * @param newSrc {string} - The new source URL for the element
   * @static
   * @since 1.0.0
   */
  static updateImgSrc(element, newSrc)
  {
    if(element.src !== newSrc) { element.src = newSrc; }
  }

  /**
   * Updates the `<source>` children of a `<picture>` directly, depending on the given media-type.
   *
   * NOTE: This is part of the {@see DOM.updateSrc} function and should not be called outside of that, unless you validated the parameters yourself before.
   * @param element {Element} - The DOM-Element you want to update the source of.
   * @param newSrc {string} - The new source URL for the element
   * @param media {string} - Can be set, to only update the matching source tags.
   * @static
   * @since 1.0.0
   */
  static updatePictureSrc(element, newSrc, media = "")
  {
    const source = DOM.find((media === "") ? 'source' : `source[media='(${media})']`, element);
    if(source !== null)
    {
      if(source.srcset !== newSrc) { source.srcset = newSrc; }
    }
  }

  /**
   * Updates the `<source>` children of an `<audio>` directly, depending on the given media-type.
   *
   * NOTE: This is part of the {@see DOM.updateSrc} function and should not be called outside of that, unless you validated the parameters yourself before.
   * @param element {Element} - The DOM-Element you want to update the source of.
   * @param newSrc {string} - The new source URL for the element
   * @param type {string} - Can be set, to only update the matching source tags.
   * @static
   * @since 1.0.0
   */
  static updateAudioSrc(element, newSrc, type = "")
  {
    if(!Utils.isset(type, false) && !type.startsWith("audio/")) return;

    const source = DOM.find((type === "") ? 'source' : `source[type='${type}']`, element);
    if(source !== null && source.src !== newSrc)
    {
      source.src = newSrc;
    }
  }

  /**
   * Updates the `<source>` children of a `<video>` directly, depending on the given media-type.
   *
   * NOTE: This is part of the {@see DOM.updateSrc} function and should not be called outside of that, unless you validated the parameters yourself before.
   * @param element {Element} - The DOM-Element you want to update the source of.
   * @param newSrc {string} - The new source URL for the element
   * @param type {string} - Can be set, to only update the matching source tags.
   * @static
   * @since 1.0.0
   */
  static updateVideoSrc(element, newSrc, type = "")
  {
    if(!Utils.isset(type, false) && !type.startsWith("video/")) return;

    const source = DOM.find((type === "") ? 'source' : `source[type='${type}']`, element);
    if(source !== null && source.src !== newSrc)
    {
      source.src = newSrc;
    }
  }

  /**
   * Sets the volume for `<audio>` and `<video>` elements.
   * @param selector {string|Element} - The selector can either be a valid CSS-selector or a DOM-Element.
   * @param volume {number} - The volume should be a whole number between 0 and 100.
   * @static
   * @since 1.0.0
   */
  static setVolume(selector, volume)
  {
    const element = (DOM.isHTMLElement(selector)) ? selector : DOM.find(selector);
    if(DOM.isAudioElement(element) || DOM.isVideoElement(element))
    {
      element.volume = (volume / 100);
    }
  }

  /**
   * Adds one or more classes to the element(s) matching the selector.
   * @param selector {string|Element} - The selector can either be a valid CSS-selector or a DOM-Element.
   * @param newClass {string|string[]} - Can either be a string if you only want to add one class or an array if you want to add multiple.
   * @static
   * @since 1.0.0
   */
  static addClass(selector, newClass)
  {
    DOM.onEach(selector, function(elem)
    {
      if(Array.isArray(newClass))
      {
        elem.classList.add(...newClass);
      }
      else
      {
        elem.classList.add(newClass);
      }
    });
  }

  /**
   * Removes one or more classes from the element(s) matching the selector.
   * @param selector {string|Element} - The selector can either be a valid CSS-selector or a DOM-Element.
   * @param remClass {string|string[]} - Can either be a string, if you only want to remove one class, or an array if you want to remove multiple.
   * @static
   * @since 1.0.0
   */
  static removeClass(selector, remClass)
  {
    DOM.onEach(selector, function(elem)
    {
      if(Array.isArray(remClass))
      {
        elem.classList.remove(...remClass);
      }
      else
      {
        elem.classList.remove(remClass);
      }
    });
  }

  /**
   * Removes one or more classes from the element(s) matching the selector and then adds one or more classes afterwards.
   *
   * Shorter form of {@link DOM.removeClass} and {@link DOM.addClass} on the same element/selector.
   * @param selector {string|Element} - The selector can either be a valid CSS-selector or a DOM-Element.
   * @param remClass {string|string[]} - Can either be a string, if you only want to add one class, or an array if you want to add multiple.
   * @param newClass {string|string[]} - Can either be a string, if you only want to remove one class, or an array if you want to remove multiple.
   * @static
   * @since 1.0.0
   */
  static swapClass(selector, remClass, newClass)
  {
    DOM.removeClass(selector, remClass);
    DOM.addClass(selector, newClass);
  }

  /**
   * Finds the first matching element for the given selector and replaces the innerText with the text parameter.
   * @param selector {string|Element} - The selector can either be a valid CSS-selector or a DOM-Element.
   * @param text {string} - The new text to insert.
   * @static
   * @since 1.0.0
   */
  static setText(selector, text)
  {
    DOM.onEach(selector, function(elem) { elem.innerText = text; });
  }

  /**
   * Finds the first matching element for the given selector and replaces the innerHTML with the htmlString parameter.
   * NOTE: Only use this method if you need to render trusted HTML-content. For just names and user-generated messages, please use the {@link DOM.setText} function instead.
   * @param selector {string|Element} - The selector can either be a valid CSS-selector or a DOM-Element.
   * @param htmlString {string} - The new HTML to execute and insert.
   * @static
   * @since 1.0.0
   */
  static setHTML(selector, htmlString)
  {
    DOM.onEach(selector, function(elem) { elem.innerHTML = htmlString; });
  }

  /**
   * Returns either the computed CSS-property of the first matching element as string or null if no element was found.
   *
   * If you pass "*" as property, this function will return the whole CSSStyleDeclaration object instead
   *
   * NOTE: Most properties return a string of their value with the according unit.
   *
   * See {@link DOM.getCSSInt} or {@link DOM.getCSSFloat} if you want to return a numeric value.
   * @param selector {string|Element} - The selector can either be a valid CSS-selector or a DOM-Element.
   * @param property {string} - The property to return the computed value of.
   * @param {string|null} [pseudoElement=null] - Can be used to get properties of pseudo-elements like :after or :before.
   * @returns {string|CSSStyleDeclaration|null}
   * @static
   * @since 1.0.0
   */
  static getCSS(selector, property, pseudoElement = null)
  {
    const element = (DOM.isHTMLElement(selector)) ? selector : DOM.find(selector);

    if(!Utils.allset(selector, property)) { return null; }

    if(property === "*")       { return window.getComputedStyle(element, pseudoElement); }
    if(property.includes("-")) { property = Utils.kebabCaseToCamelCase(property);        }

    const value = window.getComputedStyle(element, pseudoElement);
    return (Utils.isset(value)) ? value.getPropertyValue(property) : null;
  }

  /**
   * Returns either the computed CSS-property of the first matching element as integer or null if no element was found.
   * @param selector {string|Element} - The selector can either be a valid CSS-selector or a DOM-Element.
   * @param property {string} - The property to return the computed value of.
   * @param pseudoElement - Can be used to get properties of pseudo-elements like :after or :before.
   * @returns {int|null}
   * @static
   * @since 1.0.0
   */
  static getCSSInt(selector, property, pseudoElement = null)
  {
    const element = (DOM.isHTMLElement(selector)) ? selector : DOM.find(selector);
    const css     =  DOM.getCSS(element, property, pseudoElement);
    return (Utils.isset(css)) ? parseInt(css) : null;
  }

  /**
   * Returns either the computed CSS-property of the first matching element as float/decimal or null if no element was found.
   * @param selector {string|Element} - The selector can either be a valid CSS-selector or a DOM-Element.
   * @param property {string} - The property to return the computed value of.
   * @param pseudoElement - Can be used to get properties of pseudo-elements like :after or :before.
   * @returns {float|null}
   * @static
   * @since 1.0.0
   */
  static getCSSFloat(selector, property, pseudoElement = null)
  {
    const element = (DOM.isHTMLElement(selector)) ? selector : DOM.find(selector);
    const css     =  DOM.getCSS(element, property, pseudoElement);
    return (Utils.isset(css)) ? parseFloat(css) : null;
  }

  /**
   * Sets the value for a given property on an matching element.
   *
   * The value should be a string with units and you can only change one property. To update multiple properties at once see {@link DOM.setCSS}.
   * @param selector {string|Element} - The selector can either be a valid CSS-selector or a DOM-Element.
   * @param property {string} - The property name you want to change.
   * @param value {string|number} - The property value you want to set.
   * @static
   * @since 1.0.0
   */
  static setCSSProp(selector, property, value)
  {
    DOM.onEach(selector, function(elem)
    {
      if(Utils.allset(elem?.style, property))
      {
        if(property.includes("-")) { property = Utils.kebabCaseToCamelCase(property); }
        elem.style[property] = value;
      }
    });
  }

  /**
   * Sets multiple CSS-properties on an matching element.
   *
   * The passed object should have the form of { "propName1": "newValueWithUnit", "prop2": "123px", ... }
   * @param selector {string|Element} - The selector can either be a valid CSS-selector or a DOM-Element.
   * @param cssObj {object} - The objects with key-value-pairs of properties you want to update.
   * @static
   * @since 1.0.0
   */
  static setCSS(selector, cssObj)
  {
    DOM.onEach(selector, function(elem)
    {
      for(let [prop, value] of Object.entries(cssObj))
      {
        if(Utils.allset(elem?.style, prop))
        {
          if(prop.includes("-")) { prop = Utils.kebabCaseToCamelCase(prop); }
          elem.style[prop] = value;
        }
      }
    });
  }

  /**
   * Returns whether the matching element has the given attribute defined.
   *
   * Returns true as long as it is defined, even if it is empty.
   * @param selector {string|Element} - The selector can either be a valid CSS-selector or a DOM-Element.
   * @param attrName {string} - Name of the attribute to check for.
   * @returns {boolean}
   * @static
   * @since 1.0.0
   */
  static hasAttr(selector, attrName)
  {
    const element = (DOM.isHTMLElement(selector)) ? selector : DOM.find(selector);
    return Utils.isset(element?.getAttribute(attrName));
  }

  /**
   * Gets the value of the specified attribute for a matching element.
   *
   * Returns undefined if the attribute doesn't exist.
   * @param selector {string|Element} - The selector can either be a valid CSS-selector or a DOM-Element.
   * @param attrName {string} - Name of the attribute to get.
   * @returns {any}
   * @static
   * @since 1.0.0
   */
  static getAttr(selector, attrName)
  {
    const element = (DOM.isHTMLElement(selector)) ? selector : DOM.find(selector);
    return element?.getAttribute(attrName);
  }

  /**
   * Sets the value of the specified attribute for every matching element.
   *
   * If the attribute didn't exist before it will be added, else updated.
   * @param selector {string|Element} - The selector can either be a valid CSS-selector or a DOM-Element.
   * @param attrName {string} - Name of the attribute to set.
   * @param attrValue {string|number} - New value of the attribute.
   * @static
   * @since 1.0.0
   */
  static setAttr(selector, attrName, attrValue)
  {
    DOM.onEach(selector, function(element) { element?.setAttribute(attrName, attrValue); })
  }

  /**
   * Removes the given attribute of every element matching the selector.
   * @param selector {string|Element} - The selector can either be a valid CSS-selector or a DOM-Element.
   * @param attrName {string} - Name of the attribute to remove.
   * @static
   * @since 1.0.0
   */
  static remAttr(selector, attrName)
  {
    DOM.onEach(selector, function(element) { element?.removeAttribute(attrName); })
  }

  /**
   * Returns whether the element has the given data-attribute.
   *
   * Returns true as long as the name is defined, even if it is empty.
   * @param selector {string|Element} - The selector can either be a valid CSS-selector or a DOM-Element.
   * @param dataName {string} - Name of the data-attribute to check for.
   * @returns {boolean}
   * @static
   * @since 1.0.0
   */
  static hasDataAttr(selector, dataName)
  {
    const element = (DOM.isHTMLElement(selector)) ? selector : DOM.find(selector);
    return Utils.isset(element?.dataset?.[dataName], false);
  }

  /**
   * Gets the value of the specified data-attribute on matching elements.
   *
   * Returns undefined, if the attribute doesn't exist.
   * @param selector {string|Element} - The selector can either be a valid CSS-selector or a DOM-Element.
   * @param dataName {string} - Name of the data-attribute to get.
   * @returns {string|undefined}
   * @static
   * @since 1.0.0
   */
  static getDataAttr(selector, dataName)
  {
    const element = (DOM.isHTMLElement(selector)) ? selector : DOM.find(selector);
    return element?.dataset?.[dataName];
  }

  /**
   * Sets the value for the specified data-attribute on matching elements.
   *
   * If the data-attribute didn't exist before it will be added, else updated.
   * @param selector {string|Element} - The selector can either be a valid CSS-selector or a DOM-Element.
   * @param dataName {string} - Name of the data-attribute to set.
   * @param dataValue {string} - New value of the data-attribute.
   * @static
   * @since 1.0.0
   */
  static setDataAttr(selector, dataName, dataValue)
  {
    const element = (DOM.isHTMLElement(selector)) ? selector : DOM.find(selector);
    element.dataset[dataName] = dataValue;
  }

  /**
   * Removes the specified data-attribute of matching elements.
   * @param selector {string|Element} - The selector can either be a valid CSS-selector or a DOM-Element.
   * @param dataName {string} - Name of the data-attribute to remove.
   * @static
   * @since 1.0.0
   */
  static remDataAttr(selector, dataName)
  {
    const element = (DOM.isHTMLElement(selector)) ? selector : DOM.find(selector);
    if(element?.dataset[dataName] !== undefined) { delete element.dataset[dataName]; }
  }
}