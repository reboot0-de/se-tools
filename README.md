<img style="margin: auto; display: block; width: 700px;" src="https://reboot0-de.github.io/se-tools/images/logo_wide_purple.png" alt="StreamElements Logo" />
<div style="text-align: center; font-size: 32px; font-weight: bold;">Widget Tools</div>
<hr />
<p style="text-align: center; font-style: italic;">Supercharge your custom widgets and focus on the fun parts.</p>
<p style="text-align: center; font-style: italic;"><a href="https://github.com/reboot0-de/se-tools">GitHub Repo</a> | <a href="https://reboot0-de.github.io/se-tools/">Documentation</a></p>
<hr />

## Introduction
Nobody likes to copy & paste the same boilerplate code over and over, everytime they just want to test around in StreamElements custom widgets.

Or maybe you come from a more artistic background and feel overwhelmed by the required JavaScript knowledge to start building widgets.

That's where this library comes in. Just include it and let it do the heavy lifting, while you focus on the fun parts.

## Installation
You can include this in your HTML-Tab just like any other library.

```html
<script defer src="https://cdn.jsdelivr.net/gh/reboot0-de/se-tools@main/dist/se-tools.min.js"></script>
```

Make sure to not forget the `defer` attribute on the script-tag or else the script may not work properly.

**Also note:** This is currently in the beta testing phase. So please don't use this in production yet.

## Usage
Once the script is included, you'll have access to all the functions and classes.

The script will register itself to the window instance and auto-initialize its components.

The listener functions for events start with "on" followed by the event name in camel case syntax: `onEventName`

A list of all available events and their properties can be found in the [docs](https://reboot0-de.github.io/se-tools/tutorial-Events.html).

Handling new subscriptions would be shortened to just this:

```javascript
function onSubscriber(event)
{
  DOM.setText("#myAlertText", `${event.username} has subscribed!`);
}
```

You can even destruct parameters to limit the scope to only necessary properties:

```javascript
function onResub({username, amount} = event)
{
  DOM.setText("#myAlertText", `${username} has resubscribed for ${amount} months!`);
}
```

You may have noticed the `DOM.setText()` function in the examples above.

Yes, this lib also comes with some extra modules to (hopefully) make working with the StreamElements ecosystem as easy as possible.

A more in-depth explanation of all modules can also be found in the docs.

## Support
If you want to report a bug or have technical questions regarding this library, you can create an Issue on [GitHub](https://github.com/reboot0-de/se-tools).

For more general StreamElements development questions, you can join our [StreamElements Developers](https://strms.net/se_developers) server.

For non-development support questions, you can use the official [StreamElements Discord](https://discord.com/invite/se) server.

However, we won't offer support via personal messages.

## Building
In most cases, you just want to include the already compiled file without needing to build anything.

If you modified or added some code and want to recompile the output, you can use the following npm scripts:

- `npm run "generate docs"` - Generates & updates the documentation pages (locally).
- `npm run "build"` - Recompiles and minifies the modules to the final `dist/se-tools.min.js` JavaScript file.

## 3rd-Party Libraries
We use a modified version of the [clean-jsdoc-theme](https://github.com/ankitskvmdam/clean-jsdoc-theme) to generate and style the documentation.

It can be found under ``jsdoc/template`` and is not installed as npm package. (But 'jsdoc' is)

The template is a good starting point, but far from perfect. We'll update that as well over time.

We also use Babel and Webpack to compile the final script with these plugins:

- [babel-plugin-proposal-class-properties](https://babeljs.io/docs/en/babel-plugin-proposal-class-properties)
- [babel-plugin-proposal-private-methods](https://babeljs.io/docs/en/babel-plugin-proposal-private-methods)
- [babel-plugin-proposal-optional-chaining](https://babeljs.io/docs/en/babel-plugin-proposal-optional-chaining)