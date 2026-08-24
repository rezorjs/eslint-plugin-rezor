# eslint-plugin-rezor

This is a ESLint plugin for [Rezor](https://github.com/rezorjs/rezor) which enforces the rules of hooks. This repo is forked from [eslint-plugin-react-hooks](https://github.com/react/react/tree/main/packages/eslint-plugin-react-hooks)

The typical Rezor codes is bellow:

```js [app.js]
import { createApp, useState, useEffect } from 'rezor'

createApp((options) => {
  const [count, setCount] = useState(0)

  const increment = () => {
    setCount(count + 1)
  }

  useEffect(() => {
    console.log('Count:', count)
  }, [count])

  return { count, increment }
})
```

```js [app.js]
import { createApp, useState, useEffect } from 'rezor'

createApp({
  render(options) {
    const [count, setCount] = useState(0)

    const increment = () => {
      setCount(count + 1)
    }

    useEffect(() => {
      console.log('Count:', count)
    }, [count])

    return { count, increment }
  },
})
```

```js [component.js]
import { defineComponent, useState, useEffect } from 'rezor'

defineComponent((props, context) => {
  const [count, setCount] = useState(0)

  const increment = () => {
    setCount(count + 1)
  }

  useEffect(() => {
    console.log('Count:', count)
  }, [count])

  return { count, increment }
})
```

```js [component.js]
import { defineComponent, useState, useEffect } from 'rezor'

defineComponent({
  render(props, context) {
    const [count, setCount] = useState(0)

    const increment = () => {
      setCount(count + 1)
    }

    useEffect(() => {
      console.log('Count:', count)
    }, [count])

    return { count, increment }
  },
})
```

```js [use-count.js]
import { useState, useEffect } from 'rezor'

export function useCount() {
  const [count, setCount] = useState(0)

  const increment = () => {
    setCount(count + 1)
  }

  useEffect(() => {
    console.log('Count:', count)
  }, [count])

  return { count, increment }
}
```

Please note that `options` parameter of createApp render, and `context` parameter of defineComponent render. They are stable objects, their fields are also stable, so they can be ignored in the deps array, just like the setState.
