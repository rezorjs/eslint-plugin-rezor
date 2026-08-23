import { RuleTester } from 'eslint'
import { parser } from 'typescript-eslint'
import rule from '../src/rules/rules-of-hooks.ts'

const jsRuleTester = new RuleTester()
const tsRuleTester = new RuleTester({ languageOptions: { parser } })

/**
 * A string template tag that removes padding from the left side of multi-line strings
 */
function normalizeIndent(strings: TemplateStringsArray): string {
  const codeLines = strings[0].split('\n')
  const leftPadding = codeLines[1]?.match(/\s+/)?.[0] ?? ''
  return codeLines.map((line) => line.slice(leftPadding.length)).join('\n')
}

const tests = {
  valid: [
    {
      code: normalizeIndent`
        // Valid because hooks can use hooks.
        function useHookWithHook() {
          useHook();
        }
      `,
    },
    {
      code: normalizeIndent`
        // Valid because hooks can use hooks.
        function createHook() {
          return function useHookWithHook() {
            useHook();
          }
        }
      `,
    },
    {
      code: normalizeIndent`
        // Valid because functions can call functions.
        function normalFunctionWithNormalFunction() {
          doSomething();
        }
      `,
    },
    {
      code: normalizeIndent`
        // Valid because functions can call functions.
        function normalFunctionWithConditionalFunction() {
          if (cond) {
            doSomething();
          }
        }
      `,
    },
    {
      code: normalizeIndent`
        // Valid because functions can call functions.
        function functionThatStartsWithUseButIsntAHook() {
          if (cond) {
            userFetch();
          }
        }
      `,
    },
    {
      code: normalizeIndent`
        // Valid although unconditional return doesn't make sense and would fail other rules.
        // We could make it invalid but it doesn't matter.
        function useUnreachable() {
          return;
          useHook();
        }
      `,
    },
    {
      code: normalizeIndent`
        // Valid because hooks can call hooks.
        function useHook() {
          useHook1();
          useHook2();
        }
      `,
    },
    {
      code: normalizeIndent`
        // Valid because hooks can call hooks.
        function createHook() {
          return function useHook() {
            useHook1();
            useHook2();
          };
        }
      `,
    },
    {
      code: normalizeIndent`
        // Valid because hooks can call hooks.
        function useHook() {
          useState() && a;
        }
      `,
    },
    {
      code: normalizeIndent`
        // Valid because hooks can call hooks.
        function useHook() {
          return useHook1() + useHook2();
        }
      `,
    },
    {
      code: normalizeIndent`
        // Valid because hooks can call hooks.
        function useHook() {
          return useHook1(useHook2());
        }
      `,
    },
  ],
  invalid: [
    {
      code: normalizeIndent`
        // Invalid because it's dangerous and might not warn otherwise.
        // This *must* be invalid.
        function useHookWithConditionalHook() {
          if (cond) {
            useConditionalHook();
          }
        }
      `,
      errors: [conditionalError('useConditionalHook')],
    },
    {
      code: normalizeIndent`
        // Invalid because it's dangerous and might not warn otherwise.
        // This *must* be invalid.
        function createHook() {
          return function useHookWithConditionalHook() {
            if (cond) {
              useConditionalHook();
            }
          }
        }
      `,
      errors: [conditionalError('useConditionalHook')],
    },
    {
      code: normalizeIndent`
        // Currently invalid because it violates the convention and removes the "taint"
        // from a hook. We *could* make it valid to avoid some false positives but let's
        // ensure normal functions that call hooks remain invalid.
        function normalFunctionWithHook() {
          useHookInsideNormalFunction();
        }
      `,
      errors: [
        functionError('useHookInsideNormalFunction', 'normalFunctionWithHook'),
      ],
    },
    {
      code: normalizeIndent`
        // These are neither functions nor hooks.
        function _normalFunctionWithHook() {
          useHookInsideNormalFunction();
        }
        function _useNotAHook() {
          useHookInsideNormalFunction();
        }
      `,
      errors: [
        functionError('useHookInsideNormalFunction', '_normalFunctionWithHook'),
        functionError('useHookInsideNormalFunction', '_useNotAHook'),
      ],
    },
    {
      code: normalizeIndent`
        // Invalid because it's dangerous and might not warn otherwise.
        // This *must* be invalid.
        function normalFunctionWithConditionalHook() {
          if (cond) {
            useHookInsideNormalFunction();
          }
        }
      `,
      errors: [
        functionError(
          'useHookInsideNormalFunction',
          'normalFunctionWithConditionalHook',
        ),
      ],
    },
    {
      code: normalizeIndent`
        // Invalid because it's dangerous and might not warn otherwise.
        // This *must* be invalid.
        function useHookInLoops() {
          while (a) {
            useHook1();
            if (b) return;
            useHook2();
          }
          while (c) {
            useHook3();
            if (d) return;
            useHook4();
          }
        }
      `,
      errors: [
        loopError('useHook1'),
        loopError('useHook2'),
        loopError('useHook3'),
        loopError('useHook4'),
      ],
    },
    {
      code: normalizeIndent`
        // Invalid because it's dangerous and might not warn otherwise.
        // This *must* be invalid.
        function useHookInLoops() {
          while (a) {
            useHook1();
            if (b) continue;
            useHook2();
          }
        }
      `,
      errors: [loopError('useHook1'), loopError('useHook2')],
    },
    {
      code: normalizeIndent`
        // Invalid because it's dangerous and might not warn otherwise.
        // This *must* be invalid.
        function useHookInLoops() {
          do {
            useHook1();
            if (a) return;
            useHook2();
          } while (b);

          do {
            useHook3();
            if (c) return;
            useHook4();
          } while (d)
        }
      `,
      errors: [
        loopError('useHook1'),
        loopError('useHook2'),
        loopError('useHook3'),
        loopError('useHook4'),
      ],
    },
    {
      code: normalizeIndent`
        // Invalid because it's dangerous and might not warn otherwise.
        // This *must* be invalid.
        function useHookInLoops() {
          do {
            useHook1();
            if (a) continue;
            useHook2();
          } while (b);
        }
      `,
      errors: [loopError('useHook1'), loopError('useHook2')],
    },
    {
      code: normalizeIndent`
        // Invalid because it's dangerous and might not warn otherwise.
        // This *must* be invalid.
        function useLabeledBlock() {
          label: {
            if (a) break label;
            useHook();
          }
        }
      `,
      errors: [conditionalError('useHook')],
    },
    {
      code: normalizeIndent`
        // Currently invalid.
        // These are variations capturing the current heuristic--
        // we only allow hooks in direct Rezor factory functions or useFoo functions.
        // We *could* make some of these valid. But before doing it,
        // consider specific cases documented above that contain reasoning.
        function a() { useState(); }
        const whatever = function b() { useState(); };
        const c = () => { useState(); };
        let d = () => useState();
        e = () => { useState(); };
        ({f: () => { useState(); }});
        ({g() { useState(); }});
        const {j = () => { useState(); }} = {};
        ({k = () => { useState(); }} = {});
      `,
      errors: [
        functionError('useState', 'a'),
        functionError('useState', 'b'),
        functionError('useState', 'c'),
        functionError('useState', 'd'),
        functionError('useState', 'e'),
        functionError('useState', 'f'),
        functionError('useState', 'g'),
        functionError('useState', 'j'),
        functionError('useState', 'k'),
      ],
    },
    {
      code: normalizeIndent`
        // Invalid because it's dangerous and might not warn otherwise.
        // This *must* be invalid.
        function useHook() {
          if (a) return;
          useState();
        }
      `,
      errors: [conditionalError('useState', true)],
    },
    {
      code: normalizeIndent`
        // Invalid because it's dangerous and might not warn otherwise.
        // This *must* be invalid.
        function useHook() {
          if (a) return;
          if (b) {
            console.log('true');
          } else {
            console.log('false');
          }
          useState();
        }
      `,
      errors: [conditionalError('useState', true)],
    },
    {
      code: normalizeIndent`
        // Invalid because it's dangerous and might not warn otherwise.
        // This *must* be invalid.
        function useHook() {
          if (b) {
            console.log('true');
          } else {
            console.log('false');
          }
          if (a) return;
          useState();
        }
      `,
      errors: [conditionalError('useState', true)],
    },
    {
      code: normalizeIndent`
        // Invalid because it's dangerous and might not warn otherwise.
        // This *must* be invalid.
        function useHook() {
          a && useHook1();
          b && useHook2();
        }
      `,
      errors: [conditionalError('useHook1'), conditionalError('useHook2')],
    },
    {
      code: normalizeIndent`
        // Invalid because it's dangerous and might not warn otherwise.
        // This *must* be invalid.
        function useHook() {
          try {
            f();
            useState();
          } catch {}
        }
      `,
      errors: [
        // NOTE: This is an error since `f()` could possibly throw.
        conditionalError('useState'),
      ],
    },
    {
      code: normalizeIndent`
        // Invalid because it's dangerous and might not warn otherwise.
        // This *must* be invalid.
        function useHook({ bar }) {
          let foo1 = bar && useState();
          let foo2 = bar || useState();
          let foo3 = bar ?? useState();
        }
      `,
      errors: [
        conditionalError('useState'),
        conditionalError('useState'),
        conditionalError('useState'),
      ],
    },
    {
      code: normalizeIndent`
        // Technically this is a false positive.
        // We *could* make it valid (and it used to be).
        //
        // However, top-level Hook-like calls can be very dangerous
        // in environments with inline requires because they can mask
        // the runtime error by accident.
        // So we prefer to disallow it despite the false positive.

        const {createHistory, useBasename} = require('history-2.1.2');
        const browserHistory = useBasename(createHistory)({
          basename: '/',
        });
      `,
      errors: [topLevelError('useBasename')],
    },
    {
      code: normalizeIndent`
        (class {useHook = () => { useState(); }});
      `,
      errors: [classError('useState')],
    },
    {
      code: normalizeIndent`
        (class {useHook() { useState(); }});
      `,
      errors: [classError('useState')],
    },
    {
      code: normalizeIndent`
        (class {h = () => { useState(); }});
      `,
      errors: [classError('useState')],
    },
    {
      code: normalizeIndent`
        (class {i() { useState(); }});
      `,
      errors: [classError('useState')],
    },
    {
      code: normalizeIndent`
        async function useAsyncHook() {
          useState();
        }
      `,
      errors: [asyncComponentHookError('useState')],
    },
    {
      code: normalizeIndent`
        async function useAsyncHook() {
          useId();
        }
      `,
      errors: [asyncComponentHookError('useId')],
    },
    {
      code: normalizeIndent`
        async function notAHook() {
          useId();
        }
      `,
      errors: [functionError('useId', 'notAHook')],
    },
  ],
}

