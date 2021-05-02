import Utils from './Utils';
import ChatMessage from "./ChatMessage";

/**
 * @module Events
 * @since 1.0.0
 */

/**
* @typedef {object} SubscriberEvent
* @property {string} _id
* @property {string} name
* @property {number} amount
* @property {string} tier
* @property {boolean} sessionTop
* @property {string} type
* @property {string} originalEventName
 */

/**
 * @typedef {object} ResubEvent
 * @property {string} _id
 * @property {string} name
 * @property {number} amount
 * @property {string} tier
 * @property {string} message
 * @property {boolean} sessionTop
 * @property {string} type
 * @property {string} originalEventName
 */

/**
 * @typedef {object} SubGiftEvent
 * @property {string} _id
 * @property {string} name
 * @property {number} amount
 * @property {string} tier
 * @property {string} message
 * @property {string} sender
 * @property {boolean} gifted
 * @property {boolean} sessionTop
 * @property {string} type
 * @property {string} originalEventName
 */

/**
 * @typedef {object} SubBombEvent
 * @property {string} _id
 * @property {string} name
 * @property {number} amount
 * @property {number} count
 * @property {string} tier
 * @property {string} message
 * @property {string} sender
 * @property {boolean} bulkGifted
 * @property {boolean} sessionTop
 * @property {string} type
 * @property {string} originalEventName
 */

/**
 * @typedef {object} CommunityGiftEvent
 * @property {string} _id
 * @property {string} name
 * @property {number} amount
 * @property {number} count
 * @property {string} tier
 * @property {string} message
 * @property {string} sender
 * @property {boolean} gifted
 * @property {boolean} isCommunityGift
 * @property {boolean} playedAsCommunityGift
 * @property {boolean} sessionTop
 * @property {string} type
 * @property {string} originalEventName
 */

/**
 * @typedef {object} FollowEvent
 * @property {string} _id
 * @property {string} name
 * @property {boolean} sessionTop
 * @property {string} type
 * @property {string} originalEventName
 */

/**
 * @typedef {object} TipEvent
 * @property {string} _id
 * @property {string} name
 * @property {number} amount
 * @property {string} message
 * @property {boolean} sessionTop
 * @property {string} type
 * @property {string} originalEventName
 */

/**
 * @typedef {object} CheerEvent
 * @property {string} _id
 * @property {string} name
 * @property {number} amount
 * @property {string} message
 * @property {boolean} sessionTop
 * @property {string} type
 * @property {string} originalEventName
 */

/**
 * @typedef {object} RaidEvent
 * @property {string} _id
 * @property {string} name
 * @property {number} amount
 * @property {boolean} sessionTop
 * @property {string} type
 * @property {string} originalEventName
 */

/**
 * @typedef {object} HostEvent
 * @property {string} _id
 * @property {string} name
 * @property {number} amount
 * @property {boolean} sessionTop
 * @property {string} type
 * @property {string} originalEventName
 */

/**
* @typedef {object} MessageEvent
* @property {string} service
* @property {string} renderedText
* @property {object} data
* @property {number} data.time
* @property {object} data.tags
* @property {string} data.tags.badge-info
* @property {string} data.tags.badges
* @property {string} data.tags.client-nonce
* @property {string} data.tags.color
* @property {string} data.tags.display-name
* @property {string} data.tags.emotes
* @property {string} data.tags.flags
* @property {string} data.tags.id
* @property {string} data.tags.mod
* @property {string} data.tags.room-id
* @property {string} data.tags.subscriber
* @property {number} data.tags.tmi-sent-ts
* @property {string} data.tags.turbo
* @property {string} data.tags.user-id
* @property {string} data.tags.user-type
* @property {string} data.nick
* @property {string} data.userId
* @property {string} data.displayName
* @property {string} data.displayColor
* @property {Array<object>} data.badges
* @property {string} data.badges.type
* @property {string} data.badges.version
* @property {string} data.badges.url
* @property {string} data.badges.description
* @property {string} data.channel
* @property {string} data.text
* @property {boolean} data.isAction
* @property {Array<object>} data.emotes
* @property {string} data.emotes.type
* @property {string} data.emotes.name
* @property {string} data.emotes.id
* @property {boolean} data.emotes.gif
* @property {object} data.emotes.urls
* @property {number} data.emotes.start
* @property {number} data.emotes.end
* @property {string} data.msgId
*/

