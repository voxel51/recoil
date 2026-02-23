/**
 * @flow strict-local
 * @format
 * @oncall recoil
 */

'use strict';

const {
  getRecoilTestFn,
} = require('recoil-shared/__test_utils__/Recoil_TestingUtils');

let React,
  useState,
  act,
  atom,
  selector,
  isRecoilValue,
  useRecoilState,
  useRecoilValue,
  useSetRecoilState,
  useResetRecoilState,
  useRecoilStateLoadable,
  useRecoilValueLoadable,
  useGetRecoilValueInfo,
  useRecoilRefresher,
  useRecoilTransaction,
  useRecoilCallback,
  useRecoilTransactionObserver,
  useRecoilSnapshot,
  useGotoRecoilSnapshot,
  flushPromisesAndTimers,
  renderElements;

const testRecoil = getRecoilTestFn(() => {
  React = require('react');
  ({useState} = React);
  ({act} = require('ReactTestUtils'));
  ({
    atom,
    selector,
    isRecoilValue,
    useRecoilState,
    useRecoilValue,
    useSetRecoilState,
    useResetRecoilState,
    useRecoilStateLoadable,
    useRecoilValueLoadable,
    useGetRecoilValueInfo_UNSTABLE: useGetRecoilValueInfo,
    useRecoilRefresher_UNSTABLE: useRecoilRefresher,
    useRecoilTransaction_UNSTABLE: useRecoilTransaction,
    useRecoilCallback,
    useRecoilTransactionObserver_UNSTABLE: useRecoilTransactionObserver,
    useRecoilSnapshot,
    useGotoRecoilSnapshot,
  } = require('../../Recoil_index'));
  ({
    flushPromisesAndTimers,
    renderElements,
  } = require('recoil-shared/__test_utils__/Recoil_TestingUtils'));
});

testRecoil('Hook parity: useRecoilState()', () => {
  const countAtom = atom({key: 'hook parity useRecoilState', default: 0});
  let setCount;

  function Counter() {
    const [count, set] = useRecoilState(countAtom);
    setCount = set;
    return count;
  }

  const container = renderElements(<Counter />);
  expect(container.textContent).toEqual('0');

  act(() => setCount(v => v + 1));
  expect(container.textContent).toEqual('1');
});

testRecoil('Hook parity: useRecoilValue()', () => {
  const baseAtom = atom({key: 'hook parity useRecoilValue atom', default: 1});
  const doubledSelector = selector({
    key: 'hook parity useRecoilValue selector',
    get: ({get}) => get(baseAtom) * 2,
  });
  let setBase;

  function ValueReader() {
    return useRecoilValue(doubledSelector);
  }
  function ValueWriter() {
    setBase = useSetRecoilState(baseAtom);
    return null;
  }

  const container = renderElements(
    <>
      <ValueReader />
      <ValueWriter />
    </>,
  );
  expect(container.textContent).toEqual('2');

  act(() => setBase(3));
  expect(container.textContent).toEqual('6');
});

testRecoil('Hook parity: useSetRecoilState()', () => {
  const valueAtom = atom({key: 'hook parity useSetRecoilState', default: 'A'});
  let setValue;

  function Reader() {
    return useRecoilValue(valueAtom);
  }
  function Writer() {
    setValue = useSetRecoilState(valueAtom);
    return null;
  }

  const container = renderElements(
    <>
      <Reader />
      <Writer />
    </>,
  );
  expect(container.textContent).toEqual('A');

  act(() => setValue('B'));
  expect(container.textContent).toEqual('B');
});

testRecoil('Hook parity: useResetRecoilState()', () => {
  const valueAtom = atom({key: 'hook parity useResetRecoilState', default: 10});
  let setValue;
  let resetValue;

  function Component() {
    const value = useRecoilValue(valueAtom);
    setValue = useSetRecoilState(valueAtom);
    resetValue = useResetRecoilState(valueAtom);
    return value;
  }

  const container = renderElements(<Component />);
  expect(container.textContent).toEqual('10');

  act(() => setValue(99));
  expect(container.textContent).toEqual('99');

  act(() => resetValue());
  expect(container.textContent).toEqual('10');
});

testRecoil('Hook parity: useRecoilStateLoadable()', () => {
  const statusAtom = atom({
    key: 'hook parity useRecoilStateLoadable',
    default: 'idle',
  });
  let setStatus;

  function Component() {
    const [statusLoadable, set] = useRecoilStateLoadable(statusAtom);
    setStatus = set;
    return `${statusLoadable.state}:${String(statusLoadable.contents)}`;
  }

  const container = renderElements(<Component />);
  expect(container.textContent).toEqual('hasValue:idle');

  act(() => setStatus('done'));
  expect(container.textContent).toEqual('hasValue:done');
});

testRecoil('Hook parity: useRecoilValueLoadable()', async () => {
  const gateAtom = atom({
    key: 'hook parity useRecoilValueLoadable gate',
    default: 1,
  });
  let resolve;

  const asyncValueSelector = selector({
    key: 'hook parity useRecoilValueLoadable selector',
    get: ({get}) =>
      new Promise(res => {
        const base = get(gateAtom);
        resolve = () => res(base * 5);
      }),
  });

  function Component() {
    const loadable = useRecoilValueLoadable(asyncValueSelector);
    return loadable.state === 'hasValue'
      ? `${loadable.state}:${String(loadable.contents)}`
      : loadable.state;
  }

  const container = renderElements(<Component />);
  expect(container.textContent).toEqual('loading');

  act(() => resolve());
  await flushPromisesAndTimers();
  expect(container.textContent).toEqual('hasValue:5');
});

