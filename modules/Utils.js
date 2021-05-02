/**
 * @module Utils
 * @since 1.0.0
 */
export default class Utils
{
  /**
   * Returns whether the parameter is neither undefined, an empty string nor null.
   *
   * The second parameter is an optional check for empty strings, in case you need to allow those in certain scenarios.
   * @param field {any} - The value you want to check.
   * @param {boolean} [noEmptyString=true] - If set to false, this will not check for empty strings.
   * @returns {boolean}
   * @static
   * @since 1.0.0
   */
  static isset(field, noEmptyString = true)
  {
    return (noEmptyString) ? (typeof field !== "undefined" && field !== null && field !== "") : (typeof field !== "undefined" && field !== null);
  }

  /**
   * Returns whether each parameter is neither undefined nor null.
   *
   * NOTE: This function does not allow for the noEmptyString parameter and will always check for empty strings.
   *
   * If you need to allow those, please chain the {@link Utils.isset} function in your code and use the parameter there.
   * @param fields {...any} - Various amount of parameters you want to check.
   * @returns {boolean}
   * @static
   * @since 1.0.0
   */
  static allset(...fields)
  {
    for(let field of fields)
    {
      if(!Utils.isset(field)) { return false; }
    }

    return true;
  }

  /**
   * Returns whether the given object path exists on the item.
   *
   * NOTE: The path has to be a string to prevent the browser from potentially throwing an error.
   *
   * Also the path should not start with the name of the base item.
   *
   * So, if you want to check if a.b.c would resolve, you would have to call resolve("b.c", a) instead of resolve("a.b.c", a).
   * @param path {string} - The path you want to check.
   * @param item {object} - The base object you want to run the check on.
   * @return {boolean}
   * @static
   * @since 1.0.0
   */
  static resolves(path, item)
  {
    let props = path.split('.');
    for(let prop of props)
    {
      if(item?.[prop] === undefined) return false;
      item = item[prop];
    }
    return true;
  }

  /**
   * Returns whether the given function name exists on the window.
   *
   * NOTE: The function has to directly exist on the window and can not be nested.
   * @param funcName {string} - The name of the function to check for. Has to be a string.
   * @returns {boolean}
   * @static
   * @since 1.0.0
   */
  static funcExists(funcName)
  {
    return (typeof window[funcName] !== "undefined");
  }

  /**
   * Checks whether a function exists on the window and then calls it with the passed parameters.
   *
   * NOTE: The function has to directly exist on the window and can not be nested.
   * @param funcName {string} - The name of the function to call. Has to be a string.
   * @param params {...any} - A various amount of parameters to pass to the function.
   * @static
   * @since 1.0.0
   */
  static callFunc(funcName, ...params)
  {
    if(Utils.funcExists(funcName)) { window[funcName](...params); }
  }

  /**
   * Removes spaces at the end & start of the string and replaces multiple consecutive spaces with only one.
   * @param text {string} - The string you want to remove whitespaces from.
   * @returns {string}
   * @static
   * @since 1.0.0
   */
  static trimSpaces(text)
  {
    if(!Utils.isset(text)) { return ""; }
    if(typeof text !== string) { text = text.toString(); }
    return text.replace(/\s{2,}/g, ' ').trim();
  }

  /**
   * Creates and returns a list (Array) from a comma-separated string, after removing whitespaces with {@link Utils.trimSpaces}.
   *
   * The splitter character can be changed for more flexibility. Defaults to a comma.
   * @param baseText {string} - The string you want to create a list from.
   * @param splitter {string} - The character you want to use as a separator for each entry.
   * @returns {string[]}
   * @static
   * @since 1.0.0
   */
  static createList(baseText, splitter = ',')
  {
    baseText = Utils.trimSpaces(baseText);
    return baseText.split(splitter)
  }

  /**
   * Generates and returns a random color as hex-string.
   * @returns {string}
   * @static
   * @since 1.0.0
   */
  static getRandomHexColor()
  {
    return `#${Utils.getRandomNumber(0, 255).toString(16)}${Utils.getRandomNumber(0, 255).toString(16)}${Utils.getRandomNumber(0, 255).toString(16)}`
  }

  /**
   * Generates and returns a random color as RGB-string.
   * @returns {string}
   * @static
   * @since 1.0.0
   */
  static getRandomRGBColor()
  {
    return `rgb(${Utils.getRandomNumber(0, 255)}, ${Utils.getRandomNumber(0, 255)}, ${Utils.getRandomNumber(0, 255)})`;
  }

