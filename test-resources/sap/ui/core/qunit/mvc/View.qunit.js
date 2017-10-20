sap.ui.define([
	"sap/ui/core/mvc/View",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/core/util/XMLPreprocessor",
	"./testdata/TestPreprocessor"
], function(View, XMLView, XMLPreprocessor, TestPreprocessor) {

	QUnit.module("sap.ui.core.mvc.View");

	QUnit.test("ID handling", function (assert) {
		assert.expect(5);

		var oView = new View("dummy", {});
		var sPrefixedId = oView.createId("anyid");
		var sLocalId = oView.getLocalId(sPrefixedId);
		var sOtherId = oView.getLocalId("anyview--anyid");
		assert.equal(sPrefixedId, "dummy--anyid");
		assert.equal(sLocalId, "anyid");
		assert.equal(sOtherId, null);
		assert.ok(oView.isPrefixedId(sPrefixedId));
		assert.notOk(oView.isPrefixedId(sLocalId));
		oView.destroy();
	});

	QUnit.module("sap.ui.core.mvc.View#runPreprocessor(sync)", {
		beforeEach: function() {
			mock = sinon.mock(sap.ui.core.util.XMLPreprocessor);
			expectProcess = mock.expects("process");
			_mPreprocessors = jQuery.extend(true, {}, View._mPreprocessors);
			View.PreprocessorType = {"Foo":"foo"};
		},
		afterEach: function() {
			// restore the sinon spy to original state
			mock.restore();
			// remove existing global preprocessors
			View._mPreprocessors = _mPreprocessors;
			delete View.PreprocessorType;
		}
	});

	QUnit.test("runPreprocessor w/o config", function (assert) {
		assert.expect(3);
		var oSource = {},
			oView = new View({});

		assert.deepEqual(oView.mPreprocessors, {"foo":[]}, "no preprocessors stored at view");
		sinon.assert.notCalled(expectProcess);
		assert.equal(oView.runPreprocessor("xml", oSource, true), oSource);
	});

	QUnit.test("runPreprocessor w/ config", function (assert) {
		assert.expect(2);
		var oPreprocessors = {
				// Note: the type does matter, as it is describing the phase of view initialization in which the preprocessor is executed.
				// These types can be different for several view types.
				foo: {
					preprocessor: jQuery.noop, // replace below once we have a mock in place!
					bindingContexts: {},
					models: {}
				}
			},
			oResult = {},
			oSource = {},
			oView = new View({
				preprocessors: oPreprocessors,
				viewName: "foo"
			});

		var oViewInfo = { name: oView.sViewName, id: oView.getId(), async: false, sCaller: oView + " (foo)"};
		expectProcess.never();

		oPreprocessors.foo.preprocessor = {
			process: XMLPreprocessor.process
		};

		assert.strictEqual(oView.mPreprocessors.foo[0], oPreprocessors.foo, "preprocessors stored at view");
		expectProcess.verify();
	});

	QUnit.test("runPreprocessor w/ config and settings", function (assert) {
		assert.expect(5);
		var oPreprocessors = {
				// Note: the type does matter, as it is describing the phase of view initialization in which the preprocessor is executed.
				// These types can be different for several view types.
				foo: {
					preprocessor: function(vSource, oViewInfo, oConfig) {
							return vSource;
						},
					foofoo: "barbar",
					// internal settings for test purposes
					_settings: {foo: undefined},
					_syncSupport: true
				}
			},
			oView = new View({
				preprocessors: oPreprocessors,
				viewName: "foo"
			}),
			oSpy = this.spy(oPreprocessors.foo.preprocessor, "process");

		oView.runPreprocessor("foo", {}, true);

		oPreprocessors.foo._settings.foo = "bar";
		sinon.assert.calledOnce(oSpy);
		assert.strictEqual(oSpy.args[0][2].foo, oPreprocessors.foo._settings.foo, "Configured object instance gets passed to the preprocessor");
		assert.ok(oSpy.args[0][2].foo === "bar", "Property got set correctly");
		assert.strictEqual(oSpy.args[0][2].foofoo, oPreprocessors.foo.foofoo, "Relevant settings have been passed to the pp");
		assert.ok(Object.keys(oSpy.args[0][2]).length == 3, "Only relevant settings have been passed to the pp");
	});


	QUnit.test("runPreprocessor w/ default preprocessor for xml view", function (assert) {
		assert.expect(2);
		var oConfig = {},
			sViewContent = [
			    '<mvc:View xmlns:mvc="sap.ui.core.mvc"/>'
			].join('');

		// returns the processed vSource
		expectProcess.returnsArg(0);

		var oView = new XMLView({
			preprocessors: {
				xml: oConfig // the type is of course important here!
			},
			viewContent: sViewContent
		});
		sinon.assert.calledOnce(expectProcess);
		assert.strictEqual(oView._xContent, expectProcess.returnValues[0]);
	});

	QUnit.test("runPreprocessor w/ invalid preprocessor", function (assert) {
		assert.expect(2);
		var oSource = {},
			oView = new View({
				preprocessors: {
					xml: [{
						preprocessor: "sap.ui.core.util.XMLPreprocessor.process",
						_syncSupport: true
					}]
				}
			});

		try {
			oView.runPreprocessor("xml", oSource, true);
			assert.ok(false);
		} catch (ex) {
			assert.ok(true, ex); // TypeError: string is not a function
		}
		sinon.assert.notCalled(expectProcess);
	});

	QUnit.test("runPreprocessor w/ valid preprocessor", function (assert) {
		assert.expect(1);
		var oSource = {},
			bCalled = false,
			oView = new View({
				preprocessors: {
					xml: [{
						preprocessor: {
							process: function(val) {
								bCalled = true;
								return val;
							}
						},
						_syncSupport: true
					}]
				}
			});

		try {
			oView.runPreprocessor("xml", oSource, true);
			assert.ok(bCalled, "Preprocessor executed correctly");
		} catch (ex) {
			assert.ok(false, ex); // TypeError: string is not a function
		}
	});

	QUnit.test("runPreprocessor w/o known preprocessor", function (assert) {
		assert.expect(2);
		var oSource = {},
			oView = new View({
				preprocessors: {
					foo: {}
				}
			});

		oView.runPreprocessor("foo", oSource);
		assert.ok(true); // do nothing

		sinon.assert.notCalled(expectProcess);
	});

	QUnit.test("runPreprocessor w/o syncSupport preprocessor", function (assert) {
		assert.expect(3);
		var oSource = {},
			bCalled = false,
			oView = new View({
				preprocessors: {
					xml: [{
						preprocessor: function(val) {
							bCalled = true;
							return val;
						},
					}]
				}
			}),
			logSpy = this.spy(jQuery.sap.log, "debug");

		try {
			oView.runPreprocessor("xml", oSource, true);
			assert.ok(!bCalled, "Preprocessor was ignored in sync view");
			sinon.assert.calledWith(logSpy, "Async \"xml\"-preprocessor was skipped in sync view execution for undefinedView", oView.getId());
		} catch (ex) {
			assert.ok(false, ex); // TypeError: string is not a function
		}
		sinon.assert.notCalled(expectProcess);
	});

	QUnit.module("sap.ui.core.mvc.View#runPreprocessor (async)", {
		beforeEach: function() {
			mock = sinon.mock(sap.ui.core.util.XMLPreprocessor);
			expectProcess = mock.expects("process");
			_mPreprocessors = jQuery.extend(true, {}, View._mPreprocessors);
			View.PreprocessorType = {"Foo":"foo"};
		},
		afterEach: function() {
			// restore the sinon spy to original state
			mock.restore();
			// remove existing global preprocessors
			View._mPreprocessors = _mPreprocessors;
			delete View.PreprocessorType;
		}
	});

	QUnit.test("runPreprocessor w/o config", function (assert) {
		assert.expect(3);
		var done = assert.async();
		var oSource = {},
			oView = new View({});

		assert.deepEqual(oView.mPreprocessors, {"foo":[]}, "empty preprocessors stored at view");
		sinon.assert.notCalled(expectProcess);

		oView.runPreprocessor("xml", oSource).then(function(vSource) {
			assert.equal(vSource, oSource);
			done();
		});
	});

	QUnit.test("runPreprocessor w/ config", function (assert) {
		assert.expect(3);
		var done = assert.async();
		var oPreprocessors = {
				// Note: the type does matter, as it is describing the phase of view initialization in which the preprocessor is executed.
				// These types can be different for several view types.
				foo: {
					preprocessor: jQuery.noop, // replace below once we have a mock in place!
					bindingContexts: {},
					models: {}
				}
			},
			oResult = {foo:true},
			oSource = {bar:true},
			oView,
			oViewInfo;

		oView = new View({
			preprocessors: oPreprocessors,
			viewName: "foo",
			async: true
		});

		oViewInfo = {
			caller: oView + " (foo)",
			id: oView.getId(),
			name: oView.sViewName,
			componentId: undefined,
			sync: false
		};

		// instruct the mock before view creation to not miss the important call
		oPreprocessors.foo.preprocessor = {
			process: XMLPreprocessor.process
		}
		expectProcess.returns(Promise.resolve(oResult));
		expectProcess.once().withExactArgs(oSource, oViewInfo, oPreprocessors.foo._settings);


		assert.strictEqual(oView.mPreprocessors.foo[0], oPreprocessors.foo, "preprocessors stored at view");

		oView.runPreprocessor("foo", oSource).then(function(oProcessedSource) {
			assert.strictEqual(oProcessedSource, oResult, "Results equal");
			expectProcess.verify();
			done();
		});

	});

	QUnit.test("runPreprocessor w/ config and settings", function (assert) {
		assert.expect(4);
		var done = assert.async();
		var oPreprocessors = {
				// Note: the type does matter, as it is describing the phase of view initialization in which the preprocessor is executed.
				// These types can be different for several view types.
				foo: {
					preprocessor: function(vSource, oViewInfo, oConfig) {
							return Promise.resolve(vSource);
						},
					settings: {foo: undefined}
				}
			},
			oView = new View({
				preprocessors: oPreprocessors,
				viewName: "foo",
				async: true
			}),
			oSpy = this.spy(oPreprocessors.foo.preprocessor, "process");

		oView.runPreprocessor("foo", {}).then(function() {
			oPreprocessors.foo.settings.foo = "bar";
			sinon.assert.calledOnce(oSpy);
			assert.strictEqual(oSpy.args[0][2].settings.foo, oPreprocessors.foo.settings.foo, "Configured object instance gets passed to the preprocessor");
			assert.ok(oSpy.args[0][2].settings.foo === "bar", "Property got set correctly");
			assert.ok(Object.keys(oSpy.args[0][2]).length == 2, "Nothing has been added to the pp config");
			done();
		});
	});

	QUnit.test("runPreprocessor w/ default preprocessor for xml view", function (assert) {
		assert.expect(3);
		var done = assert.async();
		var sViewContent = '<mvc:View xmlns:mvc="sap.ui.core.mvc"/>';

		// returns the processed vSource
		expectProcess.returnsArg(0);

		var oView = new XMLView({
			preprocessors: {
				xml: {} // the type is of course important here!
			},
			async: true,
			viewContent: sViewContent
		});

		oView.attachAfterInit(function() {
			sinon.assert.calledOnce(expectProcess);
			assert.strictEqual(oView._xContent, expectProcess.returnValues[0]);
			expectProcess.verify();
			done();
		});
	});

	QUnit.test("runPreprocessor w/ invalid preprocessor", function (assert) {
		assert.expect(2);
		var done = assert.async();
		var oSource = {},
			oView = new View({
				preprocessors: {
					xml: [{
						preprocessor: "sap.ui.core.util.XMLPreprocessor.process",
					}]
				},
				async: true
			});

		oView.runPreprocessor("xml", oSource).then(function() {
			assert.ok(false);
			done();
		}, function(ex) {
			assert.ok(true, ex); // TypeError: string is not a function
			sinon.assert.notCalled(expectProcess);
			done();
		});
	});

	QUnit.test("runPreprocessor w/ valid preprocessor", function (assert) {
		assert.expect(1);
		var done = assert.async();
		var oSource = {}, bCalled = false;
			oView = new View({
				preprocessors: {
					xml: [{
						preprocessor: {
							process: function(val) {
								bCalled = true;
								return Promise.resolve(val);
							}
						}
					}],
				},
				async: true
			});
		oView.loaded().then(function() {
			oView.runPreprocessor("xml", oSource).then(function() {
				assert.ok(bCalled, "preprocessor was called");
				done();
			},function(ex) {
				assert.ok(false, ex); // TypeError: string is not a function
				done();
			});
		});
	});

	QUnit.test("runPreprocessor w/o known preprocessor", function (assert) {
		assert.expect(2);
		var done = assert.async();
		var oSource = {},
			oView = new View({
				preprocessors: {
					foo: {}
				}
			});

		oView.runPreprocessor("foo", oSource).then(function() {
			assert.ok(true); // do nothing
			sinon.assert.notCalled(expectProcess);
			done();
		});
	});

	QUnit.module("sap.ui.core.mvc.View#registerPreprocessor", {
		beforeEach: function() {
			_mPreprocessors = jQuery.extend(true, {}, View._mPreprocessors);
			this.sViewContent = [
				'<mvc:View xmlns:mvc="sap.ui.core.mvc"/>'
			].join(''),
			this.oPreprocessor = function(vSource, sCaller, mSettings) {
				jQuery.sap.log.debug("[TEST] " + mSettings.message, sCaller);
				assert.ok(true, "Preprocessor executed");
				return new Promise(function(resolve) {
					resolve(vSource);
				});
			},
			this.mSettings = {
				message: "Preprocessor executed"
			},
			spy = sinon.spy(View.prototype, "runPreprocessor");
		},
		afterEach: function() {
			// restore the sinon spy to original state
			View.prototype.runPreprocessor.restore();
			// remove existing global preprocessors
			View._mPreprocessors = _mPreprocessors;
		}
	});

	QUnit.test("register global preprocessor", function (assert) {
		assert.expect(2);

		// templating preprocessor set by default
		assert.deepEqual(
			View._mPreprocessors,
			{
				"XML": {
					"xml": [
						{
							"_onDemand": true,
							"_syncSupport": true,
							"preprocessor": "sap.ui.core.util.XMLPreprocessor"
						}
					]
				}
			} ,
			"default templating preprocessor stored at view");

		View.registerPreprocessor("controls", this.oPreprocessor, "test", true, this.mSettings);
		// now a preprocessor is set
		assert.deepEqual(
			View._mPreprocessors["test"]["controls"],
			[{_onDemand: false, preprocessor: this.oPreprocessor, _syncSupport: true, _settings: this.mSettings}],
			"preprocessor stored at view"
		);
	});

	QUnit.test("call method via init", function (assert) {
		assert.expect(2);
		var done = assert.async();

		XMLView.registerPreprocessor("controls", this.oPreprocessor, false, this.mSettings);

		// call by init
		var oView = sap.ui.xmlview({
			viewContent : this.sViewContent,
			async : true
		});


		oView.attachAfterInit(function() {
			sinon.assert.calledTwice(spy);
			done();
		});
	});

	QUnit.test("call method independent", function (assert) {
		assert.expect(4);
		var done = assert.async();

		XMLView.registerPreprocessor("controls", this.oPreprocessor, false, this.mSettings);

		// init view
		var oView = sap.ui.xmlview({
			viewContent : this.sViewContent,
			async : true
		});

		oView.attachAfterInit(function() {
			// call independent
			oView.runPreprocessor("controls").then(function(vSource) {
				assert.ok(true, "Method called");
				sinon.assert.calledThrice(spy);
				done();
			});
		});

	});

	QUnit.test("run async preprocessors", function (assert) {
		assert.expect(2);
		var done = assert.async();

		XMLView.registerPreprocessor("controls", this.oPreprocessor, false, this.mSettings);

		// call via init
		var oView = sap.ui.xmlview({
			viewContent : this.sViewContent,
			async : true
		});

		oView.attachAfterInit(function() {
			sinon.assert.calledTwice(spy);
			done();
		});

	});

	QUnit.test("run together with local preprocessor", function (assert) {
		assert.expect(5);
		var done = assert.async();
		var oLocalPreprocessor = function(vSource, sCaller, mSettings) {
			// async test part
			jQuery.sap.log.debug("[TEST] " + mSettings.message, sCaller);
			assert.ok(true, "Local preprocessor executed");
			return new Promise(function(resolve) {
				resolve(vSource);
			});
		},
		mLocalSettings = {
			message: "Local preprocessor executed"
		};

		XMLView.registerPreprocessor("controls", this.oPreprocessor, false, this.mSettings);

		// call via init
		var oView = sap.ui.xmlview({
			viewContent: this.sViewContent,
			preprocessors:{
				xml: {
					preprocessor: oLocalPreprocessor,
					settings: mLocalSettings
				}
			},
			async: true
		});

		oView.attachAfterInit(function() {
			sinon.assert.calledTwice(spy);
			assert.ok(oView.hasPreprocessor("xml"), "active xml preprocessor");
			assert.ok(oView.hasPreprocessor("controls"), "active controls preprocessor");
			done();
		});
	});

	QUnit.test("global preprocessor and local preprocessor on one hook", function (assert) {
		assert.expect(5);
		var done = assert.async();
		var oLocalPreprocessor = function(vSource, sCaller, mSettings) {
			assert.ok(true, "Local preprocessor executed");
			return new Promise(function(resolve) {
				resolve(vSource);
			});
		},
		mLocalSettings = {
			message: "Local preprocessor executed"
		};

		XMLView.registerPreprocessor("controls", this.oPreprocessor, false, this.mSettings);

		// call via init
		var oView = sap.ui.xmlview({
			viewContent: this.sViewContent,
			preprocessors:{
				controls: {
					preprocessor: oLocalPreprocessor,
					settings: mLocalSettings
				}
			},
			async: true
		});

		oView.attachAfterInit(function() {
			sinon.assert.calledTwice(spy);
			assert.ok(!oView.hasPreprocessor("xml"), "no active xml preprocessor");
			assert.ok(oView.hasPreprocessor("controls"), "active controls preprocessor");
			done();
		});
	});

	QUnit.test("on demand preprocessor provided", function (assert) {
		assert.expect(5);
		var done = assert.async();
		XMLView.registerPreprocessor("xml", this.oPreprocessor, true, this.mSettings);

		var mDefaultSettings = {
				message: "OnDemand preprocessor executed"
			};

		// call via init
		var oView = sap.ui.xmlview({
			viewContent: this.sViewContent,
			// provide anonymous xml preprocessor
			preprocessors:{
				xml: {
					settings: mDefaultSettings
				}
			},
			async: true
		});

		oView.attachAfterInit(function() {
			sinon.assert.calledTwice(spy);
			assert.ok(oView.hasPreprocessor("xml"), "active xml preprocessor");
			assert.ok(!oView.hasPreprocessor("controls"), "no active controls preprocessor");
			done();
		});
	});

	QUnit.test("on demand preprocessor not provided", function (assert) {
		assert.expect(4);
		var done = assert.async();
		XMLView.registerPreprocessor("xml", this.oPreprocessor, true, true, this.mSettings);

		var mDefaultSettings = {
				message: "OnDemand preprocessor executed"
			},
			logSpy = this.spy(jQuery.sap.log, "debug");

		// call via init
		var oView = sap.ui.xmlview({
			// do not provide preprocessor here
			viewContent: this.sViewContent,
			async: true
		});

		oView.attachAfterInit(function() {
			assert.ok(!logSpy.calledWithExactly("Running preprocessor for \"xml\" via given function", oView), "No log statement");
			sinon.assert.calledTwice(spy);
			assert.ok(!oView.hasPreprocessor("controls"), "no active controls preprocessor");
			assert.ok(!oView.hasPreprocessor("xml"), "no active xml preprocessor");
			done();
		});
	});

	QUnit.test("sap.ui.core.mvc.View#getPreprocessorInfo", function(assert) {
		var oView = new View("dummy", {}),
			oPreprocessorInfo = {
			  caller: "Element sap.ui.core.mvc.View#dummy (undefined)",
			  componentId: undefined,
			  id: "dummy",
			  name: undefined,
			  sync: false
			};
		assert.deepEqual(oView.getPreprocessorInfo(), oPreprocessorInfo);
		oView.destroy();
	});

	QUnit.test("sap.ui.core.mvc.Preprocessor methods", function(assert) {
		assert.ok(TestPreprocessor.process, "process method");
		assert.ok(TestPreprocessor.getCacheKey, "getCacheKey method");
	});

	QUnit.test("sap.ui.core.mvc.Preprocessor extending module", function(assert) {
		assert.expect(2);
		var done = assert.async();

		mSettings = {
			message: "TestPreprocessor executed",
			assert: ok
		};

		XMLView.registerPreprocessor("controls", "test.sap.ui.core.qunit.mvc.testdata.TestPreprocessor", true, mSettings);

		// call via init
		var oView = sap.ui.xmlview({
			viewContent: this.sViewContent,
			async: true
		});

		// twice, default + the registered one
		oView.attachAfterInit(function() {
			sinon.assert.calledTwice(spy);
			done();
		});
	});

	QUnit.module("sap.ui.core.mvc.View#loaded");

	QUnit.test("Retrieve promise for view generally", function(assert) {
		assert.expect(2);
		var done = assert.async();
		var oView = new View({});
			oPromise = oView.loaded();

		assert.ok(oPromise instanceof Promise, "Promise returned");

		oPromise.then(function(oViewLoaded) {
			assert.deepEqual(oView, oViewLoaded, "Views equal deeply");
			done();
		});
	});

});