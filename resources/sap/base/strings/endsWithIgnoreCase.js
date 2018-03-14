/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2018 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */
sap.ui.define([], function() {
	"use strict";

	/**
	 * Checks whether a given <code>sString</code> ends with <code>sEndString</code>
	 * ignoring the case of the strings.
	 *
	 * @function
	 * @exports sap/base/strings/endsWithIgnoreCase
	 * @param {string} sString String to be checked
	 * @param {string} sEndString The end string to be searched
	 * @returns {boolean} Whether <code>sString</code> ends with <code>sEndString</code>
	 * @private
	 * @example
	 * endsWithIgnoreCase("fooBaR", "bar") -> true
	 * endsWithIgnoreCase("fooBaR", "foO") -> false
	 * endsWithIgnoreCase("foobar", "") -> false
	 */
	var fnEndsWithIgnoreCase = function(sString, sEndString) {
		if (typeof (sEndString) != "string" || sEndString == "") {
			return false;
		}
		sString = sString.toUpperCase();
		sEndString = sEndString.toUpperCase();
		return sString.endsWith(sEndString);
	};
	return fnEndsWithIgnoreCase;

});