testRecoil('Hook parity: useGetRecoilValueInfo_UNSTABLE()', () => {
  const infoAtom = atom({
    key: 'hook parity useGetRecoilValueInfo atom',
    default: 'alpha',
  });
  let getInfo = () => {
    throw new Error('getInfo not set');
  };
  let setValue;

  function Component() {
    const getRecoilValueInfo = useGetRecoilValueInfo();
    getInfo = node => ({...getRecoilValueInfo(node)});
    setValue = useSetRecoilState(infoAtom);
    useRecoilValue(infoAtom);
    return null;
  }

  renderElements(<Component />);

  expect(getInfo(infoAtom)).toMatchObject({
    isActive: true,
    type: 'atom',
    loadable: expect.objectContaining({
      state: 'hasValue',
      contents: 'alpha',
    }),
  });

  act(() => setValue('beta'));

  expect(getInfo(infoAtom)).toMatchObject({
    isActive: true,
    type: 'atom',
    loadable: expect.objectContaining({
      state: 'hasValue',
      contents: 'beta',
    }),
  });
});

testRecoil('Hook parity: useRecoilRefresher_UNSTABLE()', () => {
  let evalCount = 0;
  const refreshSelector = selector({
    key: 'hook parity useRecoilRefresher selector',
    get: () => {
      evalCount += 1;
      return evalCount;
    },
  });
  let refresh;

  function Component() {
    const value = useRecoilValue(refreshSelector);
    refresh = useRecoilRefresher(refreshSelector);
    return value;
  }

  const container = renderElements(<Component />);
  const initial = Number(container.textContent);

  act(() => refresh());
  const refreshed = Number(container.textContent);

  expect(refreshed).toBeGreaterThan(initial);
});

testRecoil('Hook parity: isRecoilValue()', () => {
  const myAtom = atom({key: 'hook parity isRecoilValue', default: 0});

  expect(isRecoilValue(myAtom)).toBe(true);
  expect(isRecoilValue({key: 'fake'})).toBe(false);
});

testRecoil('Hook parity: useRecoilTransaction_UNSTABLE()', () => {
  const atomA = atom({key: 'hook parity useRecoilTransaction A', default: 1});
  const atomB = atom({key: 'hook parity useRecoilTransaction B', default: 2});
  let runTransaction;

  function Values() {
    return `${useRecoilValue(atomA)},${useRecoilValue(atomB)}`;
  }
  function TransactionButton() {
    runTransaction = useRecoilTransaction(
      ({get, set}) =>
        () => {
          set(atomA, get(atomA) + 10);
          set(atomB, get(atomB) + 20);
        },
      [],
    );
    return null;
  }

  const container = renderElements(
    <>
      <Values />
      <TransactionButton />
    </>,
  );
  expect(container.textContent).toEqual('1,2');

  act(() => runTransaction());
  expect(container.textContent).toEqual('11,22');
});

testRecoil('Hook parity: useRecoilCallback()', async () => {
  const callbackAtom = atom({
    key: 'hook parity useRecoilCallback atom',
    default: 0,
  });
  let runCallback;

  function Component() {
    runCallback = useRecoilCallback(
      ({snapshot, set}) =>
        async nextValue => {
          const prev = await snapshot.getPromise(callbackAtom);
          set(callbackAtom, nextValue);
          return prev;
        },
      [],
    );
    return useRecoilValue(callbackAtom);
  }

  const container = renderElements(<Component />);
  expect(container.textContent).toEqual('0');

  let previous;
  await act(async () => {
    previous = await runCallback(7);
  });

  expect(previous).toEqual(0);
  expect(container.textContent).toEqual('7');
});

testRecoil('Hook parity: useRecoilTransactionObserver_UNSTABLE()', () => {
  const observerAtom = atom({
    key: 'hook parity useRecoilTransactionObserver atom',
    default: 0,
  });
  let setValue;
  const transitions = [];

  function Observer() {
    useRecoilTransactionObserver(({previousSnapshot, snapshot}) => {
      const prev = previousSnapshot.getLoadable(observerAtom).contents;
      const next = snapshot.getLoadable(observerAtom).contents;
      if (prev !== next) {
        transitions.push(`${String(prev)}->${String(next)}`);
      }
    });
    return null;
  }

  function Writer() {
    setValue = useSetRecoilState(observerAtom);
    return null;
  }

  renderElements(
    <>
      <Observer />
      <Writer />
    </>,
  );

  act(() => setValue(4));
  expect(transitions).toContain('0->4');
});

testRecoil('Hook parity: useRecoilSnapshot() + useGotoRecoilSnapshot()', () => {
  const snapshotAtom = atom({
    key: 'hook parity useRecoilSnapshot atom',
    default: 0,
  });
  let setValue;
  let saveSnapshot;
  let restoreSnapshot;
  let savedSnapshot = null;

  function Component() {
    const value = useRecoilValue(snapshotAtom);
    const snapshot = useRecoilSnapshot();
    const gotoSnapshot = useGotoRecoilSnapshot();

    setValue = useSetRecoilState(snapshotAtom);
    saveSnapshot = () => {
      savedSnapshot = snapshot;
    };
    restoreSnapshot = () => {
      if (savedSnapshot != null) {
        gotoSnapshot(savedSnapshot);
      }
    };

    return value;
  }

  const container = renderElements(<Component />);
  expect(container.textContent).toEqual('0');

  act(() => saveSnapshot());
  act(() => setValue(9));
  expect(container.textContent).toEqual('9');

  act(() => restoreSnapshot());
  expect(container.textContent).toEqual('0');
});