function conditionalError(
  hook: string,
  hasPreviousFinalizer = false,
): { message: string } {
  return {
    message:
      `Rezor Hook "${hook}" is called conditionally. Rezor Hooks must be ` +
      'called in the exact same order in every component render.' +
      (hasPreviousFinalizer ?
        ' Did you accidentally call a Rezor Hook after an early return?'
      : ''),
  }
}

function loopError(hook: string) {
  return {
    message:
      `Rezor Hook "${hook}" may be executed more than once. Possibly ` +
      'because it is called in a loop. Rezor Hooks must be called in the ' +
      'exact same order in every component render.',
  }
}

function functionError(hook: string, fn: string) {
  return {
    message:
      `Rezor Hook "${hook}" is called in function "${fn}" that is neither ` +
      'a Rezor component function nor a custom Hook function.' +
      ' Rezor component functions must be passed to defineApp or ' +
      'defineComponent.' +
      ' Hook names must start with the word "use".',
  }
}

function genericError(hook: string) {
  return {
    message:
      `Rezor Hook "${hook}" cannot be called inside a callback. Rezor Hooks ` +
      'must be called in a Rezor component or a custom Hook function.',
  }
}

function topLevelError(hook: string) {
  return {
    message:
      `Rezor Hook "${hook}" cannot be called at the top level. Rezor Hooks ` +
      'must be called in a Rezor component or a custom Hook function.',
  }
}

