/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2018 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

sap.ui.define(['sap/ui/Device'], function(Device) {
	"use strict";

	/*global ES6Promise */

	// the Promise behaves wrong in MS Edge and Apple Safari - therefore we rely on the Promise
	// polyfill for these browsers which works properly (copy from jQuery.sap.global)
	// Related to MS Edge issue: https://connect.microsoft.com/IE/feedback/details/1658365
	if (Device.browser.edge || Device.browser.safari) {
		window.Promise = undefined;
	}

	if (!window.Promise) {
		sap.ui.requireSync("sap/ui/thirdparty/es6-promise");
		ES6Promise.polyfill();
	}

});
