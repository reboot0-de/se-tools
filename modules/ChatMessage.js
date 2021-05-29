import Utils from "./Utils";

/**
 * @module ChatMessage
 * @since 1.0.0
 */
export default class ChatMessage
{
  constructor(event)
  {
    this.badges         = event.data.badges;
    this.badgeInfo      = event.data.tags["badge-info"];
    this.channel        = event.data.channel;
    this.customRewardId = (Utils.isset(event.data.tags["custom-reward-id"])) ? event.data.tags["custom-reward-id"] : null;
    this.emotes         = event.data.emotes;
    this.msgId          = event.data.msgId;
    this.raw            = event;
    this.renderedText   = event.renderedText;
    this.roles          = this.#getRoles();
    this.text           = event.data.text;
    this.time           = new Date(event.data.time);
    this.userId         = event.data.userId;
    this.username       = event.data.displayName;
  }

  /**
   * Returns an object with a boolean value for every role.
   *
   * This is a private function to construct the roles object initially. Use the `roles` property in your code instead.
   * @returns {{subscriber: boolean, broadcaster: boolean, moderator: boolean, staff: boolean, vip: boolean}}
   * @private
   * @since 1.0.0
   */
  #getRoles()
  {
    let roles = { staff: false, broadcaster: false, moderator: false, vip: false, subscriber: false  }

    for(let badge of this.badges)
    {
      switch(badge.type)
      {
        case 'broadcaster': roles.broadcaster = true;
          break;
        case 'moderator':   roles.moderator   = true;
          break;
        case 'vip':         roles.vip         = true;
          break;
        case 'subscriber':  roles.subscriber  = true;
          break;
        case 'staff':       roles.staff       = true;
          break;
      }
    }

    return roles;
  }

  /**
   * Returns a stats object for the message. Can be used to filter out spam or special chars.
   *
   * Percentages range from 0 (0%) to 1 (100%). So 50% would be noted as 0.5.
   * @returns {{wordCount: number, emoteCount: number, emotePercentage: number, capsCount: number, capsPercentage: number, specialCharsCount: number, specialCharsPercentage: number}}
   * @since 1.0.0
   */
  getStats()
  {
    let textLen                  = this.text.replace(/\s+/, '').length;
    let stats                    = {};
    stats.wordCount              = this.getWordList().length;
    stats.emoteCount             = this.emotes.length;
    stats.emotePercentage        = Utils.getPercentageOf(stats.emoteCount, stats.wordCount);
    stats.capsCount              = (this.text.match("/[A-Z]/g") || []).length;
    stats.capsPercentage         = Utils.getPercentageOf(stats.capsCount, textLen);
    stats.specialCharsCount      = (this.text.match("/[^a-zA-Z0-9\\s]/g") || []).length;
    stats.specialCharsPercentage = Utils.getPercentageOf(stats.specialCharsCount, textLen);
    return stats;
  }

  /**
   * Returns either the users `displayColor` or generates a new random hex-color string if no color was set.
   * @returns {string}
   * @since 1.0.0
   */
  getDisplayColor()
  {
    return (Utils.isset(this.raw.data.displayColor)) ? this.raw.data.displayColor : Utils.getRandomHexColor();
  }

  /**
   * Returns whether the user has the given role or not.
   * This function also allows for some aliases in the role names.
   * @param role {string}
   * @returns {boolean}
   * @since 1.0.0
   */
  hasRole(role)
  {
    switch(role)
    {
      case 'broadcaster':
      case 'streamer':
        return (this.roles.broadcaster === true);
      case 'moderator':
      case 'mod':
        return (this.roles.moderator   === true);
      case 'vip':
        return (this.roles.vip         === true);
      case 'subscriber':
      case 'sub':
        return (this.roles.subscriber  === true);
      case 'staff':
        return (this.roles.staff       === true);
      default:
        return false;
    }
  }

  /**
   * Returns whether the user has the broadcaster role.
   * @returns {boolean}
   * @since 1.0.0
   */
  isBroadcaster()
  {
    return (this.roles.broadcaster === true);
  }

  /**
   * Returns whether the user has the moderator role.
   * @returns {boolean}
   * @since 1.0.0
   */
  isModerator()
  {
    return (this.roles.moderator === true);
  }

  /**
   * Returns whether the user has the VIP role.
   * @returns {boolean}
   * @since 1.0.0
   */
  isVIP()
  {
    return (this.roles.vip === true);
  }

  /**
   * Returns whether the user has the subscriber role.
   * @returns {boolean}
   * @since 1.0.0
   */
  isSubscriber()
  {
    return (this.roles.subscriber === true);
  }

  /**
   * Returns whether the user has the staff role.
   * @returns {boolean}
   * @since 1.0.0
   */
  isStaff()
  {
    return (this.roles.staff === true);
  }

  /**
   * Returns whether the user has a prime badge.
   * @returns {boolean}
   * @since 1.0.0
   */
  hasPrimeBadge()
  {
    return (this.badges.includes("premium"));
  }

  /**
   * Returns whether the user has a turbo badge.
   * @returns {boolean}
   * @since 1.0.0
   */
  hasTurboBadge()
  {
    return (this.badges.includes("turbo"));
  }

  /**
   * Returns the users current subscription-tier as number. (1 = Tier 1, 2 = Tier 2, 3 = Tier 3)
   *
   * Prime subs still count as tier 1.
   * @return {number}
   * @since 1.0.0
   */
  getTierBadge()
  {
    const groups = Utils.matchRegexGroups(this.raw.tags.badges, /subscriber\/(?<tier>[20|30])[1-9][0-9]*/i);
    if(!groups?.tier)        return 1;
    if(groups.tier === "20") return 2;
    if(groups.tier === "30") return 3;
  }