  /**
   * Generates and returns a random color as RGBA-string.
   *
   * You can pass the alpha value as parameter.
   * @param {number} [alpha=1] - The decimal value for the alpha-channel (transparency) between 0 and 1.
   * @returns {string}
   * @static
   * @since 1.0.0
   */
  static getRandomRGBAColor(alpha = 1)
  {
    const a = (alpha >= 0 && alpha <= 1) ? alpha : 1;
    return `rgba(${Utils.getRandomNumber(0, 255)}, ${Utils.getRandomNumber(0, 255)}, ${Utils.getRandomNumber(0, 255)}, ${a})`;
  }

  /**
   * Generates and returns a random integer in the range of the given numbers.
   *
   * The parameter values are inclusive.
   *
   * So, calling `Utils.getRandomNumber(1, 3)` returns either 1, 2 or 3.
   * @param min {number} - Minimum value of the range.
   * @param max {number} - Maximum value of the range.
   * @returns {number}
   * @static
   * @since 1.0.0
   */
  static getRandomNumber(min, max)
  {
    return Math.floor((Math.random() + min) * (max + 1));
  }

  /**
   * Generates and returns a random decimal number in the range of the given numbers.
   *
   * The parameter values are inclusive.
   * @param min {number} - Minimum value of the range.
   * @param max {number} - Maximum value of the range.
   * @returns {number}
   * @static
   * @since 1.0.0
   */
  static getRandomDecimal(min, max)
  {
    return ((Math.random() + min) * (max + 1));
  }

  /**
   * Returns what percentage the first parameter is of the second.
   *
   * If you pass 10 and 50 you would get 0.2, since 10 is 20% of 50.
   * @param value {number}
   * @param percentageOf {number}
   * @returns {number}
   * @static
   * @since 1.0.0
   */
  static getPercentageOf(value, percentageOf)
  {
    return (value > 0 && percentageOf > 0) ? (value / percentageOf * 100) : 0;
  }

  /**
   * Returns whether the first parameter (dividend) is divisible by the second parameter (divisor) without remainder.
   *
   * Uses a modulo calculation internally.
   * @param dividend {number} - Dividend
   * @param divisor {number} - Divisor
   * @returns {boolean}
   * @static
   * @since 1.0.0
   */
  static divisibleBy(dividend, divisor)
  {
    return (divisor === 0) ? false : ((dividend % divisor) === 0);
  }

  /**
   * Returns whether the given number is a whole number (integer).
   *
   * This also includes negative numbers.
   *
   * E.g. 1 returns true, 1.5 returns false
   * @param number - The number to check
   * @returns {boolean}
   * @static
   * @since 1.0.0
   */
  static isWholeNumber(number)
  {
    return Utils.divisibleBy(number, 1);
  }

  /**
   * Returns the next iterator (`i+1`) or `0` if `i >= max`. Both i and max have to be positive numbers.
   *
   * Useful if you want to start over after iterating over an array via index.
   * @param i {number} - Current iterator value
   * @param max {number} - Max value the iterator value should not exceed
   * @returns {number}
   * @static
   * @since 1.0.0
   */
  static nextIterator(i, max)
  {
    return (i < 0 || max <= 0) ? 0 : (i % max);
  }

  /**
   * Formats timer numbers to always have 2 digits. So 3 becomes 03, but 11 remains unchanged.
   *
   * NOTE: This returns the new value as string and not as a number.
   * @param number {number} -
   * @return {string}
   */
  static formatTimerValue(number)
  {
    return (number >= 0 && number < 10) ? `0${number}` : number.toString();
  }

  /**
   * Returns whether the current browser is Chromium-based.
   * @returns {boolean}
   * @static
   * @since 1.0.0
   */
  static isChrome()
  {
    return Utils.matchesRegex(window.navigator.userAgent, "Chrom(e|ium)", "i");
  }

  /**
   * Returns the Chrome version as numeric value or 0, if either no version was found or the browser is not Chromium-based.
   * @param {boolean} [asString=false] - If set to true, the version will be returned as string instead.
   * @returns {number}
   * @static
   * @since 1.0.0
   */
  static getChromeVersion(asString = false)
  {
    const match = Utils.matchRegexGroups(window.navigator.userAgent, "Chrom(e|ium)\\/?<version>([0-9]+)", "i");
    const value = (match) ? match[2] : 0;
    return (asString) ? value.toString() : parseFloat(value);
  }

