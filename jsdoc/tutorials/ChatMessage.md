The ChatMessage class will be automatically instanciated for every message you receive via `onMessage` and will be injected as first parameter.

It's a helper class to make dealing with commonly needed chat-message validations and actions easier.

Example usage:
```javascript
function onMessage(chatMessage)
{
  // class property
  console.log(chatMessage.renderedText);
  // class function
  console.log(chatMessage.isBroadcaster());
}
```

In the example above we used `chatMessage` as parameter name to show that the passed parameter is an instance of that class.
For the following code examples we will just shorten that name down to `message`, but this still refers to the same instance.

# Class properties
The class object has the following properties available:

| Property      | Type   | Description                                                               | Example                                                                                                                                                                                                                                                                                                          |
|---------------|--------|---------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
|badges         | Array  | An array with information for every badge the user has currently on show  | `[{ "type": "subscriber", "version": "3030", "url": "https://static-cdn.jtvnw.net/badges/v1/249a40ef-4f49-49de-a847-df2f432e8fdc/3", "description": "2.5-Year Subscriber" }]"`                                                                                                                                   |
|badgeInfo      | string | A more detailed badge-info string with the amount of months subscribed    | `"subscriber/35"`                                                                                                                                                                                                                                                                                                |
|channel        | string | The channel this message was sent in                                      | `"reboot0"`                                                                                                                                                                                                                                                                                                      |
|customRewardId | string | This is either the customRewardId for channel point redemptions or `null` | `"1234abcd-26ec-420d-af12-ff8790cb5094"`                                                                                                                                                                                                                                                                         |
|emotes         | Array  | An array with information for every emote that was used in the message    | `[{ "type": "twitch", "name": "PogChamp", "id": "305954156", "gif": false, "urls": { "1": "https://static-cdn.jtvnw.net/emoticons/v1/305954156/1.0", "2": "https://static-cdn.jtvnw.net/emoticons/v1/305954156/1.0", "4": "https://static-cdn.jtvnw.net/emoticons/v1/305954156/3.0" }, "start": 5, "end": 12 }]` |
|msgId          | string | The unique ID of the message. Can be used for moderation                  | `"1234abcd-17da-4462-9999-b9fa7c2e59cf"`                                                                                                                                                                                                                                                                         |
|raw            | Object | This contains an unprocessed copy of the original message object          | [MessageEvent](./module-Events.html#~MessageEvent)                                                                                                                                                                                                                                                               |
|renderedText   | string | The pre-rendered content of the message. Contains HTML-tags               | `"Nice <img src="https://static-cdn.jtvnw.net/emoticons/v1/305954156/1.0" srcset="https://static-cdn.jtvnw.net/emoticons/v1/305954156/1.0 1x, https://static-cdn.jtvnw.net/emoticons/v1/305954156/1.0 2x, https://static-cdn.jtvnw.net/emoticons/v1/305954156/3.0 4x" title="PogChamp" class="emote">"`          |
|roles          | Object | An object with boolean values for each possible user-role in the channel  | `{ staff: false, broadcaster: true, moderator: false, vip: false, subscriber: true  }`                                                                                                                                                                                                                           |
|text           | string | The plain-text content of the message                                     | `"Nice PogChamp"`                                                                                                                                                                                                                                                                                                |
|time           | Date   | A Date object referring to the time the message was sent                  | A [Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date) instance                                                                                                                                                                                                         |
|userId         | string | The unique ID of the message's sender                                     | `"123456789"`                                                                                                                                                                                                                                                                                                    |
|username       | string | The username of the message's sender. Capitalization may vary             | `"SenderName"`                                                                                                                                                                                                                                                                                                   |

# Text Operations
The most basic action for chat-widgets is to "just" display the text of the message.

Now, one could assume to just set the `text` property as content and be done with it, but that is just the plain-text. No emotes, bits or other special characters are parsed there.

That's what the `renderedText` property is for. This already contains the parsed HTML-markup for the messages body.

(`renderedText` is actually not new and already part of the current StreamElements message data-object. A lot of people just didn't know about it and now it's placed a little more prominently.)

In short: If you need the plain-text content of a message use `text` and if you need the HTML content use `renderedText` instead.

In addition to that, we also offer a few functions to perform various text operations on the messages content.

For example, if you need to check if the message contains any specific words or phrases, you can either use `contains(text, caseSensitive)` for simple text searches or `containsRegex(regex, flags)` for more complex regular expression searches.

The `regex` parameter has to be a string and can not be an inline expression. The default value for the `flags` parameter is `"i"`.

By default, both functions use case-insensitive flags for their searches to deliver more reliable results.

Also keep in mind that `contains(text, caseSensitive)` also returns true for matches inside of words. For word boundaries you'll need regular expressions.

```javascript
// Let's say the message looks like this
message.text = "haHAA you're so funny";

// This returns true, since haha is part of haHAA in case-insensitive searches (hahaa).
message.contains("haha");

// If you want to match the emote, you can set the second parameter to true.
// This will only return true for haHAA, but not for lower-case versions.
message.contains("haHAA", true);

// For more complex rules you could use regular expressions
// Like, finding the first word with at least 2 letters, starting with an f and is not part of any other word:
message.containsRegex("\bf[a-z]+\b"); // this would match "funny" and therefore return true

// To match every case-sensitive LUL in a message you could use
message.containsRegex("\bLUL\b", "g"); // LUL is not part of the message, so this returns false
```

Another frequent task for text operations is checking if the message starts with a command and if so, which one.

For that we have `isCommand(cmdName)` and `getCommand(withArgs)`.

The `cmdName` parameter in `isCommand()` is optional and can be used to check for specific commands. If omitted, this returns true for any command.

`getCommand()` on the other hand, returns the used command (if any was used) and can even return the commands arguments. The `withArgs` parameter defaults to false though.

When using `isCommand()` it doesn't matter if you write `cmdName` with a leading `!` or not.

However, the result of `getCommand()` will always be the name without the leading `!`.

```javascript
message.text = "!test 1 2 @user";

// Returns true, since any command will match
message.isCommand();
// Returns false. Also, it doesn't matter if you put "watchtime" or "!watchtime" here.
message.isCommand("watchtime");

// Returns "test". No leading ! will be included here.
message.getCommand();
// Returns { "command": "test", "args": ["1", "2", "@user"] }
message.getCommand(true);
```

# Roles
In most cases you probably also want to know the role of the messages author.

The most flexible function to check for roles is `hasRole(role)`, as it can be used dynamically and also supports some aliases.

```javascript
// Both will work for broadcasters
message.hasRole("broadcaster");
message.hasRole("streamer");

// Both will work for moderators
message.hasRole("moderator");
message.hasRole("mod");

// Both will work for subscribers
message.hasRole("subscriber");
message.hasRole("sub");
```

For more direct checks you could also use `isBroadcaster()`, `isModerator()`, `isVIP()`, `isSubscriber()` and `isStaff()`.

These however do not allow for aliases, so `isStreamer()` will not work.

If you have some custom logic for role combinations, you can use the `roles` property to get an object with boolean values for every role.

# Badges
Similar to roles are badges. They can be earned by supporting the channel monetarily or display other Twitch-related benefits, like a Prime- or Turbo-membership.

To check for the latter, we have `hasPrimeBadge()` and `hasTurboBadge()`, but probably more interesting is information about subscriptions, bits and given gifts.

With `getTierBadge()` you can get the subscription-tier the user is currently subscribed as, as a number between 1-3. Prime subscriptions will also count as tier 1.

To get the total amount of months the user has been subscribed for, you can use `getMonthsSubscribed()`.

Bit and sub-gift badges behave a little differently, as they don't contain the accurate total amount and only return the last milestone badge they achieved.

So, if you call `getBitsBadge()` and you cheered a total amount of 123 Bits, the result will only state 100, as that is the last badge milestone you reached. (The next upgrade would be at 1000 Bits)

The same goes for `getGiftsBadge()`.

For a list of badge-levels, please refer to the official Twitch [help article](https://help.twitch.tv/s/article/twitch-chat-badges-guide?language=en_US#Subscription)

Keep in mind that the user has to have these badges on display to get a result.

If you cheer 10000 Bits, but decide to hide the badge in your settings, the returned value will wrongly state 0.

# Custom Rewards
Custom rewards are Twitch Channel Point redemptions and individually configurable by broadcasters.

To check if the message is a redemption, you can use `isCustomReward()` and then combine that with the property `customRewardId` to work with the actual ID.

```javascript
if(message.isCustomReward())
{
  // For example: "1234abcd-26ec-420d-af12-ff8790cb5094"
  console.log(message.customRewardId);
}
```

Custom rewards will get a random ID assigned which you'll have to figure out first.

# Actions
Actions are special chat-commands by Twitch.

The most notorious one is probably `/me` which used to allow users to write in color. Now it only displays the text in italic/cursive.

You can use `message.isAction()` to check for actions and handle them how you see fit.

# Stats
We also offer a special stats object which can be used for moderation purposes.

This can be generated via `getStats()` and has a structure of `{wordCount: number, emoteCount: number, emotePercentage: number, capsCount: number, capsPercentage: number, specialCharsCount: number, specialCharsPercentage: number}`.

The percentage values range between 0 (0%) and 1 (100%).

Emotes are also counted as words and might give some unexpected results for `capsPercentage`, since the lowercase letters in emotes might "neutralize" the uppercase letters in normal words.

Speaking of emotes, currently only official Twitch emotes are recognized by `emoteCount` & `emotePercentage`.

BTTV & FFZ emotes will just be treated as normal text and might cause some false-negatives.

Special chars contain every character that is not a number, a whitespace or a letter in the range of a-z (and uppercase).

Keep in mind, that emotes are treated as normal text and still count for special chars and uppercase letters. So a message with just `Kappa` would have a `capsPercentage` of 0.2, but an `emotePercentage` of 1.

Whitespaces however, are not counted towards percentages. For example, a message of `A  B  C` still has a `capsPercentage` of 1.

```javascript
message.text = "PogChamp WOW PogChamp WOW";

/* { wordCount: 4,  emoteCount:     2,    emotePercentage:   0.5,
     capsCount: 10, capsPercentage: 0.45, specialCharsCount: 0,   specialCharsPercentage: 0 } */
let stats = message.getStats();

     if(stats.emotePercentage > 0.75) { console.log("Stop spamming emotes"); }
else if(stats.capsPercentage  > 0.75) { console.log("Stop spamming caps");   }
```

These are just helper functions for a pretty strict moderation. Be careful with this, since this can easily flag legit messages.

# Message Deletion
When building your own chat-widget, you'll probably come across the problem of removing messages, that were deleted in your chat, from your screen.

This may seem a bit tricky at first, but it's actually pretty easy to solve.

Remember, that we get the unique `msgId` and `userId` property with every message.

So, if we put these as data-attributes we can use them as selectors later to easily target specific messages.

```html
<div class="message" data-msgId="myMessageId" data-userId="myUserId">
  <!-- Actual message HTML-markup goes here -->
</div>
```

With the above HTML-markup, we can listen for deletion events in our JavaScript and then hide the corresponding messages by setting them to `display: none;` via CSS;

```javascript
// A single message got deleted
function onDeleteMessage({msgId} = data)
{
  DOM.setCSSProp(`.message[data-msgId="${msgId}"]`, "display", "none");
}

// A user got timeouted or banned
function onDeleteMessages({userId} = data)
{
  DOM.setCSSProp(`.message[data-userId="${userId}"]`, "display", "none");
}
```

# Usernames
Many chat-widgets use a username filter-list to hide bot messages or maybe even certain people.

To make this easier, we implemented `notOnList(list)` which checks if the username is not on the given list.

We strongly advise you to only use this to filter out bot messages and not to strictly exclude people from your chat though.

However, if (for some reason) you ever need moderation on a username-level, we offer functions similar to message moderation.

Namely `usernameContains(text, caseSensitive)` and `usernameContainsRegex(regexString, flags)`.

They work exactly as their previously mentioned counterparts, but will of course check the username instead of the text.

```javascript
// This would return true on every name with "inappropriate" in it.
message.usernameContains("inappropriate");

// This would return true on every username with more than 5 numbers in it.
message.usernameContainsRegex("[0-9]{5,}");
```

For more basic checks, you can also use `hasUsername(name)` or `hasUserId(id)` if you need to exactly match names or IDs.

# Other helpers
There are other functions which are not as significant as the other functions, but might still be useful in some cases.

`getDisplayColor()` returns either the users set color or generates a new random hex-string. This will always return a color value.

`getWordList()` returns an array with every word that was used in the message.