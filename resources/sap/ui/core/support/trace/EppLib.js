/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2020 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

sap.ui.define(function() {
	"use strict";


	var EppLib1 = (function() {
		var EppLib = {};

		EppLib.getBytesFromString = function(s) {
			var bytes = [];
			for (var i = 0; i < s.length; ++i) {
				bytes.push(s.charCodeAt(i));
			}
			return bytes;
		};

		EppLib.createHexString = function(arr) {
			var result = "";

			for (var i = 0; i < arr.length; i++) {
				var str = arr[i].toString(16);
				str = Array(2 - str.length + 1).join("0") + str;
				result += str;
			}

			return result;
		};

		EppLib.passportHeader = function(trcLvl, RootID, TransID) {
			var SAPEPPTemplateLow = [
				0x2A, 0x54, 0x48, 0x2A, 0x03, 0x01, 0x30, 0x00, 0x00, 0x53, 0x41, 0x50, 0x5F, 0x45, 0x32, 0x45, 0x5F, 0x54, 0x41, 0x5F, 0x50, 0x6C, 0x75, 0x67,
				0x49, 0x6E, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x00, 0x00, 0x53, 0x41, 0x50, 0x5F, 0x45,
				0x32, 0x45, 0x5F, 0x54, 0x41, 0x5F, 0x55, 0x73, 0x65, 0x72, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20,
				0x20, 0x20, 0x20, 0x53, 0x41, 0x50, 0x5F, 0x45, 0x32, 0x45, 0x5F, 0x54, 0x41, 0x5F, 0x52, 0x65, 0x71, 0x75, 0x65, 0x73, 0x74, 0x20, 0x20, 0x20,
				0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x00, 0x05, 0x53, 0x41, 0x50,
				0x5F, 0x45, 0x32, 0x45, 0x5F, 0x54, 0x41, 0x5F, 0x50, 0x6C, 0x75, 0x67, 0x49, 0x6E, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20,
				0x20, 0x20, 0x20, 0x20, 0x20, 0x34, 0x36, 0x33, 0x35, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x33, 0x31, 0x31, 0x45, 0x45, 0x30, 0x41, 0x35, 0x44,
				0x32, 0x35, 0x30, 0x39, 0x39, 0x39, 0x43, 0x33, 0x39, 0x32, 0x42, 0x36, 0x38, 0x20, 0x20, 0x20, 0x00, 0x07, 0x46, 0x35, 0x00, 0x00, 0x00, 0x31,
				0x1E, 0xE0, 0xA5, 0xD2, 0x4E, 0xDB, 0xB2, 0xE4, 0x4B, 0x68, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
				0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02, 0x00, 0xE2, 0x2A, 0x54, 0x48, 0x2A, 0x01, 0x00, 0x27, 0x00, 0x00, 0x02, 0x00, 0x03, 0x00, 0x02,
				0x00, 0x01, 0x04, 0x00, 0x08, 0x58, 0x00, 0x02, 0x00, 0x02, 0x04, 0x00, 0x08, 0x30, 0x00, 0x02, 0x00, 0x03, 0x02, 0x00, 0x0B, 0x00, 0x00, 0x00,
				0x00, 0x2A, 0x54, 0x48, 0x2A, 0x01, 0x00, 0x23, 0x01, 0x00, 0x01, 0x00, 0x01, 0x00, 0x02, 0x00, 0x01, 0x03, 0x00, 0x17, 0x00, 0xAB, 0xCD, 0xEF,
				0xAB, 0xCD, 0xEF, 0xAB, 0xCD, 0xEF, 0xAB, 0xCD, 0xEF, 0xAB, 0xCD, 0xEF, 0x2A, 0x54, 0x48, 0x2A
			];

			var RootIDPosLen = [
				372, 32
			];

			var TransIDPosLen = [
				149, 32
			];

			var CompNamePosLEn = [
				9, 32
			];

			var PreCompNamePosLEn = [
				117, 32
			];

			var traceFlgsOffset = [
				7, 2
			];

			var prefix = EppLib.getBytesFromString("SAP_E2E_TA_UI5LIB");
			prefix = prefix.concat(EppLib.getBytesFromString(new Array(32 + 1 - prefix.length).join(' ')));

			SAPEPPTemplateLow.splice.apply(SAPEPPTemplateLow, CompNamePosLEn.concat(prefix));
			SAPEPPTemplateLow.splice.apply(SAPEPPTemplateLow, PreCompNamePosLEn.concat(prefix));
			SAPEPPTemplateLow.splice.apply(SAPEPPTemplateLow, TransIDPosLen.concat(EppLib.getBytesFromString(TransID)));
			SAPEPPTemplateLow.splice.apply(SAPEPPTemplateLow, traceFlgsOffset.concat(trcLvl));

			var retVal = EppLib.createHexString(SAPEPPTemplateLow).toUpperCase();

			return retVal.substring(0, RootIDPosLen[0]).concat(RootID) + retVal.substring(RootIDPosLen[0] + RootIDPosLen[1]);
		};

		EppLib.traceFlags = function(lvl) {
			switch (lvl) {
			case 'low' :
				return [0x00, 0x00];
			case 'medium' :
				return [0x89, 0x0A];
			case 'high' :
				return [0x9F, 0x0D];
			default:
				var rta = [];
				rta.push((parseInt(lvl, 16) & 0xFF00) / 256);
				rta.push((parseInt(lvl, 16) & 0xFF));
				return rta;
			}
		};

		EppLib.createGUID = function() {
			var S4 = function() {
				var temp = Math.floor(Math.random() * 0x10000 /* 65536 */);
				return (new Array(4 + 1 - temp.toString(16).length)).join('0') + temp.toString(16);
			};

			var S5 = function() {
				var temp = (Math.floor(Math.random() * 0x10000 /* 65536 */) & 0x0fff) + 0x4000;
				return (new Array(4 + 1 - temp.toString(16).length)).join('0') + temp.toString(16);
			};

			var S6 = function() {
				var temp = (Math.floor(Math.random() * 0x10000 /* 65536 */) & 0x3fff) + 0x8000;
				return (new Array(4 + 1 - temp.toString(16).length)).join('0') + temp.toString(16);
			};

			var retVal = (S4() + S4() + //"-" +
				S4() + //"-" +
				S5() + //"-" +
				S6() + //"-" +
				S4() + S4() + S4());

			return retVal.toUpperCase();
		};

		return EppLib;
	})();

	return EppLib1;

}, /* bExport= */ true);