  /**
   * Returns the total amount of months the user has been subscribed to the channel.
   * @returns {number}
   * @since 1.0.0
   */
  getMonthsSubscribed()
  {
    const groups = Utils.matchRegexGroups(this.badgeInfo, /subscriber\/(?<months>[1-9][0-9]*)/i);
    return (groups?.months) ? parseInt(groups.months) : 0;
  }

  /**
   * Returns the current bits badge level, if the user chose to display it.
   *
   * This is not an accurate total amount and will only be upgraded on reached bit milestones.
   * @return {number}
   * @since 1.0.0
   */
  getBitsBadge()
  {
    const groups = Utils.matchRegexGroups(this.raw.tags.badges, /bits\/(?<bits>[1-9][0-9]*)/i);
    return (groups?.bits) ? parseInt(groups.bits) : 0;
  }

  /**
   * Returns the current sub-gifts badge level, if the user chose to display it.
   *
   * This is not an accurate total amount and will only be upgraded on reached sub-gift milestones.
   * @return {number}
   * @since 1.0.0
   */
  getGiftsBadge()
  {
    const groups = Utils.matchRegexGroups(this.raw.tags.badges, /sub-gifter\/(?<gifts>[1-9][0-9]*)/i);
    return (groups?.gifts) ? parseInt(groups.gifts) : 0;
  }

  /**
   * Returns whether the message is an user action. E.g. `/me`
   * @returns {boolean}
   * @since 1.0.0
   */
  isAction()
  {
    return (this.raw.data.isAction === true);
  }

  /**
   * Returns whether the message is a custom channel-points reward.
   * @returns {boolean}
   * @since 1.0.0
   */
  isCustomReward()
  {
    return Utils.isset(this.customRewardId);
  }

  /**
   * Returns whether the message is a command.
   *
   * You can also check for specific commands using the `cmdName` parameter.
   * @param {string} [cmdName=""] - The command name to check for
   * @returns {boolean}
   * @since 1.0.0
   */
  isCommand(cmdName = "")
  {
    const cmd = (cmdName.startsWith('!')) ? cmdName : '!' + cmdName;
    return this.text.startsWith(cmd);
  }

  /**
   * Returns either the used commands name as string, or null if no command was used.
   * If you set the `withArgs` parameter to true, the result will be an object containing command and passed arguments instead.
   * @param {boolean} [withArgs=false]
   * @returns {{args: string[], command: string}|string|null}
   * @since 1.0.0
   */
  getCommand(withArgs = false)
  {
    if(!this.isCommand()) return null;

    const groups = Utils.matchRegexGroups(this.text, /!(?<cmd>\w+)(?<args>[\s\w*]*)/i);
    if(groups === null) return null;

    return (withArgs) ? { command: groups.cmd, args: Utils.createList(groups.args, " ", true) } : groups.cmd;
  }

  /**
   * Returns an array with each word of the message as an element.
   * @returns {Array<string>}
   * @since 1.0.0
   */
  getWordList()
  {
    return Utils.createList(this.text, " ");
  }

  /**
   * Returns whether the given text was found in the message.
   * @param text {string} - The text to check for.
   * @param {boolean} [caseSensitive=false] - Determines if the check should be case-sensitive.
   * @returns {boolean}
   * @since 1.0.0
   */
  contains(text, caseSensitive = false)
  {
    return Utils.containsText(this.text, text, caseSensitive)
  }

  /**
   * Returns whether the given regular expression matches the text of the message.
   * @param regex {RegExp} - The regular expression to check for. Can either be an instance of RexExp or in literal notation.
   * @returns {boolean}
   * @since 1.0.0
   */
  containsRegex(regex)
  {
    return Utils.matchesRegex(this.text, regex);
  }

  /**
   * Returns whether the `username` is on a given list.
   *
   * This check is case-insensitive.
   * @param list {Array<string>} - An array of names to look up the username in.
   * @return {boolean}
   * @since 1.0.0
   */
  usernameOnList(list)
  {
    if(Array.isArray(list) && list.length > 0)
    {
      for(let entry of list)
      {
        if(entry.toLocaleLowerCase?.() === this.username.toLocaleLowerCase()) { return true; }
      }
    }
    return false;
  }

  /**
   * Returns whether the messages author matches the given username. This check is case-insensitive.
   * @param name {string} - The username to check for.
   * @returns {boolean}
   * @since 1.0.0
   */
  hasUsername(name)
  {
    return (this.username.toLocaleLowerCase() === name.toLocaleLowerCase?.());
  }

  /**
   * Returns whether the messages sender matches the given userID.
   * @param id {string} - The userID to check for.
   * @returns {boolean}
   * @since 1.0.0
   */
  hasUserId(id)
  {
    return (this.userId === id);
  }

  /**
   * Returns whether the messages sender contains the given text.
   * @param text {string} - The text to check for.
   * @param {boolean} [caseSensitive=false] - Determines if the check should be case-sensitive.
   * @return {boolean}
   * @since 1.0.0
   */
  usernameContains(text, caseSensitive = false)
  {
    return Utils.containsText(this.username, text, caseSensitive);
  }

  /**
   * Returns whether the messages sender matches the given regular expression.
   * @param regex {RegExp} - The regular expression to check for. Can either be an instance of RexExp or in literal notation.
   * @return {boolean}
   * @since 1.0.0
   */
  usernameContainsRegex(regex)
  {
    return Utils.matchesRegex(this.username, regex);
  }
}