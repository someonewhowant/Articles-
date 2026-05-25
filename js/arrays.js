/**
 * Custom implementation of JavaScript Array methods from scratch.
 */

const MyArray = {
  // --- Iteration Methods ---

  forEach(array, callback) {
    for (let i = 0; i < array.length; i++) {
      callback(array[i], i, array);
    }
  },

  map(array, callback) {
    const result = [];
    for (let i = 0; i < array.length; i++) {
      result.push(callback(array[i], i, array));
    }
    return result;
  },

  filter(array, callback) {
    const result = [];
    for (let i = 0; i < array.length; i++) {
      if (callback(array[i], i, array)) {
        result.push(array[i]);
      }
    }
    return result;
  },

  reduce(array, callback, initialValue) {
    let accumulator = initialValue;
    let startIndex = 0;

    if (accumulator === undefined) {
      if (array.length === 0) {
        throw new TypeError('Reduce of empty array with no initial value');
      }
      accumulator = array[0];
      startIndex = 1;
    }

    for (let i = startIndex; i < array.length; i++) {
      accumulator = callback(accumulator, array[i], i, array);
    }
    return accumulator;
  },

  reduceRight(array, callback, initialValue) {
    let accumulator = initialValue;
    let startIndex = array.length - 1;

    if (accumulator === undefined) {
      if (array.length === 0) {
        throw new TypeError('Reduce of empty array with no initial value');
      }
      accumulator = array[array.length - 1];
      startIndex = array.length - 2;
    }

    for (let i = startIndex; i >= 0; i--) {
      accumulator = callback(accumulator, array[i], i, array);
    }
    return accumulator;
  },

  every(array, callback) {
    for (let i = 0; i < array.length; i++) {
      if (!callback(array[i], i, array)) {
        return false;
      }
    }
    return true;
  },

  some(array, callback) {
    for (let i = 0; i < array.length; i++) {
      if (callback(array[i], i, array)) {
        return true;
      }
    }
    return false;
  },

  find(array, callback) {
    for (let i = 0; i < array.length; i++) {
      if (callback(array[i], i, array)) {
        return array[i];
      }
    }
    return undefined;
  },

  findIndex(array, callback) {
    for (let i = 0; i < array.length; i++) {
      if (callback(array[i], i, array)) {
        return i;
      }
    }
    return -1;
  },

  // --- Search Methods ---

  indexOf(array, searchElement, fromIndex = 0) {
    let start = fromIndex < 0 ? Math.max(array.length + fromIndex, 0) : fromIndex;
    for (let i = start; i < array.length; i++) {
      if (array[i] === searchElement) {
        return i;
      }
    }
    return -1;
  },

  lastIndexOf(array, searchElement, fromIndex = array.length - 1) {
    let start = fromIndex < 0 ? array.length + fromIndex : fromIndex;
    start = Math.min(start, array.length - 1);
    for (let i = start; i >= 0; i--) {
      if (array[i] === searchElement) {
        return i;
      }
    }
    return -1;
  },

  includes(array, searchElement, fromIndex = 0) {
    let start = fromIndex < 0 ? Math.max(array.length + fromIndex, 0) : fromIndex;
    for (let i = start; i < array.length; i++) {
      if (array[i] === searchElement || (Number.isNaN(array[i]) && Number.isNaN(searchElement))) {
        return true;
      }
    }
    return false;
  },

  // --- Mutation Methods ---

  push(array, ...elements) {
    for (let element of elements) {
      array[array.length] = element;
    }
    return array.length;
  },

  pop(array) {
    if (array.length === 0) return undefined;
    const element = array[array.length - 1];
    array.length = array.length - 1;
    return element;
  },

  shift(array) {
    if (array.length === 0) return undefined;
    const element = array[0];
    for (let i = 0; i < array.length - 1; i++) {
      array[i] = array[i + 1];
    }
    array.length = array.length - 1;
    return element;
  },

  unshift(array, ...elements) {
    const numElements = elements.length;
    for (let i = array.length - 1; i >= 0; i--) {
      array[i + numElements] = array[i];
    }
    for (let i = 0; i < numElements; i++) {
      array[i] = elements[i];
    }
    return array.length;
  },

  splice(array, start, deleteCount, ...items) {
    const len = array.length;
    let actualStart = start < 0 ? Math.max(len + start, 0) : Math.min(start, len);
    let actualDeleteCount = deleteCount === undefined 
      ? len - actualStart 
      : Math.min(Math.max(deleteCount, 0), len - actualStart);

    const removed = [];
    for (let i = 0; i < actualDeleteCount; i++) {
      removed.push(array[actualStart + i]);
    }

    const itemCount = items.length;
    const netChange = itemCount - actualDeleteCount;

    if (netChange > 0) {
      for (let i = len - 1; i >= actualStart + actualDeleteCount; i--) {
        array[i + netChange] = array[i];
      }
    } else if (netChange < 0) {
      for (let i = actualStart + actualDeleteCount; i < len; i++) {
        array[i + netChange] = array[i];
      }
      array.length = len + netChange;
    }

    for (let i = 0; i < itemCount; i++) {
      array[actualStart + i] = items[i];
    }

    return removed;
  },

  fill(array, value, start = 0, end = array.length) {
    const len = array.length;
    let relativeStart = start < 0 ? Math.max(len + start, 0) : Math.min(start, len);
    let relativeEnd = end < 0 ? Math.max(len + end, 0) : Math.min(end, len);

    for (let i = relativeStart; i < relativeEnd; i++) {
      array[i] = value;
    }
    return array;
  },

  reverse(array) {
    let left = 0;
    let right = array.length - 1;
    while (left < right) {
      [array[left], array[right]] = [array[right], array[left]];
      left++;
      right--;
    }
    return array;
  },

  sort(array, compareFn) {
    // Default compare function: lexicographical order
    const defaultCompare = (a, b) => {
      const sA = String(a);
      const sB = String(b);
      if (sA < sB) return -1;
      if (sA > sB) return 1;
      return 0;
    };
    const compare = compareFn || defaultCompare;

    // Simple implementation using Bubble Sort for "from scratch" feel
    for (let i = 0; i < array.length; i++) {
      for (let j = 0; j < array.length - 1 - i; j++) {
        if (compare(array[j], array[j + 1]) > 0) {
          [array[j], array[j + 1]] = [array[j + 1], array[j]];
        }
      }
    }
    return array;
  },

  findLast(array, callback) {
    for (let i = array.length - 1; i >= 0; i--) {
      if (callback(array[i], i, array)) {
        return array[i];
      }
    }
    return undefined;
  },

  findLastIndex(array, callback) {
    for (let i = array.length - 1; i >= 0; i--) {
      if (callback(array[i], i, array)) {
        return i;
      }
    }
    return -1;
  },

  copyWithin(array, target, start = 0, end = array.length) {
    const len = array.length;
    let to = target < 0 ? Math.max(len + target, 0) : Math.min(target, len);
    let from = start < 0 ? Math.max(len + start, 0) : Math.min(start, len);
    let final = end < 0 ? Math.max(len + end, 0) : Math.min(end, len);
    let count = Math.min(final - from, len - to);

    // Copy to a temporary buffer to avoid overwrite issues
    const temp = [];
    for (let i = 0; i < count; i++) {
      temp[i] = array[from + i];
    }
    for (let i = 0; i < count; i++) {
      array[to + i] = temp[i];
    }
    return array;
  },

  // --- Iterator Methods ---

  entries(array) {
    let index = 0;
    return {
      next() {
        if (index < array.length) {
          return { value: [index, array[index++]], done: false };
        }
        return { value: undefined, done: true };
      },
      [Symbol.iterator]() { return this; }
    };
  },

  keys(array) {
    let index = 0;
    return {
      next() {
        if (index < array.length) {
          return { value: index++, done: false };
        }
        return { value: undefined, done: true };
      },
      [Symbol.iterator]() { return this; }
    };
  },

  values(array) {
    let index = 0;
    return {
      next() {
        if (index < array.length) {
          return { value: array[index++], done: false };
        }
        return { value: undefined, done: true };
      },
      [Symbol.iterator]() { return this; }
    };
  },

  // --- Copying Methods (ES2023) ---

  toReversed(array) {
    return this.reverse([...array]);
  },

  toSorted(array, compareFn) {
    return this.sort([...array], compareFn);
  },

  toSpliced(array, start, deleteCount, ...items) {
    const copy = [...array];
    this.splice(copy, start, deleteCount, ...items);
    return copy;
  },

  with(array, index, value) {
    const len = array.length;
    let actualIndex = index < 0 ? len + index : index;
    if (actualIndex < 0 || actualIndex >= len) {
      throw new RangeError('Invalid index');
    }
    const result = [...array];
    result[actualIndex] = value;
    return result;
  },

  // --- Transformation Methods ---

  concat(array, ...items) {
    const result = [...array];
    for (let item of items) {
      if (Array.isArray(item)) {
        for (let subItem of item) {
          result.push(subItem);
        }
      } else {
        result.push(item);
      }
    }
    return result;
  },

  join(array, separator = ',') {
    let result = '';
    for (let i = 0; i < array.length; i++) {
      if (i > 0) result += separator;
      result += array[i] === null || array[i] === undefined ? '' : array[i];
    }
    return result;
  },

  slice(array, start = 0, end = array.length) {
    const len = array.length;
    let relativeStart = start < 0 ? Math.max(len + start, 0) : Math.min(start, len);
    let relativeEnd = end < 0 ? Math.max(len + end, 0) : Math.min(end, len);

    const result = [];
    for (let i = relativeStart; i < relativeEnd; i++) {
      result.push(array[i]);
    }
    return result;
  },

  flat(array, depth = 1) {
    const result = [];
    (function flatten(arr, d) {
      for (let item of arr) {
        if (Array.isArray(item) && d > 0) {
          flatten(item, d - 1);
        } else {
          result.push(item);
        }
      }
    })(array, depth);
    return result;
  },

  flatMap(array, callback) {
    return this.flat(this.map(array, callback), 1);
  },

  // --- Other Methods ---

  at(array, index) {
    const k = index >= 0 ? index : array.length + index;
    if (k < 0 || k >= array.length) return undefined;
    return array[k];
  },

  toString(array) {
    return this.join(array, ',');
  },

  toLocaleString(array) {
    let result = '';
    for (let i = 0; i < array.length; i++) {
      if (i > 0) result += ',';
      const item = array[i];
      result += (item === null || item === undefined) ? '' : item.toLocaleString();
    }
    return result;
  },

  // --- Static Methods ---

  isArray(arg) {
    return Object.prototype.toString.call(arg) === '[object Array]';
  },

  from(arrayLike, mapFn, thisArg) {
    const result = [];
    const len = arrayLike.length;
    for (let i = 0; i < len; i++) {
      let value = arrayLike[i];
      if (mapFn) {
        value = mapFn.call(thisArg, value, i);
      }
      result.push(value);
    }
    return result;
  },

  of(...items) {
    return [...items];
  }
};

module.exports = MyArray;
