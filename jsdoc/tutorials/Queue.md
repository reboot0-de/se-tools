The Queue class is a bonus, in case you need to manage _your own_ event queue. It has nothing to do with the internal StreamElements queue for alerts.

This class will be automatically instanciated on load and can be accessed via `Queue.functionName(parameters)`.

The usage should be pretty straight-forward and most functions self-explanatory, but we can give some examples for a potential better understanding.

# Adding elements
In general, you can add any type of element to the queue. It doesn't matter if it's a string, a number, an object or anything else.

The new element will always be added to the end. A direct position can not be specified.

```javascript
Queue.add("My string element");
Queue.add(10);
Queue.add(["My", "Array"]);
Queue.add({ "my": "object" });
```

# Counting elements
To get the amount of elements currently queued, we have 2 variations:

`Queue.length()` for the absolute amount and `Queue.indexLength()` for a zero-based count.

As a shortcut for `Queue.length() === 0` we also have `Queue.empty()`

```javascript
Queue.add("element");
Queue.add(10);
Queue.add(["My", "Array"]);
Queue.add({ "my": "object" });

// The absolute length is 4
Queue.length();
// The index length is 3, since 3 is the index of the last element. (0 is the first)
Queue.indexLength();
// Returns false
Queue.empty();
```

# Getting elements
To return an element at position x in the queue, we have `Queue.get(index)` (x is the index).

When accessing elements, we always start counting at 0. So the first element would be `Queue.get(0)` and not `Queue.get(1)`.

We also allow the index to be negative to start counting from the end. `Queue.get(-1)` would then return the last element.

For a simpler syntax, we also offer `Queue.first()` and `Queue.last()`, if you don't want to use index numbers for those.

If no element was found or the index is out of bounds, this will return `null`.

```javascript
Queue.add("element");
Queue.add(10);
Queue.add(["My", "Array"]);
Queue.add({ "my": "object" });

// returns "element"
Queue.first();
// returns 10
Queue.get(1);
// returns null, since the index is out of bounds
Queue.get(100);
// returns { "my": "object" }
Queue.last();
```

# Removing elements
Removing elements is basically the same approach as getting them.

`Queue.remove(index, deleteCount)` to remove exact positions or `Queue.removeFirst()`/`Queue.removeLast()` to remove the first/last element in the queue.

The `deleteCount` parameter can be set to remove multiple elements starting at the index. If omitted, this will default to remove only one element.

If you remove one or more element(s) at position x, the elements after that will fill the gap.

```javascript
Queue.add("element");
Queue.add(10);
Queue.add(["My", "Array"]);
Queue.add({ "my": "object" });

// Returns false
Queue.empty();

// Removes "element"
Queue.removeFirst();
// Removes { "my": "object" }
Queue.removeLast();
// Removes 2 elements starting at position 0.
// In this case 10 and ["My", "Array"], since they moved down after removeFirst() above.
Queue.remove(0, 2);

// Returns true after the removals
Queue.empty();
```

Since only the internal queue gets updated each time, removing and adding elements won't return anything.

This internal queue is private and the only way to access its elements is through the `Queue.get(index)` function.

# Calling functions on elements

The most complex functions for the queue are `Queue.processFirst(promiseFunc, delayAfter, resumeSEQueue)` and `Queue.processEach(promiseFunc, delayBetween, resumeSEQueue)`.

Both return a Promise[[MDN]](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) and execute the passed `promiseFunc` with the first element in the queue as parameter.

After that, the first element in the queue will be removed.

The function passed as `promiseFunc` also **has to** return a Promise to work.

As the names suggest, `Queue.processFirst` only executes once on the first element, while `Queue.processEach` will execute for each element in the queue, after the element before that was successfully processed.

The other two parameters are optional.

`delayAfter`/`delayBetween` can be used to set a delay in milliseconds between each Promise, without having to use something like `setTimeout` externally. (Defaults to 0)

`resumeSEQueue` can be set to true to automatically call `SE_API.resumeQueue()`, after the current element was successfully processed. (Defaults to false)

This can be useful, if you need to sync your queue to the StreamElements queue.

Let's say we wanted to enqueue and animate every resub event in a custom widget:

```javascript
// listen for resub events and add the data to the queue
function onResub(data)
{
  Queue.add(data);
  // Call myCoolAnimation with `data` as parameter and set a timeout of 1 second between each call.
  // Also execute SE_API.resumeQueue() after each.
  Queue.processEach(myCoolAnimation, 1000, true);
}

function myCoolAnimation(data)
{
  return new Promise((resolve, reject) =>
  {
    DOM.setText("#usernameText", data.username);
    // Let's pretend we have code for a nice animation here :)
    resolve();
  });
}
```