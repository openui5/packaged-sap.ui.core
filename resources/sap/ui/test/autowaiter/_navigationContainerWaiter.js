/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2018 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

sap.ui.define([
	"jquery.sap.global",
	"sap/ui/test/_OpaLogger",
	"sap/ui/test/_opaCorePlugin"
], function ($, _OpaLogger, _opaCorePlugin) {
	"use strict";

	var oHasPendingLogger = _OpaLogger.getLogger("sap.ui.test.autowaiter._navigationContainerWaiter#hasPending");

	function hasNavigatingNavContainers () {
		var sControlType = "sap.m.NavContainer";
		var fnNavContainer = $.sap.getObject(sControlType);
		// no Nav container has been loaded - continue
		if (sap.ui.lazyRequire._isStub(sControlType) || !fnNavContainer) {
			return false;
		}

		return _opaCorePlugin.getAllControls(fnNavContainer).some(function (oNavContainer) {
			if (oNavContainer._bNavigating) {
				oHasPendingLogger.debug("The NavContainer " + oNavContainer + " is currently navigating");
			}

			return oNavContainer._bNavigating;
		});
	}

	return {
		hasPending: hasNavigatingNavContainers
	};
});
