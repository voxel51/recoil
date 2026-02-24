# Recoil &middot; [![Yarn Test](https://github.com/voxel51/recoil/actions/workflows/yarn-test.yml/badge.svg)](https://github.com/voxel51/recoil/actions/workflows/yarn-test.yml) [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/facebookexperimental/Recoil/blob/main/LICENSE)

Recoil is an experimental state management framework for React.

Website: https://recoiljs.org

## React 19 Fork Notes (Experimental)

This workspace uses a fork of Recoil and targets React 19.

- What we changed:
  - We updated React-mode detection to handle React 19 removing `__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED` by falling back to public `useSyncExternalStore` availability.
  - We added a hook parity test (`packages/recoil/hooks/__tests__/Recoil_HooksParity-test.js`) and validated all core public hooks in this setup.

- Known risks:
  - Mixed-renderer environments (like React DOM + React Three Fiber) can still be risky. If React internals are unavailable, Recoil cannot verify dispatcher-level `useSyncExternalStore` support and falls back to API presence checks.

## Documentation

Documentation: https://recoiljs.org/docs/introduction/core-concepts


API Reference: https://recoiljs.org/docs/api-reference/core/RecoilRoot


Tutorials: https://recoiljs.org/resources

## Installation

The Recoil package lives in [npm](https://www.npmjs.com/get-npm).  Please see the [installation guide](https://recoiljs.org/docs/introduction/installation)


To install the latest stable version, run the following command:

```shell
npm install recoil
```

Or if you're using [yarn](https://classic.yarnpkg.com/en/docs/install/):

```shell
yarn add recoil
```

Or if you're using [bower](https://bower.io/#install-bower):

```shell
bower install --save recoil
```

## Contributing

Development of Recoil happens in the open on GitHub, and we are grateful to the community for contributing bugfixes and improvements. Read below to learn how you can take part in improving Recoil.

- [Code of Conduct](./CODE_OF_CONDUCT.md)
- [Contributing Guide](./CONTRIBUTING.md)

### License

Recoil is [MIT licensed](./LICENSE).