  /**
   * Returns whether the current window is inside of an OBS-BrowserSource.
   * @returns {boolean}
   * @static
   * @since 1.0.0
   */
  static isBrowserSource()
  {
    return Utils.isset(window.obsstudio);
  }

  /**
   * Converts a camel case string to kebab case. If no uppercase letter was found, this will just return the original string.
   *
   * E.g. the string "helloWorld" becomes "hello-world", but "helloworld" remains unchanged.
   * @param camelCase {string} - The camel case string you want to convert.
   * @returns {string}
   * @static
   * @since 1.0.0
   */
  static camelCaseToKebabCase(camelCase)
  {
    return camelCase.split('').map((l, i) => (l.toUpperCase() === l) ? `${(i > 0) ? '-' : ''}${l.toLowerCase()}` : l).join('');
  }

  /**
   * Converts a kebab case string to camel case. If no "-" character was found, this will just return the original string.
   *
   * E.g. the string "hello-world" becomes "helloWorld", but "helloworld" remains unchanged.
   * @param kebabCase {string} - The kebab case string you want to convert.
   * @return {string}
   * @static
   * @since 1.0.0
   */
  static kebabCaseToCamelCase(kebabCase)
  {
    return kebabCase.split('-').map((l, index) => (index) ? (l.charAt(0).toUpperCase() + item.slice(1).toLowerCase()) : l).join('');
  }

  /**
   * Formats the given number to a matching currency string.
   *
   * If the amount has no decimal places, only the number itself will be shown.
   *
   * E.g. 20.00 => 20€, but 4.2 => 4,20€. (Trailing zeros would normally be omitted)
   * @param {number} amount - The amount to format
   * @param {string} currencyCode - An ISO 4217 currency code. E.g. USD for $, EUR for €, RUB for ₽.
   * @param {string|undefined} [locale=undefined] - The locale code for your country. If this value is undefined, the browser will try setting the right value for you.
   * @returns {string}
   * @static
   * @since 1.0.0
   */
  static formatCurrency(amount, currencyCode, locale = undefined)
  {
    const minimumFractionDigits = Utils.isWholeNumber(amount) ? 0 : 2;
    return amount.toLocaleString(locale,{ style: 'currency', minimumFractionDigits, currency: currencyCode });
  }

  /**
   * Returns whether the text contains the given snippet.
   * @param text {string} - The text to check.
   * @param snippet {string} - The snippet to search for.
   * @param {boolean} [caseSensitive=false] - Determines if the check should be case-sensitive.
   * @return {boolean}
   * @static
   * @since 1.0.0
   */
  static containsText(text, snippet, caseSensitive = false)
  {
    return (Utils.allset(text, snippet)) ? ((caseSensitive && text.includes(snippet)) || text.includes(snippet?.toLowerCase())) : false;
  }

  /**
   * Returns whether the text matches the given regular expression and flags.
   * @param text {string} - The text to perform the RegExp on.
   * @param regexString {string} - The regular expression to check for.
   * @param {string} [flags="i"] - The flags to use. Defaults to case-insensitive (i).
   * @return {boolean}
   * @static
   * @since 1.0.0
   */
  static matchesRegex(text, regexString, flags = "i")
  {
    return (Utils.allset(text, regexString)) ? (new RegExp(regexString, flags)).test(text) : false;
  }

  /**
   * Tries to match the given RegExp groups to the text and returns the result as object.
   *
   * If no matches were found, this returns null.
   * @param text {string} - The text to perform the RegExp on.
   * @param regexString {string} - The regular expression to check for.
   * @param {string} [flags="i"] - The flags to use. Defaults to case-insensitive (i).
   * @return {object|null}
   * @static
   * @since 1.0.0
   */
  static matchRegexGroups(text, regexString, flags = "i")
  {
    const match = new RegExp(regexString).exec(this.badgeInfo);
    return (match?.groups) ? match.groups : null;
  }

  /**
   * Wrapper function for the default {@link https://github.com/StreamElements/widgets/blob/master/CustomCode.md#resumequeue-method-and-widgetduration-property|SE_API.resumeQueue()} function to ensure availability.
   *
   * Calling this will manually release the StreamElements queue hold-time, if a widget duration was set in the widgets fields.
   * @static
   * @since 1.0.0
   */
  static resumeSEQueue()
  {
    window.SE_API?.resumeQueue();
  }
}