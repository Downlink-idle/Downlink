(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.Decimal = factory());
}(this, function () { 'use strict';

  var padEnd = function (string, maxLength, fillString) {

    if (string == null || maxLength == null) {
      return string;
    }

    var result    = String(string);
    var targetLen = typeof maxLength === 'number'
      ? maxLength
      : parseInt(maxLength, 10);

    if (isNaN(targetLen) || !isFinite(targetLen)) {
      return result;
    }


    var length = result.length;
    if (length >= targetLen) {
      return result;
    }


    var filled = fillString == null ? '' : String(fillString);
    if (filled === '') {
      filled = ' ';
    }


    var fillLen = targetLen - length;

    while (filled.length < fillLen) {
      filled += filled;
    }

    var truncated = filled.length > fillLen ? filled.substr(0, fillLen) : filled;

    return result + truncated;
  };

  // consider adding them together pointless, just return the larger one

  var MAX_SIGNIFICANT_DIGITS = 17; // Highest value you can safely put here is Number.MAX_SAFE_INTEGER-MAX_SIGNIFICANT_DIGITS

  var EXP_LIMIT = 9e15; // The largest exponent that can appear in a Number, though not all mantissas are valid here.

  var NUMBER_EXP_MAX = 308; // The smallest exponent that can appear in a Number, though not all mantissas are valid here.

  var NUMBER_EXP_MIN = -324;

  var powerOf10 = function () {
    // We need this lookup table because Math.pow(10, exponent)
    // when exponent's absolute value is large is slightly inaccurate.
    // You can fix it with the power of math... or just make a lookup table.
    // Faster AND simpler
    var powersOf10 = [];

    for (var i = NUMBER_EXP_MIN + 1; i <= NUMBER_EXP_MAX; i++) {
      powersOf10.push(Number("1e" + i));
    }

    var indexOf0InPowersOf10 = 323;
    return function (power) {
      return powersOf10[power + indexOf0InPowersOf10];
    };
  }();

  var D = function D(value) {
    return value instanceof Decimal ? value : new Decimal(value);
  };

  var ME = function ME(mantissa, exponent) {
    return new Decimal().fromMantissaExponent(mantissa, exponent);
  };

  var ME_NN = function ME_NN(mantissa, exponent) {
    return new Decimal().fromMantissaExponent_noNormalize(mantissa, exponent);
  };

  function affordGeometricSeries(resourcesAvailable, priceStart, priceRatio, currentOwned) {
    var actualStart = priceStart.mul(priceRatio.pow(currentOwned));
    return Decimal.floor(resourcesAvailable.div(actualStart).mul(priceRatio.sub(1)).add(1).log10() / priceRatio.log10());
  }

  function sumGeometricSeries(numItems, priceStart, priceRatio, currentOwned) {
    return priceStart.mul(priceRatio.pow(currentOwned)).mul(Decimal.sub(1, priceRatio.pow(numItems))).div(Decimal.sub(1, priceRatio));
  }

  function affordArithmeticSeries(resourcesAvailable, priceStart, priceAdd, currentOwned) {
    // n = (-(a-d/2) + sqrt((a-d/2)^2+2dS))/d
    // where a is actualStart, d is priceAdd and S is resourcesAvailable
    // then floor it and you're done!
    var actualStart = priceStart.add(currentOwned.mul(priceAdd));
    var b = actualStart.sub(priceAdd.div(2));
    var b2 = b.pow(2);
    return b.neg().add(b2.add(priceAdd.mul(resourcesAvailable).mul(2)).sqrt()).div(priceAdd).floor();
  }

  function sumArithmeticSeries(numItems, priceStart, priceAdd, currentOwned) {
    var actualStart = priceStart.add(currentOwned.mul(priceAdd)); // (n/2)*(2*a+(n-1)*d)

    return numItems.div(2).mul(actualStart.mul(2).plus(numItems.sub(1).mul(priceAdd)));
  }

  function efficiencyOfPurchase(cost, currentRpS, deltaRpS) {
    return cost.div(currentRpS).add(cost.div(deltaRpS));
  }
  /**
   * The Decimal's value is simply mantissa * 10^exponent.
   */


  var Decimal =
  /** @class */
  function () {
    function Decimal(value) {
      /**
       * A number (double) with absolute value between [1, 10) OR exactly 0.
       * If mantissa is ever 10 or greater, it should be normalized
       * (divide by 10 and add 1 to exponent until it is less than 10,
       * or multiply by 10 and subtract 1 from exponent until it is 1 or greater).
       * Infinity/-Infinity/NaN will cause bad things to happen.
       */
      this.mantissa = NaN;
      /**
       * A number (integer) between -EXP_LIMIT and EXP_LIMIT.
       * Non-integral/out of bounds will cause bad things to happen.
       */

      this.exponent = NaN;

      if (value === undefined) {
        this.m = 0;
        this.e = 0;
      } else if (value instanceof Decimal) {
        this.fromDecimal(value);
      } else if (typeof value === "number") {
        this.fromNumber(value);
      } else {
        this.fromString(value);
      }
    }

    Object.defineProperty(Decimal.prototype, "m", {
      get: function get() {
        return this.mantissa;
      },
      set: function set(value) {
        this.mantissa = value;
      },
      enumerable: true,
      configurable: true
    });
    Object.defineProperty(Decimal.prototype, "e", {
      get: function get() {
        return this.exponent;
      },
      set: function set(value) {
        this.exponent = value;
      },
      enumerable: true,
      configurable: true
    });
    Object.defineProperty(Decimal.prototype, "s", {
      get: function get() {
        return this.sign();
      },
      set: function set(value) {
        if (value === 0) {
          this.e = 0;
          this.m = 0;
          return;
        }

        if (this.sgn() !== value) {
          this.m = -this.m;
        }
      },
      enumerable: true,
      configurable: true
    });

    Decimal.fromMantissaExponent = function (mantissa, exponent) {
      return new Decimal().fromMantissaExponent(mantissa, exponent);
    };

    Decimal.fromMantissaExponent_noNormalize = function (mantissa, exponent) {
      return new Decimal().fromMantissaExponent_noNormalize(mantissa, exponent);
    };

    Decimal.fromDecimal = function (value) {
      return new Decimal().fromDecimal(value);
    };

    Decimal.fromNumber = function (value) {
      return new Decimal().fromNumber(value);
    };

    Decimal.fromString = function (value) {
      return new Decimal().fromString(value);
    };

    Decimal.fromValue = function (value) {
      return new Decimal().fromValue(value);
    };

    Decimal.fromValue_noAlloc = function (value) {
      return value instanceof Decimal ? value : new Decimal(value);
    };

    Decimal.abs = function (value) {
      return D(value).abs();
    };

    Decimal.neg = function (value) {
      return D(value).neg();
    };

    Decimal.negate = function (value) {
      return D(value).neg();
    };

    Decimal.negated = function (value) {
      return D(value).neg();
    };

    Decimal.sign = function (value) {
      return D(value).sign();
    };

    Decimal.sgn = function (value) {
      return D(value).sign();
    };

    Decimal.round = function (value) {
      return D(value).round();
    };

    Decimal.floor = function (value) {
      return D(value).floor();
    };

    Decimal.ceil = function (value) {
      return D(value).ceil();
    };

    Decimal.trunc = function (value) {
      return D(value).trunc();
    };

    Decimal.add = function (value, other) {
      return D(value).add(other);
    };

    Decimal.plus = function (value, other) {
      return D(value).add(other);
    };

    Decimal.sub = function (value, other) {
      return D(value).sub(other);
    };

    Decimal.subtract = function (value, other) {
      return D(value).sub(other);
    };

    Decimal.minus = function (value, other) {
      return D(value).sub(other);
    };

    Decimal.mul = function (value, other) {
      return D(value).mul(other);
    };

    Decimal.multiply = function (value, other) {
      return D(value).mul(other);
    };

    Decimal.times = function (value, other) {
      return D(value).mul(other);
    };

    Decimal.div = function (value, other) {
      return D(value).div(other);
    };

    Decimal.divide = function (value, other) {
      return D(value).div(other);
    };

    Decimal.recip = function (value) {
      return D(value).recip();
    };

    Decimal.reciprocal = function (value) {
      return D(value).recip();
    };

    Decimal.reciprocate = function (value) {
      return D(value).reciprocate();
    };

    Decimal.cmp = function (value, other) {
      return D(value).cmp(other);
    };

    Decimal.compare = function (value, other) {
      return D(value).cmp(other);
    };

    Decimal.eq = function (value, other) {
      return D(value).eq(other);
    };

    Decimal.equals = function (value, other) {
      return D(value).eq(other);
    };

    Decimal.neq = function (value, other) {
      return D(value).neq(other);
    };

    Decimal.notEquals = function (value, other) {
      return D(value).notEquals(other);
    };

    Decimal.lt = function (value, other) {
      return D(value).lt(other);
    };

    Decimal.lte = function (value, other) {
      return D(value).lte(other);
    };

    Decimal.gt = function (value, other) {
      return D(value).gt(other);
    };

    Decimal.gte = function (value, other) {
      return D(value).gte(other);
    };

    Decimal.max = function (value, other) {
      return D(value).max(other);
    };

    Decimal.min = function (value, other) {
      return D(value).min(other);
    };

    Decimal.clamp = function (value, min, max) {
      return D(value).clamp(min, max);
    };

    Decimal.clampMin = function (value, min) {
      return D(value).clampMin(min);
    };

    Decimal.clampMax = function (value, max) {
      return D(value).clampMax(max);
    };

    Decimal.cmp_tolerance = function (value, other, tolerance) {
      return D(value).cmp_tolerance(other, tolerance);
    };

    Decimal.compare_tolerance = function (value, other, tolerance) {
      return D(value).cmp_tolerance(other, tolerance);
    };

    Decimal.eq_tolerance = function (value, other, tolerance) {
      return D(value).eq_tolerance(other, tolerance);
    };

    Decimal.equals_tolerance = function (value, other, tolerance) {
      return D(value).eq_tolerance(other, tolerance);
    };

    Decimal.neq_tolerance = function (value, other, tolerance) {
      return D(value).neq_tolerance(other, tolerance);
    };

    Decimal.notEquals_tolerance = function (value, other, tolerance) {
      return D(value).notEquals_tolerance(other, tolerance);
    };

    Decimal.lt_tolerance = function (value, other, tolerance) {
      return D(value).lt_tolerance(other, tolerance);
    };

    Decimal.lte_tolerance = function (value, other, tolerance) {
      return D(value).lte_tolerance(other, tolerance);
    };

    Decimal.gt_tolerance = function (value, other, tolerance) {
      return D(value).gt_tolerance(other, tolerance);
    };

    Decimal.gte_tolerance = function (value, other, tolerance) {
      return D(value).gte_tolerance(other, tolerance);
    };

    Decimal.log10 = function (value) {
      return D(value).log10();
    };

    Decimal.absLog10 = function (value) {
      return D(value).absLog10();
    };

    Decimal.pLog10 = function (value) {
      return D(value).pLog10();
    };

    Decimal.log = function (value, base) {
      return D(value).log(base);
    };

    Decimal.log2 = function (value) {
      return D(value).log2();
    };

    Decimal.ln = function (value) {
      return D(value).ln();
    };

    Decimal.logarithm = function (value, base) {
      return D(value).logarithm(base);
    };

    Decimal.pow10 = function (value) {
      if (Number.isInteger(value)) {
        return ME_NN(1, value);
      }

      return ME(Math.pow(10, value % 1), Math.trunc(value));
    };

    Decimal.pow = function (value, other) {
      // Fast track: 10^integer
      if (typeof value === "number" && value === 10 && typeof other === "number" && Number.isInteger(other)) {
        return ME_NN(1, other);
      }

      return D(value).pow(other);
    };

    Decimal.exp = function (value) {
      return D(value).exp();
    };

    Decimal.sqr = function (value) {
      return D(value).sqr();
    };

    Decimal.sqrt = function (value) {
      return D(value).sqrt();
    };

    Decimal.cube = function (value) {
      return D(value).cube();
    };

    Decimal.cbrt = function (value) {
      return D(value).cbrt();
    };
    /**
     * If you're willing to spend 'resourcesAvailable' and want to buy something
     * with exponentially increasing cost each purchase (start at priceStart,
     * multiply by priceRatio, already own currentOwned), how much of it can you buy?
     * Adapted from Trimps source code.
     */


    Decimal.affordGeometricSeries = function (resourcesAvailable, priceStart, priceRatio, currentOwned) {
      return affordGeometricSeries(D(resourcesAvailable), D(priceStart), D(priceRatio), currentOwned);
    };
    /**
     * How much resource would it cost to buy (numItems) items if you already have currentOwned,
     * the initial price is priceStart and it multiplies by priceRatio each purchase?
     */


    Decimal.sumGeometricSeries = function (numItems, priceStart, priceRatio, currentOwned) {
      return sumGeometricSeries(numItems, D(priceStart), D(priceRatio), currentOwned);
    };
    /**
     * If you're willing to spend 'resourcesAvailable' and want to buy something with additively
     * increasing cost each purchase (start at priceStart, add by priceAdd, already own currentOwned),
     * how much of it can you buy?
     */


    Decimal.affordArithmeticSeries = function (resourcesAvailable, priceStart, priceAdd, currentOwned) {
      return affordArithmeticSeries(D(resourcesAvailable), D(priceStart), D(priceAdd), D(currentOwned));
    };
    /**
     * How much resource would it cost to buy (numItems) items if you already have currentOwned,
     * the initial price is priceStart and it adds priceAdd each purchase?
     * Adapted from http://www.mathwords.com/a/arithmetic_series.htm
     */


    Decimal.sumArithmeticSeries = function (numItems, priceStart, priceAdd, currentOwned) {
      return sumArithmeticSeries(D(numItems), D(priceStart), D(priceAdd), D(currentOwned));
    };
    /**
     * When comparing two purchases that cost (resource) and increase your resource/sec by (deltaRpS),
     * the lowest efficiency score is the better one to purchase.
     * From Frozen Cookies:
     * http://cookieclicker.wikia.com/wiki/Frozen_Cookies_(JavaScript_Add-on)#Efficiency.3F_What.27s_that.3F
     */


    Decimal.efficiencyOfPurchase = function (cost, currentRpS, deltaRpS) {
      return efficiencyOfPurchase(D(cost), D(currentRpS), D(deltaRpS));
    };

    Decimal.randomDecimalForTesting = function (absMaxExponent) {
      // NOTE: This doesn't follow any kind of sane random distribution, so use this for testing purposes only.
      // 5% of the time, have a mantissa of 0
      if (Math.random() * 20 < 1) {
        return ME_NN(0, 0);
      }

      var mantissa = Math.random() * 10; // 10% of the time, have a simple mantissa

      if (Math.random() * 10 < 1) {
        mantissa = Math.round(mantissa);
      }

      mantissa *= Math.sign(Math.random() * 2 - 1);
      var exponent = Math.floor(Math.random() * absMaxExponent * 2) - absMaxExponent;
      return ME(mantissa, exponent);
      /*
        Examples:
              randomly test pow:
              var a = Decimal.randomDecimalForTesting(1000);
        var pow = Math.random()*20-10;
        if (Math.random()*2 < 1) { pow = Math.round(pow); }
        var result = Decimal.pow(a, pow);
        ["(" + a.toString() + ")^" + pow.toString(), result.toString()]
              randomly test add:
              var a = Decimal.randomDecimalForTesting(1000);
        var b = Decimal.randomDecimalForTesting(17);
        var c = a.mul(b);
        var result = a.add(c);
        [a.toString() + "+" + c.toString(), result.toString()]
      */
    };
    /**
     * When mantissa is very denormalized, use this to normalize much faster.
     */


    Decimal.prototype.normalize = function () {
      if (this.m >= 1 && this.m < 10) {
        return;
      } // TODO: I'm worried about mantissa being negative 0 here which is why I set it again, but it may never matter


      if (this.m === 0) {
        this.m = 0;
        this.e = 0;
        return;
      }

      var tempExponent = Math.floor(Math.log10(Math.abs(this.m)));
      this.m = this.m / powerOf10(tempExponent);
      this.e += tempExponent;
      return this;
    };

    Decimal.prototype.fromMantissaExponent = function (mantissa, exponent) {
      // SAFETY: don't let in non-numbers
      if (!isFinite(mantissa) || !isFinite(exponent)) {
        mantissa = Number.NaN;
        exponent = Number.NaN;
        return this;
      }

      this.m = mantissa;
      this.e = exponent; // Non-normalized mantissas can easily get here, so this is mandatory.

      this.normalize();
      return this;
    };
    /**
     * Well, you know what you're doing!
     */


    Decimal.prototype.fromMantissaExponent_noNormalize = function (mantissa, exponent) {
      this.m = mantissa;
      this.e = exponent;
      return this;
    };

    Decimal.prototype.fromDecimal = function (value) {
      this.m = value.m;
      this.e = value.e;
      return this;
    };

    Decimal.prototype.fromNumber = function (value) {
      // SAFETY: Handle Infinity and NaN in a somewhat meaningful way.
      if (isNaN(value)) {
        this.m = Number.NaN;
        this.e = Number.NaN;
      } else if (value === Number.POSITIVE_INFINITY) {
        this.m = 1;
        this.e = EXP_LIMIT;
      } else if (value === Number.NEGATIVE_INFINITY) {
        this.m = -1;
        this.e = EXP_LIMIT;
      } else if (value === 0) {
        this.m = 0;
        this.e = 0;
      } else {
        this.e = Math.floor(Math.log10(Math.abs(value))); // SAFETY: handle 5e-324, -5e-324 separately

        this.m = this.e === NUMBER_EXP_MIN ? value * 10 / 1e-323 : value / powerOf10(this.e); // SAFETY: Prevent weirdness.

        this.normalize();
      }

      return this;
    };

    Decimal.prototype.fromString = function (value) {
      if (value.indexOf("e") !== -1) {
        var parts = value.split("e");
        this.m = parseFloat(parts[0]);
        this.e = parseFloat(parts[1]); // Non-normalized mantissas can easily get here, so this is mandatory.

        this.normalize();
      } else if (value === "NaN") {
        this.m = Number.NaN;
        this.e = Number.NaN;
      } else {
        this.fromNumber(parseFloat(value));

        if (isNaN(this.m)) {
          throw Error("[DecimalError] Invalid argument: " + value);
        }
      }

      return this;
    };

    Decimal.prototype.fromValue = function (value) {
      if (value instanceof Decimal) {
        return this.fromDecimal(value);
      }

      if (typeof value === "number") {
        return this.fromNumber(value);
      }

      if (typeof value === "string") {
        return this.fromString(value);
      }

      this.m = 0;
      this.e = 0;
      return this;
    };

    Decimal.prototype.toNumber = function () {
      // Problem: new Decimal(116).toNumber() returns 115.99999999999999.
      // TODO: How to fix in general case? It's clear that if toNumber() is
      //  VERY close to an integer, we want exactly the integer.
      //  But it's not clear how to specifically write that.
      //  So I'll just settle with 'exponent >= 0 and difference between rounded
      //  and not rounded < 1e-9' as a quick fix.
      // var result = this.m*Math.pow(10, this.e);
      if (!isFinite(this.e)) {
        return Number.NaN;
      }

      if (this.e > NUMBER_EXP_MAX) {
        return this.m > 0 ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;
      }

      if (this.e < NUMBER_EXP_MIN) {
        return 0;
      } // SAFETY: again, handle 5e-324, -5e-324 separately


      if (this.e === NUMBER_EXP_MIN) {
        return this.m > 0 ? 5e-324 : -5e-324;
      }

      var result = this.m * powerOf10(this.e);

      if (!isFinite(result) || this.e < 0) {
        return result;
      }

      var resultRounded = Math.round(result);

      if (Math.abs(resultRounded - result) < 1e-10) {
        return resultRounded;
      }

      return result;
    };

    Decimal.prototype.mantissaWithDecimalPlaces = function (places) {
      // https://stackoverflow.com/a/37425022
      if (isNaN(this.m) || isNaN(this.e)) {
        return Number.NaN;
      }

      if (this.m === 0) {
        return 0;
      }

      var len = places + 1;
      var numDigits = Math.ceil(Math.log10(Math.abs(this.m)));
      var rounded = Math.round(this.m * Math.pow(10, len - numDigits)) * Math.pow(10, numDigits - len);
      return parseFloat(rounded.toFixed(Math.max(len - numDigits, 0)));
    };

    Decimal.prototype.toString = function () {
      if (isNaN(this.m) || isNaN(this.e)) {
        return "NaN";
      }

      if (this.e >= EXP_LIMIT) {
        return this.m > 0 ? "Infinity" : "-Infinity";
      }

      if (this.e <= -EXP_LIMIT || this.m === 0) {
        return "0";
      }

      if (this.e < 21 && this.e > -7) {
        return this.toNumber().toString();
      }

      return this.m + "e" + (this.e >= 0 ? "+" : "") + this.e;
    };

    Decimal.prototype.toExponential = function (places) {
      // https://stackoverflow.com/a/37425022
      // TODO: Some unfixed cases:
      //  new Decimal("1.2345e-999").toExponential()
      //  "1.23450000000000015e-999"
      //  new Decimal("1e-999").toExponential()
      //  "1.000000000000000000e-999"
      // TBH I'm tempted to just say it's a feature.
      // If you're doing pretty formatting then why don't you know how many decimal places you want...?
      if (isNaN(this.m) || isNaN(this.e)) {
        return "NaN";
      }

      if (this.e >= EXP_LIMIT) {
        return this.m > 0 ? "Infinity" : "-Infinity";
      }

      if (this.e <= -EXP_LIMIT || this.m === 0) {
        return "0" + (places > 0 ? padEnd(".", places + 1, "0") : "") + "e+0";
      } // two cases:
      // 1) exponent is < 308 and > -324: use basic toFixed
      // 2) everything else: we have to do it ourselves!


      if (this.e > NUMBER_EXP_MIN && this.e < NUMBER_EXP_MAX) {
        return this.toNumber().toExponential(places);
      }

      if (!isFinite(places)) {
        places = MAX_SIGNIFICANT_DIGITS;
      }

      var len = places + 1;
      var numDigits = Math.max(1, Math.ceil(Math.log10(Math.abs(this.m))));
      var rounded = Math.round(this.m * Math.pow(10, len - numDigits)) * Math.pow(10, numDigits - len);
      return rounded.toFixed(Math.max(len - numDigits, 0)) + "e" + (this.e >= 0 ? "+" : "") + this.e;
    };

    Decimal.prototype.toFixed = function (places) {
      if (isNaN(this.m) || isNaN(this.e)) {
        return "NaN";
      }

      if (this.e >= EXP_LIMIT) {
        return this.m > 0 ? "Infinity" : "-Infinity";
      }

      if (this.e <= -EXP_LIMIT || this.m === 0) {
        return "0" + (places > 0 ? padEnd(".", places + 1, "0") : "");
      } // two cases:
      // 1) exponent is 17 or greater: just print out mantissa with the appropriate number of zeroes after it
      // 2) exponent is 16 or less: use basic toFixed


      if (this.e >= MAX_SIGNIFICANT_DIGITS) {
        return this.m.toString().replace(".", "").padEnd(this.e + 1, "0") + (places > 0 ? padEnd(".", places + 1, "0") : "");
      }

      return this.toNumber().toFixed(places);
    };

    Decimal.prototype.toPrecision = function (places) {
      if (this.e <= -7) {
        return this.toExponential(places - 1);
      }

      if (places > this.e) {
        return this.toFixed(places - this.e - 1);
      }

      return this.toExponential(places - 1);
    };

    Decimal.prototype.valueOf = function () {
      return this.toString();
    };

    Decimal.prototype.toJSON = function () {
      return this.toString();
    };

    Decimal.prototype.toStringWithDecimalPlaces = function (places) {
      return this.toExponential(places);
    };

    Decimal.prototype.abs = function () {
      return ME_NN(Math.abs(this.m), this.e);
    };

    Decimal.prototype.neg = function () {
      return ME_NN(-this.m, this.e);
    };

    Decimal.prototype.negate = function () {
      return this.neg();
    };

    Decimal.prototype.negated = function () {
      return this.neg();
    };

    Decimal.prototype.sign = function () {
      return Math.sign(this.m);
    };

    Decimal.prototype.sgn = function () {
      return this.sign();
    };

    Decimal.prototype.round = function () {
      if (this.e < -1) {
        return new Decimal(0);
      }

      if (this.e < MAX_SIGNIFICANT_DIGITS) {
        return new Decimal(Math.round(this.toNumber()));
      }

      return this;
    };

    Decimal.prototype.floor = function () {
      if (this.e < -1) {
        return Math.sign(this.m) >= 0 ? new Decimal(0) : new Decimal(-1);
      }

      if (this.e < MAX_SIGNIFICANT_DIGITS) {
        return new Decimal(Math.floor(this.toNumber()));
      }

      return this;
    };

    Decimal.prototype.ceil = function () {
      if (this.e < -1) {
        return Math.sign(this.m) > 0 ? new Decimal(1) : new Decimal(0);
      }

      if (this.e < MAX_SIGNIFICANT_DIGITS) {
        return new Decimal(Math.ceil(this.toNumber()));
      }

      return this;
    };

    Decimal.prototype.trunc = function () {
      if (this.e < 0) {
        return new Decimal(0);
      }

      if (this.e < MAX_SIGNIFICANT_DIGITS) {
        return new Decimal(Math.trunc(this.toNumber()));
      }

      return this;
    };

    Decimal.prototype.add = function (value) {
      // figure out which is bigger, shrink the mantissa of the smaller
      // by the difference in exponents, add mantissas, normalize and return
      // TODO: Optimizations and simplification may be possible, see https://github.com/Patashu/break_infinity.js/issues/8
      var decimal = D(value);

      if (this.m === 0) {
        return decimal;
      }

      if (decimal.m === 0) {
        return this;
      }

      var biggerDecimal;
      var smallerDecimal;

      if (this.e >= decimal.e) {
        biggerDecimal = this;
        smallerDecimal = decimal;
      } else {
        biggerDecimal = decimal;
        smallerDecimal = this;
      }

      if (biggerDecimal.e - smallerDecimal.e > MAX_SIGNIFICANT_DIGITS) {
        return biggerDecimal;
      } // Have to do this because adding numbers that were once integers but scaled down is imprecise.
      // Example: 299 + 18


      return ME(Math.round(1e14 * biggerDecimal.m + 1e14 * smallerDecimal.m * powerOf10(smallerDecimal.e - biggerDecimal.e)), biggerDecimal.e - 14);
    };

    Decimal.prototype.plus = function (value) {
      return this.add(value);
    };

    Decimal.prototype.sub = function (value) {
      return this.add(D(value).neg());
    };

    Decimal.prototype.subtract = function (value) {
      return this.sub(value);
    };

    Decimal.prototype.minus = function (value) {
      return this.sub(value);
    };

    Decimal.prototype.mul = function (value) {
      // This version avoids an extra conversion to Decimal, if possible. Since the
      // mantissa is -10...10, any number short of MAX/10 can be safely multiplied in
      if (typeof value === "number") {
        if (value < 1e307 && value > -1e307) {
          return ME(this.m * value, this.e);
        } // If the value is larger than 1e307, we can divide that out of mantissa (since it's
        // greater than 1, it won't underflow)


        return ME(this.m * 1e-307 * value, this.e + 307);
      }

      var decimal = typeof value === "string" ? new Decimal(value) : value;
      return ME(this.m * decimal.m, this.e + decimal.e);
    };

    Decimal.prototype.multiply = function (value) {
      return this.mul(value);
    };

    Decimal.prototype.times = function (value) {
      return this.mul(value);
    };

    Decimal.prototype.div = function (value) {
      return this.mul(D(value).recip());
    };

    Decimal.prototype.divide = function (value) {
      return this.div(value);
    };

    Decimal.prototype.divideBy = function (value) {
      return this.div(value);
    };

    Decimal.prototype.dividedBy = function (value) {
      return this.div(value);
    };

    Decimal.prototype.recip = function () {
      return ME(1 / this.m, -this.e);
    };

    Decimal.prototype.reciprocal = function () {
      return this.recip();
    };

    Decimal.prototype.reciprocate = function () {
      return this.recip();
    };
    /**
     * -1 for less than value, 0 for equals value, 1 for greater than value
     */


    Decimal.prototype.cmp = function (value) {
      var decimal = D(value); // TODO: sign(a-b) might be better? https://github.com/Patashu/break_infinity.js/issues/12

      /*
      from smallest to largest:
            -3e100
      -1e100
      -3e99
      -1e99
      -3e0
      -1e0
      -3e-99
      -1e-99
      -3e-100
      -1e-100
      0
      1e-100
      3e-100
      1e-99
      3e-99
      1e0
      3e0
      1e99
      3e99
      1e100
      3e100
            */

      if (this.m === 0) {
        if (decimal.m === 0) {
          return 0;
        }

        if (decimal.m < 0) {
          return 1;
        }

        if (decimal.m > 0) {
          return -1;
        }
      }

      if (decimal.m === 0) {
        if (this.m < 0) {
          return -1;
        }

        if (this.m > 0) {
          return 1;
        }
      }

      if (this.m > 0) {
        if (decimal.m < 0) {
          return 1;
        }

        if (this.e > decimal.e) {
          return 1;
        }

        if (this.e < decimal.e) {
          return -1;
        }

        if (this.m > decimal.m) {
          return 1;
        }

        if (this.m < decimal.m) {
          return -1;
        }

        return 0;
      }

      if (this.m < 0) {
        if (decimal.m > 0) {
          return -1;
        }

        if (this.e > decimal.e) {
          return -1;
        }

        if (this.e < decimal.e) {
          return 1;
        }

        if (this.m > decimal.m) {
          return 1;
        }

        if (this.m < decimal.m) {
          return -1;
        }

        return 0;
      }

      throw Error("Unreachable code");
    };

    Decimal.prototype.compare = function (value) {
      return this.cmp(value);
    };

    Decimal.prototype.eq = function (value) {
      var decimal = D(value);
      return this.e === decimal.e && this.m === decimal.m;
    };

    Decimal.prototype.equals = function (value) {
      return this.eq(value);
    };

    Decimal.prototype.neq = function (value) {
      return !this.eq(value);
    };

    Decimal.prototype.notEquals = function (value) {
      return this.neq(value);
    };

    Decimal.prototype.lt = function (value) {
      var decimal = D(value);

      if (this.m === 0) {
        return decimal.m > 0;
      }

      if (decimal.m === 0) {
        return this.m <= 0;
      }

      if (this.e === decimal.e) {
        return this.m < decimal.m;
      }

      if (this.m > 0) {
        return decimal.m > 0 && this.e < decimal.e;
      }

      return decimal.m > 0 || this.e > decimal.e;
    };

    Decimal.prototype.lte = function (value) {
      return !this.gt(value);
    };

    Decimal.prototype.gt = function (value) {
      var decimal = D(value);

      if (this.m === 0) {
        return decimal.m < 0;
      }

      if (decimal.m === 0) {
        return this.m > 0;
      }

      if (this.e === decimal.e) {
        return this.m > decimal.m;
      }

      if (this.m > 0) {
        return decimal.m < 0 || this.e > decimal.e;
      }

      return decimal.m < 0 && this.e < decimal.e;
    };

    Decimal.prototype.gte = function (value) {
      return !this.lt(value);
    };

    Decimal.prototype.max = function (value) {
      var decimal = D(value);
      return this.lt(decimal) ? decimal : this;
    };

    Decimal.prototype.min = function (value) {
      var decimal = D(value);
      return this.gt(decimal) ? decimal : this;
    };

    Decimal.prototype.clamp = function (min, max) {
      return this.max(min).min(max);
    };

    Decimal.prototype.clampMin = function (min) {
      return this.max(min);
    };

    Decimal.prototype.clampMax = function (max) {
      return this.min(max);
    };

    Decimal.prototype.cmp_tolerance = function (value, tolerance) {
      var decimal = D(value);
      return this.eq_tolerance(decimal, tolerance) ? 0 : this.cmp(decimal);
    };

    Decimal.prototype.compare_tolerance = function (value, tolerance) {
      return this.cmp_tolerance(value, tolerance);
    };
    /**
     * Tolerance is a relative tolerance, multiplied by the greater of the magnitudes of the two arguments.
     * For example, if you put in 1e-9, then any number closer to the
     * larger number than (larger number)*1e-9 will be considered equal.
     */


    Decimal.prototype.eq_tolerance = function (value, tolerance) {
      var decimal = D(value); // https://stackoverflow.com/a/33024979
      // return abs(a-b) <= tolerance * max(abs(a), abs(b))

      return Decimal.lte(this.sub(decimal).abs(), Decimal.max(this.abs(), decimal.abs()).mul(tolerance));
    };

    Decimal.prototype.equals_tolerance = function (value, tolerance) {
      return this.eq_tolerance(value, tolerance);
    };

    Decimal.prototype.neq_tolerance = function (value, tolerance) {
      return !this.eq_tolerance(value, tolerance);
    };

    Decimal.prototype.notEquals_tolerance = function (value, tolerance) {
      return this.neq_tolerance(value, tolerance);
    };

    Decimal.prototype.lt_tolerance = function (value, tolerance) {
      var decimal = D(value);
      return !this.eq_tolerance(decimal, tolerance) && this.lt(decimal);
    };

    Decimal.prototype.lte_tolerance = function (value, tolerance) {
      var decimal = D(value);
      return this.eq_tolerance(decimal, tolerance) || this.lt(decimal);
    };

    Decimal.prototype.gt_tolerance = function (value, tolerance) {
      var decimal = D(value);
      return !this.eq_tolerance(decimal, tolerance) && this.gt(decimal);
    };

    Decimal.prototype.gte_tolerance = function (value, tolerance) {
      var decimal = D(value);
      return this.eq_tolerance(decimal, tolerance) || this.gt(decimal);
    };

    Decimal.prototype.log10 = function () {
      return this.e + Math.log10(this.m);
    };

    Decimal.prototype.absLog10 = function () {
      return this.e + Math.log10(Math.abs(this.m));
    };

    Decimal.prototype.pLog10 = function () {
      return this.m <= 0 || this.e < 0 ? 0 : this.log10();
    };

    Decimal.prototype.log = function (base) {
      // UN-SAFETY: Most incremental game cases are log(number := 1 or greater, base := 2 or greater).
      // We assume this to be true and thus only need to return a number, not a Decimal,
      return Math.LN10 / Math.log(base) * this.log10();
    };

    Decimal.prototype.log2 = function () {
      return 3.32192809488736234787 * this.log10();
    };

    Decimal.prototype.ln = function () {
      return 2.30258509299404568402 * this.log10();
    };

    Decimal.prototype.logarithm = function (base) {
      return this.log(base);
    };

    Decimal.prototype.pow = function (value) {
      // UN-SAFETY: Accuracy not guaranteed beyond ~9~11 decimal places.
      // TODO: Decimal.pow(new Decimal(0.5), 0); or Decimal.pow(new Decimal(1), -1);
      //  makes an exponent of -0! Is a negative zero ever a problem?
      var numberValue = value instanceof Decimal ? value.toNumber() : value; // TODO: Fast track seems about neutral for performance.
      //  It might become faster if an integer pow is implemented,
      //  or it might not be worth doing (see https://github.com/Patashu/break_infinity.js/issues/4 )
      // Fast track: If (this.e*value) is an integer and mantissa^value
      // fits in a Number, we can do a very fast method.

      var temp = this.e * numberValue;
      var newMantissa;

      if (Number.isSafeInteger(temp)) {
        newMantissa = Math.pow(this.m, numberValue);

        if (isFinite(newMantissa) && newMantissa !== 0) {
          return ME(newMantissa, temp);
        }
      } // Same speed and usually more accurate.


      var newExponent = Math.trunc(temp);
      var residue = temp - newExponent;
      newMantissa = Math.pow(10, numberValue * Math.log10(this.m) + residue);

      if (isFinite(newMantissa) && newMantissa !== 0) {
        return ME(newMantissa, newExponent);
      } // return Decimal.exp(value*this.ln());
      // UN-SAFETY: This should return NaN when mantissa is negative and value is non-integer.


      var result = Decimal.pow10(numberValue * this.absLog10()); // this is 2x faster and gives same values AFAIK

      if (this.sign() === -1 && numberValue % 2 === 1) {
        return result.neg();
      }

      return result;
    };

    Decimal.prototype.pow_base = function (value) {
      return D(value).pow(this);
    };

    Decimal.prototype.factorial = function () {
      // Using Stirling's Approximation.
      // https://en.wikipedia.org/wiki/Stirling%27s_approximation#Versions_suitable_for_calculators
      var n = this.toNumber() + 1;
      return Decimal.pow(n / Math.E * Math.sqrt(n * Math.sinh(1 / n) + 1 / (810 * Math.pow(n, 6))), n).mul(Math.sqrt(2 * Math.PI / n));
    };

    Decimal.prototype.exp = function () {
      var x = this.toNumber(); // Fast track: if -706 < this < 709, we can use regular exp.

      if (-706 < x && x < 709) {
        return Decimal.fromNumber(Math.exp(x));
      }

      return Decimal.pow(Math.E, x);
    };

    Decimal.prototype.sqr = function () {
      return ME(Math.pow(this.m, 2), this.e * 2);
    };

    Decimal.prototype.sqrt = function () {
      if (this.m < 0) {
        return new Decimal(Number.NaN);
      }

      if (this.e % 2 !== 0) {
        return ME(Math.sqrt(this.m) * 3.16227766016838, Math.floor(this.e / 2));
      } // Mod of a negative number is negative, so != means '1 or -1'


      return ME(Math.sqrt(this.m), Math.floor(this.e / 2));
    };

    Decimal.prototype.cube = function () {
      return ME(Math.pow(this.m, 3), this.e * 3);
    };

    Decimal.prototype.cbrt = function () {
      var sign = 1;
      var mantissa = this.m;

      if (mantissa < 0) {
        sign = -1;
        mantissa = -mantissa;
      }

      var newMantissa = sign * Math.pow(mantissa, 1 / 3);
      var mod = this.e % 3;

      if (mod === 1 || mod === -1) {
        return ME(newMantissa * 2.1544346900318837, Math.floor(this.e / 3));
      }

      if (mod !== 0) {
        return ME(newMantissa * 4.6415888336127789, Math.floor(this.e / 3));
      } // mod != 0 at this point means 'mod == 2 || mod == -2'


      return ME(newMantissa, Math.floor(this.e / 3));
    }; // Some hyperbolic trig functions that happen to be easy


    Decimal.prototype.sinh = function () {
      return this.exp().sub(this.negate().exp()).div(2);
    };

    Decimal.prototype.cosh = function () {
      return this.exp().add(this.negate().exp()).div(2);
    };

    Decimal.prototype.tanh = function () {
      return this.sinh().div(this.cosh());
    };

    Decimal.prototype.asinh = function () {
      return Decimal.ln(this.add(this.sqr().add(1).sqrt()));
    };

    Decimal.prototype.acosh = function () {
      return Decimal.ln(this.add(this.sqr().sub(1).sqrt()));
    };

    Decimal.prototype.atanh = function () {
      if (this.abs().gte(1)) {
        return Number.NaN;
      }

      return Decimal.ln(this.add(1).div(new Decimal(1).sub(this))) / 2;
    };
    /**
     * Joke function from Realm Grinder
     */


    Decimal.prototype.ascensionPenalty = function (ascensions) {
      if (ascensions === 0) {
        return this;
      }

      return this.pow(Math.pow(10, -ascensions));
    };
    /**
     * Joke function from Cookie Clicker. It's 'egg'
     */


    Decimal.prototype.egg = function () {
      return this.add(9);
    };

    Decimal.prototype.lessThanOrEqualTo = function (other) {
      return this.cmp(other) < 1;
    };

    Decimal.prototype.lessThan = function (other) {
      return this.cmp(other) < 0;
    };

    Decimal.prototype.greaterThanOrEqualTo = function (other) {
      return this.cmp(other) > -1;
    };

    Decimal.prototype.greaterThan = function (other) {
      return this.cmp(other) > 0;
    };

    Object.defineProperty(Decimal, "MAX_VALUE", {
      get: function get() {
        return MAX_VALUE;
      },
      enumerable: true,
      configurable: true
    });
    Object.defineProperty(Decimal, "MIN_VALUE", {
      get: function get() {
        return MIN_VALUE;
      },
      enumerable: true,
      configurable: true
    });
    Object.defineProperty(Decimal, "NUMBER_MAX_VALUE", {
      get: function get() {
        return NUMBER_MAX_VALUE;
      },
      enumerable: true,
      configurable: true
    });
    Object.defineProperty(Decimal, "NUMBER_MIN_VALUE", {
      get: function get() {
        return NUMBER_MIN_VALUE;
      },
      enumerable: true,
      configurable: true
    });
    return Decimal;
  }();
  var MAX_VALUE = ME_NN(1, EXP_LIMIT);
  var MIN_VALUE = ME_NN(1, -EXP_LIMIT);
  var NUMBER_MAX_VALUE = D(Number.MAX_VALUE);
  var NUMBER_MIN_VALUE = D(Number.MIN_VALUE);

  return Decimal;

}));

},{}],2:[function(require,module,exports){
let alphabetGrid = [];

class Alphabet
{
    static build()
    {
        let searchSpace = '';
        for(let i = 0; i < 10; i++)
        {
            searchSpace += ''+i;
        }

        for(let i = 0; i < 26; i++)
        {
            // add the letters a through z in upper and lower case by their character code
            searchSpace += String.fromCharCode(i + 65);
            searchSpace += String.fromCharCode(i + 97);
        }
        alphabetGrid = searchSpace.split('');
        this.shuffle();
    }

    static shuffle()
    {
        this.randomizedAlphabet = [...alphabetGrid].shuffle();
    }

    static getRandomLetter()
    {
        if(!(this.randomizedAlphabet && this.randomizedAlphabet.length))
        {
            this.shuffle();
        }

        return this.randomizedAlphabet.pop();
    }
};

Alphabet.build();

module.exports = Alphabet;

},{}],3:[function(require,module,exports){
const EventListener = require('../EventListener');

class Challenge extends EventListener
{
    /**
     * An abstract class to represent all challenges a MissionComputer might have
     * I could namescape this in Missions, and may do this later but currently exists in the namespace
     * Downlink.Challenges.Challenge
     *
     * @param {string} name         The name of the challenge, useful for UI purposes
     * @param {Decimal} difficulty   An int to describe in some abstract manner what reward ratio this challenge
     *     should provide. Provided in the form of an integer.
     */
    constructor(name, difficulty)
    {
        super();
        this.name = name;
        this.difficulty = difficulty;
        this.solved = false;
        this.task = null;
    }

    setTask(task)
    {
        this.task = task;
        return this;
    }

    solve()
    {
        this.signalSolved();
    }

    /**
     * A method to signal to the Mission Computers, or localhost that a Challenge has been complete.
     */
    signalSolved()
    {
        this.solved = true;
        this.trigger('solved');
        return this;
    }
}

module.exports = Challenge;

},{"../EventListener":18}],4:[function(require,module,exports){
/**
 * @type {{}}
 */
       DIFFICULTIES = {
            'EASY':{name:'Linear', size:{min:7, max:10}},
            'MEDIUM':{name:'Quadratic', size:{min:10,max:15}},
            'HARD':{name:'Cubic', size:{min:15,max:20}}
        },
        DIFFICULTY_EXPONENT = 0.4;

function getRandomIntBetween(min, max)
{
    return  Math.floor(Math.random() * (max - min + 1)) + min;
}
const Challenge = require('./Challenge');
class Encryption extends Challenge
{
    constructor(difficulty)
    {
        let rows = getRandomIntBetween(difficulty.size.min, difficulty.size.max),
            cols = getRandomIntBetween(difficulty.size.min, difficulty.size.max),
            difficultyRatio = Math.floor(Math.pow(rows * cols, DIFFICULTY_EXPONENT));

        super(difficulty.name + ' Encryption', difficultyRatio);
        this.rows = rows;
        this.cols = cols;
    }

    static get DIFFICULTIES()
    {
        return DIFFICULTIES;
    }

    static getNewLinearEncryption()
    {
        return new Encryption(DIFFICULTIES.EASY);
    }

    static getNewQuadraticEncryption()
    {
        return new Encryption(DIFFICULTIES.MEDIUM);
    }

}

module.exports = Encryption;

},{"./Challenge":3}],5:[function(require,module,exports){
const   dictionary = require('./dictionary'),
        Challenge = require('./Challenge');

const PASSWORD_TYPES = {
    'DICTIONARY':'Dictionary',
    'ALPHANUMERIC':'Alphanumeric'
};
const PASSWORD_DICTIONARY_DIFFICULTIES = {
    'EASIEST':1,
    'HARDEST':10
};


class Password extends Challenge
{
    constructor(text, type, difficulty)
    {
        super(type + ' Password', difficulty) ;
        this.text = text;
        this.type = type;
    }

    attack(testPassword)
    {
        this.trigger('start');
        return testPassword === this.text;
    }

    static get PASSWORD_DICTIONARY_DIFFICULTIES()
    {
        return PASSWORD_DICTIONARY_DIFFICULTIES;
    }


    /**
     *
     * @param {number} difficulty should be between one and 10
     * @returns {Password}
     */
    static randomDictionaryPassword(difficulty)
    {
        // limit the difficulty to be between the easiest and hardest allowed difficulties
        difficulty = Math.min(Math.max(difficulty, PASSWORD_DICTIONARY_DIFFICULTIES.EASIEST), PASSWORD_DICTIONARY_DIFFICULTIES.HARDEST);
        // reduce the dictionary by a percentage of that amount
        let reduction = PASSWORD_DICTIONARY_DIFFICULTIES.HARDEST - difficulty,
            usedDictionary = [];
        dictionary.forEach((entry, index)=>{if(index%PASSWORD_DICTIONARY_DIFFICULTIES.HARDEST >= reduction){usedDictionary.push(entry);}});
        let dictionaryPassword = new Password(usedDictionary.randomElement(), PASSWORD_TYPES.DICTIONARY, difficulty);
        dictionaryPassword.dictionary = usedDictionary;
        return dictionaryPassword;
    }

    static randomAlphanumericPassword()
    {
        let stringLength = Math.floor(Math.random() * 5) + 5;
        let password = '';
        for (let i = 0; i < stringLength; i++)
        {
            password += Alphabet.getRandomLetter();
        }
        return new Password(password, PASSWORD_TYPES.ALPHANUMERIC,  stringLength);
    }


    static get dictionary()
    {
        return dictionary;
    }

    static get PASSWORD_TYPES()
    {
        return PASSWORD_TYPES;
    }
}

module.exports = Password;

},{"./Challenge":3,"./dictionary":6}],6:[function(require,module,exports){
// stolen from Bart Busschot's xkpasswd JS github repo
// See https://github.com/bbusschots/hsxkpasswd.js

let dictionary = [
    'abandoned',
    'abilities',
    'aboriginal',
    'absolutely',
    'absorption',
    'abstracts',
    'academics',
    'acceptable',
    'acceptance',
    'accepting',
    'accessibility',
    'accessible',
    'accessing',
    'accessories',
    'accessory',
    'accidents',
    'accommodate',
    'accommodation',
    'accommodations',
    'accompanied',
    'accompanying',
    'accomplish',
    'accomplished',
    'accordance',
    'according',
    'accordingly',
    'accountability',
    'accounting',
    'accreditation',
    'accredited',
    'accurately',
    'acdbentity',
    'achievement',
    'achievements',
    'achieving',
    'acknowledge',
    'acknowledged',
    'acquisition',
    'acquisitions',
    'activated',
    'activation',
    'activists',
    'activities',
    'adaptation',
    'addiction',
    'additional',
    'additionally',
    'additions',
    'addressed',
    'addresses',
    'addressing',
    'adjective',
    'adjustable',
    'adjustment',
    'adjustments',
    'administered',
    'administration',
    'administrative',
    'administrator',
    'administrators',
    'admission',
    'admissions',
    'adolescent',
    'advancement',
    'advantage',
    'advantages',
    'adventure',
    'adventures',
    'advertise',
    'advertisement',
    'advertisements',
    'advertiser',
    'advertisers',
    'advertising',
    'aerospace',
    'affecting',
    'affiliate',
    'affiliated',
    'affiliates',
    'affiliation',
    'affordable',
    'afghanistan',
    'afternoon',
    'afterwards',
    'aggregate',
    'aggressive',
    'agreement',
    'agreements',
    'agricultural',
    'agriculture',
    'albuquerque',
    'alexander',
    'alexandria',
    'algorithm',
    'algorithms',
    'alignment',
    'allocated',
    'allocation',
    'allowance',
    'alphabetical',
    'alternate',
    'alternative',
    'alternatively',
    'alternatives',
    'aluminium',
    'ambassador',
    'amendment',
    'amendments',
    'amenities',
    'americans',
    'amplifier',
    'amsterdam',
    'analytical',
    'animation',
    'anniversary',
    'annotated',
    'annotation',
    'announced',
    'announcement',
    'announcements',
    'announces',
    'anonymous',
    'answering',
    'antarctica',
    'anthropology',
    'antibodies',
    'anticipated',
    'antivirus',
    'apartment',
    'apartments',
    'apparatus',
    'apparently',
    'appearance',
    'appearing',
    'appliance',
    'appliances',
    'applicable',
    'applicant',
    'applicants',
    'application',
    'applications',
    'appointed',
    'appointment',
    'appointments',
    'appraisal',
    'appreciate',
    'appreciated',
    'appreciation',
    'approaches',
    'appropriate',
    'appropriations',
    'approximate',
    'approximately',
    'arbitrary',
    'arbitration',
    'architect',
    'architects',
    'architectural',
    'architecture',
    'argentina',
    'arguments',
    'arlington',
    'armstrong',
    'arrangement',
    'arrangements',
    'arthritis',
    'artificial',
    'assembled',
    'assessing',
    'assessment',
    'assessments',
    'assignment',
    'assignments',
    'assistance',
    'assistant',
    'associate',
    'associated',
    'associates',
    'association',
    'associations',
    'assumption',
    'assumptions',
    'assurance',
    'astrology',
    'astronomy',
    'athletics',
    'atmosphere',
    'atmospheric',
    'attachment',
    'attachments',
    'attempted',
    'attempting',
    'attendance',
    'attending',
    'attention',
    'attitudes',
    'attorneys',
    'attraction',
    'attractions',
    'attractive',
    'attribute',
    'attributes',
    'australia',
    'australian',
    'authentic',
    'authentication',
    'authorities',
    'authority',
    'authorization',
    'authorized',
    'automated',
    'automatic',
    'automatically',
    'automation',
    'automobile',
    'automobiles',
    'automotive',
    'availability',
    'available',
    'awareness',
    'azerbaijan',
    'background',
    'backgrounds',
    'bacterial',
    'baltimore',
    'bandwidth',
    'bangladesh',
    'bankruptcy',
    'barcelona',
    'basically',
    'basketball',
    'bathrooms',
    'batteries',
    'battlefield',
    'beastality',
    'beautiful',
    'beautifully',
    'beginners',
    'beginning',
    'behavioral',
    'behaviour',
    'benchmark',
    'beneficial',
    'bestsellers',
    'beverages',
    'bibliographic',
    'bibliography',
    'biodiversity',
    'biographies',
    'biography',
    'biological',
    'biotechnology',
    'birmingham',
    'blackberry',
    'blackjack',
    'bloomberg',
    'bluetooth',
    'bookmarks',
    'bookstore',
    'boulevard',
    'boundaries',
    'bracelets',
    'brazilian',
    'breakdown',
    'breakfast',
    'breathing',
    'brilliant',
    'britannica',
    'broadband',
    'broadcast',
    'broadcasting',
    'brochures',
    'brunswick',
    'buildings',
    'bulgarian',
    'burlington',
    'businesses',
    'butterfly',
    'calculate',
    'calculated',
    'calculation',
    'calculations',
    'calculator',
    'calculators',
    'calendars',
    'calibration',
    'california',
    'cambridge',
    'camcorder',
    'camcorders',
    'campaigns',
    'cancellation',
    'cancelled',
    'candidate',
    'candidates',
    'capabilities',
    'capability',
    'cardiovascular',
    'carefully',
    'caribbean',
    'cartridge',
    'cartridges',
    'catalogue',
    'categories',
    'cathedral',
    'catherine',
    'celebrate',
    'celebration',
    'celebrities',
    'celebrity',
    'centuries',
    'certainly',
    'certificate',
    'certificates',
    'certification',
    'certified',
    'challenge',
    'challenged',
    'challenges',
    'challenging',
    'champagne',
    'champions',
    'championship',
    'championships',
    'chancellor',
    'changelog',
    'character',
    'characteristic',
    'characteristics',
    'characterization',
    'characterized',
    'characters',
    'charitable',
    'charleston',
    'charlotte',
    'checklist',
    'chemicals',
    'chemistry',
    'chevrolet',
    'childhood',
    'childrens',
    'chocolate',
    'cholesterol',
    'christian',
    'christianity',
    'christians',
    'christina',
    'christine',
    'christmas',
    'christopher',
    'chronicle',
    'chronicles',
    'cigarette',
    'cigarettes',
    'cincinnati',
    'circulation',
    'circumstances',
    'citations',
    'citizenship',
    'citysearch',
    'civilization',
    'classical',
    'classification',
    'classified',
    'classifieds',
    'classroom',
    'clearance',
    'cleveland',
    'coalition',
    'cognitive',
    'collaboration',
    'collaborative',
    'colleague',
    'colleagues',
    'collectables',
    'collected',
    'collectible',
    'collectibles',
    'collecting',
    'collection',
    'collections',
    'collective',
    'collector',
    'collectors',
    'columnists',
    'combination',
    'combinations',
    'combining',
    'comfortable',
    'commander',
    'commentary',
    'commented',
    'commercial',
    'commission',
    'commissioner',
    'commissioners',
    'commissions',
    'commitment',
    'commitments',
    'committed',
    'committee',
    'committees',
    'commodities',
    'commodity',
    'commonwealth',
    'communicate',
    'communication',
    'communications',
    'communist',
    'communities',
    'community',
    'companies',
    'companion',
    'comparable',
    'comparative',
    'comparing',
    'comparison',
    'comparisons',
    'compatibility',
    'compatible',
    'compensation',
    'competent',
    'competing',
    'competition',
    'competitions',
    'competitive',
    'competitors',
    'compilation',
    'complaint',
    'complaints',
    'complement',
    'completed',
    'completely',
    'completing',
    'completion',
    'complexity',
    'compliance',
    'compliant',
    'complicated',
    'complications',
    'complimentary',
    'component',
    'components',
    'composite',
    'composition',
    'compounds',
    'comprehensive',
    'compressed',
    'compression',
    'compromise',
    'computation',
    'computational',
    'computers',
    'computing',
    'concentrate',
    'concentration',
    'concentrations',
    'conceptual',
    'concerned',
    'concerning',
    'concluded',
    'conclusion',
    'conclusions',
    'condition',
    'conditional',
    'conditioning',
    'conditions',
    'conducted',
    'conducting',
    'conference',
    'conferences',
    'conferencing',
    'confidence',
    'confident',
    'confidential',
    'confidentiality',
    'configuration',
    'configurations',
    'configure',
    'configured',
    'configuring',
    'confirmation',
    'confirmed',
    'conflicts',
    'confusion',
    'congratulations',
    'congressional',
    'conjunction',
    'connected',
    'connecticut',
    'connecting',
    'connection',
    'connections',
    'connectivity',
    'connector',
    'connectors',
    'conscious',
    'consciousness',
    'consecutive',
    'consensus',
    'consequence',
    'consequences',
    'consequently',
    'conservation',
    'conservative',
    'considerable',
    'consideration',
    'considerations',
    'considered',
    'considering',
    'considers',
    'consistency',
    'consistent',
    'consistently',
    'consisting',
    'consolidated',
    'consolidation',
    'consonant',
    'consortium',
    'conspiracy',
    'constantly',
    'constitute',
    'constitutes',
    'constitution',
    'constitutional',
    'constraint',
    'constraints',
    'construct',
    'constructed',
    'construction',
    'consultancy',
    'consultant',
    'consultants',
    'consultation',
    'consulting',
    'consumers',
    'consumption',
    'contacted',
    'contacting',
    'contained',
    'container',
    'containers',
    'containing',
    'contamination',
    'contemporary',
    'continent',
    'continental',
    'continually',
    'continued',
    'continues',
    'continuing',
    'continuity',
    'continuous',
    'continuously',
    'contracting',
    'contractor',
    'contractors',
    'contracts',
    'contribute',
    'contributed',
    'contributing',
    'contribution',
    'contributions',
    'contributor',
    'contributors',
    'controlled',
    'controller',
    'controllers',
    'controlling',
    'controversial',
    'controversy',
    'convenience',
    'convenient',
    'convention',
    'conventional',
    'conventions',
    'convergence',
    'conversation',
    'conversations',
    'conversion',
    'converted',
    'converter',
    'convertible',
    'convicted',
    'conviction',
    'convinced',
    'cooperation',
    'cooperative',
    'coordinate',
    'coordinated',
    'coordinates',
    'coordination',
    'coordinator',
    'copenhagen',
    'copyright',
    'copyrighted',
    'copyrights',
    'corporate',
    'corporation',
    'corporations',
    'corrected',
    'correction',
    'corrections',
    'correctly',
    'correlation',
    'correspondence',
    'corresponding',
    'corruption',
    'cosmetics',
    'counseling',
    'countries',
    'creations',
    'creativity',
    'creatures',
    'criterion',
    'criticism',
    'crossword',
    'cumulative',
    'currencies',
    'currently',
    'curriculum',
    'customers',
    'customise',
    'customize',
    'customized',
    'dangerous',
    'databases',
    'daughters',
    'decisions',
    'declaration',
    'decorating',
    'decorative',
    'decreased',
    'dedicated',
    'defendant',
    'defensive',
    'definitely',
    'definition',
    'definitions',
    'delegation',
    'delicious',
    'delivered',
    'delivering',
    'demanding',
    'democracy',
    'democratic',
    'democrats',
    'demographic',
    'demonstrate',
    'demonstrated',
    'demonstrates',
    'demonstration',
    'department',
    'departmental',
    'departments',
    'departure',
    'dependence',
    'dependent',
    'depending',
    'deployment',
    'depression',
    'descending',
    'described',
    'describes',
    'describing',
    'description',
    'descriptions',
    'designated',
    'designation',
    'designers',
    'designing',
    'desirable',
    'desperate',
    'destination',
    'destinations',
    'destroyed',
    'destruction',
    'detection',
    'detective',
    'determination',
    'determine',
    'determined',
    'determines',
    'determining',
    'deutschland',
    'developed',
    'developer',
    'developers',
    'developing',
    'development',
    'developmental',
    'developments',
    'deviation',
    'diagnosis',
    'diagnostic',
    'dictionaries',
    'dictionary',
    'difference',
    'differences',
    'different',
    'differential',
    'differently',
    'difficult',
    'difficulties',
    'difficulty',
    'dimension',
    'dimensional',
    'dimensions',
    'direction',
    'directions',
    'directive',
    'directories',
    'directors',
    'directory',
    'disabilities',
    'disability',
    'disappointed',
    'discharge',
    'disciplinary',
    'discipline',
    'disciplines',
    'disclaimer',
    'disclaimers',
    'disclosure',
    'discounted',
    'discounts',
    'discovered',
    'discovery',
    'discretion',
    'discrimination',
    'discussed',
    'discusses',
    'discussing',
    'discussion',
    'discussions',
    'disorders',
    'dispatched',
    'displayed',
    'displaying',
    'disposition',
    'distances',
    'distinction',
    'distinguished',
    'distribute',
    'distributed',
    'distribution',
    'distributions',
    'distributor',
    'distributors',
    'districts',
    'disturbed',
    'diversity',
    'divisions',
    'documentary',
    'documentation',
    'documented',
    'documents',
    'dominican',
    'donations',
    'downloadable',
    'downloaded',
    'downloading',
    'downloads',
    'dramatically',
    'duplicate',
    'earthquake',
    'ecological',
    'ecommerce',
    'economics',
    'economies',
    'edinburgh',
    'editorial',
    'editorials',
    'education',
    'educational',
    'educators',
    'effective',
    'effectively',
    'effectiveness',
    'efficiency',
    'efficient',
    'efficiently',
    'elections',
    'electoral',
    'electrical',
    'electricity',
    'electronic',
    'electronics',
    'elementary',
    'elevation',
    'eligibility',
    'eliminate',
    'elimination',
    'elizabeth',
    'elsewhere',
    'emergency',
    'emissions',
    'emotional',
    'empirical',
    'employees',
    'employers',
    'employment',
    'enclosure',
    'encounter',
    'encountered',
    'encourage',
    'encouraged',
    'encourages',
    'encouraging',
    'encryption',
    'encyclopedia',
    'endangered',
    'endorsement',
    'enforcement',
    'engagement',
    'engineering',
    'engineers',
    'enhancement',
    'enhancements',
    'enhancing',
    'enlargement',
    'enquiries',
    'enrollment',
    'enterprise',
    'enterprises',
    'entertaining',
    'entertainment',
    'entrepreneur',
    'entrepreneurs',
    'environment',
    'environmental',
    'environments',
    'equations',
    'equilibrium',
    'equipment',
    'equivalent',
    'especially',
    'essential',
    'essentially',
    'essentials',
    'establish',
    'established',
    'establishing',
    'establishment',
    'estimated',
    'estimates',
    'estimation',
    'evaluated',
    'evaluating',
    'evaluation',
    'evaluations',
    'evanescence',
    'eventually',
    'everybody',
    'everything',
    'everywhere',
    'evolution',
    'examination',
    'examinations',
    'examining',
    'excellence',
    'excellent',
    'exception',
    'exceptional',
    'exceptions',
    'excessive',
    'exchanges',
    'excitement',
    'excluding',
    'exclusion',
    'exclusive',
    'exclusively',
    'execution',
    'executive',
    'executives',
    'exemption',
    'exercises',
    'exhibition',
    'exhibitions',
    'existence',
    'expanding',
    'expansion',
    'expectations',
    'expenditure',
    'expenditures',
    'expensive',
    'experience',
    'experienced',
    'experiences',
    'experiencing',
    'experiment',
    'experimental',
    'experiments',
    'expertise',
    'expiration',
    'explained',
    'explaining',
    'explanation',
    'explicitly',
    'exploration',
    'exploring',
    'explosion',
    'expressed',
    'expression',
    'expressions',
    'extending',
    'extension',
    'extensions',
    'extensive',
    'extraction',
    'extraordinary',
    'extremely',
    'facilitate',
    'facilities',
    'factories',
    'fairfield',
    'fantastic',
    'fascinating',
    'favorites',
    'favourite',
    'favourites',
    'featuring',
    'federation',
    'fellowship',
    'festivals',
    'filtering',
    'financial',
    'financing',
    'findarticles',
    'finishing',
    'fireplace',
    'fisheries',
    'flexibility',
    'following',
    'forbidden',
    'forecasts',
    'forgotten',
    'formation',
    'formatting',
    'forwarding',
    'foundation',
    'foundations',
    'fragrance',
    'fragrances',
    'framework',
    'franchise',
    'francisco',
    'frankfurt',
    'frederick',
    'freelance',
    'frequencies',
    'frequency',
    'frequently',
    'friendship',
    'frontpage',
    'functional',
    'functionality',
    'functioning',
    'functions',
    'fundamental',
    'fundamentals',
    'fundraising',
    'furnished',
    'furnishings',
    'furniture',
    'furthermore',
    'galleries',
    'gardening',
    'gathering',
    'genealogy',
    'generally',
    'generated',
    'generates',
    'generating',
    'generation',
    'generations',
    'generator',
    'generators',
    'gentleman',
    'geographic',
    'geographical',
    'geography',
    'geological',
    'gibraltar',
    'girlfriend',
    'governance',
    'governing',
    'government',
    'governmental',
    'governments',
    'gradually',
    'graduated',
    'graduates',
    'graduation',
    'graphical',
    'greenhouse',
    'greensboro',
    'greetings',
    'groundwater',
    'guarantee',
    'guaranteed',
    'guarantees',
    'guatemala',
    'guestbook',
    'guidelines',
    'halloween',
    'hampshire',
    'handhelds',
    'happening',
    'happiness',
    'harassment',
    'hardcover',
    'hazardous',
    'headlines',
    'headphones',
    'headquarters',
    'healthcare',
    'helicopter',
    'henderson',
    'hepatitis',
    'hierarchy',
    'highlight',
    'highlighted',
    'highlights',
    'historical',
    'hollywood',
    'holocaust',
    'hopefully',
    'horizontal',
    'hospitality',
    'hospitals',
    'household',
    'households',
    'housewares',
    'housewives',
    'humanitarian',
    'humanities',
    'hungarian',
    'huntington',
    'hurricane',
    'hydraulic',
    'hydrocodone',
    'hypothesis',
    'hypothetical',
    'identical',
    'identification',
    'identified',
    'identifier',
    'identifies',
    'identifying',
    'illustrated',
    'illustration',
    'illustrations',
    'imagination',
    'immediate',
    'immediately',
    'immigrants',
    'immigration',
    'immunology',
    'implement',
    'implementation',
    'implemented',
    'implementing',
    'implications',
    'importance',
    'important',
    'importantly',
    'impossible',
    'impressed',
    'impression',
    'impressive',
    'improvement',
    'improvements',
    'improving',
    'inappropriate',
    'incentive',
    'incentives',
    'incidence',
    'incidents',
    'including',
    'inclusion',
    'inclusive',
    'incomplete',
    'incorporate',
    'incorporated',
    'incorrect',
    'increased',
    'increases',
    'increasing',
    'increasingly',
    'incredible',
    'independence',
    'independent',
    'independently',
    'indianapolis',
    'indicated',
    'indicates',
    'indicating',
    'indication',
    'indicator',
    'indicators',
    'indigenous',
    'individual',
    'individually',
    'individuals',
    'indonesia',
    'indonesian',
    'induction',
    'industrial',
    'industries',
    'inexpensive',
    'infection',
    'infections',
    'infectious',
    'inflation',
    'influence',
    'influenced',
    'influences',
    'information',
    'informational',
    'informative',
    'infrastructure',
    'infringement',
    'ingredients',
    'inherited',
    'initially',
    'initiated',
    'initiative',
    'initiatives',
    'injection',
    'innovation',
    'innovations',
    'innovative',
    'inquiries',
    'insertion',
    'inspection',
    'inspections',
    'inspector',
    'inspiration',
    'installation',
    'installations',
    'installed',
    'installing',
    'instances',
    'instantly',
    'institute',
    'institutes',
    'institution',
    'institutional',
    'institutions',
    'instruction',
    'instructional',
    'instructions',
    'instructor',
    'instructors',
    'instrument',
    'instrumental',
    'instrumentation',
    'instruments',
    'insulation',
    'insurance',
    'integrate',
    'integrated',
    'integrating',
    'integration',
    'integrity',
    'intellectual',
    'intelligence',
    'intelligent',
    'intensity',
    'intensive',
    'intention',
    'interaction',
    'interactions',
    'interactive',
    'interested',
    'interesting',
    'interests',
    'interface',
    'interfaces',
    'interference',
    'intermediate',
    'international',
    'internationally',
    'internship',
    'interpretation',
    'interpreted',
    'interracial',
    'intersection',
    'interstate',
    'intervals',
    'intervention',
    'interventions',
    'interview',
    'interviews',
    'introduce',
    'introduced',
    'introduces',
    'introducing',
    'introduction',
    'introductory',
    'invention',
    'inventory',
    'investigate',
    'investigated',
    'investigation',
    'investigations',
    'investigator',
    'investigators',
    'investing',
    'investment',
    'investments',
    'investors',
    'invisible',
    'invitation',
    'invitations',
    'involvement',
    'involving',
    'irrigation',
    'isolation',
    'jacksonville',
    'javascript',
    'jefferson',
    'jerusalem',
    'jewellery',
    'journalism',
    'journalist',
    'journalists',
    'jurisdiction',
    'kazakhstan',
    'keyboards',
    'kilometers',
    'knowledge',
    'knowledgestorm',
    'laboratories',
    'laboratory',
    'lafayette',
    'lancaster',
    'landscape',
    'landscapes',
    'languages',
    'lauderdale',
    'leadership',
    'legendary',
    'legislation',
    'legislative',
    'legislature',
    'legitimate',
    'lexington',
    'liabilities',
    'liability',
    'librarian',
    'libraries',
    'licensing',
    'liechtenstein',
    'lifestyle',
    'lightning',
    'lightweight',
    'likelihood',
    'limitation',
    'limitations',
    'limousines',
    'listening',
    'listprice',
    'literally',
    'literature',
    'lithuania',
    'litigation',
    'liverpool',
    'livestock',
    'locations',
    'logistics',
    'longitude',
    'looksmart',
    'louisiana',
    'louisville',
    'luxembourg',
    'macedonia',
    'machinery',
    'macintosh',
    'macromedia',
    'madagascar',
    'magazines',
    'magnificent',
    'magnitude',
    'mainstream',
    'maintained',
    'maintaining',
    'maintains',
    'maintenance',
    'malpractice',
    'management',
    'manchester',
    'mandatory',
    'manhattan',
    'manufacture',
    'manufactured',
    'manufacturer',
    'manufacturers',
    'manufacturing',
    'marijuana',
    'marketing',
    'marketplace',
    'massachusetts',
    'mastercard',
    'masturbating',
    'masturbation',
    'materials',
    'maternity',
    'mathematical',
    'mathematics',
    'mauritius',
    'meaningful',
    'meanwhile',
    'measurement',
    'measurements',
    'measuring',
    'mechanical',
    'mechanics',
    'mechanism',
    'mechanisms',
    'mediawiki',
    'medication',
    'medications',
    'medicines',
    'meditation',
    'mediterranean',
    'melbourne',
    'membership',
    'memorabilia',
    'mentioned',
    'merchandise',
    'merchants',
    'messaging',
    'messenger',
    'metabolism',
    'metallica',
    'methodology',
    'metropolitan',
    'microphone',
    'microsoft',
    'microwave',
    'migration',
    'milfhunter',
    'millennium',
    'milwaukee',
    'miniature',
    'ministers',
    'ministries',
    'minneapolis',
    'minnesota',
    'miscellaneous',
    'mississippi',
    'mitsubishi',
    'modelling',
    'moderator',
    'moderators',
    'modification',
    'modifications',
    'molecular',
    'molecules',
    'monitored',
    'monitoring',
    'montgomery',
    'mortality',
    'mortgages',
    'motherboard',
    'motivated',
    'motivation',
    'motorcycle',
    'motorcycles',
    'mountains',
    'movements',
    'mozambique',
    'multimedia',
    'municipal',
    'municipality',
    'musicians',
    'mysterious',
    'namespace',
    'narrative',
    'nashville',
    'nationally',
    'nationwide',
    'naturally',
    'navigation',
    'navigator',
    'necessarily',
    'necessary',
    'necessity',
    'negotiation',
    'negotiations',
    'neighborhood',
    'neighbors',
    'netherlands',
    'networking',
    'nevertheless',
    'newcastle',
    'newfoundland',
    'newsletter',
    'newsletters',
    'newspaper',
    'newspapers',
    'nicaragua',
    'nightlife',
    'nightmare',
    'nominated',
    'nomination',
    'nominations',
    'nonprofit',
    'northeast',
    'northwest',
    'norwegian',
    'notebooks',
    'notification',
    'notifications',
    'nottingham',
    'numerical',
    'nutrition',
    'nutritional',
    'obituaries',
    'objective',
    'objectives',
    'obligation',
    'obligations',
    'observation',
    'observations',
    'obtaining',
    'obviously',
    'occasional',
    'occasionally',
    'occasions',
    'occupation',
    'occupational',
    'occupations',
    'occurrence',
    'occurring',
    'offensive',
    'offerings',
    'officially',
    'officials',
    'omissions',
    'operating',
    'operation',
    'operational',
    'operations',
    'operators',
    'opponents',
    'opportunities',
    'opportunity',
    'opposition',
    'optimization',
    'orchestra',
    'ordinance',
    'organisation',
    'organisations',
    'organised',
    'organisms',
    'organization',
    'organizational',
    'organizations',
    'organized',
    'organizer',
    'organizing',
    'orientation',
    'originally',
    'otherwise',
    'ourselves',
    'outsourcing',
    'outstanding',
    'overnight',
    'ownership',
    'packaging',
    'paintball',
    'paintings',
    'palestine',
    'palestinian',
    'panasonic',
    'pantyhose',
    'paperback',
    'paperbacks',
    'paragraph',
    'paragraphs',
    'parameter',
    'parameters',
    'parenting',
    'parliament',
    'parliamentary',
    'partially',
    'participant',
    'participants',
    'participate',
    'participated',
    'participating',
    'participation',
    'particles',
    'particular',
    'particularly',
    'partition',
    'partnership',
    'partnerships',
    'passenger',
    'passengers',
    'passwords',
    'pathology',
    'pediatric',
    'penalties',
    'penetration',
    'peninsula',
    'pennsylvania',
    'perceived',
    'percentage',
    'perception',
    'perfectly',
    'performance',
    'performances',
    'performed',
    'performer',
    'performing',
    'periodically',
    'peripheral',
    'peripherals',
    'permalink',
    'permanent',
    'permission',
    'permissions',
    'permitted',
    'persistent',
    'personality',
    'personalized',
    'personally',
    'personals',
    'personnel',
    'perspective',
    'perspectives',
    'petersburg',
    'petroleum',
    'pharmaceutical',
    'pharmaceuticals',
    'pharmacies',
    'pharmacology',
    'phenomenon',
    'phentermine',
    'philadelphia',
    'philippines',
    'philosophy',
    'photograph',
    'photographer',
    'photographers',
    'photographic',
    'photographs',
    'photography',
    'photoshop',
    'physically',
    'physician',
    'physicians',
    'physiology',
    'pichunter',
    'pittsburgh',
    'placement',
    'plaintiff',
    'platforms',
    'playstation',
    'political',
    'politicians',
    'pollution',
    'polyester',
    'polyphonic',
    'popularity',
    'population',
    'populations',
    'porcelain',
    'portfolio',
    'portraits',
    'portsmouth',
    'portuguese',
    'positioning',
    'positions',
    'possession',
    'possibilities',
    'possibility',
    'postcards',
    'postposted',
    'potential',
    'potentially',
    'powerpoint',
    'powerseller',
    'practical',
    'practices',
    'practitioner',
    'practitioners',
    'preceding',
    'precipitation',
    'precisely',
    'precision',
    'predicted',
    'prediction',
    'predictions',
    'preference',
    'preferences',
    'preferred',
    'pregnancy',
    'preliminary',
    'preparation',
    'preparing',
    'prerequisite',
    'prescribed',
    'prescription',
    'presentation',
    'presentations',
    'presented',
    'presenting',
    'presently',
    'preservation',
    'president',
    'presidential',
    'presidents',
    'preventing',
    'prevention',
    'previously',
    'primarily',
    'princeton',
    'principal',
    'principle',
    'principles',
    'printable',
    'priorities',
    'prisoners',
    'privilege',
    'privileges',
    'probability',
    'procedure',
    'procedures',
    'proceeding',
    'proceedings',
    'processed',
    'processes',
    'processing',
    'processor',
    'processors',
    'procurement',
    'producers',
    'producing',
    'production',
    'productions',
    'productive',
    'productivity',
    'profession',
    'professional',
    'professionals',
    'professor',
    'programme',
    'programmer',
    'programmers',
    'programmes',
    'programming',
    'progressive',
    'prohibited',
    'projected',
    'projection',
    'projector',
    'projectors',
    'prominent',
    'promising',
    'promoting',
    'promotion',
    'promotional',
    'promotions',
    'properties',
    'proportion',
    'proposals',
    'proposition',
    'proprietary',
    'prospective',
    'prospects',
    'prostores',
    'protected',
    'protecting',
    'protection',
    'protective',
    'protocols',
    'prototype',
    'providence',
    'providers',
    'providing',
    'provinces',
    'provincial',
    'provision',
    'provisions',
    'psychiatry',
    'psychological',
    'psychology',
    'publication',
    'publications',
    'publicity',
    'published',
    'publisher',
    'publishers',
    'publishing',
    'punishment',
    'purchased',
    'purchases',
    'purchasing',
    'qualification',
    'qualifications',
    'qualified',
    'qualifying',
    'qualities',
    'quantitative',
    'quantities',
    'quarterly',
    'queensland',
    'questionnaire',
    'questions',
    'quotations',
    'radiation',
    'reactions',
    'realistic',
    'reasonable',
    'reasonably',
    'reasoning',
    'receivers',
    'receiving',
    'reception',
    'receptors',
    'recipient',
    'recipients',
    'recognised',
    'recognition',
    'recognize',
    'recognized',
    'recommend',
    'recommendation',
    'recommendations',
    'recommended',
    'recommends',
    'reconstruction',
    'recorders',
    'recording',
    'recordings',
    'recovered',
    'recreation',
    'recreational',
    'recruiting',
    'recruitment',
    'recycling',
    'reduction',
    'reductions',
    'reference',
    'referenced',
    'references',
    'referrals',
    'referring',
    'refinance',
    'reflected',
    'reflection',
    'reflections',
    'refrigerator',
    'refurbished',
    'regarding',
    'regardless',
    'registered',
    'registrar',
    'registration',
    'regression',
    'regularly',
    'regulated',
    'regulation',
    'regulations',
    'regulatory',
    'rehabilitation',
    'relations',
    'relationship',
    'relationships',
    'relatively',
    'relatives',
    'relaxation',
    'relevance',
    'reliability',
    'religions',
    'religious',
    'relocation',
    'remainder',
    'remaining',
    'remarkable',
    'remembered',
    'removable',
    'renaissance',
    'rendering',
    'renewable',
    'replacement',
    'replacing',
    'replication',
    'reporters',
    'reporting',
    'repository',
    'represent',
    'representation',
    'representations',
    'representative',
    'representatives',
    'represented',
    'representing',
    'represents',
    'reproduce',
    'reproduced',
    'reproduction',
    'reproductive',
    'republican',
    'republicans',
    'reputation',
    'requested',
    'requesting',
    'requirement',
    'requirements',
    'requiring',
    'researcher',
    'researchers',
    'reservation',
    'reservations',
    'reservoir',
    'residence',
    'residential',
    'residents',
    'resistance',
    'resistant',
    'resolution',
    'resolutions',
    'resources',
    'respected',
    'respective',
    'respectively',
    'respiratory',
    'responded',
    'respondent',
    'respondents',
    'responding',
    'responses',
    'responsibilities',
    'responsibility',
    'responsible',
    'restaurant',
    'restaurants',
    'restoration',
    'restricted',
    'restriction',
    'restrictions',
    'restructuring',
    'resulting',
    'retailers',
    'retention',
    'retirement',
    'retrieval',
    'retrieved',
    'returning',
    'revelation',
    'reviewing',
    'revisions',
    'revolution',
    'revolutionary',
    'richardson',
    'ringtones',
    'riverside',
    'robertson',
    'rochester',
    'roommates',
    'sacramento',
    'sacrifice',
    'salvation',
    'saskatchewan',
    'satellite',
    'satisfaction',
    'satisfactory',
    'satisfied',
    'scenarios',
    'scheduled',
    'schedules',
    'scheduling',
    'scholarship',
    'scholarships',
    'scientific',
    'scientist',
    'scientists',
    'screening',
    'screensaver',
    'screensavers',
    'screenshot',
    'screenshots',
    'scripting',
    'sculpture',
    'searching',
    'secondary',
    'secretariat',
    'secretary',
    'securities',
    'selecting',
    'selection',
    'selections',
    'selective',
    'semiconductor',
    'sensitive',
    'sensitivity',
    'sentences',
    'separated',
    'separately',
    'separation',
    'september',
    'sequences',
    'seriously',
    'settlement',
    'sexuality',
    'shakespeare',
    'shareholders',
    'shareware',
    'sheffield',
    'shipments',
    'shopzilla',
    'shortcuts',
    'showtimes',
    'signature',
    'signatures',
    'significance',
    'significant',
    'significantly',
    'similarly',
    'simplified',
    'simulation',
    'simulations',
    'simultaneously',
    'singapore',
    'situation',
    'situations',
    'slideshow',
    'smithsonian',
    'snowboard',
    'societies',
    'sociology',
    'solutions',
    'something',
    'sometimes',
    'somewhere',
    'sophisticated',
    'soundtrack',
    'southampton',
    'southeast',
    'southwest',
    'specialist',
    'specialists',
    'specialized',
    'specializing',
    'specially',
    'specialties',
    'specialty',
    'specifically',
    'specification',
    'specifications',
    'specifics',
    'specified',
    'specifies',
    'spectacular',
    'spiritual',
    'spirituality',
    'spokesman',
    'sponsored',
    'sponsorship',
    'spotlight',
    'spreading',
    'springfield',
    'squirting',
    'stability',
    'stainless',
    'stakeholders',
    'standards',
    'standings',
    'starsmerchant',
    'statement',
    'statements',
    'statewide',
    'stationery',
    'statistical',
    'statistics',
    'statutory',
    'stephanie',
    'stockholm',
    'stockings',
    'strategic',
    'strategies',
    'streaming',
    'strengthen',
    'strengthening',
    'strengths',
    'stretched',
    'structural',
    'structure',
    'structured',
    'structures',
    'subcommittee',
    'subdivision',
    'subjective',
    'sublimedirectory',
    'submission',
    'submissions',
    'submitted',
    'submitting',
    'subscribe',
    'subscriber',
    'subscribers',
    'subscription',
    'subscriptions',
    'subsection',
    'subsequent',
    'subsequently',
    'subsidiaries',
    'subsidiary',
    'substance',
    'substances',
    'substantial',
    'substantially',
    'substitute',
    'successful',
    'successfully',
    'suffering',
    'sufficient',
    'sufficiently',
    'suggested',
    'suggesting',
    'suggestion',
    'suggestions',
    'summaries',
    'sunglasses',
    'superintendent',
    'supervision',
    'supervisor',
    'supervisors',
    'supplement',
    'supplemental',
    'supplements',
    'suppliers',
    'supported',
    'supporters',
    'supporting',
    'surprised',
    'surprising',
    'surrounded',
    'surrounding',
    'surveillance',
    'survivors',
    'suspected',
    'suspended',
    'suspension',
    'sustainability',
    'sustainable',
    'sustained',
    'swaziland',
    'switching',
    'switzerland',
    'syllables',
    'symposium',
    'syndicate',
    'syndication',
    'synthesis',
    'synthetic',
    'systematic',
    'technical',
    'technician',
    'technique',
    'techniques',
    'technological',
    'technologies',
    'technology',
    'techrepublic',
    'telecharger',
    'telecommunications',
    'telephone',
    'telephony',
    'telescope',
    'television',
    'televisions',
    'temperature',
    'temperatures',
    'templates',
    'temporarily',
    'temporary',
    'tennessee',
    'terminals',
    'termination',
    'terminology',
    'territories',
    'territory',
    'terrorism',
    'terrorist',
    'terrorists',
    'testament',
    'testimonials',
    'testimony',
    'textbooks',
    'thanksgiving',
    'themselves',
    'theoretical',
    'therapeutic',
    'therapist',
    'thereafter',
    'therefore',
    'thesaurus',
    'thickness',
    'thoroughly',
    'thousands',
    'threatened',
    'threatening',
    'threshold',
    'throughout',
    'thumbnail',
    'thumbnails',
    'thumbzilla',
    'tolerance',
    'tournament',
    'tournaments',
    'trackback',
    'trackbacks',
    'trademark',
    'trademarks',
    'tradition',
    'traditional',
    'traditions',
    'transaction',
    'transactions',
    'transcript',
    'transcription',
    'transcripts',
    'transexual',
    'transexuales',
    'transferred',
    'transfers',
    'transform',
    'transformation',
    'transition',
    'translate',
    'translated',
    'translation',
    'translations',
    'translator',
    'transmission',
    'transmitted',
    'transparency',
    'transparent',
    'transport',
    'transportation',
    'transsexual',
    'travelers',
    'traveling',
    'traveller',
    'travelling',
    'treasurer',
    'treasures',
    'treatment',
    'treatments',
    'tremendous',
    'tripadvisor',
    'troubleshooting',
    'tutorials',
    'typically',
    'ultimately',
    'unauthorized',
    'unavailable',
    'uncertainty',
    'undefined',
    'undergraduate',
    'underground',
    'underline',
    'underlying',
    'understand',
    'understanding',
    'understood',
    'undertake',
    'undertaken',
    'underwear',
    'unemployment',
    'unexpected',
    'unfortunately',
    'uniprotkb',
    'universal',
    'universities',
    'university',
    'unlimited',
    'unnecessary',
    'unsubscribe',
    'upgrading',
    'utilities',
    'utilization',
    'uzbekistan',
    'vacancies',
    'vacations',
    'valentine',
    'validation',
    'valuation',
    'vancouver',
    'variables',
    'variation',
    'variations',
    'varieties',
    'vbulletin',
    'vegetable',
    'vegetables',
    'vegetarian',
    'vegetation',
    'venezuela',
    'verification',
    'verzeichnis',
    'veterinary',
    'vibrators',
    'victorian',
    'vietnamese',
    'viewpicture',
    'violation',
    'violations',
    'virtually',
    'visibility',
    'vocabulary',
    'vocational',
    'volkswagen',
    'volleyball',
    'voluntary',
    'volunteer',
    'volunteers',
    'voyeurweb',
    'vulnerability',
    'vulnerable',
    'wallpaper',
    'wallpapers',
    'warehouse',
    'warranties',
    'washington',
    'waterproof',
    'watershed',
    'webmaster',
    'webmasters',
    'wednesday',
    'wellington',
    'westminster',
    'wholesale',
    'widescreen',
    'widespread',
    'wikipedia',
    'wilderness',
    'wisconsin',
    'withdrawal',
    'witnesses',
    'wonderful',
    'wondering',
    'worcester',
    'wordpress',
    'workforce',
    'workplace',
    'workshops',
    'workstation',
    'worldwide',
    'wrestling',
    'yesterday',
    'yorkshire',
    'yugoslavia',
];

module.exports = dictionary;

},{}],7:[function(require,module,exports){
const   ComputerGenerator = require('../Computers/ComputerGenerator'),
        Decimal = require('break_infinity.js'),
        companyNames = require('./companies');

/**
 * @type {Array.<Company>}
 */
let companies = [],
    /** @type {boolean} */
    locationsSet = false;


class Company
{
    constructor(name)
    {
        this.name = name;

        this.computers = [];

        /**
         * @type {Decimal} the reward modifier this company offers the player
         * this is based on the accrued successful missions and the number of times the company has detected you hacking
         * one of their servers
         */
        this.playerRespectModifier = new Decimal(1);
        /**
         * @type {Decimal} the reward modifier this company offers the player
         * this is the increase exponent for successfully achieved missions
         */
        this.missionSuccessIncreaseExponent = new Decimal(1.001);
    }

    setPublicServer(publicServer)
    {
        this.publicServer = publicServer;
        publicServer.setCompany(this);
    }

    addComputer(computer)
    {
        this.computers.push(computer);
    }

    finishMission(mission)
    {
        this.playerRespectModifier = this.playerRespectModifier.times(this.missionSuccessIncreaseExponent);
    }

    static getRandomCompany()
    {
        return companies.randomElement();
    }

    /**
     * @returns {[<Company>]}
     */
    static get allCompanies()
    {
        return companies;
    }

    static setAllPublicServerLocations()
    {
        if(locationsSet)
        {
            return;
        }
        for(let company of companies)
        {
            company.publicServer.setLocation(ComputerGenerator.getRandomLandboundPoint());
        }
        locationsSet = true;
    }

    toJSON()
    {

        let json = {
            name:this.name,
            publicServer:this.publicServer.toJSON(),
            computers:[],
            playerRespectModifier:this.playerRespectModifier.toString(),
            missionSuccessIncreaseExponent:this.missionSuccessIncreaseExponent.toString()
        };
        for(let computer of this.computers)
        {
            json.computers.push(computer.toJSON());
        }
        return json;
    }

    static loadCompaniesFromJSON(companiesJSON)
    {
        companies = [];
        for(let companyJSON of companiesJSON)
        {
            companies.push(Company.fromJSON(companyJSON));
        }
    }

    static fromJSON(companyJSON)
    {
        let company = new Company(companyJSON.name);
        company.setPublicServer(ComputerGenerator.fromJSON(companyJSON.publicServer));
        company.playerRespectModifier = Decimal.fromString(companyJSON.playerRespectModifier);
        company.missionSuccessIncreaseExponent = Decimal.fromString(companyJSON.missionSuccessIncreaseExponent);

        for(let computerJSON of company.computers)
        {
            company.addComputer(ComputerGenerator.fromJSON(computerJSON, company));
        }
        locationsSet = true;
        return company;
    }

    static buildCompanyList()
    {
        companies = [];
        for(let companyName of companyNames)
        {
            let company = new Company(companyName);
            company.setPublicServer(ComputerGenerator.newPublicServer(company));
            companies.push(company);
        }
    }
}


module.exports = Company;

},{"../Computers/ComputerGenerator":12,"./companies":8,"break_infinity.js":1}],8:[function(require,module,exports){
let companyNames = [
    "Mike Rowe soft",
    "Pear",
    "Outel",
    "Ice",
    "Tomsung",
    "Popsy",
    "Ohm Djezis",
    "Fizzer",
    "Wonder",
    "Global Hyper Mega Compunet",
    "Athena",
    "Hybrides",
    "Tógan Labs", // with permission from Eilís Ní Fhlannagáin
];

module.exports = companyNames;

},{}],9:[function(require,module,exports){
const   Task = require('../Tasks/Task'),
        EventListener = require('../EventListener'),
        cpus = require('./cpus');

class CPUFullError extends Error{};
class CPUDuplicateTaskError extends Error{};
class InvalidTaskError extends Error{};

const DEFAULT_PROCESSOR_SPEED = 20;

class CPU extends EventListener
{
    constructor(name, speed, lifeCycle, lifeCycleUsed, living)
    {
        super();
        /**
         * @type {string}
         */
        this.name = name?name:"Garbo Processor";
        /**
         * @type {Decimal}
         */
        this.speed = parseInt(speed?speed:DEFAULT_PROCESSOR_SPEED);
        /**
         * @type {Array.<Task>}
         */
        this.tasks = [];
        /**
         * @type {Decimal}
         */
        this.lifeCycle = lifeCycle?lifeCycle:1000;
        this.lifeCycleUsed = lifeCycleUsed?lifeCycleUsed:0;
        this.living = living !== null?living:true;
    }

    toJSON()
    {
        return {
            name:this.name,
            speed:this.speed.toString(),
            lifeCycle:this.lifeCycle.toString(),
            lifeCycleUsed:this.lifeCycleUsed.toString(),
            living:this.living
        }
    }

    static fromJSON(json)
    {
        return new CPU(json.name, json.speed, json.lifeCycle, json.lifeCycleUsed, json.living);
    }

    static getCPUs()
    {
        return cpus;
    }

    tick(load)
    {
        this.lifeCycleUsed += Math.round(load);
        if(this.lifeCycleUsed >= this.lifeCycle)
        {
            this.trigger('CPUDied');
        }
    }

    /**
     * @param cpuData
     */
    static getPriceFor(cpuData)
    {
        return cpuData.lifeCycle * cpuData.speed / 20;
    }
}

module.exports = CPU;

},{"../EventListener":18,"../Tasks/Task":26,"./cpus":15}],10:[function(require,module,exports){
const   CPU = require('./CPU'),
        Task = require('../Tasks/Task'),
        EventListener = require('../EventListener');

/*
 * Custom exceptions
 */
class NoFreeCPUCyclesError extends Error{};
class CPUDuplicateTaskError extends Error{};
class InvalidTaskError extends Error{};

class CPUPool extends EventListener
{
    constructor(cpus)
    {
        super();
        /**
         * @type {Array.<CPU>}
         */
        this.cpus = [];
        /**
         * @type {number} The average speed of all cpus in the pool
         */
        this.averageSpeed = 0;
        /**
         * @type {Decimal} The average speed of all cpus in the pool
         */
        this.totalSpeed = 0;
        /**
         * @type {Decimal} The total cycles used by all tasks
         */
        this.load = 0;
        /**
         * * @type {Array.<Task>}
         */
        this.tasks = [];
        /**
         * @type {number} The number of CPUs. Because entries can be null, this needs to be counted
         */
        this.cpuCount = 0;

        for(let cpu of cpus)
        {
            this.addCPU(cpu);
        }
    }

    /**
     * @param {CPU} cpu
     */
    addCPU(cpu)
    {
        this.setCPUSlot(this.cpus.length, cpu);
    }

    setCPUSlot(slot, cpu)
    {
        if(cpu)
        {
            this.cpus[slot] = cpu;
            this.cpuCount ++;
            this.totalSpeed += cpu.speed;
            this.averageSpeed = this.totalSpeed / this.cpuCount;
        }
        else
        {
            this.cpus[slot] = null;
        }
    }

    /**
     * figure out how many cycles to assign the task. This number will be the larger of the minimum required cycles
     * and 1/nth of the total cycles available to the pool (where n is the number of total tasks being run, including
     * this task).
     * @param {Task} task   The task to figure out the cycles for
     * @returns {number}   The number of cycles to assign the task
     */
    getCyclesForTask(task)
    {
        return Math.max(task.minimumRequiredCycles, Math.floor(this.totalSpeed / (this.tasks.length + 1)));
    }

    /**
     * Figure out how many cycles to remove from all of the current tasks in the pool and do so.
     * This method will keep a tally of the freed cycles, as no task will lower its assigned cycles below the minimum
     * required amount.
     * @param task
     * @returns {number}
     */
    balanceTaskLoadForNewTask(task)
    {
        // get the number of cycles to assign
        let cyclesToAssign = this.getCyclesForTask(task);
        if(this.tasks.length === 0)
        {
            return cyclesToAssign;
        }

        let idealCyclesToAssign = cyclesToAssign;
        if(this.tasks.length > 0)
        {
            // average that out
            let cyclesToTryToTakeAwayFromEachProcess = Math.ceil(idealCyclesToAssign /this.tasks.length),
                cyclesFreedUp = 0;

            for(let task of this.tasks)
            {
                // add the actual amount freed up to the total freed
                cyclesFreedUp += task.freeCycles(cyclesToTryToTakeAwayFromEachProcess);
            }
            cyclesToAssign = cyclesFreedUp;
        }
        return cyclesToAssign;
    }

    /**
     * Add a task to the cpu pool
     * @param {Task} task   The task to be added
     */
    addTask(task)
    {
        // if it's not a task, complain
        if (!(task instanceof Task))
        {
            throw new InvalidTaskError('Tried to add a non task object to a processor');
        }
        // if it's already in the pool, complain
        if(this.tasks.indexOf(task)>=0)
        {
            throw new CPUDuplicateTaskError('This task is already on the CPU');
        }
        let freeCycles = this.availableCycles;
        // if you don't have the free oomph, complain
        if(task.minimumRequiredCycles > freeCycles)
        {
            throw new NoFreeCPUCyclesError(`CPU pool does not have the required cycles for ${task.name}. Need ${task.minimumRequiredCycles.toString()} but only have ${freeCycles}.`);
        }

        // figure out how many cycles to assign
        let cyclesToAssign = this.balanceTaskLoadForNewTask(task);

        task.setCyclesPerTick(cyclesToAssign);
        task.on('complete', ()=>{ this.completeTask(task); });

        this.load += task.minimumRequiredCycles;
        this.tasks.push(task);
    }

    /**
     * Finish a task and remove it from the cpu pool
     * @param {Task} task
     */
    completeTask(task)
    {
        let freedCycles = task.cyclesPerTick;
        this.tasks.removeElement(task);
        this.load -= task.minimumRequiredCycles;

        if(this.tasks.length >= 1)
        {
            let freedCyclesPerTick = Math.floor(freedCycles / this.tasks.length);
            let i = 0;
            while(i < this.tasks.length && freedCycles > (0))
            {
                let task = this.tasks[i];
                freedCycles -= freedCyclesPerTick;
                task.addCycles(freedCyclesPerTick);
                i++;
            }
        }
        this.trigger('taskComplete');
    }

    get availableCycles()
    {
        return this.totalSpeed - this.load;
    }

    get averageLoad()
    {
        return this.load / this.cpuCount;
    }

    tick()
    {
        for(let task of this.tasks)
        {
            task.tick();
        }
        for(let cpu of this.cpus)
        {
            if(cpu)
            {
                cpu.tick(this.averageLoad);
            }
        }
    }
}

module.exports = CPUPool;

},{"../EventListener":18,"../Tasks/Task":26,"./CPU":9}],11:[function(require,module,exports){
const EventListener = require('../EventListener');

function randomIPAddress()
{
    let ipAddress = "";
    for(let i = 0; i < 4; i++)
    {
        if(i)
        {
            ipAddress += '.';
        }
        ipAddress += Math.floor(Math.random() * 256);
    }
    return ipAddress;
}

let allComputers = {};

class Computer extends EventListener
{
    /**
     *
     * @param {string}      name      The name of the computer
     * @param {string|null} ipAddress The ipAddress, if none provided a random ip address
     */
    constructor(name, ipAddress)
    {
        super();
        this.name= name;
        // stop two computers having the same ip address
        // while the statistic chances of this are **REALLY REALLY** small on any given instance, it will almost certainly
        // happen to some poor schmuck and fuck his save file up
        while(ipAddress == null)
        {
            let testIPAddress = randomIPAddress();
            if(Object.keys(allComputers).indexOf(testIPAddress) < 0)
            {
                ipAddress = testIPAddress;
            }
        }
        this.ipAddress = ipAddress;
        this.location = null;
        this.company = null;
        allComputers[this.simpleHash] = this;
    }

    setCompany(company)
    {
        this.company = company;
    }

    get simpleHash()
    {
        return this.name+'::'+this.ipAddress;
    }

    setLocation(location)
    {
        this.location = location;
        return this;
    }

    connect()
    {
        return this;
    }

    disconnect()
    {
        return this;
    }

    tick()
    {

    }

    static allComputers()
    {
        return allComputers;
    }

    static getComputerByHash(hash)
    {
        return allComputers[hash];
    }


    static fromJSON(json, company)
    {
        let computer = new this(json.name, json.ipAddress);

        computer.location = json.location;
        computer.company = company;
        return computer;
    }

    toJSON()
    {
        return {
            className:this.constructor.name,
            name:this.name,
            ipAddress:this.ipAddress,
            location:this.location
        };
    }


}

module.exports = Computer;

},{"../EventListener":18}],12:[function(require,module,exports){
const   PlayerComputer = require('./PlayerComputer'),
        Computer = require('./Computer'),
        CPU = require('./CPU'),
        PublicComputer= require('./PublicComputer'),
        MissionComputer = require('../Missions/MissionComputer'),
        constructors = {PlayerComputer:PlayerComputer, PublicComputer:PublicComputer, MissionComputer:MissionComputer};

const LAND_COLOR = 0xf2efe9;

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive
}

function getRandomBoundInt(boundary)
{
    return getRandomIntInclusive(boundary.min, boundary.max);
}

function colorArrayToHex(colorArray)
{
    let [red, green, blue] = colorArray;
    let rgb = red * 256 * 256 + green * 256 + blue;
    return rgb;
}

class ComputerGenerator
{
    constructor()
    {
        this.canvasContext = null;
        this.boundaries = {};
    }


    /**
     *
     */
    getRandomLandboundPoint()
    {
        let point = null;
        while(point == null)
        {
            let testPoint= this.getRandomPointData();
            if(testPoint.color === LAND_COLOR)
            {
                point = testPoint;
            }
        }
        return point;
    }

    getRandomPointData()
    {
        let point = {
            x:getRandomBoundInt(this.boundaries.x),
            y:getRandomBoundInt(this.boundaries.y)
        };
        let color = this.canvasContext.getImageData(point.x, point.y, 1, 1).data;
        point.color =  colorArrayToHex(color);

        return point;
    }


    /**
     * In order to determine valid locations for any new computer, the class needs a reference to the image so that
     * a random point on the image|map is on a land mass. This method builds up a canvas and throws the image onto
     * the canvas. The canvas' context is then bound as an instance variable
     * @see getRandomLandboundPoint
     * @param mapImage
     */
    defineMapImage(canvas)
    {

        this.boundaries = {
            x:{min:0, max:canvas.width},
            y:{min:0, max:canvas.height}
        };
        this.canvasContext = canvas.getContext('2d');
        return this;
    }

    newPlayerComputer(location)
    {
        let potato = new PlayerComputer([new CPU()]);
        potato.setLocation(location?location:this.getRandomLandboundPoint());
        return potato;
    }

    newPublicServer(company)
    {
        let server = new PublicComputer(company.name+' Public Server');
        server.setCompany(company);
        return server;
    }

    fromJSON(computerJSON, company)
    {
        let computer = constructors[computerJSON.className].fromJSON(computerJSON, company);
        return computer;
    }
}



module.exports = new ComputerGenerator();

},{"../Missions/MissionComputer":21,"./CPU":9,"./Computer":11,"./PlayerComputer":13,"./PublicComputer":14}],13:[function(require,module,exports){
const   Password = require('../Challenges/Password'),
        {DictionaryCracker, PasswordCracker} = require('../Tasks/PasswordCracker'),
        Encryption = require('../Challenges/Encryption'),
        EncryptionCracker = require('../Tasks/EncryptionCracker'),
        Computer = require('./Computer'),
        CPUPool = require('./CPUPool'),
        CPU = require('./CPU.js');

class InvalidTaskError extends Error{};
const DEFAULT_MAX_CPUS = 4;

class PlayerComputer extends Computer
{
    constructor(cpus, maxCPUs)
    {
        super('Home', null, '127.0.0.1');
        this.cpuPool = new CPUPool(cpus);
        this.queuedTasks = [];
        this.maxCPUs = maxCPUs?maxCPUs:DEFAULT_MAX_CPUS;
    }

    get cpus()
    {
        return this.cpuPool.cpus;
    }

    addCPU(cpu)
    {
        this.cpuPool.addCPU(cpu);
    }

    setCPUSlot(slot, cpu)
    {
        this.cpuPool.setCPUSlot(slot, cpu);
    }

    getTaskForChallenge(challenge)
    {
        let task = null;
        if(challenge instanceof Password)
        {
            task = new DictionaryCracker(challenge);
        }
        if(challenge instanceof  Encryption)
        {
            task = new EncryptionCracker(challenge);
        }

        if(!task)
        {
            throw new InvalidTaskError(`No task found for challenge ${challenge.constructor.name}`);
        }
        return task;
    }

    addTaskForChallenge(challenge)
    {
        let task = this.getTaskForChallenge(challenge);
        this.cpuPool.addTask(task);
    }

    tick()
    {
        this.cpuPool.tick();
    }


    get tasks()
    {
        return this.cpuPool.tasks;
    }

    get missionTasks()
    {
        let allTasks = Object.values(this.tasks),
            missionTasks = {crackers:{}};
        for(let task of allTasks)
        {
            if(task instanceof PasswordCracker)
            {
                missionTasks.crackers.password = task;
            }
            if(task instanceof EncryptionCracker)
            {
                missionTasks.crackers.encryption = task;
            }
        }
        return missionTasks;

    }

    toJSON()
    {
        let json = super.toJSON();
        json.cpus = [];
        for(let cpu of this.cpus)
        {
            if(cpu)
            {
                json.cpus.push(cpu.toJSON());
            }
            else
            {
                json.cpus.push(null);
            }
        }
        return json;
    }

    static fromJSON(json)
    {
        let cpus = [];
        for(let cpuJSON of json.cpus)
        {
            if(cpuJSON)
            {
                cpus.push(new CPU(cpuJSON.name, cpuJSON.speed))
            }
            else
            {
                cpus.push(null);
            }
        }
        let pc = new PlayerComputer(cpus);
        pc.setLocation(json.location);
        return pc;
    }
}

module.exports = PlayerComputer;

},{"../Challenges/Encryption":4,"../Challenges/Password":5,"../Tasks/EncryptionCracker":24,"../Tasks/PasswordCracker":25,"./CPU.js":9,"./CPUPool":10,"./Computer":11}],14:[function(require,module,exports){
let Computer = require('./Computer');

class PublicComputer extends Computer
{
    constructor(name, ipAddress)
    {
        super(name, ipAddress);
    }
}

module.exports = PublicComputer;

},{"./Computer":11}],15:[function(require,module,exports){
let cpus = [
    {name:"Garbo Processor", speed:20, lifeCycle:100},
    {name:"Garbo Processor II", speed:40, lifeCycle:1000},
    {name:"Garbo Processor II.5", speed:80, lifeCycle:1500},
    {name:"Garbo Processor BLT", speed:133, lifeCycle: 2000}
];
module.exports = cpus;

},{}],16:[function(require,module,exports){
const Computer = require('./Computers/Computer');

    class InvalidTypeError extends Error{}
    class InvalidComputerError extends Error{}
    class DuplicateComputerError extends Error{}

    let connections = 0;

    /**
     * A class to encapsulate the points in between you and the target computer, excluding both
     */
    class Connection
    {
        constructor(name)
        {
            connections++;
            this.startingPoint = null;
            this.name = name?name:`Connection ${connections}`;
            this.computers=[];
            this.connectionLength = 0;
            this.computersTraced = 0;
        }

        setStartingPoint(playerComputer)
        {
            this.startingPoint = playerComputer;
            return this;
        }

        open()
        {
            for(let computer of this.computers)
            {
                computer.connect();
            }
            return this;
        }

        close()
        {
            let reverseComputers = this.computers.reverse();
            for(let computer of reverseComputers)
            {
                computer.disconnect();
            }
            return this;
        }

        addComputer(computer)
        {
            if(!(computer instanceof Computer))
            {
                throw new InvalidTypeError("Incorrect object type added");
            }
            if(this.computers.indexOf(computer) >= 0)
            {
                this.removeComputer(computer);
                return this;
            }
            computer.connect(this);
            this.computers.push(computer);
            this.connectionLength ++;
            return this;
        }

        removeComputer(computer)
        {
            if(this.computers.indexOf(computer) < 0)
            {
                throw new InvalidComputerError("Computers not found in connection");
            }
            computer.disconnect();
            this.computers.removeElement(computer);
            this.connectionLength --;
        }

        equals(otherConnection)
        {
            if(!otherConnection || !(otherConnection instanceof this))
            {
                return false;
            }

            return JSON.stringify(this.computers) === JSON.stringify(otherConnection.computers);
        }

        toJSON()
        {
            let json= {name:this.name, computerHashes:[]};
            for(let computer of this.computers)
            {
                json.computerHashes.push(computer.simpleHash);
            }
            return json;
        }

        static fromJSON(json, startingPoint)
        {
            let connection = new Connection(json.name);
            connection.startingPoint = startingPoint;
            for(let computerHash of json.computerHashes)
            {
                connection.addComputer(Computer.getComputerByHash(computerHash));
            }
            return connection;
        }
    }

module.exports = Connection;

},{"./Computers/Computer":11}],17:[function(require,module,exports){
const   MissionGenerator = require('./Missions/MissionGenerator'),
        EventListener = require('./EventListener'),
        Connection = require('./Connection'),
        Company = require('./Companies/Company'),
        ComputerGenerator = require('./Computers/ComputerGenerator'),
        CPU = require('./Computers/CPU'),
        Decimal = require('break_infinity.js');

/**
 * This class serves to expose, to the front end, any of the game classes functionality that the UI needs access to
 * It exists only as a means of hard encapsulation
 * This exists as an instantiable class only because it's really difficult to get static classes to have events
 */
class Downlink extends EventListener
{
    constructor()
    {
        super();
        /**
         * @type {PlayerComputer}
         */
        this.playerComputer = null;
        /**
         *
         * @type {Connection}
         */
        this.playerConnection = null;
        this.getNewConnection();
        this.runTime = 0;
        this.lastTickTime = Date.now();

        this.currency = new Decimal(0);
    }

    getNewConnection()
    {
        this.playerConnection = new Connection("Player Connection");
        return this.playerComputer;
    }

    setPlayerComputer()
    {
        this.playerComputer = ComputerGenerator.newPlayerComputer();
        this.playerConnection.setStartingPoint(this.playerComputer);
        return this.playerComputer;
    }

    getPlayerComputer()
    {
        if(!this.playerComputer)
        {
            this.setPlayerComputer();
        }
        return this.playerComputer;
    }

    tick()
    {
        let now = Date.now();
        this.runTime += now - this.lastTickTime;

        this.playerComputer.tick();
        if(this.activeMission)
        {
            this.activeMission.tick();
        }
        this.lastTickTime = Date.now();
    }

    getNextMission()
    {
        this.activeMission = MissionGenerator.getFirstAvailableMission().on("complete", ()=>{
            this.finishCurrentMission(this.activeMission);
            this.trigger('missionComplete');
        });
        this.activeMission.computer.connect(this.playerConnection);
        for(let challenge of this.activeMission.challenges)
        {
            challenge.on("solved", ()=>{this.challengeSolved(challenge)});
            this.playerComputer.addTaskForChallenge(challenge);
        }
        return this.activeMission;
    }

    finishCurrentMission(mission)
    {
        this.currency = this.currency.add(mission.reward);
    }

    challengeSolved(challenge)
    {
        this.trigger("challengeSolved", challenge);
    }

    /**
     * Just exposing the currently available missions
     */
    get availableMissions()
    {
        return MissionGenerator.availableMissions;
    }

    get currentMissionTasks()
    {
        return this.playerComputer.missionTasks;
    }

    get allPublicServers()
    {
        let servers = [];
        for(let company of Company.allCompanies)
        {
            servers.push(company.publicServer);
        }
        return servers;
    }

    /**
     *
     * @returns {[<Company>]}
     */
    get companies()
    {
        return Company.allCompanies;
    }

    performPostLoad(canvas)
    {
        this.buildComputerGenerator(canvas);
        Company.setAllPublicServerLocations();
    }

    buildComputerGenerator(imageReference)
    {
        ComputerGenerator.defineMapImage(imageReference);
    }

    /**
     * @param {<Computer>} computer
     * @returns {<Connection>}
     */
    addComputerToConnection(computer)
    {
        let result = this.playerConnection.addComputer(computer);
        return result;
    }

    toJSON()
    {
        let json = {
            playerComputer:this.playerComputer.toJSON(),
            playerConnection:this.playerConnection.toJSON(),
            companies:[],
            currency:this.currency.toString(),
            runTime:this.runTime
        };
        for(let company of this.companies)
        {
            json.companies.push(company.toJSON());
        }
        return json;
    }

    static fromJSON(json)
    {
        Company.loadCompaniesFromJSON(json.companies);

        let downlink = new Downlink();

        downlink.currency = Decimal.fromString(json.currency);
        downlink.playerComputer = ComputerGenerator.fromJSON(json.playerComputer);
        downlink.runTime = parseInt(json.runTime);
        downlink.lastTickTime = Date.now();

        downlink.playerConnection = Connection.fromJSON(json.playerConnection);
        downlink.playerConnection.setStartingPoint(downlink.playerComputer);

        return downlink;
    }

    static getNew()
    {
        Company.buildCompanyList();

        let dl = new Downlink();
        return dl;
    }

    static stop()
    {

    }

    get secondsRunning()
    {
        return Math.floor(this.runTime / 1000);
    }

    canAfford(cost)
    {
        return this.currency.greaterThan(cost);
    }

    buyCPU(cpuData, slot)
    {
        let cpu = CPU.fromJSON(cpuData);
        this.currency = this.currency.minus(CPU.getPriceFor(cpuData));
        this.playerComputer.setCPUSlot(slot, cpu);

    }
}

module.exports = Downlink;

},{"./Companies/Company":7,"./Computers/CPU":9,"./Computers/ComputerGenerator":12,"./Connection":16,"./EventListener":18,"./Missions/MissionGenerator":23,"break_infinity.js":1}],18:[function(require,module,exports){
class Event
{
    constructor(name)
    {
        this.name = name;
        this.callbacks = [];
    }

    addListener(callback)
    {
        this.callbacks.push(callback);
        return this;
    }

    removeListener(callback)
    {
        let index = this.callbacks.indexOf(callback);
        if(index >= 0)
        {
            this.callbacks.splice(index, 1);
        }
        return this;
    }

    trigger(args)
    {
        this.callbacks.forEach(function(callback){
            callback(...args);
        });
    }
}

class EventListener
{
    constructor()
    {
        /**
         * @type {{Event}}
         */
        this.events = {};
    }

    on(eventName, callback)
    {
        let e = eventName.toLowerCase();
        if(!this.events[e])
        {
            this.events[e] = new Event(e);
        }
        this.events[e].addListener(callback);
        return this;
    }

    off(eventName)
    {
        if(eventName)
        {
            let e = eventName.toLowerCase();
            this.events[e] = null;
        }
        else
        {
            this.events = {};
        }
        return this;
    }

    addListener(eventName, callback)
    {
        let e = eventName.toLowerCase();
        return this.on(e, callback);
    }

    trigger(eventName, ...args)
    {
        let e = eventName.toLowerCase();
        if(this.events[e])
        {
            this.events[e].trigger(args);
        }
    }


    removeListener(eventName, callback)
    {
        let e = eventName.toLowerCase();
        if(this.events[e])
        {
            this.events[e].removeListener(callback);
        }
    }
}

module.exports = EventListener;

},{}],19:[function(require,module,exports){
// This file is solely responsible for exposing the necessary parts of the game to the UI elements
(($)=>{$(()=>{

    const   Downlink = require('./Downlink'),
            CPU = require('./Computers/CPU'),
            Decimal = require('break_infinity.js'),
            TICK_INTERVAL_LENGTH=100,
            MISSION_LIST_CLASS = 'mission-list-row',
            COMPANY_REP_CLASS = 'company-rep-row',
            PLAYER_COMPUTER_CPU_ROW_CLASS = "cpu-row";
    function parseVersionNumber(versionNumberAsString)
    {
        let parts = versionNumberAsString.split('.'),
            partAsNumber = 0;
        for(let partIndex in parts)
        {
            partAsNumber +=  parts[partIndex] * Math.pow(1000, parts.length - 1 - partIndex);
        }
        return partAsNumber
    }

    function saveIsOlder(oldVersionString, currentVersionString)
    {
        let oldVersion = parseVersionNumber(oldVersionString),
            currentVersion = parseVersionNumber(currentVersionString);

        return oldVersion < currentVersion;
    }

    let game = {
        interval:null,
        ticking:true,
        initialised:false,
        takingMissions:true,
        mission:false,
        computer:null,
        downlink:null,
        version:"0.2.2a",
        requiresHardReset:true,
        /**
         * jquery entities that are needed for updating
         */
        $missionContainer:null,
        $activeMissionName:null,
        $activeMissionPassword:null,
        $activeMissionEncryptionGrid:null,
        $activeMissionEncryptionType:null,
        $activeMissionIPAddress:null,
        $activeMissionServerName:null,
        $playerCurrencySpan:null,
        $playerStandingsTitle:null,
        $playerComputerCPUListContainer:null,
        $worldMapModal:null,
        $worldMapContainer:null,
        $worldMapCanvasContainer:null,
        $activeMissionServer:null,
        $settingsTimePlayed:null,
        $settingsModal:null,
        $importExportTextarea:null,
        $computerBuildModal:null,
        $computerBuild:null,
        $computerPartsCPURow:null,
        /**
         * HTML DOM elements, as opposed to jQuery entities for special cases
         */
        mapImageElement:null,
        bindUIElements:function()
        {
            this.$missionContainer = $('#mission-list');
            this.$activeMissionName = $('#active-mission');
            this.$activeMissionServer = $('#active-mission-machine-details');
            this.$activeMissionPassword = $('#active-mission-password-input');
            this.$activeMissionEncryptionGrid = $('#active-mission-encryption-grid');
            this.$activeMissionEncryptionType = $('#active-mission-encryption-type');
            this.$activeMissionIPAddress = $('#active-mission-server-ip-address');
            this.$activeMissionServerName = $('#active-mission-server-name');
            this.$playerCurrencySpan = $('#player-currency');
            this.$playerStandingsTitle = $('#player-company-standings-title');
            this.$playerComputerCPUListContainer = $('#player-computer-processors');
            this.$worldMapModal = $('#connection-modal');
            this.$worldMapContainer = $('#world-map');
            this.$worldMapCanvasContainer = $('#canvas-container');
            this.$worldMapModal.on("hide.bs.modal", ()=>{this.afterHideConnectionManager()});
            this.$settingsTimePlayed = $('#settings-time-played');
            this.$settingsModal = $('#settings-modal');
            this.$importExportTextarea = $('#settings-import-export');
            this.$computerBuildModal = $('#computer-build-modal');
            this.$computerBuild = $('#computer-build-layout');
            this.$computerPartsCPURow = $('#computer-parts-cpu-row');

            $('#settings-export-button').click(()=>{
                this.$importExportTextarea.val(this.save());
            });
            $('#settings-import-button').click(()=>{this.importFile(this.$importExportTextarea.val())});
            $('#settings-save-button').click(()=>{this.saveFile();});
            $('#connectionModalLink').click(()=>{this.showConnectionManager();});
            $('#settingsModalLink').click(()=>{this.showSettingsModal();});
            $('#game-version').html(this.version);
            $('#computerModalLink').click(()=>{this.showComputerBuildModal()});
        },
        buildWorldMap:function()
        {
            // resizing the worldmap container
            let image = new Image();
            this.mapImageElement = image;
            let dimensionBounds = {x:{min:0, max:0}, y:{min:0, max:0}};
            /*
             This is needed so that we can know what the image values are before the game loads
             */
            let p = new Promise((resolve, reject)=>{

                image.onload =()=>{
                    this.buildCanvas();
                    resolve();
                };
                image.src = './img/osm-world-map.png';
            });

            return p;
        },
        getFreshCanvas()
        {
            let canvas = document.createElement('canvas');
            canvas.width = this.mapImageElement.width;
            canvas.height = this.mapImageElement.height;
            canvas
                .getContext('2d')
                .drawImage(
                    this.mapImageElement, 0, 0,
                    this.mapImageElement.width, this.mapImageElement.height
                );
            this.$worldMapCanvasContainer.empty().append($(canvas));
            return canvas;
        },
        /**
         * Using a canvas for two reasons. JavaScript requires one to figure out whether a random point is landbound or not
         * This will pass a fresh copy of the canvas to the Downlink object to keep for that purpose and also draw
         * one to the dom. The one on the dom will be drawn to and deleted and drawn to and deleted, but the
         * Downlink object needs to know the raw one.
         * @param image
         */
        buildCanvas:function()
        {
            this.downlink.performPostLoad(this.getFreshCanvas());

            this.$worldMapContainer.css({
                height:this.mapImageElement.height+'px',
                width:this.mapImageElement.width+'px'
            });
        },
        newGame:function()
        {
            this.downlink = Downlink.getNew();
        },
        loadGame:function(json)
        {
            this.downlink = Downlink.fromJSON(json);
        },
        saveFile:function()
        {
            let data = new Blob([this.save()], {type: 'text/plain'}),
                urlParam = window.URL.createObjectURL(data),
                a = document.createElement('a');
            a.href = urlParam;
            a.download = 'Downlink-Save.txt';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        },
        importFile:function(json)
        {
            this.stop();
            this.initialised = false;
            this.loadGame(json);
            this.performPostLoadCleanup().then(()=>{
                this.start();
            });
        },
        needsHardReset:function(saveFile)
        {
            if(!saveFile.version)
            {
                return true;
            }
            return (this.requiresHardReset && saveIsOlder(saveFile.version, this.version));
        },
        initialise:function()
        {
            this.bindUIElements();

            let saveFile = this.load();
            if (saveFile && !this.needsHardReset(saveFile))
            {
                this.loadGame(saveFile);
            }
            else
            {
                this.newGame();
            }

            return this.performPostLoadCleanup();
        },
        performPostLoadCleanup:function()
        {
            this.updatePlayerDetails();

            this.initialised = true;
            return this.buildWorldMap().then(()=>{

                let pc = this.downlink.getPlayerComputer();
                this.addComputerToWorldMap(pc);
                this.updateComputerBuild();
                this.buildComputerPartsUI();
                this.buildComputerGrid();

                this.addPublicComputersToWorldMap();

                this.ticking = true;
                this.updateConnectionMap();
                this.getNextMission();

            });
        },
        addPublicComputersToWorldMap:function()
        {
            for(let computer of this.downlink.allPublicServers)
            {
                this.addComputerToWorldMap(computer, ()=>{
                    this.addComputerToConnection(computer);
                });
            }
        },
        addComputerToConnection:function(computer)
        {
            this.downlink.addComputerToConnection(computer);
            this.updateConnectionMap();
        },
        updateConnectionMap:function()
        {
            let connection = this.downlink.playerConnection;
            let context = this.getFreshCanvas().getContext('2d');
            let currentComputer = this.downlink.playerComputer;
            for(let computer of connection.computers)
            {
                // connect the current computer to the current computer in the connection
                context.beginPath();
                context.moveTo(currentComputer.location.x, currentComputer.location.y);
                context.lineTo(computer.location.x, computer.location.y);
                context.stroke();
                // set the currentComputer to be the current computer in the connection
                currentComputer = computer;
            }
        },
        start:function(){
            this.ticking = true;
            if(this.initialised)
            {
                this.tick();
                //this.showComputerBuildModal();
            }
            else
            {
                this.initialise().then(() => {
                    this.tick();
                  //  this.showComputerBuildModal();
                });
            }
        },
        stop:function(){
            this.ticking = false;
            window.clearTimeout(this.interval);
        },
        tick:function() {
            try
            {
                if (this.ticking)
                {
                    this.downlink.tick();
                    this.animateTick();
                    this.interval = window.setTimeout(() => {this.tick()}, TICK_INTERVAL_LENGTH);
                    this.$settingsTimePlayed.html(this.getRunTime());
                }
            }
            catch(e)
            {
                console.log(e);
            }
        },
        animateTick:function()
        {
            let tasks = this.downlink.currentMissionTasks;
            if(tasks.crackers.password)
            {
                this.animatePasswordField(tasks.crackers.password);
            }
            if(tasks.crackers.encryption)
            {
                this.animateEncryptionGrid(tasks.crackers.encryption);
            }
        },
        /**
         *
         * @param {PasswordCracker|undefined} passwordCracker
         */
        animatePasswordField:function(passwordCracker)
        {
            if(passwordCracker)
            {
                this.$activeMissionPassword
                    .val(passwordCracker.currentGuess)
                    .removeClass("solved-password unsolved-password")
                    .addClass(passwordCracker.completed ? "solved-password" : "unsolved-password");
            }
            else
            {
                this.$activeMissionPassword
                    .removeClass("unsolved-password")
                    .addClass('solved-password');
            }
        },
        /**
         *
         * @param {EncryptionCracker} encryptionCracker
         */
        animateEncryptionGrid:function(encryptionCracker)
        {
            let html = '';

            let grid = encryptionCracker.cellGridArrayForAnimating;
            let height = this.$activeMissionEncryptionGrid.height(),
                cellHeight = height / grid.length;

            for(let row of grid)
            {
                html += '<div class="row">';
                for(let cell of row)
                {
                    html += `<div class="col encryption-cell ${cell.solved?"solved-encryption-cell":"unsolved-encryption-cell"}">${cell.letter}</div>`;
                }
                html += '</div>';
            }
            this.$activeMissionEncryptionGrid.html(html);

            $('.encryption-cell').css('max-width', cellHeight+'px');
        },
        getNextMission:function(){
            if(!this.takingMissions)
            {
                this.$activeMissionServer.hide();
                return false;
            }
            this.$activeMissionServer.show();
            this.mission = this.downlink.getNextMission()
                .on('complete', ()=>{
                    this.updatePlayerDetails();
                    this.updateComputerPartsUI();
                    this.getNextMission();
                });
            this.downlink
                .on("challengeSolved", (task)=>{this.updateChallenge(task)});
            this.updateMissionInterface(this.mission);
            this.save();
        },
        updatePlayerDetails:function()
        {
            this.$playerCurrencySpan.html(this.downlink.currency.toFixed(2));
            this.updatePlayerReputations();
        },
        updatePlayerReputations:function()
        {
            $(`.${COMPANY_REP_CLASS}`).remove();
            let html = '';
            for(let company of this.downlink.companies)
            {
                html += `<div class="row ${COMPANY_REP_CLASS}"><div class="col">${company.name}</div><div class="col-2">${company.playerRespectModifier.toFixed(2)}</div></div>`;
            }
            this.$playerStandingsTitle.after(html);
        },
        updateComputerBuild:function()
        {
            $(`.${PLAYER_COMPUTER_CPU_ROW_CLASS}`).remove();

            let html = '';
            for(let cpu of this.downlink.playerComputer.cpus)
            {
                if(cpu)
                {
                    html += `<div class="row ${PLAYER_COMPUTER_CPU_ROW_CLASS}"><div class="col">${cpu.name}</div><div class="col">${cpu.speed}MHz</div></div>`;
                }
            }

            this.$playerComputerCPUListContainer.html(html);
        },
        updateChallenge:function(challenge)
        {
            switch(challenge.constructor.name)
            {
                case "Password":
                    this.animatePasswordField();
                    break;
            }
        },
        /**
         *
         * @param {Mission} mission
         */
        updateMissionInterface:function(mission){
            this.updateAvailableMissionList(mission);
            this.updateCurrentMissionView(mission.computer);

        },
        updateCurrentMissionView:function(server){
            this.$activeMissionPassword.val('');
            this.$activeMissionEncryptionGrid.empty();
            this.$activeMissionEncryptionType.html(server.encryption.name);
            this.$activeMissionIPAddress.html(server.ipAddress);
            this.$activeMissionServerName.html(server.name);
        },
        updateAvailableMissionList:function(mission){
            $('.'+MISSION_LIST_CLASS).remove();
            this.$activeMissionName.html(mission.name);
            let html = '';
            for(let mission of this.downlink.availableMissions)
            {
                html += `<div class="row ${MISSION_LIST_CLASS}">${mission.name}</div>`;
            }
            let $html = $(html);
            this.$missionContainer.append($html);
        },
        addComputerToWorldMap(computer, callback)
        {
            let $node = $('<div/>')
                .addClass('computer')
                .attr('title', computer.name)
                .addClass(computer.constructor.name);
            if(callback)
            {
                $node.on("click", callback);
            }

            this.$worldMapContainer.append($node);
            let width = parseInt($node.css('width'), 10),
                height = parseInt($node.css('height'), 10);
            // This makes sure that the centre of the location is the centre of the div
            // which means that the lines between computer points go from centre point to centre point
            // instead of top left to top left
            $node.css({
                top:(computer.location.y - height / 2)+'px',
                left:(computer.location.x - width / 2)+'px'
            })
        },
        hardReset:function()
        {
            this.stop();
            localStorage.clear();
        },
        getJSON:function()
        {
            return this.downlink.toJSON();
        },
        save:function()
        {
            let json = this.getJSON();
            json.version = this.version;
            let jsonAsString = JSON.stringify(json),
                jsonAsAsciiSafeString = btoa(jsonAsString);
            localStorage.setItem('saveFile', jsonAsAsciiSafeString);
            return jsonAsAsciiSafeString;
        },
        parseLoadFile:function(loadFile)
        {
            let jsonAsString = atob(loadFile), json = JSON.parse(jsonAsString);
            return json;
        },
        load:function()
        {
            let jsonAsAsciiSafeString = localStorage.getItem('saveFile');
            if(jsonAsAsciiSafeString)
            {
                return this.parseLoadFile(jsonAsAsciiSafeString);
            }
            return null;
        },
        showConnectionManager:function()
        {
            this.takingMissions = false;
            this.$worldMapModal.modal({keyboard:false, backdrop:"static"});
        },
        afterHideConnectionManager:function()
        {
            this.takingMissions = true;
            this.getNextMission();
        },
        getRunTime:function()
        {
            return this.downlink.secondsRunning;
        },
        showSettingsModal:function()
        {
            this.$settingsModal.modal({keyboard:false, backdrop:"static"});
        },
        showComputerBuildModal:function()
        {
            this.$computerBuildModal.modal({keyboard:false, backdrop:"static"});
        },
        buildComputerPartsUI:function()
        {
            this.$computerPartsCPURow.empty();
            for(let cpu of CPU.getCPUs())
            {
                let cost = CPU.getPriceFor(cpu),
                    affordable = this.downlink.canAfford(cost);
                let $node = $(`<div data-part-cost="${cost.toString()}" class="col-4 cpu part ${affordable?"":"un"}affordable-part"><div class="row"><i class="fas fa-microchip"></i></div><div class="row">${cpu.name}</div><div class="row">${cpu.speed} MHz</div><div class="row">${cost.toString()}</div></div>`);
                $node.click(() => {
                    this.setChosenPart(cpu, 'CPU', cost, $node);
                });

                this.$computerPartsCPURow.append($node);
            }
        },
        setChosenPart(part, type, cost, $node)
        {
            if(!this.downlink.canAfford(cost))
            {
                return;
            }
            $('.chosenPart').removeClass('chosenPart');
            if(part === this.chosenPart)
            {
                this.chosenPart = null;
                return;
            }
            this.chosenPart = part;
            $node.addClass('chosenPart');
        },
        updateComputerPartsUI:function()
        {
            let downlink = this.downlink
            $('.part').each(function(index){
                let $node = $(this),
                    cost = new Decimal($node.data('partCost')),
                    canAfford = downlink.canAfford(cost);
                $node.removeClass('affordable-part unaffordable-part').addClass(
                    (canAfford?'':'un')+'affordable-part'
                );
            });
        },
        buildComputerGrid:function()
        {
            this.$computerBuild.empty();

            let pc = this.downlink.playerComputer,
                gridSize = Math.floor(Math.sqrt(pc.maxCPUs)),
                html = '',
                cpuCount = 0;
            for(let i = 0; i < gridSize; i++)
            {
                html += '<div class="row cpuRow">'
                for(let j = 0; j < gridSize; j++)
                {
                    html += `<div data-cpu-slot="${cpuCount}" class="col cpuHolder">${pc.cpus[cpuCount]?'<i class="fas fa-microchip"></i>':''}</div>`;
                    cpuCount++;
                }
                html += '</div>';
            }
            this.$computerBuild.html(html);
            $('.cpuHolder').click((evt)=> {
                let cpuSlot = $(evt.currentTarget).data('cpuSlot');
                this.buyCPU(cpuSlot)
            });
            $('.cpuRow').css('width', gridSize * 30);
        },
        buyCPU:function(cpuSlot)
        {
            if(!this.chosenPart || !this.downlink.canAfford(CPU.getPriceFor(this.chosenPart)))
            {
                return;
            }
            this.downlink.buyCPU(this.chosenPart, cpuSlot);
            this.buildComputerGrid();
            this.updateComputerBuild();
        }
    };

    game.start();

    window.game = game;
})})(window.jQuery);

},{"./Computers/CPU":9,"./Downlink":17,"break_infinity.js":1}],20:[function(require,module,exports){
const   Company = require('../Companies/Company'),
    MissionComputer = require('./MissionComputer'),
    Password = require('../Challenges/Password'),
    Encryption = require('../Challenges/Encryption'),
    EventListener = require('../EventListener'),
    MissionDifficulty = require('./MissionDifficulty');


class Mission extends EventListener
{
    /**
     * Any mission is going to involve connecting to another computer belonging to a company and doing something to it
     * @param {Company}    target      The object representing the company you are, in some way, attacking
     * @param {Company}    sponsor     The company sponsoring this hack
     */
    constructor(target, sponsor)
    {
        super();
        this.name = `Hack ${target.name} for ${sponsor.name}`;
        /**
         * @type {Company} the target company being attacked
         */
        this.target = target;
        /**
         * @type {Company} the company sponsoring this mission
         */
        this.sponsor = sponsor;

        // these values are all instantiated later.
        /**
         * @type {MissionDifficulty}
         */
        this.difficulty = null;
        /**
         *
         * @type {MissionComputer}
         */
        this.computer = null;

        this.status = "Available";

    }

    setDifficulty(difficulty)
    {
        if(!difficulty instanceof MissionDifficulty)
        {
            throw new Error("Mission Difficulty unrecognised");
        }
        this.difficulty = difficulty;
        return this;
    }

    get challenges()
    {
        return this.computer.challenges;
    }

    /**
     * A method to set the computer for this mission.
     * This is kept as a separate method because we only really want the mission to be populated when we take it,
     * not when we're just listing it.
     *
     *
     */
    build()
    {
        if(this.computer)
        {
            return this;
        }

        this.computer = new MissionComputer(this.target, this.difficulty.serverType);
        this.computer.on('accessed', ()=>{
            this.signalComplete();
        });

        let password = null, encryption = null;

        /**
         * This a hoist, not the end result
         */
        if(this.difficulty === MissionDifficulty.DIFFICULTIES.EASY)
        {
            password = Password.randomDictionaryPassword(Password.PASSWORD_DICTIONARY_DIFFICULTIES.EASIEST);
            encryption = Encryption.getNewLinearEncryption();
        }

        this.computer.setPassword(password).setEncryption(encryption);


        this.target.addComputer(this.computer);
        this.status = "Underway";
        return this;
    }

    /**
     * @returns {Decimal}
     */
    get reward()
    {
        return this.difficulty.modifier.times(this.computer.difficultyModifier.sqrt()).times(this.sponsor.playerRespectModifier);
    }

    signalComplete()
    {
        this.status="Complete";
        this.sponsor.finishMission(this);
        this.trigger('complete');
    }

    set connection(connection)
    {
        this.computer.connect(connection);

    }

    tick()
    {
        this.build();
        this.computer.tick();
    }

    static getNewSimpleMission()
    {
        let companies = [...Company.allCompanies].shuffle();
        return new Mission(
            companies.shift(),
            companies.shift()
        ).setDifficulty(
            MissionDifficulty.DIFFICULTIES.EASY
        );
    }
}
module.exports = Mission;

},{"../Challenges/Encryption":4,"../Challenges/Password":5,"../Companies/Company":7,"../EventListener":18,"./MissionComputer":21,"./MissionDifficulty":22}],21:[function(require,module,exports){
const   Computer = require('../Computers/Computer'),
        Decimal = require('break_infinity.js');
class MissionComputer extends Computer
{
    constructor(company, serverType)
    {
        let name = company.name+' '+serverType;
        super(name, null);
        /**
         * @type {string}
         */
        this.serverType = serverType;
        /**
         * @type {Encryption}   The Encryption this computer has on it
         */
        this.encryption = null;
        /**
         * @type {Password}     The Password this computer has on it
         */
        this.password = null;
        /**
         * Whether or not this computer has been successfully hacked
         * @type {boolean}
         */
        this.accessible = false;
        /**
         * The current connection by which the player accesses this computer
         * @type {Connection}
         */
        this.currentPlayerConnection = null;
        /**
         * The  connection by which the player last accessed this computer
         * @type {Connection}
         */
        this.previousPlayerConnection = null;
        /**
         * Whether or not the administrator of this computer should have been alerted as to the breach
         * @type {boolean}
         */
        this.alerted = false;
        /**
         * The set of all challenges that need to be overcome in order to access this computer
         * @type {Array.<Challenge>}
         */
        this.challenges = [];

    }

    toJSON()
    {
        let json = super.toJSON();
        json.serverType = this.serverType;
    }

    fromJSON(companyJSON, company)
    {
        let computer = new MissionComputer(company, companyJSON.serverType);
        computer.setLocation(companyJSON.location);
    }

    /**
     * @param {Connection} connection
     */
    connect(connection)
    {
        connection.open();
        super.connect();
        this.currentPlayerConnection = connection;

        if(this.currentPlayerConnection.equals(this.previousPlayerConnection) && this.alerted === true)
        {
            this.resumeTraceBack();
        }

        return this;
    }

    disconnect()
    {
        super.disconnect();
        this.currentPlayerConnection.close();
        this.stopTraceBack();
        return this;
    }

    setEncryption(encryption)
    {
        this.encryption = encryption;
        this.challenges.push(encryption);

        encryption
            .on('solved', ()=>{
                this.updateAccessStatus();
                encryption.off();
            })
            .on('start', ()=>{this.startTraceBack();});
        return this;
    }

    setPassword(password)
    {
        this.password = password;
        this.challenges.push(password);

        // password is not handled the same as encryption
        // because password is not a Tasks
        // the PasswordCracker Tasks isn't
        password.on('solved', ()=>{
            this.updateAccessStatus();
            password.off();
        }).on('start', ()=>{this.startTraceBack();});
        return this;
    }

    get difficultyModifier()
    {
        let mod = new Decimal(1);
        for(let challenge of this.challenges)
        {
            mod = mod.plus(challenge.difficulty);
        }
        return mod;
    }

    updateAccessStatus()
    {
        if(!this.accessible)
        {
            let accessible = true;
            for(let challenge of this.challenges)
            {
                accessible = accessible && challenge.solved;
            }
            this.accessible = accessible;
        }

        if(this.accessible)
        {
            this.trigger('accessed');
        }
        return this.accessible;
    }

    startTraceBack()
    {

    }

    resumeTraceBack()
    {

    }

    stopTraceBack()
    {

    }
}

module.exports = MissionComputer;

},{"../Computers/Computer":11,"break_infinity.js":1}],22:[function(require,module,exports){
const Decimal = require('break_infinity.js');

/**
 * This class largely exists to make commenting cleaner
 */
class MissionDifficulty
{
    /**
     * @param {string} name         The name of the difficulty
     * @param {Decimal} modifier     The modifier of the difficulty
     * @param {string} serverType   The server type this difficulty faces
     */
    constructor(name, modifier, serverType)
    {
        this.nanme = name;
        /**
         * @type {Decimal}   A modifier to the reward given for the mission as a number
         */
        this.modifier = modifier;
        /**
         * @type {Decimal}   A name for the type of server you are attacking
         */
        this.serverType = serverType;
    }

}

MissionDifficulty.DIFFICULTIES = {
    EASY:new MissionDifficulty("Easy", new Decimal(1), "Server"),
    MEDIUM:new MissionDifficulty("Medium", new Decimal(5), "Cluster"),
    HARD:new MissionDifficulty("Hard", new Decimal(10), "Farm"),
};

module.exports = MissionDifficulty;

},{"break_infinity.js":1}],23:[function(require,module,exports){
const   Mission = require('./Mission'),
        MINIMUM_MISSIONS = 10;
let availableMissions = [];

class MissionGenerator
{
    static updateAvailableMissions()
    {
        while(availableMissions.length < MINIMUM_MISSIONS)
        {
            availableMissions.push(
                Mission.getNewSimpleMission()
            );
        }
    }

    static get availableMissions()
    {
        this.updateAvailableMissions();
        return availableMissions;
    }

    static getFirstAvailableMission()
    {
        this.updateAvailableMissions();
        let mission = availableMissions.shift().build();
        this.updateAvailableMissions();
        return mission;
    }
}

module.exports = MissionGenerator;

},{"./Mission":20}],24:[function(require,module,exports){
const   Alphabet = require('../Alphabet'),
        Task = require('./Task');

class EncryptionCell
{
    constructor()
    {
        this.solved = false;
        this.letter = Alphabet.getRandomLetter();
    }

    solve()
    {
        this.solved = true;
        this.letter = '0';
    }

    tick()
    {
        if(this.solved)
        {
            return;
        }
        this.letter = Alphabet.getRandomLetter();
    }
}

class EncryptionCracker extends Task
{
    constructor(encryption)
    {
        super('EncryptionCracker', encryption, encryption.difficulty);
        this.rows = encryption.rows;
        this.cols = encryption.cols;
        this.encryption = encryption;

        /**
         * This is just an arbitrary number representing how many clock cycles per tick are needed to solve each cell
         */
        this.encryptionDifficulty = encryption.difficulty;

        /**
         *
         * @type {number}
         */
        this.cyclesPerTick = 0;
        /**
         * The amount of progress you have made on the current tick
         */
        this.currentTickPercentage = 0;

        /**
         * @type {Array.<Array.<EncryptionCell>>}
         */
        this.grid = [];
        /**
         * @type {Array.<EncryptionCell>}
         */
        this.cells = [];
        this.unsolvedCells = [];
        for(let i = 0; i < this.rows; i++)
        {
            let row = [];
            this.grid.push(row);

            for(let j = 0; j < this.cols; j++)
            {
                let cell = new EncryptionCell();
                row[j] = cell;
                this.cells.push(cell);
                this.unsolvedCells.push(cell);
            }
        }
    }


    solveNCells(cellsToSolve)
    {
        this.trigger('start');
        for(let i = 0; i < cellsToSolve; i++)
        {
            let cell = this.unsolvedCells.randomElement();
            if(cell)
            {
                cell.solve();
                this.unsolvedCells.removeElement(cell);
            }
        }


    }

    /**
     * This should hopefully update the graphic properly
     * @returns {Array<Array<EncryptionCell>>}
     */
    get cellGridArrayForAnimating()
    {
        if(!this.unsolvedCells.length)
        {
            this.signalComplete();
        }

        return this.grid;
    }

    get percentage()
    {
        return (this.cells.length - this.unsolvedCells.length) / (this.cells.length);
    }

    get solved()
    {
        return this.unsolvedCells.length == 0;
    }

    tick()
    {
        super.tick();

        // Cycle through all of the cells and tick them.
        for (let cell of this.unsolvedCells)
        {
            cell.tick();
        }

        // figure out how many cells to solve
        // by determining how many cycles per tick we have divided by the difficulty of this task
        // this may lead to a number less than zero and so, this tick, nothing will happen
        this.currentTickPercentage += this.cyclesPerTick / this.encryptionDifficulty;

        // if the currentTickPercentage is bigger than one, we solve that many cells
        if(this.currentTickPercentage >= 1)
        {
            let fullCells = Math.floor(this.currentTickPercentage);
            this.currentTickPercentage -= fullCells;
            this.solveNCells(fullCells);
        }
    }

    static fromJSON(json)
    {
        json = json?json:{rows:10,cols:10,difficulty:50};
        return new EncryptionCracker(json.rows, json.cols, json.difficulty);
    }

    getRewardRatio()
    {
        return this.difficultyRatio / Math.pow(this.ticksTaken, 2);
    }
}

module.exports = EncryptionCracker;

},{"../Alphabet":2,"./Task":26}],25:[function(require,module,exports){
const   DICTIONARY_CRACKER_MINIMUM_CYCLES = 5,
        SEQUENTIAL_CRACKER_MINIMUM_CYCLES = 20,
        Task = require('./Task'),
        Password = require('../Challenges/Password');

class PasswordCracker extends Task
{
    constructor(password, name, minimumRequiredCycles)
    {
        super(name, password, minimumRequiredCycles);
        this.password = password;
        this.currentGuess = null;
    }

    attackPassword()
    {
        if(!this.password.solved)
        {
            let result = this.password.attack(this.currentGuess);
            if (result)
            {
                this.signalComplete();
            }
            return result;
        }
    }

}


class DictionaryCracker extends PasswordCracker
{
    constructor(password)
    {
        super(password, 'Dictionary Cracker', DICTIONARY_CRACKER_MINIMUM_CYCLES);
        this.dictionary = [...password.dictionary];
        this.totalGuesses = 0;
    }

    get dictionaryEntriesLeft()
    {
        return this.dictionary.length;
    }

    tick()
    {
        super.tick();

        if(!this.solved)
        {
            let attacking = true,
                found = false,
                guessesThisTick = 0;

            while(attacking)
            {
                this.currentGuess = this.dictionary[this.totalGuesses++];

                let guessSuccessful = this.attackPassword();
                found = found || guessSuccessful;
                if(guessSuccessful || guessesThisTick++ >= this.cyclesPerTick)
                {
                    attacking = false;
                }
            }
        }
    }
}

class SequentialAttacker extends PasswordCracker
{
    constructor(password)
    {
        super(password, 'Sequential Cracker', SEQUENTIAL_CRACKER_MINIMUM_CYCLES);
    }

    tick()
    {

    }
}

module.exports = {
    PasswordCracker:PasswordCracker,
    DictionaryCracker:DictionaryCracker,
    SequentialAttacker:SequentialAttacker
};

},{"../Challenges/Password":5,"./Task":26}],26:[function(require,module,exports){
const   EventListener = require('../EventListener'),
        Decimal = require('break_infinity.js');

class CPUOverloadError extends Error
{
    constructor(task, cycles)
    {
        super(`Trying to run a task (${task.name}) with fewer cycles ${cycles} than it requires ${task.minimumRequiredCycles}`);
        this.task = task;
        this.cycles = cycles;
    }
}

class Task extends EventListener
{
    constructor(name, challenge, minimumRequiredCycles)
    {
        super();
        this.name= name;
        this.minimumRequiredCycles = minimumRequiredCycles?minimumRequiredCycles:10;
        this.cyclesPerTick = 0;
        this.weight = 1;
        this.difficultyRatio = 0;
        this.ticksTaken = 0;
        this.working = false;
        this.completed = false;
        this.challenge = challenge.setTask(this);
    }

    setCyclesPerTick(cyclesPerTick)
    {
        if(cyclesPerTick < this.minimumRequiredCycles)
        {
            throw new CPUOverloadError(this, cyclesPerTick);
        }
        this.cyclesPerTick = cyclesPerTick;
        return this;
    }

    addCycles(tickIncrease)
    {
        this.cyclesPerTick += tickIncrease;
    }

    /**
     * Try to release a number of ticks from the task and return the number actually released
     * @param {number} tickReduction
     * @returns {number|*}
     */
    freeCycles(tickReduction)
    {
        // figure out how many freeable ticks we have
        const freeableTicks = this.cyclesPerTick-this.minimumRequiredCycles;
        // if it's one or less, free none and return 0
        let ticksToFree = 0;
        if(freeableTicks > 1)
        {
            if(freeableTicks > tickReduction)
            {
                ticksToFree = tickReduction;
            }
            else
            {
                ticksToFree = Math.floor(freeableTicks / 2);
            }
        }
        this.cyclesPerTick -= ticksToFree;
        return ticksToFree;
    }

    signalComplete()
    {
        this.working = false;
        this.completed = true;
        this.trigger('complete');
        this.challenge.solve();
    }

    getRewardRatio()
    {
        return 0;
        //return this.difficultyRatio / Math.pow(this.ticksTaken, 2.5);
    }

    tick()
    {
        this.ticksTaken++;
    }
}

module.exports = Task;

},{"../EventListener":18,"break_infinity.js":1}]},{},[19]);