/**
 * @typedef {object} DeleteMessageEvent
 * @property {string} msgId
 */

/**
 * @typedef {object} DeleteMessagesEvent
 * @property {string} userId
 */

/**
 * @typedef {object} BotCounterEvent
 * @property {string} counter
 * @property {number} value
 */

/**
 * @typedef {object} KVStoreUpdateEvent
 * @property {string} key
 * @property {object} value
 */

/**
 * @typedef {object} WidgetButtonEvent
 * @property {string} listener
 * @property {string} field
 * @property {string} value
 */

/**
 * @typedef {object} ToggleSoundEvent
 * @property {boolean} muted
 */

export default class Events
{
  #skippable;
  #giftCollection;
  #expectedEventListeners;
  #expectedEventNames;
  #expectsOnWidgetLoad;
  #expectsOnSessionUpdate;

  constructor()
  {
    this.#skippable              = ["bot:counter", "event:test", "event:skip", "message", "kvstore:update", "alertService:toggleSound"];
    this.#giftCollection         = {}; /* { "Username1": { amount: 5, recipients: ["a", "b", "c", "d", "e"] }, ... } */
    this.#expectedEventListeners = [];
    this.#expectedEventNames     = [];
    this.#expectsOnWidgetLoad    = Utils.funcExists('onWidgetLoad');
    this.#expectsOnSessionUpdate = Utils.funcExists('onSessionUpdate');

    this.preflightEventListeners()
    this.registerOnWidgetLoad();
    this.registerOnSessionUpdate();
    this.registerOnEventReceived();
  }

  /**
   * Checks which listener-functions are set on the window and adds them to the corresponding expectedEvents array.
   * @since 1.0.0
   */
  preflightEventListeners()
  {
    const events = [{ name: "Subscriber",    listener: "subscriber-latest"        }, { name: "Resub",          listener: "subscriber-latest" }, { name: "SubGift",         listener: "subscriber-latest" },
                    { name: "CommunityGift", listener: "subscriber-latest"        }, { name: "SubBomb",        listener: "subscriber-latest" }, { name: "SubBombComplete", listener: "subscriber-latest" },
                    { name: "Tip",           listener: "tip-latest"               }, { name: "Cheer",          listener: "cheer-latest"      }, { name: "Host",            listener: "host-latest"       },
                    { name: "Raid",          listener: "raid-latest"              }, { name: "Follow",         listener: "follower-latest"   }, { name: "Message",         listener: "message"           },
                    { name: "DeleteMessage", listener: "delete-message"           }, { name: "DeleteMessages", listener: "delete-messages"   }, { name: "EventSkip",       listener: "event:skip"        },
                    { name: "BotCounter",    listener: "bot:counter"              }, { name: "WidgetButton",   listener: "event:test"        }, { name: "KVStoreUpdate",   listener: "kvstore:update"    },
                    { name: "ToggleSound",   listener: "alertService:toggleSound" }];

    for(let event of events)
    {
      if(Utils.funcExists(`on${event.name}`))
      {
        if(!this.expectsEventListener(event.listener))
        {
          this.#expectedEventListeners.push(event.listener);
        }
        this.#expectedEventNames.push(event.name);
      }
    }
  }

