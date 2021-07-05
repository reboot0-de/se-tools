The Events class was designed to make working with StreamElements events easier and eliminate a lot of boilerplate code.

**Currently only Twitch and StreamElements events are supported.**

This class will check if certain functions exist on the window and if so, execute and pass data to them.

# Listening For Events
Usually the listener nesting can get quite tricky, since one listener can account for multiple different events.

For example the `subscriber-latest` listener triggers either for a new subscription, a resub, a targeted gifted sub or community gifts with random receivers.

What the actual event was, is on you to determine.

So right now you would need something like this to do so:

```javascript
if(listener === 'subscriber-latest')
{
    if(event.amount === 1 && event.sender === undefined)
    {
      // New Subscriber
    }
    else if(event.amount > 1 && event.sender === undefined)
    {
      // Resub
    }
    else if(event.gifted && !event.isCommunityGift)
    {
      // Gifted Sub
    }
    else if(event.bulkGifted)
    {
      // Community Gift - Initial Announcement
    }
    else if(event.gifted && event.isCommunityGift)
    {
      // Community Gift - Individual Gift
    }
}
```

This is neither trivial to figure out nor easy to remember. (And this is just for the subscriber-listener)

We don't want this. We want an easier approach.

How about an event-listener syntax of `onEvent(data)`:

```javascript
function onResub(data)
{
    // Resub
}
```

Now that looks a lot cleaner, doesn't it?

We support this syntax for almost all events, so let's take a look at each of them.



## Twitch Events

## onSubscriber
This gets triggered on every new subscriber.

"New" as in: Has never been subscribed to the channel before.

```javascript
function onSubscriber(data)
{
    console.log(`${data.name} is our newest subscriber!`);
}
```

## onResub
This gets triggered everytime a viewer continues their subscription for (at least) another month.

These do not have to be consecutive months.

Even if some time passed since the user last subscribed to the channel, the next subscription will still be considered a resub.

```javascript
function onResub(data)
{
    console.log(`${data.name} resubscribed for ${data.amount} months!`);
}
```

## onSubGift
A SubGift is considered a targeted gifted subscription towards a single pre-determined user.

These are not part of SubBombs and have to be issued individually. (See `onCommunityGift` for gifts part of SubBombs)

```javascript
function onSubGift(data)
{
    console.log(`${data.sender} just gifted a subscription to ${data.name}!`);
}
```

## onSubBomb
SubBombs are triggered, when a user gifts one or more subscriptions to the community. The actual receivers are chosen randomly.

This specific event here only gets triggered on initiation and does not know who the receivers are.

Only the username of the gifter and the amount are known at this point in time. (See `onSubBombComplete` to also get the receivers)

This is useful for widgets, that want to be notified as fast as possible and don't need to process the receivers anyways.

```javascript
function onSubBomb(data)
{
    console.log(`${data.sender} just gifted ${data.amount} subs to the community!`);
}
```

## onSubBombComplete
This event only gets triggered **after** all random subs in a SubBomb were distributed to users.

Since distribution takes a variable amount of time on Twitch's side, this event can take some time to trigger.

However, the listener function for this, gets a second special parameter `receivers`, which is an array of usernames that got gifted a sub as part of the SubBomb.

```javascript
function onSubBombComplete(data, receivers)
{
    console.log(`${data.name} just gifted a sub to the following ${data.amount} people: ${receivers.join(', ')}`);
}
```

## onCommunityGift
CommunityGifts are singular gift events related to a SubBomb.

You can use this, if you want to handle each gift in a SubBomb individually.

```javascript
function onCommunityGift(data)
{
    console.log(`${data.sender} just gifted a sub to ${data.name} as part of their SubBomb!`);
}
```

## onHost
This gets triggered, when somebody hosts your channel.

However, due to some changes to the Twitch API some conditions have to be met to trigger this:

- The hosting channel has to be online and have at least 1+ viewer
- Auto-hosts also need to have at least 1+ viewer and have to come from a channel that just went offline

```javascript
function onHost(data)
{
    console.log(`${data.name} now hosts our channel for ${data.amount} viewers!`);
}
```

## onRaid
This gets triggered, when somebody raids your channel.

Raids do not need to meet certain conditions to trigger.

```javascript
function onRaid(data)
{
    console.log(`${data.name} just raided our channel with ${data.amount} raiders!`);
}
```

## onCheer
This gets triggered, when somebody cheers (uses Bits) on your channel.

Bits are a virtual currency by Twitch, which have to be bought with real money. One Bit is (roughly) equivalent to one cent.

```javascript
function onCheer(data)
{
    console.log(`${data.name} just cheered ${data.amount} Bits!`);
}
```

## onFollow
This gets triggered, when somebody follows your channel.

```javascript
function onFollow(data)
{
    console.log(`${data.name} just followed!`);
}
```

## onMessage
This gets triggered, when somebody writes something in your chat.

This event works a little different, as it gets its own [ChatMessage](./tutorial-ChatMessage.html) object as parameter.

Please take a look at the ChatMessage tutorial for more infos.

```javascript
function onMessage(message)
{
    console.log(`${message.username} wrote: ${message.text}`);
    // You can still access the original data object via the "raw" class property
    console.log(JSON.stringify(message.raw));
}
```

## onDeleteMessage
This gets triggered, when a single message in your chat gets deleted.

For more information, please take a look at the "Message Deletion" article in the [ChatMessage tutorial](./tutorial-ChatMessage.html).

```javascript
function onDeleteMessage(data)
{
    console.log(`A message with the ID ${data.msgId} just got deleted!`);
}
```

## onDeleteMessages
This gets triggered, when a user in your chat gets banned or timed out and hence their previous messages also get deleted.

