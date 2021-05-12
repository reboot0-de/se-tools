import Utils from './Utils';

/**
 * @module Queue
 * @since 1.0.0
 */
export default class Queue
{
  #queue;
  #inUse;

  constructor()
  {
    this.#queue = [];
    this.#inUse = false;
  }

  /**
   * Returns the amount of elements currently in the queue.
   * @returns {number}
   * @since 1.0.0
   */
  length()
  {
    return this.#queue.length;
  }

  /**
   * Returns whether the queue is currently usable.
   * @returns {boolean}
   * @since 1.0.0
   */
  ready()
  {
    return (this.#inUse === false);
  }

  /**
   * Returns whether the queue is currently empty
   * @returns {boolean}
   * @since 1.0.0
   */
  empty()
  {
    return (this.length() === 0);
  }

  /**
   * Returns the zero-based length for array operations. An empty queue still returns 0.
   *
   * A queue with 4 elements would return 3 as indexLength(), since queue[3] points to the 4th element.
   * @returns {number}
   * @since 1.0.0
   */
  indexLength()
  {
    const len = this.length();
    return (len > 0) ? (len - 1) : 0;
  }

  /**
   * Adds an element to the end of the queue.
   * @param {any} element - The element to add
   * @since 1.0.0
   */
  add(element)
  {
    this.#queue.push(element);
  }

  /**
   * Removes one or more elements from the queue. Starting with the given index
   * @param index {number} - The index to start removing elements from
   * @param {number} [deleteCount=1] - The number of elements to remove
   * @since 1.0.0
   */
  remove(index, deleteCount = 1)
  {
    if (!this.empty())
    {
      this.#queue.splice(index, deleteCount);
    }
  }

  /**
   * Removes the first element of the queue
   * @since 1.0.0
   */
  removeFirst()
  {
    this.remove(0);
  }

  /**
   * Removes the last element of the queue
   * @since 1.0.0
   */
  removeLast()
  {
    this.remove(-1);
  }

  /**
   * Returns the element with the given index or null if nothing was found.
   *
   * You can also pass a negative number to start counting from the end. E.g. -1 will return the last element.
   * @param index {number} - The index of the element you want to return.
   * @returns {any|null}
   * @since 1.0.0
   */
  get(index)
  {
    if(this.empty())                                  { return null;                               }
    if(index >= 0 && index <= this.indexLength())     { return this.#queue[index];                 }
    if(index < 0 && Math.abs(index) <= this.length()) { return this.#queue[this.length() - index]; }

    return null;
  }

  /**
   * Returns the first element in the queue or null if it is empty.
   * @returns {any|null}
   * @since 1.0.0
   */
  first()
  {
    return this.get(0);
  }

  /**
   * Returns the last element in the queue or null if it is empty.
   * @returns {any|null}
   * @since 1.0.0
   */
  last()
  {
    return this.get(-1);
  }

  /**
   * Passes the first queue element to the specified function and removes it from the queue after resolving the `Promise`.
   *
   * This function returns a `Promise` which resolves after the first element is cleared.
   * @param promiseFunc {function} - The function to execute with the first queue element as parameter. This HAS TO return a resolving promise
   * @param {number} [delayAfter=0] - Milliseconds to wait before this function resolves
   * @param {boolean} [resumeSEQueue=false] - Determines if `SE_API.resumeQueue()` should be called after processing the current element
   * @returns {Promise}
   * @since 1.0.0
   */
  processFirst(promiseFunc, delayAfter = 0, resumeSEQueue = false)
  {
    return new Promise((resolve, reject) =>
    {
      let first = this.first();
      if(first !== null && this.ready())
      {
        this.#inUse = true;

        promiseFunc(first)
        .then(() =>
        {
          setTimeout(() =>
          {
            this.removeFirst();
            this.#inUse = false;

            if(resumeSEQueue) { Utils.resumeSEQueue(); }
            resolve();
          }, delayAfter);
        })
        .catch(reject);
      }
    });
  }

  /**
   * Passes the first queue element to the specified function and removes it from the queue after resolving the `Promise`.
   *
   * This gets repeated for each element, until the queue is empty.
   * @param promiseFunc {function} - The function to execute with the first queue element as parameter. This HAS TO return a resolving promise
   * @param {number} [delayBetween=0] - Milliseconds to wait between each processing cycle
   * @param {boolean} [resumeSEQueue=false] - Determines if `SE_API.resumeQueue()` should be called after processing each element
   * @since 1.0.0
   */
  processEach(promiseFunc, delayBetween = 0, resumeSEQueue = false)
  {
    this.processFirst(promiseFunc, delayBetween, resumeSEQueue)
    .then(() =>
    {
      this.processEach(promiseFunc, delayBetween, resumeSEQueue);
    })
    .catch((err) => { console.error(err); });
  }
}