  /**
   * Returns whether the window expects any `onEventReceived` events.
   * @returns {boolean}
   * @since 1.0.0
   */
  expectsEvents()
  {
    return (this.#expectedEventNames.length > 0);
  }

  /**
   * Returns whether the window expects an event for the specified listener.
   * @param listener {string} - The event-listener to check for.
   * @returns {boolean}
   * @since 1.0.0
   */
  expectsEventListener(listener)
  {
    return (this.#expectedEventListeners.includes(listener));
  }

  /**
   * Returns whether the window expects an event for the specified name.
   * @param name {string} - The event-name to check for.
   * @returns {boolean}
   * @since 1.0.0
   */
  expectsEventName(name)
  {
    return (this.#expectedEventNames.includes(name));
  }

  /**
   * Returns whether the given event would not get queued by the StreamElemens API.
   * @param event {string} - The event-name to check for.
   * @returns {boolean}
   * @since 1.0.0
   */
  isSkippable(event)
  {
    return this.#skippable.includes(event);
  }

  /**
   * Registers the `onWidgetLoad` listener, if the `onWidgetLoad` function was set on the window.
   * @since 1.0.0
   */
  registerOnWidgetLoad()
  {
    if(this.#expectsOnWidgetLoad) { window.addEventListener('onWidgetLoad', this.onWidgetLoadHandler.bind(this)); }
  }

  /**
   * Unregisters the onEventReceived listener.
   * @since 1.0.0
   */
  unregisterOnWidgetLoad()
  {
    window.removeEventListener('onWidgetLoad', this.onWidgetLoadHandler);
  }

  /**
   * Registers the onSessionUpdate listener, if the onSessionUpdate function was set on the window.
   * @since 1.0.0
   */
  registerOnSessionUpdate()
  {
    if(this.#expectsOnSessionUpdate) { window.addEventListener('onSessionUpdate', this.onSessionUpdateHandler.bind(this)); }
  }

  /**
   * Unregisters the `onSessionUpdate` listener.
   * @since 1.0.0
   */
  unregisterOnSessionUpdate()
  {
    window.removeEventListener('onSessionUpdate', this.onSessionUpdateHandler);
  }

  /**
   * Registers the `onEventReceived` listener, if any event is expected.
   * @since 1.0.0
   */
  registerOnEventReceived()
  {
    if(this.expectsEvents()) { window.addEventListener('onEventReceived', this.onEventReceivedHandler.bind(this)); }
  }

  /**
   * Unregisters the `onEventReceived` listener.
   * @since 1.0.0
   */
  unregisterOnEventReceived()
  {
    window.removeEventListener('onEventReceived', this.onEventReceivedHandler);
  }

  /**
   * Handles and forwards the 'onWidgetLoad' event-data to window.onWidgetLoad.
   * @param obj {object} - The proxied obj parameter of the original onWidgetLoad event
   * @since 1.0.0
   */
  onWidgetLoadHandler(obj)
  {
    Utils.callFunc("onWidgetLoad", obj?.detail);
  }

  /**
   * Handles and forwards the 'onSessionUpdate' event data to window.onSessionUpdate.
   * @param obj {object} - The proxied obj parameter of the original onSessionUpdate event
   * @since 1.0.0
   */
  onSessionUpdateHandler(obj)
  {
    Utils.callFunc("onSessionUpdate", obj?.detail?.session);
  }

  /**
   * Handles the 'onEventReceived' event and forwards the data parameter to the corresponding handler.
   * This function auto-determines which handler should be called, based on the provided data object.
   * @param obj {object} - The proxied obj parameter of the original onEventReceived event
   * @since 1.0.0
   */
  onEventReceivedHandler(obj)
  {
    const listener = obj?.detail?.listener;
    const event    = obj?.detail?.event;

    if(listener === undefined || event === undefined || !this.expectsEventListener(listener))
    {
      Utils.resumeSEQueue();
      return;
    }

    // Chat message
    if(this.expectsEventName("Message")             && listener === "message")
    {
      this.onMessageHandler(event);
    }
    // Single message deleted
    else if(this.expectsEventName("DeleteMessage")  && listener === "delete-message")
    {
      this.onDeleteMessageHandler(event);
    }
    // Multiple messages deleted (User Timeout)
    else if(this.expectsEventName("DeleteMessages") && listener === "delete-messages")
    {
      this.onDeleteMessagesHandler(event);
    }
    // Check type of subscription
    else if(listener === 'subscriber-latest')
    {
      // Correct sender on test alerts
      if(event.isTest && !(event.gifted && event.isCommunityGift) && !event.bulkGifted)
      {
        event.sender = undefined;
      }
      // New Sub
      if(this.expectsEventName("Subscriber") && event.amount === 1 && event.sender === undefined)
      {
        this.onSubscriberHandler(event);
      }
      // Gift
      else if(this.expectsEventName("SubGift") && event.gifted && !event.isCommunityGift)
      {
        this.onSubGiftHandler(event);
      }
      // Resub
      else if(this.expectsEventName("Resub") && event.amount > 1 && event.sender === undefined)
      {
        this.onResubHandler(event);
      }
      // SubBomb - Main
      else if(this.expectsEventName("SubBomb") && event.bulkGifted)
      {
        const gifter = event?.sender?.toLowerCase();

        if(gifter && this.#giftCollection[gifter] === undefined)
        {
          this.#giftCollection[gifter] = { amount: event.amount, recipients: [] };
        }

        this.onSubBombHandler(event);
      }
      // SubBomb - Gift
      else if(event.gifted && event.isCommunityGift)
      {
        if(this.expectsEventName("CommunityGift"))
        {
          this.onCommunityGiftHandler(event);
        }

        if(this.expectsEventName("SubBombComplete"))
        {
          const gifter = event?.sender?.toLowerCase();

          if(gifter && this.#giftCollection[gifter] !== undefined)
          {
            this.#giftCollection[gifter].recipients.push(event.name);

            if(this.#giftCollection[gifter].amount === this.#giftCollection[gifter].recipients.length)
            {
              event.amount = this.#giftCollection[gifter].amount;
              this.onSubBombCompleteHandler(event, this.#giftCollection[gifter].recipients);

              delete this.#giftCollection[gifter];
            }
            else
            {
              Utils.resumeSEQueue();
            }
          }
        }
      }
    }
    // Tip
    else if(this.expectsEventName("Tip")           && listener === 'tip-latest')
    {
      this.onTipHandler(event);
    }
    // Cheer
    else if(this.expectsEventName("Cheer")         && listener === 'cheer-latest')
    {
      this.onCheerHandler(event);
    }
    // Host
    else if(this.expectsEventName("Host")          && listener === 'host-latest')
    {
      this.onHostHandler(event);
    }
    // Raid
    else if(this.expectsEventName("Raid")          && listener === 'raid-latest')
    {
      this.onRaidHandler(event);
    }
    // Follow
    else if(this.expectsEventName("Follow")        && listener === 'follower-latest')
    {
      this.onFollowHandler(event);
    }
    // Bot-Counter updated
    else if(this.expectsEventName("BotCounter")    && listener === "bot:counter")
    {
      this.onBotCounterHandler(event);
    }
    // Event skipped
    else if(this.expectsEventName("EventSkip")     && listener === "event:skip")
    {
      this.onEventSkipHandler(event);
    }
    // Widget-Button pressed
    else if(this.expectsEventName("WidgetButton")  && listener === "event:test" && event.listener === "widget-button")
    {
      this.onWidgetButtonHandler(event);
    }
    // Key-Value-Store updated
    else if(this.expectsEventName("KVStoreUpdate") && listener === "kvstore:update")
    {
      this.onKVStoreUpdateHandler(event);
    }
    // Alerts were (un)muted by the user
    else if(this.expectsEventName("ToggleSound")   && listener === "alertService:toggleSound")
    {
      this.onToggleSoundHandler(event);
    }
  }

  /**
   * Calls window.onSubscriber and gets triggered when someone subscribes for the first time (first month) on your channel.
   * @param event {SubscriberEvent} - The event data object
   * @since 1.0.0
   */
  onSubscriberHandler(event)
  {
    Utils.callFunc("onSubscriber", event);
  }

  /**
   * Calls window.onResub and gets triggered when someone resubscribes on your channel.
   * @param event {ResubEvent} - The event data object
   * @since 1.0.0
   */
  onResubHandler(event)
  {
    Utils.callFunc("onResub", event);
  }

  /**
   * Calls window.onSubGift and gets triggered when someone gifts a subscription to another user (targeted).
   * @param event {SubGiftEvent} - The event data object
   * @since 1.0.0
   */
  onSubGiftHandler(event)
  {
    Utils.callFunc("onSubGift", event);
  }

  /**
   * Calls window.onCommunityGift and gets triggered for each subgift in a SubBomb. Has the same data as onSubGift and a fixed recipient.
   * @param event {CommunityGiftEvent} - The event data object
   * @since 1.0.0
   */
  onCommunityGiftHandler(event)
  {
    Utils.callFunc("onCommunityGift", event);
  }

  /**
   * Calls window.onSubBomb and gets triggered when a SubBomb occurs.
   * This event will trigger on the initial SubBomb message and only contains the sender and amount.
   * Recipients are not known yet.
   * @param event {SubBombEvent} - The event data object
   * @since 1.0.0
   */
  onSubBombHandler(event)
  {
    Utils.callFunc("onSubBomb", event);
  }

  /**
   * Calls window.onSubBombComplete and gets triggered after a SubBomb completes and all recipients are known.
   * Passes an array of recipient names as second parameter.
   * @param event {SubBombEvent} - The event data object
   * @param recipients {string[]} - An array of recipient names
   * @since 1.0.0
   */
  onSubBombCompleteHandler(event, recipients)
  {
    Utils.callFunc("onSubBombComplete", event, recipients);
  }

  /**
   * Calls window.onTip and gets triggered when you receive a tip through StreamElements.
   * @param event {TipEvent} - The event data object
   * @since 1.0.0
   */
  onTipHandler(event)
  {
    Utils.callFunc("onTip", event);
  }

  /**
   * Calls window.onCheer and gets triggered when someone cheers (uses Bits) in your channel.
   * @param event {CheerEvent} - The event data object
   * @since 1.0.0
   */
  onCheerHandler(event)
  {
    Utils.callFunc("onCheer", event);
  }

  /**
   * Calls window.onHost and gets triggered when someone hosts your channel.
   * @param event {HostEvent} - The event data object
   * @since 1.0.0
   */
  onHostHandler(event)
  {
    Utils.callFunc("onHost", event);
  }

  /**
   * Calls window.onCheer and gets triggered when someone raids your channel.
   * @param event {RaidEvent} - The event data object
   * @since 1.0.0
   */
  onRaidHandler(event)
  {
    Utils.callFunc("onRaid", event);
  }

  /**
   * Calls window.onFollow and gets triggered when someone follows your channel.
   * @param event {FollowEvent} - The event data object
   * @since 1.0.0
   */
  onFollowHandler(event)
  {
    Utils.callFunc("onFollow", event);
  }

  /**
   * Calls window.onMessage and gets triggered everytime someone sends a message in your chat.
   * @param event {MessageEvent} - The event data object
   * @since 1.0.0
   */
  onMessageHandler(event)
  {
    Utils.callFunc("onMessage", (new ChatMessage(event)));
  }

  /**
   * Calls window.onDeleteMessage and gets triggered everytime a single message is deleted in your chat, by a moderator.
   * You can use the passed messageId to delete the message in your own chat widget.
   * @param event {DeleteMessageEvent} - The event data object
   * @since 1.0.0
   */
  onDeleteMessageHandler(event)
  {
    Utils.callFunc("onDeleteMessage", event);
  }

  /**
   * Calls window.onMessage and gets triggered everytime multiple messages are deleted in your chat, by a moderator.
   * This could occur on timeouts and bans and affects every message the user sent in chat this session.
   * You can use the passed userId to delete all messages of that user in your own chat widget.
   * @param event {DeleteMessagesEvent} - The event data object
   * @since 1.0.0
   */
  onDeleteMessagesHandler(event)
  {
    Utils.callFunc("onDeleteMessages", event);
  }

  /**
   * Calls window.onEventSkip and gets triggered everytime you try to skip an alert in your dashboard.
   * @since 1.0.0
   */
  onEventSkipHandler()
  {
    Utils.callFunc("onEventSkip");
  }

  /**
   * Calls window.onBotCounter and gets triggered everytime a bot-counter gets updated. (Through chat commands for example)
   * @param event {BotCounterEvent} - The event data object
   * @since 1.0.0
   */
  onBotCounterHandler(event)
  {
    Utils.callFunc("onBotCounter", event);
  }

  /**
   * Calls window.onWidgetButton and gets triggered everytime you press a custom button (defined in your fields) via the overlay editor.
   * @param event {WidgetButtonEvent} - The event data object
   * @since 1.0.0
   */
  onWidgetButtonHandler(event)
  {
    Utils.callFunc("onWidgetButton", event);
  }

  /**
   * Calls window.onKVStoreUpdate and gets triggered everytime a value changes.
   * NOTE: This will also get triggered across widgets to communicate between them.
   * @param event {KVStoreUpdateEvent} - The event data object
   * @since 1.0.0
   */
  onKVStoreUpdateHandler(event)
  {
    Utils.callFunc("onKVStoreUpdate", event);
  }

  /**
   * Calls window.onToggleSound and gets triggered everytime the user toggles the sound for alerts.
   * @param event {ToggleSoundEvent} - The event data object
   * @since 1.0.0
   */
  onToggleSoundHandler(event)
  {
    Utils.callFunc("onToggleSound", event);
  }
}