/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @oncall recoil
 */

'use strict';

const React = require('react');
const ReactDOMTestUtils = require('react-dom/test-utils');

module.exports = {
  ...ReactDOMTestUtils,
  act: React.act ?? ReactDOMTestUtils.act,
};