function classError(hook: string) {
  return {
    message:
      `Rezor Hook "${hook}" cannot be called in a class. Rezor Hooks ` +
      'must be called in a Rezor component or a custom Hook function.',
  }
}

function useEffectEventError(fn: string | null, called: boolean) {
  if (fn === null) {
    return {
      message:
        `Rezor Hook "useEffectEvent" can only be called at the top level of your component.` +
        ` It cannot be passed down.`,
    }
  }

  return {
    message:
      `\`${fn}\` is a function created with Rezor Hook "useEffectEvent", and can only be called from ` +
      'Effects and Effect Events in the same component.' +
      (called ? '' : ' It cannot be assigned to a variable or passed down.'),
  }
}

function asyncComponentHookError(fn: string) {
  return {
    message: `Rezor Hook "${fn}" cannot be called in an async function.`,
  }
}

const allTests = {
  valid: [
    ...tests.valid,
    {
      code: normalizeIndent`
        defineApp(() => {
          useState();
        });
      `,
    },
    {
      code: normalizeIndent`
        defineApp({
          render() {
            useState();
          },
        });
      `,
    },
    {
      code: normalizeIndent`
        defineComponent(() => {
          useState();
        });
      `,
    },
    {
      code: normalizeIndent`
        defineComponent({
          render() {
            useState();
          },
        });
      `,
    },
    {
      code: normalizeIndent`
        defineComponent(() => {
          const event = useEffectEvent(() => {});
          useEffect(() => event());
        });
      `,
    },
  ],
  invalid: [
    ...tests.invalid,
    {
      code: normalizeIndent`
        defineComponent(() => {
          if (condition) {
            useState();
          }
        });
      `,
      errors: [conditionalError('useState')],
    },
    {
      code: normalizeIndent`
        defineApp({
          render() {
            items.forEach(() => useState());
          },
        });
      `,
      errors: [genericError('useState')],
    },
    {
      code: normalizeIndent`
        defineComponent(() => {
          const event = useEffectEvent(() => {});
          return { event };
        });
      `,
      errors: [useEffectEventError('event', false)],
    },
  ],
}

jsRuleTester.run('rules-of-hooks', rule, allTests)
tsRuleTester.run('rules-of-hooks (TypeScript)', rule, allTests)
