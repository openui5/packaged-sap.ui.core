/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2017 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

sap.ui.define([
	"sap/ui/test/autowaiter/_XHRWaiter",
	"sap/ui/test/autowaiter/_timeoutWaiter",
	"sap/ui/test/autowaiter/_promiseWaiter",
	"sap/ui/test/autowaiter/_navigationContainerWaiter",
	"sap/ui/test/autowaiter/_UIUpdatesWaiter"
], function (_XHRWaiter, _timeoutWaiter, _promiseWaiter, _navigationContainerWaiter, _UIUpdatesWaiter) {
	"use strict";

	// TODO: add possibility to add and exclude validators
	// execute wait helpers in sequence and stop on the first that returns true
	// eg: there's no use to call _timeoutWaiter if _UIUpdatesWaiter is true
	var aWaiters = [_navigationContainerWaiter, _UIUpdatesWaiter, _XHRWaiter, _promiseWaiter, _timeoutWaiter];

	return {
		hasToWait: function () {
			var result = false;
			aWaiters.forEach(function (oWaiter) {
				if (!result && oWaiter.hasPending()) {
					result = true;
				}
			});
			return result;
		}
	};
}, true);