For more information, please take a look at the "Message Deletion" article in the [ChatMessage tutorial](./tutorial-ChatMessage.html).

```javascript
function onDeleteMessages(data)
{
    console.log(`A chatter with the userID ${data.userId} just got banned or timeouted!`);
}
```

## StreamElements Events

## onTip
This gets triggered everytime somebody tips through your StreamElements tipping page.

```javascript
function onTip(data)
{
    console.log(`${data.name} just tipped ${Utils.formatCurrency(data.amount, "USD", "en-US")}!`);
}
```

_Bonus Tip_: `Utils.formatCurrency(amount, currencyCode, locale)` is an easy way of formatting amounts of money to your local/national notation.

The `currencyCode` parameter accepts any valid ISO 4217 currency code to format the amount to.

The `locale` parameter is optional and will be set by the browser if omitted.

This function will also remove trailing zeros if the amount is not a decimal. An amount of $20,00 would become $20, while $4,20 would stay $4,20.

## onWidgetLoad
This gets triggered, when the widget and document finished loading and necessary pieces of information (like data about widget and user) is available.

This only executes once, but changing values of custom fields will cause the widget to reload and hence trigger this again when ready.

For most widgets this is the main entry point for initialization logic.

For more details see: https://github.com/StreamElements/widgets/blob/master/CustomCode.md#on-widget-load

```javascript
function onWidgetLoad(obj)
{
    const data        = obj.detail.session.data;
    const recents     = obj.detail.recents;
    const currency    = obj.detail.currency;
    const channelName = obj.detail.channel.username;
    const apiToken    = obj.detail.channel.apiToken;
    const fieldData   = obj.detail.fieldData;
    
    console.log("Widget and document loaded!");
}
```

## onSessionUpdate
This gets triggered, whenever an event updates your current session-data.

However, this should not be used as a one-for-all solution`to handle events.

Use the corresponding listener functions for specific events instead and only use `onSessionUpdate`, when you need to update any top-* values of the current session.

For more details see: https://github.com/StreamElements/widgets/blob/master/CustomCode.md#on-session-update

`obj.detail.session` holds the same data as `obj.detail.session.data` in `onWidgetLoad(obj)` above.

```javascript
function onSessionUpdate(obj)
{
    const session = obj.detail.session;
    console.log("Session updated!");
}
```

## onBotCounter
This gets triggered, when the value of a Bot Counter changes.

```javascript
function onBotCounter(data)
{
    console.log(`Your counter named "${data.counter}" updated its value to: ${data.value}`);
}
```

## onWidgetButton
This gets triggered, when a custom button (defined in the fields of a custom widget) was pressed in the Overlay-Editor.

```javascript
function onWidgetButton(data)
{
    console.log(`Your button with the field ${data.field} and value ${data.value} just got clicked in the Overlay Editor!`);
}
```

## onKVStoreUpdate
Gets triggered, when the value of stored item in your key-value-store is updated. This can also be used across widgets.

This event here has nothing to do with store redemptions!

See https://github.com/StreamElements/widgets/blob/master/CustomCode.md#se-api for more details regarding the key-value-store.

```javascript
function onKVStoreUpdate(data)
{
    console.log(`Your kvstore-item with the key ${data.key} just got updated to: `, data.value);
}
```

## onEventSkip
Gets triggered, when the streamer clicks the "Skip alert" button in the top bar of their activity feed.

This event does not get a parameter passed.

```javascript
function onEventSkip()
{
    console.log(`Event skipped!`);
}
```

## onToggleSound
Gets triggered, when the streamer clicks the "Mute alerts" button in the top bar of their activity feed.

```javascript
function onToggleSound(data)
{
    console.log(`Alerts are now ${(data.muted) ? 'muted' : 'unmuted'}!`);
}
```

# Destructuring Parameters
In the previous code-examples we always had whole objects as parameters, but then only used 1-2 properties of it.

Also in a real-world example, we should probably also check if the property even exist on the object, so that they don't throw any errors and possibly break events.

In JavaScript, we have the so-called "destructuring assignment syntax"[[MDN]](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment), which allows us to isolate specific properties from an object in its own variable.

If you try to destructure properties, that do not exist on the object, the value of the variable will just be undefined (without throwing an error).

Keep in mind, that once you destructure a parameter, the original object will not be available in the scope anymore. Also, any non-destructured property will be lost as well.

```javascript
function onResub({ name, amount, iDontExist } = data)
{
    // This would for example just output "MyUsername just resubscribed for 42 months: undefined" without throwing an error
    console.log(`${name} just resubscribed for ${amount} months: ${iDontExist}`);
    // This won't work, since data is not available anymore.
    console.log(data.name);
}
```

For the sake of completeness we should also mention, that this works for arrays as well.

It is not as helpful there, as it is for objects, but it works.

```javascript
function onSubBombComplete({ sender, amount } = data, [first] = recipients)
{
    // This would for example output "SenderName just gifted 69 subs to the community and Username1 got the first one!"
    console.log(`${sender} just gifted ${amount} subs to the community and ${first} got the first one!`);
}
```

Again, this would discard all other recipients besides the first one.

So only use this feature, when you really just need specific values and don't care about the rest.


# Sender Correction
When you emulate events in the Overlay Editor, the provided values will most likely differ from the real (production) data.

To mitigate this, the Events class will automatically adjust the ``sender`` attribute for specific subscription events.

If you ever run into bugs or unintended behavior because of this, you can always disable the correction by calling ``window.Events.disableSenderCorrection()`` in your ``onWidgetLoad`` function.

NOTE: This only affects emulated events, not real data!