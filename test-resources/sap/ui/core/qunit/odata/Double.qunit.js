/*!
 *{copyright}
 */
(function () {
	/*global asyncTest, deepEqual, equal, expect, module, notDeepEqual,
	notEqual, notStrictEqual, ok, raises, sinon, start, strictEqual, stop, test,
	*/
	"use strict";

	var sDefaultLanguage = sap.ui.getCore().getConfiguration().getLanguage();

	jQuery.sap.require("sap.ui.core.Control");
	jQuery.sap.require("sap.ui.core.LocaleData");
	jQuery.sap.require("sap.ui.model.odata.type.Double");

	//*********************************************************************************************
	module("sap.ui.model.odata.type.Double", {
		setup: function () {
			sap.ui.getCore().getConfiguration().setLanguage("en-US");
		},
		teardown: function () {
			sap.ui.getCore().getConfiguration().setLanguage(sDefaultLanguage);
		}
	});

	//*********************************************************************************************
	test("basics", function () {
		var oType = new sap.ui.model.odata.type.Double();

		ok(oType instanceof sap.ui.model.odata.type.Double, "is a Double");
		ok(oType instanceof sap.ui.model.odata.type.ODataType, "is a ODataType");
		strictEqual(oType.getName(), "sap.ui.model.odata.type.Double", "type name");
		strictEqual(oType.oFormatOptions, undefined, "default format options");
		strictEqual(oType.oConstraints, undefined, "default constraints");
		strictEqual(oType.oFormat, null, "no formatter preload");
	});

	//*********************************************************************************************
	test("format: English", function () {
		var oType = new sap.ui.model.odata.type.Double();

		strictEqual(oType.formatValue(undefined, "foo"), null, "undefined");
		strictEqual(oType.formatValue(null, "foo"), null, "null");
		strictEqual(oType.formatValue("1.234E3", "any"), "1.234E3", "target type any");
		strictEqual(oType.formatValue("1.234567E3", "float"), 1234.567, "target type float");
		strictEqual(oType.formatValue("1.2341e3", "int"), 1234, "target type int");
		strictEqual(oType.formatValue("0", "string"), "0", "0");
		strictEqual(oType.formatValue("9.99999999999999e+14", "string"), "999,999,999,999,999",
			"9.99999999999999e+14");
		strictEqual(oType.formatValue("1e+15", "string"), "1\u00a0E+15", "1e+15");
		strictEqual(oType.formatValue("-9.99999999999999e+14", "string"), "-999,999,999,999,999",
			"-9.99999999999999e+14");
		strictEqual(oType.formatValue("-1e+15", "string"), "-1\u00a0E+15", "-1e+15");
		strictEqual(oType.formatValue("1e-4", "string"), "0.0001", "1e-4");
		strictEqual(oType.formatValue("9.99999999999999e-5", "string"),
			"9.99999999999999\u00a0E-5", "9.99999999999999e-5");
		try {
			oType.formatValue(12.34, "boolean");
			ok(false);
		} catch (e) {
			ok(e instanceof sap.ui.model.FormatException);
			strictEqual(e.message,
				"Don't know how to format sap.ui.model.odata.type.Double to boolean");
		}
	});

	//*********************************************************************************************
	test("format: modified Swedish", function () {
		var oType = new sap.ui.model.odata.type.Double({plusSign: ">", minusSign: "<"});

		// Swedish is interesting because it uses a different decimal separator, non-breaking
		// space as grouping separator and _not_ the 'E' for the exponential format.
		// TODO The 'e' is not replaced because NumberFormat doesn't care either (esp. in parse).
		sap.ui.getCore().getConfiguration().setLanguage("sv");

		strictEqual(oType.formatValue("-1.234e+3", "string"), "<1\u00a0234", "check modification");
		strictEqual(oType.formatValue("-1.234e+15", "string"), "<1,234\u00a0E>15",
			"check replacement");
	});

	//*********************************************************************************************
	test("parse", function () {
		var oType = new sap.ui.model.odata.type.Double();

		try {
			oType.parseValue("4.2", "string");
			ok(false);
		} catch (e) {
			ok(e instanceof sap.ui.model.ParseException);
			strictEqual(e.message, "Unsupported operation: data type " + oType.getName()
				+ " is read-only.");
		}
	});

	//*********************************************************************************************
	test("validate", function () {
		var oType = new sap.ui.model.odata.type.Double();

		try {
			oType.validateValue(42);
			ok(false);
		} catch (e) {
			ok(e instanceof sap.ui.model.ValidateException);
			strictEqual(e.message, "Unsupported operation: data type " + oType.getName()
				+ " is read-only.");
		}
	});

	//*********************************************************************************************
	test("localization change", function () {
		var oControl = new sap.ui.core.Control(),
			oType = new sap.ui.model.odata.type.Double();

		oControl.bindProperty("tooltip", {path: "/unused", type: oType});
		strictEqual(oType.formatValue("1.234e3", "string"), "1,234",
			"before language change");
		sap.ui.getCore().getConfiguration().setLanguage("de-CH");
		strictEqual(oType.formatValue("1.234e3", "string"), "1'234",
			"adjusted to changed language");
	});

	//*********************************************************************************************
	jQuery.each([{
		set: {foo: "bar"},
		expect: {foo: "bar", groupingEnabled: true}
	}, {
		set: {decimals: 7, groupingEnabled: false},
		expect: {decimals: 7, groupingEnabled: false}
	}], function (i, oFixture) {
		test("formatOptions: " + JSON.stringify(oFixture.set), function () {
			var oSpy,
				oType = new sap.ui.model.odata.type.Double(oFixture.set);

			deepEqual(oType.oFormatOptions, oFixture.set);

			oSpy = this.spy(sap.ui.core.format.NumberFormat, "getFloatInstance");
			oType.formatValue(42, "string");
			sinon.assert.calledWithExactly(oSpy, oFixture.expect);
		});
	});
} ());
