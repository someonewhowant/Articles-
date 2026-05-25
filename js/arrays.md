# Реализация методов массива в JavaScript с нуля

В этой статье мы разберем внутреннее устройство стандартных методов `Array` в JavaScript, реализовав их «с чистого листа». Понимание того, как работают эти методы «под капотом», критически важно для любого JavaScript-разработчика, так как это помогает писать более эффективный код и лучше понимать временную сложность операций.

## Содержание
1. [Методы итерации](#методы-итерации)
2. [Методы поиска](#методы-поиска)
3. [Методы мутации](#методы-мутации)
4. [Методы трансформации](#методы-трансформации)
5. [Новые методы ES2023](#новые-методы-es2023)
6. [Статические методы](#статические-методы)

---

## Методы итерации

Методы итерации проходят по каждому элементу массива и выполняют определенное действие.

### forEach
Самый базовый метод. Он просто выполняет переданную функцию для каждого элемента.

```javascript
forEach(array, callback) {
  for (let i = 0; i < array.length; i++) {
    callback(array[i], i, array);
  }
}
```

### map
Создает новый массив, заполняя его результатами вызова функции для каждого элемента.

```javascript
map(array, callback) {
  const result = [];
  for (let i = 0; i < array.length; i++) {
    result.push(callback(array[i], i, array));
  }
  return result;
}
```

### reduce
Один из самых сложных для понимания методов. Он «сворачивает» массив в одно значение. Важный нюанс — обработка начального значения (accumulator).

### every / some
Методы для проверки условий. `every` возвращает `true`, если все элементы подходят под условие, а `some` — если хотя бы один. Оба метода прекращают выполнение (short-circuit), как только результат становится очевиден.

```javascript
every(array, callback) {
  for (let i = 0; i < array.length; i++) {
    if (!callback(array[i], i, array)) return false;
  }
  return true;
}
```

### find / findIndex
Ищут первый элемент (или его индекс), удовлетворяющий условию.

---

## Методы поиска

### indexOf / lastIndexOf
Классические методы поиска индекса элемента. `indexOf` идет с начала, `lastIndexOf` — с конца.

### includes
Проверяет наличие элемента в массиве. Здесь важно учитывать `NaN`, так как `NaN === NaN` возвращает `false`.

```javascript
includes(array, searchElement, fromIndex = 0) {
  let start = fromIndex < 0 ? Math.max(array.length + fromIndex, 0) : fromIndex;
  for (let i = start; i < array.length; i++) {
    if (array[i] === searchElement || (Number.isNaN(array[i]) && Number.isNaN(searchElement))) {
      return true;
    }
  }
  return false;
}
```

---

## Методы мутации

### push / pop / shift / unshift
`push`/`pop` работают с концом массива (быстро, O(1)). `shift`/`unshift` работают с началом, что требует сдвига всех остальных элементов (медленно, O(n)).

```javascript
shift(array) {
  if (array.length === 0) return undefined;
  const element = array[0];
  for (let i = 0; i < array.length - 1; i++) {
    array[i] = array[i + 1];
  }
  array.length = array.length - 1;
  return element;
}
```

### sort
В нашей реализации мы используем простую сортировку пузырьком (Bubble Sort) для наглядности, хотя в движках V8 используется более сложный Timsort.

### reverse
Меняет порядок элементов на обратный «на месте», используя метод двух указателей.

---

## Методы трансформации

### concat / slice
`concat` объединяет массивы (или значения) в один новый массив. `slice` возвращает поверхностную копию части массива.

### join
Превращает массив в строку, объединяя элементы через разделитель.

### flat / flatMap
`flat` раскрывает вложенные массивы. `flatMap` — это комбинация `map` и `flat` с глубиной 1, что часто эффективнее ручного вызова двух методов.

```javascript
flatMap(array, callback) {
  return this.flat(this.map(array, callback), 1);
}
```

---

## Новые методы ES2023
... (предыдущее описание toReversed и with) ...

---

## Статические методы

### Array.from
Создает массив из итерируемого или массивоподобного объекта.

```javascript
from(arrayLike, mapFn, thisArg) {
  const result = [];
  for (let i = 0; i < arrayLike.length; i++) {
    let value = arrayLike[i];
    if (mapFn) value = mapFn.call(thisArg, value, i);
    result.push(value);
  }
  return result;
}
```

### Array.isArray
Единственный надежный способ проверить, является ли объект массивом, обходя ограничения `typeof` и `instanceof` (например, при работе с разными iframe).

Реализация этих методов с нуля позволяет увидеть:
- Как `length` автоматически управляет размером массива.
- Почему некоторые методы быстрее других (O(1) против O(n)).
- Как работают итераторы и замыкания.

Полный код реализации доступен в файле `arrays.js`.
