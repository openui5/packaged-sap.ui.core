/*global QUnit, sinon */
sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/core/mvc/JSView",
	"sap/ui/core/routing/Route",
	"sap/ui/core/routing/Views",
	"sap/ui/core/routing/Targets",
	"./AsyncViewModuleHook",
	"sap/m/Panel"
], function(UIComponent, JSView, Route, Views, Targets, ModuleHook, Panel) {
	"use strict";

	// use sap.m.Panel as a lightweight drop-in replacement for the ux3.Shell
	var ShellSubstitute = Panel;

	QUnit.module("async view loading", ModuleHook.create({
		beforeEach: function() {
			var oViews = new Views({async: true});
			this.oShell = new ShellSubstitute();
			this.oRouterStub = {
				fireRouteMatched : function () {},
				fireRoutePatternMatched : function () {},
				fireBeforeRouteMatched : function () {},
				_oTargets: new Targets({
					targets: {
						async1: {
							// key: "async1",
							viewName: "qunit.view.Async1",
							controlAggregation: "content",
							controlId: this.oShell.getId(),
							viewType: "XML"
						},
						async2: {
							// key: "async2",
							viewName: "qunit.view.Async2",
							controlAggregation: "content",
							controlId: this.oShell.getId(),
							viewType: "XML"
						},
						async3: {
							// key: "async3",
							viewName: "qunit.view.Async3",
							controlAggregation: "content",
							controlId: this.oShell.getId(),
							viewType: "XML"
						}
					},
					views: oViews,
					config: {
						_async: true
					}
				}),
				_oViews: oViews,
				_isAsync: function() {
					return true;
				}
			};

			this.oRoute = new Route(this.oRouterStub, {
				name: "testRoute",
				target: [
					"async1", "async2", "async3"
				]
			});

			this.oRoute1 = new Route(this.oRouterStub, {
				name: "testRoute1",
				view: "qunit.view.Async3",
				targetAggregation: "content",
				targetControl: this.oShell.getId(),
				viewType: "XML"
			});
		},
		afterEach: function() {
			this.oRoute.destroy();
			this.oRoute1.destroy();
		}
	}));

	QUnit.test("Should fired beforeMatched before matched", function(assert) {
		var fnBeforeMatchedSpy = this.spy(function() {
				assert.notOk(fnMatchedSpy.called, "the matched event shouldn't be fired yet");
			}),
			fnMatchedSpy = this.spy();

		this.oRoute.attachBeforeMatched(fnBeforeMatchedSpy);
		this.oRoute.attachMatched(fnMatchedSpy);

		// Act
		var oSequencePromise = this.oRoute._routeMatched({}, Promise.resolve());
		return oSequencePromise.then(function() {
			// Assert
			assert.strictEqual(fnBeforeMatchedSpy.callCount, 1, "did fire the beforeMatched event");
			assert.strictEqual(fnMatchedSpy.callCount, 1, "did fire the matched event");
		});
	});

	QUnit.test("Should not call pattern matched only matched", function(assert) {
		var fnMatchedSpy = this.spy(),
			fnPatternMatchedSpy = this.spy();

		this.oRoute.attachMatched(fnMatchedSpy);
		this.oRoute.attachPatternMatched(fnPatternMatchedSpy);

		// Act
		var oSequencePromise = this.oRoute._routeMatched({}, Promise.resolve());
		return oSequencePromise.then(function(aValues) {
			// Assert
			assert.strictEqual(fnMatchedSpy.callCount, 1, "did call the attachMatched spy");
			assert.strictEqual(fnPatternMatchedSpy.callCount, 0, "did not call the attachPatternMatched spy");
		});
	});

	QUnit.test("Should not call pattern matched only matched (legacy version; not setting target parameter)", function(assert) {
		var fnMatchedSpy = this.spy(),
			fnPatternMatchedSpy = this.spy();

		this.oRoute1.attachMatched(fnMatchedSpy);
		this.oRoute1.attachPatternMatched(fnPatternMatchedSpy);

		// Act
		var oSequencePromise = this.oRoute1._routeMatched({}, Promise.resolve());
		return oSequencePromise.then(function(aValues) {
			// Assert
			assert.strictEqual(fnMatchedSpy.callCount, 1, "did call the attachMatched spy");
			assert.strictEqual(fnPatternMatchedSpy.callCount, 0, "did not call the attachPatternMatched spy");
		});
	});


	function fnRouteEventsTestCase (sTestName, sEventName) {
		QUnit.test(sTestName, function(assert) {
			// Arrange
			var sName = "testRoute",
				aTargetNames = ["async1", "async2", "async3"],
				oRoute = new Route(this.oRouterStub, { name : sName, target : aTargetNames }),
				fnEventSpy = this.spy(function(oEvent, oActualData) {
					assert.strictEqual(oActualData, oData, "the data is correct");
					assert.strictEqual(oEvent.getParameters().name, sName, "the name is correct");
					assert.strictEqual(this, oListener, "the this pointer is correct");
				}),
				oListener = {},
				oData = {some: "data"},
				oAttachReturnValue = oRoute["attach" + sEventName](oData, fnEventSpy, oListener);

			// Act
			var oSequencePromise = oRoute._routeMatched({});

			return oSequencePromise.then(function(aValues) {
				// Assert
				assert.strictEqual(fnEventSpy.callCount, 1, "did call the attach spy for the event " + sEventName);
				assert.strictEqual(oAttachReturnValue, oRoute, "did return this for chaining for the event " + sEventName);
			});
		});
	}

	fnRouteEventsTestCase("Should attach to the beforeMatched event", "BeforeMatched");
	fnRouteEventsTestCase("Should attach to the matched event", "Matched");
	fnRouteEventsTestCase("Should attach to the patternMatched event", "PatternMatched");

	function fnDetachRouteEventTestCase(sTestName, sEventName) {
		QUnit.test(sTestName, function(assert) {
			// Arrange
			var sName = "testRoute",
				aTargetNames = ["async1", "async2", "async3"],
				fnRouteMatchedSpy = this.spy(),
				fnEventSpy = this.spy(),
				oListener = {};

			this.oRouterStub.fireRouteMatched = fnRouteMatchedSpy;
			this.oRouterStub.fireRoutePatternMatched = fnRouteMatchedSpy;

			var oRoute = new Route(this.oRouterStub,
				{ name : sName, target : aTargetNames });

			oRoute["attach" + sEventName](fnEventSpy, oListener);
			oRoute["attach" + sEventName](fnEventSpy);

			// Act
			var oDetachedReturnValue = oRoute["detach" + sEventName](fnEventSpy, oListener);
			oRoute["detach" + sEventName](fnEventSpy);

			// FireEvent to make sure no spy is called
			var oSequencePromise = oRoute._routeMatched({});

			// Assert
			return oSequencePromise.then(function(aValues) {
				assert.strictEqual(fnEventSpy.callCount, 0, "did not call the spy since it was detached");
				assert.strictEqual(oDetachedReturnValue, oRoute, "did return this for chaining");
			});
		});
	}

	fnDetachRouteEventTestCase("Should detach the beforeMatched event", "BeforeMatched");
	fnDetachRouteEventTestCase("Should detach the matched event", "Matched");
	fnDetachRouteEventTestCase("Should detach the patternMatched event", "PatternMatched");

	QUnit.module("nested routes",{
		beforeEach: function() {
			var that = this;
			this.oSpy = sinon.spy(function(sRoute) {
				return {
					matched: {
						add: function() {

						}
					}
				};
			});
			this.oRouterStub = {
				_oRouter: {
					addRoute: this.oSpy
				},
				_isAsync: function() {
					return true;
				},
				getRoute: function() {
					return that.oParentRoute;
				}
			};

			this.oParentRoute = new Route(this.oRouterStub, {
				name: "parentRoute",
				pattern: "parent"
			});

			this.oChildRoute = new Route(this.oRouterStub, {
				name: "childRoute",
				pattern: "child",
				parent: ":parentRoute"
			});

			var ParentComponent = UIComponent.extend("parent.component", {
				metadata : {
					routing:  {
						routes: [
							{
								pattern: "category/{id}",
								name: "category"
							}
						]
					}
				},
				createContent: function() {
					that.oChildComponent = new ChildComponent("child");
					return sap.ui.jsview("view", {
						content: that.oChildComponent
					});
				}
			});

			var ChildComponent = UIComponent.extend("child.component", {
				metadata : {
					routing:  {
						routes: [
							{
								pattern: "product/{id}",
								name: "product",
								parent: "parent.component:category"
							}
						]
					}
				}
			});

			this.oGetParentRouteSpy = sinon.spy(Route.prototype, "_getParentRoute");

			this.oParentComponent = new ParentComponent("parent");

		},
		afterEach: function() {
			this.oGetParentRouteSpy.restore();
			this.oParentRoute.destroy();
			this.oChildRoute.destroy();
			this.oParentComponent.destroy();
			this.oChildComponent.destroy();
		}
	});

	QUnit.test("Route with prefixed pattern is added to router", function(assert) {
		assert.strictEqual(this.oSpy.callCount, 2, "Two patterns are added to the router");
		assert.strictEqual(this.oSpy.args[0][0], "parent", "Pattern of parent route is added to router");
		assert.strictEqual(this.oSpy.args[1][0], "parent/child", "Pattern of child route is prefixed with the parent route and added to router");
	});

	QUnit.test("Route with prefixed pattern matches for nested components", function(assert) {
		var oParentRouter = this.oParentComponent.getRouter();
		assert.strictEqual(this.oGetParentRouteSpy.callCount, 1, "getParentRoute is called once on the child route");
		assert.strictEqual(this.oGetParentRouteSpy.args[0][0], "parent.component:category", "parameter is correctly given");
		assert.strictEqual(this.oGetParentRouteSpy.returnValues[0], oParentRouter.getRoute("category"), "The parent route instance is fetched from the component");
	});
});
