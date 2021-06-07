<img style="margin: auto; display: block; width: 100%; max-width: 600px;" src="https://reboot0-de.github.io/se-tools/images/logo_wide_purple.png" alt="StreamElements Logo" />
<div style="text-align: center; font-size: 26px; font-weight: bold;">Reboot0s Widget Tools</div>
<hr />
<p style="text-align: center; font-style: italic;">Supercharge your custom widgets and focus on the fun parts.</p>
<p style="text-align: center;"><a href="https://github.com/reboot0-de/se-tools">GitHub Repo</a> | <a href="https://reboot0-de.github.io/se-tools/">Documentation</a></p>
<p style="text-align: center; font-size: 18px; font-weight: bold;">This is a community-driven resource and no official product by StreamElements. <sup style="font-size: 10px;">Yet. <sub><img style="height: 18px;" src="https://static-cdn.jtvnw.net/emoticons/v1/2868/1.0" alt="MiniK" /></sub></sup></p>
<hr />

## Introduction
Nobody likes to copy & paste the same boilerplate code over and over, everytime they just want to test around in StreamElements custom widgets.

Or maybe you come from a more artistic background and feel overwhelmed by the required JavaScript knowledge to start building widgets.

That's where this library comes in. Just include it and let it do the heavy lifting, while you focus on the fun parts.

## Installation
You can include this in your HTML-markup just like any other library.

```html
<script defer src="https://reboot0.de/hosted/js/se-tools.min.js"></script>
```

Make sure to not forget the `defer` attribute on the script-tag or else the script may not work properly.

**Also note:** This is currently in the beta testing phase. So use this with that in mind and please report any issues you find.

## Usage
For a quick-start you can check out this preset example overlay with each event implemented:

[https://streamelements.com/dashboard/overlays/share/6025327a79af692b94ee6f44](https://streamelements.com/dashboard/overlays/share/6025327a79af692b94ee6f44)

Just include the script and you'll have access to all the functions and classes.

The script will register itself to the window instance and auto-initialize its components.

The listener functions for events start with "on" followed by the event name in camel case syntax: `onEventName`

A list of all available events and their properties can be found [here](https://reboot0-de.github.io/se-tools/tutorial-Events.html).

Handling new subscriptions would be shortened to just this:

```javascript
function onSubscriber(event)
{
  DOM.setText("#myAlertText", `${event.name} has subscribed!`);
}
```

You can even destruct parameters to limit the scope to only necessary properties:

```javascript
function onResub({name, amount} = event)
{
  DOM.setText("#myAlertText", `${name} has resubscribed for ${amount} months!`);
}
```

You may have noticed the `DOM.setText()` function in the examples above.

Yes, this lib also comes with some extra modules to (hopefully) make working with the StreamElements ecosystem as easy as possible.

A more in-depth explanation of all modules can also be found in the docs.

## Support
If you want to report a bug or have technical questions regarding this library, you can open a new issue on [GitHub](https://github.com/reboot0-de/se-tools/issues).

For more general StreamElements development questions, you can join the [SE Developers](https://strms.net/se_developers) server.

For non-development support questions you can use the official [StreamElements Discord](https://discord.com/invite/se) server.

However, none of these will offer support via personal/direct messages.

Not for support questions, but you could also follow me on my socials ([Twitter](https://twitter.com/reboot0), [Twitch](https://twitch.tv/reboot0) to stay up-to-date.

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