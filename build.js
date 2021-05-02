import DOM    from './modules/DOM';
import Events from './modules/Events';
import Queue  from './modules/Queue';
import Utils  from './modules/Utils';

window.DOM    = DOM;
window.Events = new Events();
window.Queue  = new Queue();
window.Utils  = Utils;