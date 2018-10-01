sap.ui.define(["sap/ui/model/ValidateException",
	"sap/ui/model/FormatException",
	"sap/ui/model/type/Boolean",
	"sap/ui/model/ParseException",
	"sap/ui/model/type/String",
	"sap/ui/model/type/Integer",
	"sap/ui/model/type/Float",
	"sap/ui/model/type/Currency",
	"sap/ui/model/type/Unit",
	"sap/ui/model/type/Date",
	"sap/ui/model/type/Time",
	"sap/ui/model/type/TimeInterval",
	"sap/ui/model/type/DateTime",
	"sap/ui/model/type/DateInterval",
	"sap/ui/model/type/DateTimeInterval",
	"sap/ui/model/type/FileSize",
	"sap/ui/core/format/NumberFormat"],
	function (ValidateException, FormatException, BooleanType,
		ParseException, StringType, IntegerType,
		FloatType, CurrencyType, UnitType, DateType,
		TimeType, TimeIntervalType, DateTimeType,
		DateIntervalType, DateTimeIntervalType, FileSizeType, NumberFormat) {
		function checkValidateException(oEx) {
			// Exception fails, if translation text can not be found (message looks like the translation key)
			return oEx instanceof ValidateException && !/^\w+\.\w+$/.test(oEx.message);
		}

		function checkParseException(oEx) {
			// Exception fails, if translation text can not be found (message looks like the translation key)
			return oEx instanceof ParseException && !/^\w+\.\w+$/.test(oEx.message);
		}

		// boolean type tests
		QUnit.module("boolean type");

		QUnit.test("boolean formatValue", function (assert) {
			var boolType = new BooleanType();
			assert.equal(boolType.formatValue(true, "boolean"), true, "format test");
			assert.equal(boolType.formatValue(null, "boolean"), null, "format test");
			assert.equal(boolType.formatValue(undefined, "boolean"), null, "format test");
			assert.equal(boolType.formatValue(false, "boolean"), false, "format test");
			assert.equal(boolType.formatValue(true, "string"), "true", "format test");
			assert.equal(boolType.formatValue(false, "string"), "false", "format test");
			raises(function () { boolType.formatValue(true, "int") }, "format test");
			raises(function () { boolType.formatValue(false, "int") }, "format test");
			raises(function () { boolType.formatValue(true, "float") }, "format test");
			raises(function () { boolType.formatValue(false, "float") }, "format test");
		});

		QUnit.test("boolean parseValue", function (assert) {
			var boolType = new BooleanType();
			assert.equal(boolType.parseValue(true, "boolean"), true, "parse test");
			assert.equal(boolType.parseValue(false, "boolean"), false, "parse test");
			assert.equal(boolType.parseValue("true", "string"), true, "parse test");
			assert.equal(boolType.parseValue("false", "string"), false, "parse test");
			assert.equal(boolType.parseValue("X", "string"), true, "parse test");
			assert.equal(boolType.parseValue("", "string"), false, "parse test");
			assert.equal(boolType.parseValue(" ", "string"), false, "parse test");

			raises(function () { boolType.parseValue(true, "int") }, ParseException, "parse test");
			raises(function () { boolType.parseValue(false, "int") }, ParseException, "parse test");
			raises(function () { boolType.parseValue(true, "float") }, ParseException, "parse test");
			raises(function () { boolType.parseValue(false, "float") }, ParseException, "parse test");
			raises(function () { boolType.parseValue("xxx", "string") }, checkParseException, "parse test");
		});

		// string type tests
		QUnit.module("string type");

		QUnit.test("string formatValue", function (assert) {
			var stringType = new StringType();
			assert.equal(stringType.formatValue("true", "boolean"), true, "format test");
			assert.equal(stringType.formatValue("false", "boolean"), false, "format test");
			assert.equal(stringType.formatValue("X", "boolean"), true, "format test");
			assert.equal(stringType.formatValue("", "boolean"), false, "format test");
			assert.equal(stringType.formatValue(undefined, "boolean"), null, "format test");
			assert.equal(stringType.formatValue(null, "boolean"), null, "format test");
			assert.equal(stringType.formatValue("test", "string"), "test", "format test");
			assert.equal(stringType.formatValue("X", "string"), "X", "format test");
			assert.equal(stringType.formatValue("1234", "int"), 1234, "format test");
			assert.equal(stringType.formatValue("34", "int"), 34, "format test");
			assert.equal(stringType.formatValue("1.34", "float"), 1.34, "format test");
			assert.equal(stringType.formatValue("33.456", "float"), 33.456, "format test");

			raises(function () { stringType.formatValue("33.456", "untype") }, "format test");
			raises(function () { stringType.formatValue("notfalse", "boolean") }, FormatException, "format test");
			raises(function () { stringType.formatValue("NaN", "int") }, FormatException, "format test");
			raises(function () { stringType.formatValue("d3f.442fs", "float") }, FormatException, "format test");

		});

		QUnit.test("string parseValue", function (assert) {
			var stringType = new StringType();
			assert.equal(stringType.parseValue(true, "boolean"), "true", "parse test");
			assert.equal(stringType.parseValue(false, "boolean"), "false", "parse test");
			assert.equal(stringType.parseValue("true", "string"), "true", "parse test");
			assert.equal(stringType.parseValue("false", "string"), "false", "parse test");
			assert.equal(stringType.parseValue("X", "string"), "X", "parse test");
			assert.equal(stringType.parseValue("", "string"), "", "parse test");
			assert.equal(stringType.parseValue(-222, "int"), "-222", "parse test");
			assert.equal(stringType.parseValue(-4.3657, "float"), "-4.3657", "parse test");

			raises(function () { stringType.parseValue(true, "untype") }, ParseException, "parse test");
		});

		QUnit.test("string validateValue", function (assert) {

			var stringType = new StringType(null, {
				minLength: 3,
				maxLength: 10
			});
			try {
				assert.equal(stringType.validateValue("fff"), undefined, "validate test");
				assert.equal(stringType.validateValue("ffdddddddd"), undefined, "validate test");
			} catch (e) {
				assert.ok(false, "one of the validation tests failed please check");
			}
			raises(function () { stringType.validateValue("dd") }, checkValidateException, "validate test");
			raises(function () { stringType.validateValue("ddggggggggggg") }, checkValidateException, "validate test");

			var stringType = new StringType(null, {
				startsWith: "ab",
				contains: "cd"
			});
			try {
				assert.equal(stringType.validateValue("abcccdfff"), undefined, "validate test");
				assert.equal(stringType.validateValue("abcd"), undefined, "validate test");
			} catch (e) {
				assert.ok(false, "one of the validation tests failed please check");
			}
			raises(function () { stringType.validateValue("cdab") }, checkValidateException, "validate test");
			raises(function () { stringType.validateValue("abdccsbaab") }, checkValidateException, "validate test");

			var stringType = new StringType(null, {
				equals: "ab"
			});
			try {
				assert.equal(stringType.validateValue("ab"), undefined, "validate test");
			} catch (e) {
				assert.ok(false, "one of the validation tests failed please check");
			}
			raises(function () { stringType.validateValue("cdab") }, checkValidateException, "validate test");
			raises(function () { stringType.validateValue("abdaab") }, checkValidateException, "validate test");
			var stringType = new StringType(null, {
				search: "ab",
			});
			try {
				assert.equal(stringType.validateValue("ddabcccdfff"), undefined, "validate test");
				assert.equal(stringType.validateValue("abcd"), undefined, "validate test");
			} catch (e) {
				assert.ok(false, "one of the validation tests failed please check");
			}
			raises(function () { stringType.validateValue("cdb") }, checkValidateException, "validate test");
			raises(function () { stringType.validateValue("adccsbba") }, checkValidateException, "validate test");

		});

		// integer type tests
		QUnit.module("integer type");

		QUnit.test("integer formatValue", function (assert) {
			var intType = new IntegerType();
			assert.equal(intType.formatValue(22, "string"), "22", "format test");
			assert.equal(intType.formatValue(-6622, "string"), "-6622", "format test");
			assert.equal(intType.formatValue(1234, "int"), 1234, "format test");
			assert.equal(intType.formatValue(null, "int"), null, "format test");
			assert.equal(intType.formatValue(undefined, "int"), null, "format test");
			assert.equal(intType.formatValue(0, "int"), 0, "format test");
			assert.equal(intType.formatValue(0.00, "int"), 0, "format test");
			assert.equal(intType.formatValue(34, "int"), 34, "format test");
			assert.equal(intType.formatValue(134, "float"), 134, "format test");
			assert.equal(intType.formatValue(344456, "float"), 344456, "format test");

			raises(function () { intType.formatValue(33456, "boolean") }, "format test");
			raises(function () { intType.formatValue(22, "untype") }, FormatException, "format test");

		});

		QUnit.test("integer parseValue", function (assert) {
			var intType = new IntegerType();

			assert.equal(intType.parseValue("3333", "string"), 3333, "parse test");
			assert.equal(intType.parseValue("3,555", "string"), 3555, "parse test");
			assert.equal(intType.parseValue("-3,555", "string"), -3555, "parse test");
			assert.equal(intType.parseValue(-3, "float"), -3, "parse test");
			raises(function () { intType.parseValue("-3.444", "float") }, ParseException, "parse test");
			assert.equal(intType.parseValue(-222, "int"), -222, "parse test");
			assert.equal(intType.parseValue(4444, "float"), 4444, "parse test");

			raises(function () { intType.parseValue("3333.555", "string") }, ParseException, "parse test");
			raises(function () { intType.parseValue(true, "untype") }, ParseException, "parse test");
			raises(function () { intType.parseValue(true, "boolean") }, ParseException, "parse test");
			raises(function () { intType.parseValue("test", "string") }, checkParseException, "parse test");
		});

		QUnit.test("integer validateValue", function (assert) {
			var intType = new IntegerType(null, {
				minimum: 3,
				maximum: 10
			});
			try {
				assert.equal(intType.validateValue(4), undefined, "validate test");
				assert.equal(intType.validateValue(10), undefined, "validate test");
			} catch (e) {
				assert.ok(false, "one of the validation tests failed please check");
			}
			raises(function () { intType.validateValue(-1) }, checkValidateException, "validate test");
			raises(function () { intType.validateValue(33) }, checkValidateException, "validate test");

		});

		QUnit.test("integer formatOptions", function (assert) {
			var intType = new IntegerType({
				minIntegerDigits: 2,
				maxIntegerDigits: 4
			});

			assert.equal(intType.formatValue(22, "string"), "22", "format test");
			assert.equal(intType.formatValue(333, "string"), "333", "format test");
			assert.equal(intType.formatValue(6666, "string"), "6666", "format test");
			assert.equal(intType.formatValue(-6622, "string"), "-6622", "format test");
			assert.equal(intType.formatValue(662244, "string"), "????", "format test");
			assert.equal(intType.formatValue(1, "string"), "01", "format test");
			// see NumberFormat.qunit for further formatting tests...

		});

		QUnit.test("integer formatOptions.source", function (assert) {
			var intType = new IntegerType({
				source: {
					groupingEnabled: true
				}
			});

			assert.equal(intType.formatValue("22", "string"), "22", "format test");
			assert.equal(intType.formatValue("333", "string"), "333", "format test");
			assert.equal(intType.formatValue("6,666", "string"), "6666", "format test");
			assert.equal(intType.formatValue("-6622", "string"), "-6622", "format test");
			assert.equal(intType.parseValue("3333", "string"), "3,333", "parse test");
			assert.equal(intType.parseValue("3,555", "string"), "3,555", "parse test");
			assert.equal(intType.parseValue("-3,555", "string"), "-3,555", "parse test");

		});

		QUnit.test("integer formatOptions.source and validateValue", function (assert) {
			var intType = new IntegerType({
				source: {
					decimalSeparator: ",",
					groupingSeparator: "."
				}
			}, {
					minimum: 3,
					maximum: 10
				});

			try {
				assert.equal(intType.validateValue("4,0"), undefined, "validate test");
				assert.equal(intType.validateValue("10"), undefined, "validate test");
			} catch (e) {
				assert.ok(false, "one of the validation tests failed please check");
			}
			raises(function () { intType.validateValue("-1") }, checkValidateException, "validate test");
			raises(function () { intType.validateValue("3.300") }, checkValidateException, "validate test");

		});


		// float type tests
		QUnit.module("float type");

		QUnit.test("float formatValue", function (assert) {
			var floatType = new FloatType();
			assert.equal(floatType.formatValue(22, "string"), "22", "format test");
			assert.equal(floatType.formatValue(-6622.333, "string"), "-6,622.333", "format test");
			assert.equal(floatType.formatValue(1.0, "string"), "1", "format test");
			assert.equal(floatType.formatValue(1.0000, "string"), "1", "format test");
			assert.equal(floatType.formatValue(1234, "int"), 1234, "format test");
			assert.equal(floatType.formatValue(34.44, "int"), 34, "format test");
			assert.equal(floatType.formatValue(undefined, "int"), null, "format test");
			assert.equal(floatType.formatValue(null, "int"), null, "format test");
			assert.equal(floatType.formatValue(0, "float"), 0, "format test");
			assert.equal(floatType.formatValue(0.0000, "int"), 0, "format test");
			assert.equal(floatType.formatValue(34.64, "int"), 34, "format test");
			assert.equal(floatType.formatValue(30.000, "int"), 30, "format test");
			assert.equal(floatType.formatValue(134.12, "float"), 134.12, "format test");
			assert.equal(floatType.formatValue(344456.5667, "float"), 344456.5667, "format test");
			assert.equal(floatType.formatValue(-344456.5667, "float"), -344456.5667, "format test");
			assert.equal(floatType.formatValue(134.00, "float"), 134, "format test");
			assert.equal(floatType.formatValue(134.000, "float"), 134, "format test");

			raises(function () { floatType.formatValue(22.0, "untype") }, FormatException, "format test");

		});

		QUnit.test("float parseValue", function (assert) {
			var floatType = new FloatType();

			assert.equal(floatType.parseValue("3333", "string"), 3333, "parse test");
			assert.equal(floatType.parseValue("3333.555", "string"), 3333.555, "parse test");
			assert.equal(floatType.parseValue("3.555", "string"), 3.555, "parse test");
			assert.equal(floatType.parseValue("-3.555", "string"), -3.555, "parse test");
			assert.equal(floatType.parseValue(-3.555, "float"), -3.555, "parse test");
			assert.equal(floatType.parseValue(-222, "int"), -222, "parse test");
			assert.equal(floatType.parseValue(-4.3657, "float"), -4.3657, "parse test");
			assert.equal(floatType.parseValue(4.657, "float"), 4.657, "parse test");

			raises(function () { floatType.parseValue(true, "untype") }, ParseException, "parse test");
			raises(function () { floatType.parseValue(true, "boolean") }, ParseException, "parse test");
			raises(function () { floatType.parseValue("test", "string") }, ParseException, "parse test");
		});

		QUnit.test("float validateValue", function (assert) {
			var floatType = new FloatType(null, {
				minimum: 3,
				maximum: 10
			});
			try {
				assert.equal(floatType.validateValue(3.0), undefined, "validate test");
				assert.equal(floatType.validateValue(3.01), undefined, "validate test");
				assert.equal(floatType.validateValue(10), undefined, "validate test");
			} catch (e) {
				assert.ok(false, "one of the validation tests failed please check");
			}
			raises(function () { floatType.validateValue(2.99999) }, checkValidateException, "validate test");
			raises(function () { floatType.validateValue(10.0000001) }, checkValidateException, "validate test");

		});

		QUnit.test("float formatOptions", function (assert) {
			var floatType = new FloatType({
				minFractionDigits: 2,
				maxFractionDigits: 2
			});

			assert.equal(floatType.formatValue(22, "string"), "22.00", "format test");
			assert.equal(floatType.formatValue(-6622.333, "string"), "-6,622.33", "format test");
			assert.equal(floatType.formatValue(-6622.339, "string"), "-6,622.34", "format test");
			assert.equal(floatType.formatValue(1.0, "string"), "1.00", "format test");
			assert.equal(floatType.formatValue(1.0000, "string"), "1.00", "format test");
			assert.equal(floatType.formatValue(1.009, "string"), "1.01", "format test");
			assert.equal(floatType.formatValue(1.00001, "string"), "1.00", "format test");


			// TODO is this right?! no formatting for floats?
			// see numberformat.qunit for more formatting tests
			assert.equal(floatType.formatValue(134.12, "float"), 134.12, "format test");
			assert.equal(floatType.formatValue(344456.5667, "float"), 344456.5667, "format test");
			assert.equal(floatType.formatValue(-344456.5667, "float"), -344456.5667, "format test");
			assert.equal(floatType.formatValue(134.00, "float"), 134, "format test");
			assert.equal(floatType.formatValue(134.000, "float"), 134, "format test");

		});

		QUnit.test("float formatOptions.source", function (assert) {
			var floatType = new FloatType({
				source: {}
			});

			assert.equal(floatType.parseValue("3333", "string"), "3333", "parse test");
			assert.equal(floatType.parseValue("3333.555", "string"), "3333.555", "parse test");
			assert.equal(floatType.parseValue("3.555", "string"), "3.555", "parse test");
			assert.equal(floatType.parseValue("-3.555", "string"), "-3.555", "parse test");
			assert.equal(floatType.parseValue(-3.555, "float"), "-3.555", "parse test");
			assert.equal(floatType.parseValue(-222, "int"), "-222", "parse test");

			assert.equal(floatType.formatValue("22", "string"), "22", "format test");
			assert.equal(floatType.formatValue("-6622.333", "string"), "-6,622.333", "format test");
			assert.equal(floatType.formatValue("-6622.339", "string"), "-6,622.339", "format test");

		});

		QUnit.test("float formatOptions.source and validateValue", function (assert) {
			var floatType = new FloatType({
				source: {
					decimalSeparator: ",",
					groupingSeparator: "."
				}
			}, {
					minimum: 3,
					maximum: 10
				});
			try {
				assert.equal(floatType.validateValue("3,0"), undefined, "validate test");
				assert.equal(floatType.validateValue("3,01"), undefined, "validate test");
				assert.equal(floatType.validateValue("10"), undefined, "validate test");
			} catch (e) {
				assert.ok(false, "one of the validation tests failed please check");
			}
			raises(function () { floatType.validateValue("2,99999") }, checkValidateException, "validate test");
			raises(function () { floatType.validateValue("10,0000001") }, checkValidateException, "validate test");

		});

		// currency type tests
		QUnit.module("currency type");

		QUnit.test("currency formatValue", function (assert) {
			var currencyType = new CurrencyType();
			assert.equal(currencyType.formatValue([22, "EUR"], "string"), "EUR" + "\xa0" + "22.00", "format test");
			assert.equal(currencyType.formatValue([22, "JPY"], "string"), "JPY" + "\xa0" + "22", "format test");
			assert.equal(currencyType.formatValue([-6622.333, "EUR"], "string"), "EUR" + "\ufeff" + "-6,622.33", "format test");
			assert.equal(currencyType.formatValue([1.0, "EUR"], "string"), "EUR" + "\xa0" + "1.00", "format test");
			assert.equal(currencyType.formatValue([1.0000, "EUR"], "string"), "EUR" + "\xa0" + "1.00", "format test");

			assert.equal(currencyType.formatValue(null, "string"), null, "format test");
			assert.equal(currencyType.formatValue([null, "EUR"], "string"), null, "format test");
			assert.equal(currencyType.formatValue([1, null], "string"), "1.00", "format test");

			raises(function () { currencyType.formatValue(22.0, "int") }, FormatException, "format test");
			raises(function () { currencyType.formatValue(22.0, "float") }, FormatException, "format test");
			raises(function () { currencyType.formatValue(22.0, "untype") }, FormatException, "format test");
		});

		QUnit.test("currency parseValue", function (assert) {
			var currencyType = new CurrencyType();

			assert.deepEqual(currencyType.parseValue("3333", "string"), [3333, undefined], "parse test");
			assert.deepEqual(currencyType.parseValue("USD" + "\xa0" + "3333.555", "string"), [3333.555, "USD"], "parse test");
			assert.deepEqual(currencyType.parseValue("EUR3.555", "string"), [3.555, "EUR"], "parse test");
			assert.deepEqual(currencyType.parseValue("¥-3.555", "string"), [-3.555, "JPY"], "parse test");

			raises(function () { currencyType.parseValue(true, "untype") }, ParseException, "parse test");
			raises(function () { currencyType.parseValue(true, "boolean") }, ParseException, "parse test");
			raises(function () { currencyType.parseValue("test", "string") }, checkParseException, "parse test");
		});

		QUnit.test("currency validateValue", function (assert) {
			var currencyType = new CurrencyType(null, {
				minimum: 3,
				maximum: 10
			});
			try {
				assert.equal(currencyType.validateValue([3.0, "EUR"]), undefined, "validate test");
				assert.equal(currencyType.validateValue([3.01, "USD"]), undefined, "validate test");
				assert.equal(currencyType.validateValue([10, "JPY"]), undefined, "validate test");
			} catch (e) {
				assert.ok(false, "one of the validation tests failed please check");
			}
			raises(function () { currencyType.validateValue([2.99999, "USD"]) }, checkValidateException, "validate test");
			raises(function () { currencyType.validateValue([10.0000001, "EUR"]) }, checkValidateException, "validate test");

		});

		QUnit.test("currency formatOptions", function (assert) {
			var currencyType = new CurrencyType({
				showMeasure: false
			});

			assert.equal(currencyType.formatValue([22, "USD"], "string"), "22.00", "format test");
			assert.equal(currencyType.formatValue([-6622.333, "USD"], "string"), "-6,622.33", "format test");
			assert.equal(currencyType.formatValue([-6622.339, "EUR"], "string"), "-6,622.34", "format test");
			assert.equal(currencyType.formatValue([1.0, "USD"], "string"), "1.00", "format test");
			assert.equal(currencyType.formatValue([1.0000, "JPY"], "string"), "1", "format test");
			assert.equal(currencyType.formatValue([1.009, "EUR"], "string"), "1.01", "format test");
			assert.equal(currencyType.formatValue([1.00001, "USD"], "string"), "1.00", "format test");

			var currencyType = new CurrencyType({
				currencyCode: false
			});

			assert.equal(currencyType.formatValue([22, "USD"], "string"), "$22.00", "format test");
			assert.equal(currencyType.formatValue([-6622.333, "USD"], "string"), "$" + "\ufeff" + "-6,622.33", "format test");
			assert.equal(currencyType.formatValue([-6622.339, "EUR"], "string"), "€" + "\ufeff" + "-6,622.34", "format test");
			assert.equal(currencyType.formatValue([1.0, "USD"], "string"), "$1.00", "format test");
			assert.equal(currencyType.formatValue([1.0000, "JPY"], "string"), "¥1", "format test");
			assert.equal(currencyType.formatValue([1.009, "EUR"], "string"), "€1.01", "format test");
			assert.equal(currencyType.formatValue([1.00001, "USD"], "string"), "$1.00", "format test");

		});

		QUnit.test("currency formatOptions.source", function (assert) {
			var currencyType = new CurrencyType({
				source: {}
			});

			assert.equal(currencyType.parseValue("EUR3333", "string"), "EUR" + "\xa0" + "3333.00", "parse test");
			assert.equal(currencyType.parseValue("USD3333.555", "string"), "USD" + "\xa0" + "3333.56", "parse test");
			assert.equal(currencyType.parseValue("$3.555", "string"), "USD" + "\xa0" + "3.56", "parse test");
			assert.equal(currencyType.parseValue("JPY-3.555", "string"), "JPY" + "\ufeff" + "-4", "parse test");

			assert.equal(currencyType.formatValue("EUR22", "string"), "EUR" + "\xa0" + "22.00", "format test");
			assert.equal(currencyType.formatValue("USD-6622.333", "string"), "USD" + "\ufeff" + "-6,622.33", "format test");
			assert.equal(currencyType.formatValue("JPY-6622.339", "string"), "JPY" + "\ufeff" + "-6,622", "format test");

		});

		QUnit.test("currency formatOptions.source and validateValue", function (assert) {
			var currencyType = new CurrencyType({
				source: {}
			}, {
					minimum: 3,
					maximum: 10
				});
			try {
				assert.equal(currencyType.validateValue("EUR3.00"), undefined, "validate test");
				assert.equal(currencyType.validateValue("USD3.01"), undefined, "validate test");
				assert.equal(currencyType.validateValue("JPY10"), undefined, "validate test");
			} catch (e) {
				assert.ok(false, "one of the validation tests failed please check");
			}
			raises(function () { currencyType.validateValue("USD2.99999") }, checkValidateException, "validate test");
			raises(function () { currencyType.validateValue("EUR10.0000001") }, checkValidateException, "validate test");

		});


		// unit type tests
		QUnit.module("unit type");

		QUnit.test("unit formatValue", function (assert) {
			var unitType = new UnitType();
			assert.equal(unitType.formatValue([22, "duration-hour"], "string"), "22 hr", "format test");
			assert.equal(unitType.formatValue([22, "speed-mile-per-hour"], "string"), "22 mph", "format test");
			assert.equal(unitType.formatValue([-6622.333, "duration-hour"], "string"), "-6,622.333 hr", "format test");
			assert.equal(unitType.formatValue([1.0, "duration-hour"], "string"), "1 hr", "format test");
			assert.equal(unitType.formatValue([1.0000, "duration-hour"], "string"), "1 hr", "format test");
			assert.equal(unitType.formatValue([1.0000, "electric-ohm"], "string"), "1 Ω", "format test");

			assert.equal(unitType.formatValue(null, "string"), null, "format test");
			assert.equal(unitType.formatValue([null, "duration-hour"], "string"), null, "format test");
			assert.equal(unitType.formatValue([1, null], "string"), "", "format test");

			raises(function () { unitType.formatValue(22.0, "int") }, FormatException, "format test");
			raises(function () { unitType.formatValue(22.0, "float") }, FormatException, "format test");
			raises(function () { unitType.formatValue(22.0, "untype") }, FormatException, "format test");
		});

		QUnit.test("unit parseValue", function (assert) {
			var unitType = new UnitType();

			assert.deepEqual(unitType.parseValue("3333.555 Ω", "string"), [3333.555, "electric-ohm"], "parse test");
			assert.deepEqual(unitType.parseValue("3.555 hr", "string"), [3.555, "duration-hour"], "parse test");
			assert.deepEqual(unitType.parseValue("-3.555 mph", "string"), [-3.555, "speed-mile-per-hour"], "parse test");

			raises(function () { unitType.parseValue("3333", "string") }, ParseException, "parse test");
			raises(function () { unitType.parseValue(true, "untype") }, ParseException, "parse test");
			raises(function () { unitType.parseValue(true, "boolean") }, ParseException, "parse test");
			raises(function () { unitType.parseValue("test", "string") }, ParseException, "parse test");
		});

		QUnit.test("unit validateValue - minimum and maximum value constraints", function (assert) {
			var unitType = new UnitType(null, {
				minimum: 3,
				maximum: 10
			});

			//values are within range therefore no error should be thrown
			try {
				assert.equal(unitType.validateValue([3.0, "duration-hour"]), undefined, "validate test");
				assert.equal(unitType.validateValue([3.01, "electric-ohm"]), undefined, "validate test");
				assert.equal(unitType.validateValue([10, "speed-mile-per-hour"]), undefined, "validate test");
			} catch (e) {
				assert.ok(false, "one of the validation tests failed please check");
			}

			//values are out of range
			raises(function () { unitType.validateValue([2.99999, "electric-ohm"]) }, ValidateException, "validate test");
			raises(function () { unitType.validateValue([10.0000001, "duration-hour"]) }, ValidateException, "validate test");

		});

		QUnit.test("unit type - formatValue with showMeasure false", function (assert) {

			var unitType = new UnitType({
				showMeasure: false
			});

			assert.equal(unitType.formatValue([22, "electric-ohm"], "string"), "22", "format test");
			assert.equal(unitType.formatValue([-6622.333, "electric-ohm"], "string"), "-6,622.333", "format test");
			assert.equal(unitType.formatValue([-6622.339, "duration-hour"], "string"), "-6,622.339", "format test");
			assert.equal(unitType.formatValue([1.0, "electric-ohm"], "string"), "1", "format test");
			assert.equal(unitType.formatValue([1.0000, "speed-mile-per-hour"], "string"), "1", "format test");
			assert.equal(unitType.formatValue([1.009, "duration-hour"], "string"), "1.009", "format test");
			assert.equal(unitType.formatValue([1.00001, "electric-ohm"], "string"), "1", "format test");

		});

		QUnit.test("unit type - formatValue with maxFractionDigits 2", function (assert) {

			unitType = new UnitType({
				maxFractionDigits: 2
			});

			assert.equal(unitType.formatValue([22, "electric-ohm"], "string"), "22 Ω", "format test");
			assert.equal(unitType.formatValue([-6622.333, "electric-ohm"], "string"), "-6,622.33 Ω", "format test");
			assert.equal(unitType.formatValue([-6622.339, "duration-hour"], "string"), "-6,622.34 hr", "format test");
			assert.equal(unitType.formatValue([1.0, "electric-ohm"], "string"), "1 Ω", "format test");
			assert.equal(unitType.formatValue([1.0000, "speed-mile-per-hour"], "string"), "1 mph", "format test");
			assert.equal(unitType.formatValue([1.009, "duration-hour"], "string"), "1.01 hr", "format test");
			assert.equal(unitType.formatValue([1.00001, "electric-ohm"], "string"), "1 Ω", "format test");

		});

		QUnit.test("unit formatOptions.source", function (assert) {
			var unitType = new UnitType({
				source: {}
			});

			assert.equal(unitType.parseValue("3333 hr", "string"), "3333 hr", "parse test");
			assert.equal(unitType.parseValue("3333.555 Ω", "string"), "3333.555 Ω", "parse test");
			assert.equal(unitType.parseValue("3.555 Ω", "string"), "3.555 Ω", "parse test");
			assert.equal(unitType.parseValue("-3.555 mph", "string"), "-3.555 mph", "parse test");

			assert.equal(unitType.formatValue("22 hr", "string"), "22 hr", "format test");
			assert.equal(unitType.formatValue("-6622.333 Ω", "string"), "-6,622.333 Ω", "format test");
			assert.equal(unitType.formatValue("-6622.339 mph", "string"), "-6,622.339 mph", "format test");

		});

		QUnit.test("unit formatOptions.source and validateValue", function (assert) {

			//source format option is used to parse the value before formatting it,
			//specifying an empty object is the same as not specifying source options
			var unitType = new UnitType({
				source: {}
			}, {
					minimum: 3,
					maximum: 10,
					decimals: 10
				});
			try {
				assert.equal(unitType.validateValue("3.00 hr"), undefined, "validate test");
				assert.equal(unitType.validateValue("3.01 Ω"), undefined, "validate test");
				assert.equal(unitType.validateValue("10 mph"), undefined, "validate test");
				assert.equal(unitType.validateValue("3.0000000001 mph"), undefined, "validate test 10 digits");
			} catch (e) {
				assert.ok(!e, "one of the validation tests failed please check");
			}
			raises(function () { unitType.validateValue("2.99999 Ω") }, ValidateException, "smaller than min");
			raises(function () { unitType.validateValue("10.0000001 hr") }, ValidateException, "bigger than max");
			raises(function () { unitType.validateValue("3.00000000000001 hr") }, ValidateException, "more digits than decimals (14)");
			raises(function () { unitType.validateValue("3.00000000001 hr") }, ValidateException, "more digits than decimals (11)");

		});


		QUnit.test("unit dynamic values", function (assert) {

			var MeterType = UnitType.extend("sap.ui.core.test.MeterType", {
				constructor: function (oFormatOptions, oConstraints) {
					UnitType.apply(this, [oFormatOptions, oConstraints, ["decimals"]]);
				},

				//check dynamic decimals
				validateValue: function (vValue) {
					//call super validateValue
					UnitType.prototype.validateValue.apply(this, arguments);

					var oBundle = sap.ui.getCore().getLibraryResourceBundle(),
						aValues = vValue,
						iValue;
					if (this.oInputFormat) {
						aValues = this.oInputFormat.parse(vValue);
					}
					iValue = aValues[0];

					//check decimals
					if (this.oOutputFormat) {
						var iDecimals = this.oOutputFormat.oFormatOptions.decimals;

						var tempValue = NumberFormat._shiftDecimalPoint(iValue, iDecimals);
						if (Math.floor(tempValue) !== tempValue) {
							throw new ValidateException(oBundle.getText("Unit.Decimals", [iDecimals]), ["decimals"]);
						}
					}
				}

			});

			var oMeterType = new MeterType();
			var oMeterTypeInstanceSpy = this.spy(oMeterType, "_createInstance");
			//4 digits
			assert.equal(oMeterType.formatValue([123.123123, "length-meter", 4], "string"), "123.1231 m", "format 4 digits meters expected");
			assert.deepEqual(oMeterType.parseValue("123.1231 m", "string"), [123.1231, "length-meter"], "parse 4 digits meters expected");
			oMeterType.validateValue([123.1231, "length-meter"]);
			assert.equal(1, oMeterTypeInstanceSpy.callCount, "1 instance because 1 decimal option is provided (4)");


			// 5 digits
			assert.equal(oMeterType.formatValue([123.123123, "length-meter", 5], "string"), "123.12312 m", "format 5 digits meters expected");
			assert.deepEqual(oMeterType.parseValue("123.12312 m", "string"), [123.12312, "length-meter"], "parse 5 digits meters expected");
			oMeterType.validateValue([123.12312, "length-meter"]);


			assert.equal(oMeterType.formatValue([123.1, "length-meter", 5], "string"), "123.10000 m", "small number format 5 digits meters expected");
			assert.deepEqual(oMeterType.parseValue("123.10000 m", "string"), [123.1, "length-meter"], "small number parse 5 digits meters expected");
			oMeterType.validateValue([123.1, "length-meter"]);

			assert.deepEqual(oMeterType.parseValue("123.100000000001 m", "string"), [123.100000000001, "length-meter"], " number with too many digits parse 5 digits meters expected");
			assert.equal(2, oMeterTypeInstanceSpy.callCount, "2 instances because 2 different decimal options are provided");


			// 6 digits
			assert.equal(oMeterType.formatValue([123.123123, "length-meter", 6], "string"), "123.123123 m", "format 6 digits meters expected");
			assert.deepEqual(oMeterType.parseValue("123.123123 m", "string"), [123.123123, "length-meter"], "parse 6 digits meters expected");
			oMeterType.validateValue([123.123123, "length-meter"]);


			assert.equal(oMeterType.formatValue([123.1, "length-meter", 6], "string"), "123.100000 m", "small number format 6 digits meters expected");
			assert.deepEqual(oMeterType.parseValue("123.100000 m", "string"), [123.1, "length-meter"], "small number parse 6 digits meters expected");
			oMeterType.validateValue([123.1, "length-meter"]);

			assert.deepEqual(oMeterType.parseValue("123.100000000001 m", "string"), [123.100000000001, "length-meter"], " number with too many digits parse 5 digits meters expected");
			assert.equal(3, oMeterTypeInstanceSpy.callCount, "3 instances because 3 different decimal options are provided");


			try {

				oMeterType.validateValue([123.100000000001, "length-meter"]);
				assert.ok(false, "validation should fail as too many digits");
			} catch (e) {
				assert.ok(e);
				assert.equal(e.name, "ValidateException");
				assert.equal(e.message, "Enter an amount with less decimals than 6");

			}

		});

		QUnit.test("Unit: Dynamic values & unit overdefiniton via Configuration (decimals)", function (assert) {

			// overwrite the length-meter unit, and define a decimals value
			var oFormatSettings = sap.ui.getCore().getConfiguration().getFormatSettings();
			var oConfigObject = {
				"length-meter": {
					"unitPattern-count-one": "{0} m",
					"unitPattern-count-many": "{0} m",
					"unitPattern-count-other": "{0} m",
					"decimals": 3
				}
			};
			oFormatSettings.setCustomUnits(oConfigObject);

			// new Meter type
			var MeterType = UnitType.extend("sap.ui.core.test.MeterType", {
				constructor: function (oFormatOptions, oConstraints) {
					UnitType.apply(this, [oFormatOptions, oConstraints, ["decimals"]]);
				},
			});

			var oMeterType = new MeterType();
			var oMeterTypeInstanceSpy = this.spy(oMeterType, "_createInstance");

			// zero
			assert.equal(oMeterType.formatValue([123.123123, "length-meter", 0], "string"), "123 m", "format with decimals 3 expected");
			assert.deepEqual(oMeterType.parseValue("123.1231 m", "string"), [123.1231, "length-meter"], "parse correct");
			assert.equal(oMeterTypeInstanceSpy.callCount, 1, "1 instance because one decimal value is used");

			// empty
			assert.equal(oMeterType.formatValue([123.123123, "length-meter", undefined], "string"), "123.123 m", "format with decimals 3 expected");
			assert.deepEqual(oMeterType.parseValue("123.1231 m", "string"), [123.1231, "length-meter"], "parse correct");
			assert.equal(oMeterTypeInstanceSpy.callCount, 2, "2 instance because 2 decimal value is used");

			//4 digits
			assert.equal(oMeterType.formatValue([123.123123, "length-meter", 4], "string"), "123.1231 m", "format 4 digits meters expected");
			assert.deepEqual(oMeterType.parseValue("123.1231 m", "string"), [123.1231, "length-meter"], "parse 4 digits meters expected");
			assert.equal(oMeterTypeInstanceSpy.callCount, 3, "3 instance because 3 decimal option is provided (4)");

			// 5 digits
			assert.equal(oMeterType.formatValue([123.123123, "length-meter", 5], "string"), "123.12312 m", "format 5 digits meters expected");
			assert.deepEqual(oMeterType.parseValue("123.12312 m", "string"), [123.12312, "length-meter"], "parse 5 digits meters expected");

			assert.equal(oMeterType.formatValue([123.1, "length-meter", 5], "string"), "123.10000 m", "small number format 5 digits meters expected");
			assert.deepEqual(oMeterType.parseValue("123.10000 m", "string"), [123.1, "length-meter"], "small number parse 5 digits meters expected");

			assert.deepEqual(oMeterType.parseValue("123.100000000001 m", "string"), [123.100000000001, "length-meter"], " number with too many digits parse 5 digits meters expected");
			assert.equal(oMeterTypeInstanceSpy.callCount, 4, "4 instances because 4 different decimal options are provided");

			// 6 digits
			assert.equal(oMeterType.formatValue([123.1231236, "length-meter", 6], "string"), "123.123124 m", "format 6 digits meters expected");
			assert.deepEqual(oMeterType.parseValue("123.12312345 m", "string"), [123.12312345, "length-meter"], "parse 6 digits meters expected");

			assert.equal(oMeterType.formatValue([123.1, "length-meter", 6], "string"), "123.100000 m", "small number format 6 digits meters expected");
			assert.deepEqual(oMeterType.parseValue("123.100000 m", "string"), [123.1, "length-meter"], "small number parse 6 digits meters expected");

			assert.deepEqual(oMeterType.parseValue("123.100000000001 m", "string"), [123.100000000001, "length-meter"], " number with too many digits parse 5 digits meters expected");
			assert.equal(oMeterTypeInstanceSpy.callCount, 5, "5 instances because 5 different decimal options are provided");

		});

		QUnit.test("Unit: Dynamic values & unit overdefiniton via Configuration (precision)", function (assert) {

			// overwrite the length-meter unit, and define a decimals value
			var oFormatSettings = sap.ui.getCore().getConfiguration().getFormatSettings();
			var oConfigObject = {
				"length-meter": {
					"unitPattern-count-one": "{0} m",
					"unitPattern-count-many": "{0} m",
					"unitPattern-count-other": "{0} m",
					"precision": 4
				}
			};
			oFormatSettings.setCustomUnits(oConfigObject);

			// new Meter type
			var MeterType = UnitType.extend("sap.ui.core.test.MeterType", {
				constructor: function (oFormatOptions, oConstraints) {
					UnitType.apply(this, [oFormatOptions, oConstraints, ["precision"]]);
				},
			});

			var oMeterType = new MeterType();
			var oMeterTypeInstanceSpy = this.spy(oMeterType, "_createInstance");

			// empty
			assert.equal(oMeterType.formatValue([123.163123, "length-meter", 0], "string"), "123 m", "format with precision 4 expected");
			assert.deepEqual(oMeterType.parseValue("123.1231 m", "string"), [123.1231, "length-meter"], "parse correct");
			assert.equal(oMeterTypeInstanceSpy.callCount, 1, "1 instance because one precision value is used");

			// empty
			assert.equal(oMeterType.formatValue([123.163123, "length-meter", undefined], "string"), "123.2 m", "format with precision 4 expected");
			assert.deepEqual(oMeterType.parseValue("123.1231 m", "string"), [123.1231, "length-meter"], "parse correct");
			assert.equal(oMeterTypeInstanceSpy.callCount, 2, "2 instance because 2 precision value is used");

			//4 digits
			assert.equal(oMeterType.formatValue([123.123123, "length-meter", 3], "string"), "123 m", "format with precision 3 expected");
			assert.deepEqual(oMeterType.parseValue("123.1231 m", "string"), [123.1231, "length-meter"], "parse correct");
			assert.equal(oMeterTypeInstanceSpy.callCount, 3, "3 instances because 3 different precision values are used");

			// 5 digits
			assert.equal(oMeterType.formatValue([123.123123, "length-meter", 2], "string"), "123 m", "format 5 digits meters expected");
			assert.deepEqual(oMeterType.parseValue("123.12312 m", "string"), [123.12312, "length-meter"], "parse 5 digits meters expected");

			assert.equal(oMeterType.formatValue([123.1, "length-meter", 2], "string"), "123 m", "small number format 5 digits meters expected");
			assert.deepEqual(oMeterType.parseValue("123.10000 m", "string"), [123.1, "length-meter"], "small number parse 5 digits meters expected");

			assert.deepEqual(oMeterType.parseValue("123.100000000001 m", "string"), [123.100000000001, "length-meter"], " number with too many digits parse 5 digits meters expected");
			assert.equal(oMeterTypeInstanceSpy.callCount, 4, "4 instances because 4 different precision options are provided");

			// 6 digits
			assert.equal(oMeterType.formatValue([123.123123, "length-meter", 1], "string"), "123 m", "format 6 digits meters expected");
			assert.deepEqual(oMeterType.parseValue("123.123123 m", "string"), [123.123123, "length-meter"], "parse 6 digits meters expected");

			assert.equal(oMeterType.formatValue([123.1, "length-meter", 1], "string"), "123 m", "small number format 6 digits meters expected");
			assert.deepEqual(oMeterType.parseValue("123.100000 m", "string"), [123.1, "length-meter"], "small number parse 6 digits meters expected");

			assert.deepEqual(oMeterType.parseValue("123.100000000001 m", "string"), [123.100000000001, "length-meter"], " number with too many digits parse 5 digits meters expected");
			assert.equal(oMeterTypeInstanceSpy.callCount, 5, "5 instances because 5 different precision options are provided");

		});


		// date type tests
		QUnit.module("date type");

		QUnit.test("date formatValue", function (assert) {
			// as date object is locale dependend fill it manually
			var dateValue = new Date(2003, 1, 1);

			var dateType = new DateType();
			//			assert.equal(dateType.formatValue(dateValue, "string"), "02/01/2003", "format test");
			//as default pattern is locale dependend

			dateType = new DateType({ pattern: "yy-MM-dd" });
			assert.equal(dateType.formatValue(dateValue, "string"), "03-02-01", "format test with pattern");

			dateType = new DateType({ pattern: "yy-MM-dd EEE" });
			assert.equal(dateType.formatValue(dateValue, "string"), "03-02-01 Sat", "format test with pattern including dayName");

			dateType = new DateType({ pattern: "yy 'week' w, EEE" });
			assert.equal(dateType.formatValue(dateValue, "string"), "03 week 5, Sat", "format test with pattern with week");

			dateType = new DateType({ source: { pattern: "yyyy/MM/dd" }, pattern: "dd.MM.yyyy" });
			assert.equal(dateType.formatValue("2012/01/23", "string"), "23.01.2012", "format test with source pattern");

			dateType = new DateType({ source: { pattern: "timestamp" }, pattern: "dd.MM.yy" });
			assert.equal(dateType.formatValue(dateValue.getTime(), "string"), "01.02.03", "format test with timestamp");
			assert.equal(dateType.formatValue(null, "string"), "", "format test");
			assert.equal(dateType.formatValue(undefined, "string"), "", "format test");
			raises(function () { dateType.formatValue(1044068706007, "untype") }, FormatException, "format test");

		});

		QUnit.test("date parseValue", function (assert) {
			// as date object is locale dependend fill it manually
			var dateValue = new Date(2003, 1, 1);

			var dateType = new DateType();
			//			assert.equal(dateType.parseValue("02/01/2003", "string").getTime(), dateValue.getTime(), "parse test");
			//as default pattern is locale dependend

			dateType = new DateType({ pattern: "yy-MM-dd" });
			assert.equal(dateType.parseValue("03-02-01", "string").getTime(), dateValue.getTime(), "parse test with pattern");

			dateType = new DateType({ pattern: "yy-MM-dd EEE" });
			assert.equal(dateType.parseValue("03-02-01 Sat", "string").getTime(), dateValue.getTime(), "parse test with pattern including dayName");

			dateType = new DateType({ pattern: "yy 'week' w, EEE" });
			assert.equal(dateType.parseValue("03 week 5, Sat", "string").getTime(), dateValue.getTime(), "parse test with week pattern");

			dateType = new DateType({ source: { pattern: "yyyy/MM/dd" }, pattern: "dd.MM.yyyy" });
			assert.equal(dateType.parseValue("01.02.2003", "string"), "2003/02/01", "parse test with source pattern");

			dateType = new DateType({ source: { pattern: "timestamp" }, pattern: "dd.MM.yy" });
			assert.equal(dateType.parseValue("01.02.03", "string"), dateValue.getTime(), "parse test with timestamp");

			raises(function () { dateType.parseValue(true, "untype") }, ParseException, "parse test");
			raises(function () { dateType.parseValue(true, "boolean") }, ParseException, "parse test");
			// TODO: This test does not throw an exception
			//raises(function() { dateType.parseValue("test", "string") }, ParseException, "parse test");
		});

		QUnit.test("date validateValue", function (assert) {
			// as date object is locale dependend fill it manually
			var dateValueMin = new Date(2000, 0, 1);
			var dateValueMax = new Date(2000, 11, 31);

			var dateType = new DateType(null, {
				minimum: dateValueMin, //01.01.2000
				maximum: dateValueMax //31.12.2000
			});

			var dateValue = new Date(2000, 1, 1);

			try {
				assert.equal(dateType.validateValue(dateValue), undefined, "validate test");
			} catch (e) {
				assert.ok(false, "one of the validation tests failed please check");
			}

			dateValue = new Date(1999, 1, 1);
			raises(function () { dateType.validateValue(dateValue) }, checkValidateException, "validate test");

			dateValue = new Date(2001, 1, 1);
			raises(function () { dateType.validateValue(dateValue) }, checkValidateException, "validate test");

			dateType = new DateType({
				source: { pattern: "dd.MM.yyyy" },
				pattern: "yyyy/mm/dd"
			}, {
					minimum: "01.01.2000",
					maximum: "31.12.2000"
				});
			try {
				assert.equal(dateType.validateValue("01.01.2000"), undefined, "validate test");
				assert.equal(dateType.validateValue("06.06.2000"), undefined, "validate test");
				assert.equal(dateType.validateValue("31.12.2000"), undefined, "validate test");
			} catch (e) {
				assert.ok(false, "one of the validation tests failed please check");
			}
			raises(function () { dateType.validateValue("10.10.1999") }, checkValidateException, "validate test");
			raises(function () { dateType.validateValue("10.10.2001") }, checkValidateException, "validate test");

		});

		QUnit.test("date getModelFormat() without source option", function (assert) {
			var dateType = new DateType();

			var oFormat = dateType.getModelFormat();
			var oDate = new Date(2001, 1, 1);
			var sDate = "01.01.2000";

			assert.ok(oFormat, "InputFormat exists");
			assert.equal(oFormat.format(oDate), oDate, "InputFormat should have the default implementation of SimpleType");
			assert.equal(oFormat.parse(sDate), sDate, "InputFormat should have the default implementation of SimpleType");
		});

		QUnit.test("date getModelFormat() with timestamp", function (assert) {
			var dateType = new DateType({ source: { pattern: "timestamp" } });
			var dateValue = new Date(2000, 1, 1);

			var oFormat = dateType.getModelFormat();

			assert.ok(oFormat, "InputFormat is created");
			assert.ok(oFormat.parse(dateValue.getTime()) instanceof Date, "InputFormat parses Timestamp correctly");
		});

		QUnit.test("date getModelFormat() with default source option", function (assert) {
			var dateType = new DateType({ source: {} });
			var sValue = "2002-01-02";

			var oFormat = dateType.getModelFormat();

			assert.ok(oFormat, "InputFormat is created");
			var oDate = oFormat.parse(sValue);
			assert.ok(oDate instanceof Date, "InputFormat parses date string correctly");
			assert.equal(oDate.getFullYear(), 2002);
			assert.equal(oDate.getMonth(), 0);
			assert.equal(oDate.getDate(), 2);
		});

		// time type tests
		QUnit.module("time type");

		QUnit.test("time formatValue", function (assert) {
			var timeType = new TimeType();
			// as date object is locale dependend fill it manually
			var timeValue = new Date(2003, 1, 1, 16, 58, 49);

			assert.equal(timeType.formatValue(timeValue, "string"), "4:58:49 PM", "format test");

			timeType = new TimeType({ pattern: "HH:mm:ss" });
			assert.equal(timeType.formatValue(timeValue, "string"), "16:58:49", "format test with pattern");

			timeType = new TimeType({ source: { pattern: "HH:mm:ss" }, pattern: "hh-mm" });
			assert.equal(timeType.formatValue("17:01:02", "string"), "05-01", "format test with source pattern");

			timeType = new TimeType({ source: { pattern: "timestamp" }, pattern: "hh-mm-ss" });
			assert.equal(timeType.formatValue(timeValue.getTime(), "string"), "04-58-49", "format test with timestamp");

			assert.equal(timeType.formatValue(null, "string"), "", "format test");
			assert.equal(timeType.formatValue(undefined, "string"), "", "format test");

			raises(function () { timeType.formatValue(timeValue.getTime(), "untype") }, FormatException, "format test");

		});

		QUnit.test("time parseValue", function (assert) {
			// as date object is locale dependend fill it manually
			var timeValue = new Date(1970, 0, 1, 16, 58, 49);

			var timeType = new TimeType();
			assert.equal(timeType.parseValue("04:58:49 PM", "string").getTime(), timeValue.getTime(), "parse test");

			timeType = new TimeType({ pattern: "HH:mm:ss" });
			assert.equal(timeType.parseValue("16:58:49", "string").getTime(), timeValue.getTime(), "parse test with pattern");

			timeType = new TimeType({ source: { pattern: "HH:mm_ss" }, pattern: "hh-mm-ss" });
			assert.equal(timeType.parseValue("10-05-15", "string"), "10:05_15", "parse test with source pattern");

			timeType = new TimeType({ source: { pattern: "timestamp" }, pattern: "HH:mm:ss" });
			assert.equal(timeType.parseValue("16:58:49", "string"), timeValue.getTime(), "parse test with timestamp");

			raises(function () { timeType.parseValue(true, "untype") }, ParseException, "parse test");
			raises(function () { timeType.parseValue(true, "boolean") }, ParseException, "parse test");
			raises(function () { timeType.parseValue("test", "string") }, checkParseException, "parse test");
		});

		QUnit.test("time validateValue", function (assert) {
			timeType = new TimeType({
				source: { pattern: "HH:mm:ss" },
				pattern: "hh-mm-ss"
			}, {
					minimum: "10:00:00",
					maximum: "11:00:00"
				});
			try {
				assert.equal(timeType.validateValue("10:30:00"), undefined, "validate test");
			} catch (e) {
				assert.ok(false, "one of the validation tests failed please check");
			}
			raises(function () { timeType.validateValue("09:30:00") }, checkValidateException, "validate test");
			raises(function () { timeType.validateValue("11:30:00") }, checkValidateException, "validate test");

		});

		// dateTime type tests
		QUnit.module("dateTime type");

		QUnit.test("dateTime formatValue", function (assert) {
			// as date object is locale dependend fill it manually
			var dateValue = new Date(2003, 1, 1, 4, 5, 6, 7);

			var dateType = new DateTimeType();

			assert.equal(dateType.formatValue(dateValue, "string"), "Feb 1, 2003, 4:05:06 AM", "format test");

			dateType = new DateTimeType({ pattern: "yy-MM-dd '/' hh:mm" });
			assert.equal(dateType.formatValue(dateValue, "string"), "03-02-01 / 04:05", "format test with pattern");

			dateType = new DateTimeType({ source: { pattern: "yyyy/MM/dd HH/mm/ss/SSS" }, pattern: "dd.MM.yyyy HH:mm:ss '+' SSS'" });
			assert.equal(dateType.formatValue("2012/01/23 18/30/05/123", "string"), "23.01.2012 18:30:05 + 123", "format test with source pattern");

			dateType = new DateTimeType({ source: { pattern: "timestamp" }, pattern: "dd.MM.yy hh:mm:ss'+'SSS" });
			assert.equal(dateType.formatValue(dateValue.getTime(), "string"), "01.02.03 04:05:06+007", "format test with timestamp");

			assert.equal(dateType.formatValue(null, "string"), "", "format test");
			assert.equal(dateType.formatValue(undefined, "string"), "", "format test");

			raises(function () { dateType.formatValue(dateValue.getTime(), "untype") }, FormatException, "format test");

		});

		QUnit.test("dateTime parseValue", function (assert) {
			var dateValue = new Date(2003, 1, 1, 4, 5, 6);
			var dateType = new DateTimeType();
			assert.equal(dateType.parseValue("Feb 1, 2003, 4:05:06 AM", "string").getTime(), dateValue.getTime(), "parse test");

			dateValue = new Date(2003, 1, 1, 4, 5, 6, 7);
			dateType = new DateTimeType({ pattern: "yy-MM-dd HH:mm:ss'+'SSS'" });
			assert.equal(dateType.parseValue("03-02-01 04:05:06+007", "string").getTime(), dateValue.getTime(), "parse test with pattern");

			dateType = new DateTimeType({ source: { pattern: "yyyy/MM/dd HHmmssSSS" }, pattern: "dd.MM.yyyy HH-mm-ss.SSS" });
			assert.equal(dateType.parseValue("01.02.2003 04-05-06.007", "string"), "2003/02/01 040506007", "parse test with source pattern");

			dateValue = new Date(2012, 0, 24, 14, 33, 0);
			dateType = new DateTimeType({ source: { pattern: "timestamp" }, pattern: "dd.MM.yyyy HH:mm" });
			assert.equal(dateType.parseValue("24.01.2012 14:33", "string"), dateValue.getTime(), "parse test with timestamp");

			raises(function () { dateType.parseValue(true, "untype") }, ParseException, "parse test");
			raises(function () { dateType.parseValue(true, "boolean") }, ParseException, "parse test");
			raises(function () { dateType.parseValue("test", "string") }, checkParseException, "parse test");
		});

		QUnit.test("dateTime validateValue", function (assert) {
			dateType = new DateTimeType({
				source: { pattern: "dd.MM.yyyy HH:mm:ss" },
				pattern: "yyyy/mm/dd hh/mm/ss"
			}, {
					minimum: "24.01.2012 10:00:00",
					maximum: "24.01.2012 11:00:00"
				});
			try {
				assert.equal(dateType.validateValue("24.01.2012 10:30:00"), undefined, "validate test");
			} catch (e) {
				assert.ok(false, "one of the validation tests failed please check");
			}
			raises(function () { dateType.validateValue("24.01.2012 09:30:00") }, checkValidateException, "validate test");
			raises(function () { dateType.validateValue("25.01.2012 10:30:00") }, checkValidateException, "validate test");
		});

		// DateInterval type tests

		QUnit.module("DateInterval type");

		QUnit.test("DateInterval formatValue", function (assert) {
			var oDateIntervalType = new DateIntervalType({
				format: "yMMMd"
			});
			var oDate1 = new Date(2003, 10, 6);
			var oDate2 = new Date(2003, 11, 6);

			assert.equal(oDateIntervalType.formatValue([oDate1, oDate2], "string"), "Nov 6 – Dec 6, 2003", "dates can be formatted as interval");
			raises(function () { oDateIntervalType.formatValue(oDate1, "string") }, FormatException, "format type with invalid parameter");
			assert.equal(oDateIntervalType.formatValue([oDate1], "string"), "", "format type with invalid parameter");
			raises(function () { oDateIntervalType.formatValue([oDate1, oDate2], "untype") }, FormatException, "format type with invalid target type");

			oDateIntervalType = new DateIntervalType({
				format: "yMMMd",
				source: {
					pattern: "timestamp"
				}
			});

			assert.equal(oDateIntervalType.formatValue([oDate1.getTime(), oDate2.getTime()], "string"), "Nov 6 – Dec 6, 2003", "timestamps can be formatted as interval");
			assert.equal(oDateIntervalType.formatValue([String(oDate1.getTime()), oDate2.getTime()], "string"), "Nov 6 – Dec 6, 2003", "timestamps can be formatted as interval");
			raises(function () { oDateIntervalType.formatValue(["a", "a"], "string") }, FormatException, "format type with invalid parameter");

			oDateIntervalType = new DateIntervalType({
				format: "yMMMd",
				source: {
					pattern: "yyyy-MM-dd"
				}
			});
			raises(function () { oDateIntervalType.formatValue(["2017", "2018"], "string") }, FormatException, "format type with invalid parameter");
		});

		QUnit.test("DateInterval parseValue", function (assert) {
			var oDateIntervalType = new DateIntervalType({
				format: "yMMMd"
			});
			var oDate1 = new Date(2003, 10, 6);
			var oDate2 = new Date(2003, 11, 6);

			assert.deepEqual(oDateIntervalType.parseValue("", "string"), [null, null], "empty string can be parsed into an array of nulls");
			assert.deepEqual(oDateIntervalType.parseValue("Nov 6 – Dec 6, 2003", "string"), [oDate1, oDate2], "Interval string can be parsed into an array of dates");
			raises(function () { oDateIntervalType.parseValue("Nov 6", "string") }, checkParseException, "parse test");
			raises(function () { oDateIntervalType.parseValue("Nov 6 – Dec 6, 2003", "untype") }, checkParseException, "parse test");

			oDateIntervalType = new DateIntervalType({
				format: "yMMMd",
				source: {
					pattern: "timestamp"
				}
			});

			assert.deepEqual(oDateIntervalType.parseValue("Nov 6 – Dec 6, 2003", "string"), [oDate1.getTime(), oDate2.getTime()], "Interval string can be parsed into an array of timestamps");

			oDateIntervalType = new DateIntervalType({
				format: "yMMMd",
				source: {}
			});

			assert.deepEqual(oDateIntervalType.parseValue("Nov 6 – Dec 6, 2003", "string"), ["2003-11-06", "2003-12-06"], "Interval string can be parsed into an array of defined dates");
		});

		QUnit.test("DateInterval validateValue", function (assert) {
			var oDate1 = new Date(2003, 10, 6);
			var oDate2 = new Date(2003, 11, 6);

			var oDateIntervalType = new DateIntervalType({
				format: "yMMMd",
				source: {
					pattern: "timestamp"
				}
			}, {
					minimum: oDate1.getTime(),
					maximum: oDate2.getTime()
				});

			try {
				assert.equal(oDateIntervalType.validateValue([oDate1.getTime(), oDate2.getTime()]), undefined, "validate test");
			} catch (e) {
				assert.ok(false, "validate test fails");
			}

			var oPreDate = new Date(2003, 10, 5);
			var oSufDate = new Date(2003, 11, 7);

			raises(function () {
				oDateIntervalType.validateValue([oPreDate.getTime(), oDate2.getTime()]);
			}, checkValidateException, "validate test");

			raises(function () {
				oDateIntervalType.validateValue([oDate1.getTime(), oSufDate.getTime()]);
			}, checkValidateException, "validate test");

			raises(function () {
				oDateIntervalType.validateValue([oPreDate.getTime(), oDate1]);
			}, checkValidateException, "validate test");

			raises(function () {
				oDateIntervalType.validateValue([oDate2, oSufDate]);
			}, checkValidateException, "validate test");

			oDateIntervalType = new DateIntervalType({
				format: "yMMMd",
				source: {}
			}, {
					minimum: oDate1.getTime(),
					maximum: oDate2.getTime()
				});

			try {
				assert.equal(oDateIntervalType.validateValue(["2003-11-06", "2003-12-06"]), undefined, "validate test");
			} catch (e) {
				assert.ok(false, "validate test fails");
			}
		});

		QUnit.module("DateTimeInterval type");

		QUnit.test("DateTimeInterval formatValue", function (assert) {
			var oDateTimeIntervalType = new DateTimeIntervalType();

			var oDateTime1 = new Date(2003, 1, 1, 4, 5, 6);
			var oDateTime2 = new Date(2003, 1, 2, 5, 6, 7);

			assert.equal(oDateTimeIntervalType.formatValue([oDateTime1, oDateTime2], "string"), "Feb 1, 2003, 4:05:06 AM – Feb 2, 2003, 5:06:07 AM", "dates can be formatted as interval");

			oDateTimeIntervalType = new DateTimeIntervalType({
				source: {}
			});
			assert.equal(oDateTimeIntervalType.formatValue(["Feb 1, 2003, 4:05:06 AM", "Feb 2, 2003, 5:06:07 AM"], "string"), "Feb 1, 2003, 4:05:06 AM – Feb 2, 2003, 5:06:07 AM", "dates can be formatted as interval");
		});

		QUnit.test("DateTimeInterval parseValue", function (assert) {
			var oDateTimeIntervalType = new DateTimeIntervalType();

			var oDateTime1 = new Date(2003, 1, 1, 4, 5, 6);
			var oDateTime2 = new Date(2003, 1, 2, 5, 6, 7);

			assert.deepEqual(oDateTimeIntervalType.parseValue("Feb 1, 2003, 4:05:06 AM – Feb 2, 2003, 5:06:07 AM", "string"), [oDateTime1, oDateTime2], "Interval string can be parsed into an array of dates");

			oDateTimeIntervalType = new DateTimeIntervalType({
				source: {}
			});

			assert.deepEqual(oDateTimeIntervalType.parseValue("Feb 1, 2003, 4:05:06 AM – Feb 2, 2003, 5:06:07 AM", "string"), ["Feb 1, 2003, 4:05:06 AM", "Feb 2, 2003, 5:06:07 AM"], "Interval string can be parsed into an array of formatted dates");
		});

		QUnit.test("DateTimeInterval validateValue", function (assert) {
			var oDateTime1 = new Date(2003, 1, 1, 4, 5, 6);
			var oDateTime2 = new Date(2003, 1, 2, 5, 6, 7);

			var oDateTimeIntervalType = new DateTimeIntervalType({}, {
				minimum: oDateTime1,
				maximum: oDateTime2
			});

			try {
				assert.equal(oDateTimeIntervalType.validateValue([oDateTime1, oDateTime2]), undefined, "validate test");
			} catch (e) {
				assert.ok(false, "validate test fails");
			}
		});

		QUnit.module("TimeInterval type");

		QUnit.test("TimeInterval formatValue", function (assert) {
			var oTimeIntervalType = new TimeIntervalType();

			var oTime1 = new Date(2003, 1, 1, 16, 58, 49);
			var oTime2 = new Date(2003, 1, 1, 17, 00, 00);

			assert.equal(oTimeIntervalType.formatValue([oTime1, oTime2], "string"), "4:58:49 PM – 5:00:00 PM", "dates can be formatted as interval");

			oTimeIntervalType = new TimeIntervalType({
				source: {}
			});
			assert.equal(oTimeIntervalType.formatValue(["4:58:49 PM", "5:00:00 PM"], "string"), "4:58:49 PM – 5:00:00 PM", "dates can be formatted as interval");
		});

		QUnit.test("TimeInterval parseValue", function (assert) {
			var oTimeIntervalType = new TimeIntervalType();

			var oTime1 = new Date(1970, 0, 1, 16, 58, 49);
			var oTime2 = new Date(1970, 0, 1, 17, 00, 00);

			var aTimeIntervalResult = oTimeIntervalType.parseValue("4:58:49 PM –  5:00:00 PM", "string");

			assert.deepEqual([aTimeIntervalResult[0].getTime(), aTimeIntervalResult[1].getTime()], [oTime1.getTime(), oTime2.getTime()], "Interval string can be parsed into an array of dates");

			oTimeIntervalType = new TimeIntervalType({
				source: {}
			});

			assert.deepEqual(oTimeIntervalType.parseValue("4:58:49 PM – 5:00:00 PM", "string"), ["4:58:49 PM", "5:00:00 PM"], "Interval string can be parsed into an array of formatted dates");
		});

		QUnit.test("TimeInterval validateValue", function (assert) {
			var oTime1 = new Date(1970, 0, 1, 16, 58, 49);
			var oTime2 = new Date(1970, 0, 1, 17, 00, 00);

			var oTimeIntervalType = new TimeIntervalType({}, {
				minimum: oTime1,
				maximum: oTime2
			});

			try {
				assert.equal(oTimeIntervalType.validateValue([oTime1, oTime2]), undefined, "validate test");
			} catch (e) {
				assert.ok(false, "validate test fails");
			}
		});


		// filesize type tests
		QUnit.module("filesize type");

		QUnit.test("filesize formatValue", function (assert) {
			var filesizeType = new FileSizeType();

			assert.equal(filesizeType.formatValue(null, "string"), null, "format test: null-string");
			assert.equal(filesizeType.formatValue(1000, "string").toUpperCase(), "1 KB", "format test: 1000-string");
			assert.equal(filesizeType.formatValue(1000.5, "string").toUpperCase(), "1.0005 KB", "format test: 1000.5-string");
			raises(function () { filesizeType.formatValue("Hello", "string") }, FormatException, "format test: Hello-string");
			raises(function () { filesizeType.formatValue("1 kB", "string") }, FormatException, "format test: 1 kB-string");

			assert.equal(filesizeType.formatValue(null, "int"), null, "format test: null-int");
			assert.equal(filesizeType.formatValue(1000, "int"), 1000, "format test: 1000-int");
			assert.equal(filesizeType.formatValue(1000.5, "int"), 1000, "format test: 1000.5-int");
			raises(function () { filesizeType.formatValue("Hello", "int") }, FormatException, "format test: Hello-int");
			raises(function () { filesizeType.formatValue("1 kB", "int") }, FormatException, "format test: 1 kB-int");

			assert.equal(filesizeType.formatValue(null, "float"), null, "format test: null-float");
			assert.equal(filesizeType.formatValue(1000, "float"), 1000, "format test: 1000-float");
			assert.equal(filesizeType.formatValue(1000.5, "float"), 1000.5, "format test: 1000.5-float");
			raises(function () { filesizeType.formatValue("Hello", "float") }, FormatException, "format test: Hello-float");
			raises(function () { filesizeType.formatValue("1 kB", "float") }, FormatException, "format test: 1 kB-float");

			assert.equal(filesizeType.formatValue(null, "untype"), null, "format test: null-untype");
			raises(function () { filesizeType.formatValue(1000, "untype") }, FormatException, "format test: 1000-untype");
			raises(function () { filesizeType.formatValue(1000.5, "untype") }, FormatException, "format test: 1000.5-untype");
			raises(function () { filesizeType.formatValue("Hello", "untype") }, FormatException, "format test: Hello-untype");
			raises(function () { filesizeType.formatValue("1 kB", "untype") }, FormatException, "format test: 1 kB-untype");

			filesizeType.setFormatOptions({ source: {} });

			assert.equal(filesizeType.formatValue(null, "string"), null, "format test: null-string-inputformat");
			assert.equal(filesizeType.formatValue(1000, "string").toUpperCase(), "1 KB", "format test: 1000-string-inputformat");
			assert.equal(filesizeType.formatValue(1000.5, "string").toUpperCase(), "1.0005 KB", "format test: 1000.5-string-inputformat");
			raises(function () { filesizeType.formatValue("Hello", "string") }, FormatException, "format test: Hello-string-inputformat");
			assert.equal(filesizeType.formatValue("1 kB", "string").toUpperCase(), "1 KB", "format test: 1kB-string-inputformat");

			assert.equal(filesizeType.formatValue(null, "int"), null, "format test: null-int-inputformat");
			assert.equal(filesizeType.formatValue(1000, "int"), 1000, "format test: 1000-int-inputformat");
			assert.equal(filesizeType.formatValue(1000.5, "int"), 1000, "format test: 1000.5-int-inputformat");
			raises(function () { filesizeType.formatValue("Hello", "int") }, FormatException, "format test: Hello-int-inputformat");
			assert.equal(filesizeType.formatValue("1 kB", "int"), 1000, "format test: 1kB-int-inputformat");

			assert.equal(filesizeType.formatValue(null, "float"), null, "format test: null-float-inputformat");
			assert.equal(filesizeType.formatValue(1000, "float"), 1000, "format test: 1000-float-inputformat");
			assert.equal(filesizeType.formatValue(1000.5, "float"), 1000.5, "format test: 1000.5-float-inputformat");
			raises(function () { filesizeType.formatValue("Hello", "float") }, FormatException, "format test: Hello-float-inputformat");
			assert.equal(filesizeType.formatValue("1 kB", "float"), 1000, "format test: 1kB-float-inputformat");

			assert.equal(filesizeType.formatValue(null, "untype"), null, "format test: null-untype-inputformat");
			raises(function () { filesizeType.formatValue(1000, "untype") }, FormatException, "format test: 1000-untype-inputformat");
			raises(function () { filesizeType.formatValue(1000.5, "untype") }, FormatException, "format test: 1000.5-untype-inputformat");
			raises(function () { filesizeType.formatValue("Hello", "untype") }, FormatException, "format test: Hello-untype-inputformat");
			raises(function () { filesizeType.formatValue("1 kB", "untype") }, FormatException, "format test: 1kB-untype-inputformat");
		});

		QUnit.test("filesize parseValue", function (assert) {
			var filesizeType = new FileSizeType();

			assert.equal(filesizeType.parseValue(null, "string"), null, "parse test: null-string");
			raises(function () { filesizeType.parseValue("Hello", "string") }, ParseException, "parse test: Hello-string");
			assert.equal(filesizeType.parseValue("1 kB", "string"), 1000, "parse test: 1 kB-string");
			assert.equal(filesizeType.parseValue("1.0005 kB", "string"), 1000.5, "parse test: 1.0005 kB-string");

			assert.equal(filesizeType.parseValue(null, "int"), null, "parse test: null-int");
			assert.equal(filesizeType.parseValue(1000, "int"), 1000, "parse test: 1000-int");
			assert.equal(filesizeType.parseValue(1000.5, "int"), 1000.5, "parse test: 1000.5 kB-int");

			assert.equal(filesizeType.parseValue(null, "float"), null, "parse test: null-float");
			assert.equal(filesizeType.parseValue(1000, "float"), 1000, "parse test: 1000-float");
			assert.equal(filesizeType.parseValue(1000.5, "float"), 1000.5, "parse test: 1000.5 kB-float");

			assert.equal(filesizeType.parseValue(null, "untype"), null, "parse test: null-untype");
			raises(function () { filesizeType.parseValue("Hello", "untype") }, ParseException, "parse test: Hello-untype");
			raises(function () { filesizeType.parseValue("1 kB", "untype") }, ParseException, "parse test: 1 kB-untype");
			raises(function () { filesizeType.parseValue("1.0005 kB", "untype") }, ParseException, "parse test: 1.0005 kB-untype");
			raises(function () { filesizeType.parseValue(1000, "untype") }, ParseException, "parse test: 1000-untype");
			raises(function () { filesizeType.parseValue(1000.5, "untype") }, ParseException, "parse test: 1000.5 kB-untype");

			filesizeType.setFormatOptions({ source: {} });

			assert.equal(filesizeType.parseValue(null, "string"), null, "parse test: null-string-inputformat");
			raises(function () { filesizeType.parseValue("Hello", "string") }, checkParseException, "parse test: Hello-string-inputformat");
			assert.equal(filesizeType.parseValue("1 kB", "string").toUpperCase(), "1 KB", "parse test: 1 kB-string-inputformat");
			assert.equal(filesizeType.parseValue("1.0005 kB", "string").toUpperCase(), "1.0005 KB", "parse test: 1.0005 kB-string-inputformat");

			assert.equal(filesizeType.parseValue(null, "int"), null, "parse test: null-int-inputformat");
			assert.equal(filesizeType.parseValue(1000, "int").toUpperCase(), "1 KB", "parse test: 1000-int-inputformat");
			assert.equal(filesizeType.parseValue(1000.5, "int").toUpperCase(), "1.0005 KB", "parse test: 1000.5 kB-int-inputformat");

			assert.equal(filesizeType.parseValue(null, "float"), null, "parse test: null-float-inputformat");
			assert.equal(filesizeType.parseValue(1000, "float").toUpperCase(), "1 KB", "parse test: 1000-float-inputformat");
			assert.equal(filesizeType.parseValue(1000.5, "float").toUpperCase(), "1.0005 KB", "parse test: 1000.5 kB-float-inputformat");

			assert.equal(filesizeType.parseValue(null, "untype"), null, "parse test: null-untype");
			raises(function () { filesizeType.parseValue("Hello", "untype") }, ParseException, "parse test: Hello-untype-inputformat");
			raises(function () { filesizeType.parseValue("1 kB", "untype") }, ParseException, "parse test: 1 kB-untype-inputformat");
			raises(function () { filesizeType.parseValue("1.0005 kB", "untype") }, ParseException, "parse test: 1.0005 kB-untype-inputformat");
			raises(function () { filesizeType.parseValue(1000, "untype") }, ParseException, "parse test: 1000-untype-inputformat");
			raises(function () { filesizeType.parseValue(1000.5, "untype") }, ParseException, "parse test: 1000.5 kB-untype-inputformat");
		});

		QUnit.test("filesize validateValue", function (assert) {
			var filesizeType = new FileSizeType(null, {
				minimum: 1000,
				maximum: 2000
			});

			var filesizeType2 = new FileSizeType(null, {
				minimum: "1 kB",
				maximum: "2 kB"
			});

			try {
				assert.equal(filesizeType.validateValue(1000.0), undefined, "validate test: 1000.0-floatcompare");
				assert.equal(filesizeType.validateValue(1000), undefined, "validate test: 1000-floatcompare");
				assert.equal(filesizeType.validateValue(1500), undefined, "validate test: 1500-floatcompare");
			} catch (e) {
				assert.ok(false, "one of the validation tests failed please check");
			}

			raises(function () { filesizeType.validateValue(2000.1) }, checkValidateException, "validate test: 2000.1-floatcompare");
			raises(function () { filesizeType.validateValue(3000) }, checkValidateException, "validate test: 3000-floatcompare");
			raises(function () { filesizeType.validateValue(500) }, checkValidateException, "validate test: 500-floatcompare");
			raises(function () { filesizeType.validateValue("5 kB") }, Error, "validate test: 5 kB-floatcompare");
			raises(function () { filesizeType2.validateValue("1.5 kB") }, Error, "validate test: 1.5 kB-floatcompare");


			raises(function () { filesizeType2.validateValue(1000.0) }, Error, "validate test: 1000.0-stringcompare");
			raises(function () { filesizeType2.validateValue(1000) }, Error, "validate test: 1000-stringcompare");
			raises(function () { filesizeType2.validateValue(1500) }, Error, "validate test: 1500-stringcompare");
			raises(function () { filesizeType2.validateValue(2000.1) }, Error, "validate test: 2000.1-stringcompare");
			raises(function () { filesizeType2.validateValue(3000) }, Error, "validate test: 3000-stringcompare");
			raises(function () { filesizeType2.validateValue(500) }, Error, "validate test: 500-stringcompare");
			raises(function () { filesizeType2.validateValue("5 kB") }, Error, "validate test: 5 kB-stringcompare");
			raises(function () { filesizeType2.validateValue("1.5 kB") }, Error, "validate test: 1.5 kB-stringcompare");


			filesizeType.setFormatOptions({ source: {} });
			filesizeType2.setFormatOptions({ source: {} });


			try {
				assert.equal(filesizeType.validateValue(1000.0), undefined, "validate test: 1000.0-floatcompare-inputformat");
				assert.equal(filesizeType.validateValue(1000), undefined, "validate test: 1000-floatcompare-inputformat");
				assert.equal(filesizeType.validateValue(1500), undefined, "validate test: 1500-floatcompare-inputformat");
				assert.equal(filesizeType.validateValue("1.5 kB"), undefined, "validate test: 5 kB-floatcompare-inputformat");
			} catch (e) {
				assert.ok(false, "one of the validation tests failed please check");
			}

			raises(function () { filesizeType.validateValue(2000.1) }, checkValidateException, "validate test: 2000.1-floatcompare-inputformat");
			raises(function () { filesizeType.validateValue(3000) }, checkValidateException, "validate test: 3000-floatcompare-inputformat");
			raises(function () { filesizeType.validateValue(500) }, checkValidateException, "validate test: 500-floatcompare-inputformat");
			raises(function () { filesizeType.validateValue("5 kB") }, checkValidateException, "validate test: 5 kB-floatcompare-inputformat");


			try {
				assert.equal(filesizeType2.validateValue(1000.0), undefined, "validate test: 1000.0-stringcompare-inputformat");
				assert.equal(filesizeType2.validateValue(1000), undefined, "validate test: 1000-stringcompare-inputformat");
				assert.equal(filesizeType2.validateValue(1500), undefined, "validate test: 1500-stringcompare-inputformat");
				assert.equal(filesizeType2.validateValue("1.5 kB"), undefined, "validate test: 5 kB-stringcompare-inputformat");
			} catch (e) {
				assert.ok(false, "one of the validation tests failed please check");
			}


			raises(function () { filesizeType2.validateValue(2000.1) }, checkValidateException, "validate test: 2000.1-stringcompare-inputformat");
			raises(function () { filesizeType2.validateValue(3000) }, checkValidateException, "validate test: 3000-stringcompare-inputformat");
			raises(function () { filesizeType2.validateValue(500) }, checkValidateException, "validate test: 500-stringcompare-inputformat");
			raises(function () { filesizeType2.validateValue("5 kB") }, checkValidateException, "validate test: 5 kB-stringcompare-inputformat");

		});

		// Validation messages
		QUnit.module("Validation messages");

		QUnit.test("Single constraint", function (assert) {
			var oBundle = sap.ui.getCore().getLibraryResourceBundle(),
				sExpectedMessage = oBundle.getText("Integer.Minimum").replace("{0}", "1"),
				oType = new IntegerType(null, {
					minimum: 1
				});

			try {
				oType.validateValue(0);
			} catch (e) {
				assert.ok(e instanceof ValidateException, "ValidateException is thrown");
				assert.equal(e.message, sExpectedMessage, "Validation message for constraint is returned");
			}
		});

		QUnit.test("Multiple constraints", function (assert) {
			var oBundle = sap.ui.getCore().getLibraryResourceBundle(),
				sMessage1 = oBundle.getText("Integer.Minimum").replace("{0}", "2"),
				sMessage2 = oBundle.getText("Integer.Maximum").replace("{0}", "0"),
				sExpectedMessage = sMessage1 + ". " + sMessage2 + ".";
			oType = new IntegerType(null, {
				minimum: 2,
				maximum: 0
			});

			try {
				oType.validateValue(1);
			} catch (e) {
				assert.ok(e instanceof ValidateException, "ValidateException is thrown");
				assert.equal(e.message, sExpectedMessage, "Combined validation message for both contraints is returned");
			}
		});
	})