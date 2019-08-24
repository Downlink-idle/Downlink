(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
;(function (globalScope) {
  'use strict';


  /*
   *  decimal.js v10.2.0
   *  An arbitrary-precision Decimal type for JavaScript.
   *  https://github.com/MikeMcl/decimal.js
   *  Copyright (c) 2019 Michael Mclaughlin <M8ch88l@gmail.com>
   *  MIT Licence
   */


  // -----------------------------------  EDITABLE DEFAULTS  ------------------------------------ //


    // The maximum exponent magnitude.
    // The limit on the value of `toExpNeg`, `toExpPos`, `minE` and `maxE`.
  var EXP_LIMIT = 9e15,                      // 0 to 9e15

    // The limit on the value of `precision`, and on the value of the first argument to
    // `toDecimalPlaces`, `toExponential`, `toFixed`, `toPrecision` and `toSignificantDigits`.
    MAX_DIGITS = 1e9,                        // 0 to 1e9

    // Base conversion alphabet.
    NUMERALS = '0123456789abcdef',

    // The natural logarithm of 10 (1025 digits).
    LN10 = '2.3025850929940456840179914546843642076011014886287729760333279009675726096773524802359972050895982983419677840422862486334095254650828067566662873690987816894829072083255546808437998948262331985283935053089653777326288461633662222876982198867465436674744042432743651550489343149393914796194044002221051017141748003688084012647080685567743216228355220114804663715659121373450747856947683463616792101806445070648000277502684916746550586856935673420670581136429224554405758925724208241314695689016758940256776311356919292033376587141660230105703089634572075440370847469940168269282808481184289314848524948644871927809676271275775397027668605952496716674183485704422507197965004714951050492214776567636938662976979522110718264549734772662425709429322582798502585509785265383207606726317164309505995087807523710333101197857547331541421808427543863591778117054309827482385045648019095610299291824318237525357709750539565187697510374970888692180205189339507238539205144634197265287286965110862571492198849978748873771345686209167058',

    // Pi (1025 digits).
    PI = '3.1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679821480865132823066470938446095505822317253594081284811174502841027019385211055596446229489549303819644288109756659334461284756482337867831652712019091456485669234603486104543266482133936072602491412737245870066063155881748815209209628292540917153643678925903600113305305488204665213841469519415116094330572703657595919530921861173819326117931051185480744623799627495673518857527248912279381830119491298336733624406566430860213949463952247371907021798609437027705392171762931767523846748184676694051320005681271452635608277857713427577896091736371787214684409012249534301465495853710507922796892589235420199561121290219608640344181598136297747713099605187072113499999983729780499510597317328160963185950244594553469083026425223082533446850352619311881710100031378387528865875332083814206171776691473035982534904287554687311595628638823537875937519577818577805321712268066130019278766111959092164201989380952572010654858632789',


    // The initial configuration properties of the Decimal constructor.
    DEFAULTS = {

      // These values must be integers within the stated ranges (inclusive).
      // Most of these values can be changed at run-time using the `Decimal.config` method.

      // The maximum number of significant digits of the result of a calculation or base conversion.
      // E.g. `Decimal.config({ precision: 20 });`
      precision: 20,                         // 1 to MAX_DIGITS

      // The rounding mode used when rounding to `precision`.
      //
      // ROUND_UP         0 Away from zero.
      // ROUND_DOWN       1 Towards zero.
      // ROUND_CEIL       2 Towards +Infinity.
      // ROUND_FLOOR      3 Towards -Infinity.
      // ROUND_HALF_UP    4 Towards nearest neighbour. If equidistant, up.
      // ROUND_HALF_DOWN  5 Towards nearest neighbour. If equidistant, down.
      // ROUND_HALF_EVEN  6 Towards nearest neighbour. If equidistant, towards even neighbour.
      // ROUND_HALF_CEIL  7 Towards nearest neighbour. If equidistant, towards +Infinity.
      // ROUND_HALF_FLOOR 8 Towards nearest neighbour. If equidistant, towards -Infinity.
      //
      // E.g.
      // `Decimal.rounding = 4;`
      // `Decimal.rounding = Decimal.ROUND_HALF_UP;`
      rounding: 4,                           // 0 to 8

      // The modulo mode used when calculating the modulus: a mod n.
      // The quotient (q = a / n) is calculated according to the corresponding rounding mode.
      // The remainder (r) is calculated as: r = a - n * q.
      //
      // UP         0 The remainder is positive if the dividend is negative, else is negative.
      // DOWN       1 The remainder has the same sign as the dividend (JavaScript %).
      // FLOOR      3 The remainder has the same sign as the divisor (Python %).
      // HALF_EVEN  6 The IEEE 754 remainder function.
      // EUCLID     9 Euclidian division. q = sign(n) * floor(a / abs(n)). Always positive.
      //
      // Truncated division (1), floored division (3), the IEEE 754 remainder (6), and Euclidian
      // division (9) are commonly used for the modulus operation. The other rounding modes can also
      // be used, but they may not give useful results.
      modulo: 1,                             // 0 to 9

      // The exponent value at and beneath which `toString` returns exponential notation.
      // JavaScript numbers: -7
      toExpNeg: -7,                          // 0 to -EXP_LIMIT

      // The exponent value at and above which `toString` returns exponential notation.
      // JavaScript numbers: 21
      toExpPos:  21,                         // 0 to EXP_LIMIT

      // The minimum exponent value, beneath which underflow to zero occurs.
      // JavaScript numbers: -324  (5e-324)
      minE: -EXP_LIMIT,                      // -1 to -EXP_LIMIT

      // The maximum exponent value, above which overflow to Infinity occurs.
      // JavaScript numbers: 308  (1.7976931348623157e+308)
      maxE: EXP_LIMIT,                       // 1 to EXP_LIMIT

      // Whether to use cryptographically-secure random number generation, if available.
      crypto: false                          // true/false
    },


  // ----------------------------------- END OF EDITABLE DEFAULTS ------------------------------- //


    Decimal, inexact, noConflict, quadrant,
    external = true,

    decimalError = '[DecimalError] ',
    invalidArgument = decimalError + 'Invalid argument: ',
    precisionLimitExceeded = decimalError + 'Precision limit exceeded',
    cryptoUnavailable = decimalError + 'crypto unavailable',

    mathfloor = Math.floor,
    mathpow = Math.pow,

    isBinary = /^0b([01]+(\.[01]*)?|\.[01]+)(p[+-]?\d+)?$/i,
    isHex = /^0x([0-9a-f]+(\.[0-9a-f]*)?|\.[0-9a-f]+)(p[+-]?\d+)?$/i,
    isOctal = /^0o([0-7]+(\.[0-7]*)?|\.[0-7]+)(p[+-]?\d+)?$/i,
    isDecimal = /^(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i,

    BASE = 1e7,
    LOG_BASE = 7,
    MAX_SAFE_INTEGER = 9007199254740991,

    LN10_PRECISION = LN10.length - 1,
    PI_PRECISION = PI.length - 1,

    // Decimal.prototype object
    P = { name: '[object Decimal]' };


  // Decimal prototype methods


  /*
   *  absoluteValue             abs
   *  ceil
   *  comparedTo                cmp
   *  cosine                    cos
   *  cubeRoot                  cbrt
   *  decimalPlaces             dp
   *  dividedBy                 div
   *  dividedToIntegerBy        divToInt
   *  equals                    eq
   *  floor
   *  greaterThan               gt
   *  greaterThanOrEqualTo      gte
   *  hyperbolicCosine          cosh
   *  hyperbolicSine            sinh
   *  hyperbolicTangent         tanh
   *  inverseCosine             acos
   *  inverseHyperbolicCosine   acosh
   *  inverseHyperbolicSine     asinh
   *  inverseHyperbolicTangent  atanh
   *  inverseSine               asin
   *  inverseTangent            atan
   *  isFinite
   *  isInteger                 isInt
   *  isNaN
   *  isNegative                isNeg
   *  isPositive                isPos
   *  isZero
   *  lessThan                  lt
   *  lessThanOrEqualTo         lte
   *  logarithm                 log
   *  [maximum]                 [max]
   *  [minimum]                 [min]
   *  minus                     sub
   *  modulo                    mod
   *  naturalExponential        exp
   *  naturalLogarithm          ln
   *  negated                   neg
   *  plus                      add
   *  precision                 sd
   *  round
   *  sine                      sin
   *  squareRoot                sqrt
   *  tangent                   tan
   *  times                     mul
   *  toBinary
   *  toDecimalPlaces           toDP
   *  toExponential
   *  toFixed
   *  toFraction
   *  toHexadecimal             toHex
   *  toNearest
   *  toNumber
   *  toOctal
   *  toPower                   pow
   *  toPrecision
   *  toSignificantDigits       toSD
   *  toString
   *  truncated                 trunc
   *  valueOf                   toJSON
   */


  /*
   * Return a new Decimal whose value is the absolute value of this Decimal.
   *
   */
  P.absoluteValue = P.abs = function () {
    var x = new this.constructor(this);
    if (x.s < 0) x.s = 1;
    return finalise(x);
  };


  /*
   * Return a new Decimal whose value is the value of this Decimal rounded to a whole number in the
   * direction of positive Infinity.
   *
   */
  P.ceil = function () {
    return finalise(new this.constructor(this), this.e + 1, 2);
  };


  /*
   * Return
   *   1    if the value of this Decimal is greater than the value of `y`,
   *  -1    if the value of this Decimal is less than the value of `y`,
   *   0    if they have the same value,
   *   NaN  if the value of either Decimal is NaN.
   *
   */
  P.comparedTo = P.cmp = function (y) {
    var i, j, xdL, ydL,
      x = this,
      xd = x.d,
      yd = (y = new x.constructor(y)).d,
      xs = x.s,
      ys = y.s;

    // Either NaN or ±Infinity?
    if (!xd || !yd) {
      return !xs || !ys ? NaN : xs !== ys ? xs : xd === yd ? 0 : !xd ^ xs < 0 ? 1 : -1;
    }

    // Either zero?
    if (!xd[0] || !yd[0]) return xd[0] ? xs : yd[0] ? -ys : 0;

    // Signs differ?
    if (xs !== ys) return xs;

    // Compare exponents.
    if (x.e !== y.e) return x.e > y.e ^ xs < 0 ? 1 : -1;

    xdL = xd.length;
    ydL = yd.length;

    // Compare digit by digit.
    for (i = 0, j = xdL < ydL ? xdL : ydL; i < j; ++i) {
      if (xd[i] !== yd[i]) return xd[i] > yd[i] ^ xs < 0 ? 1 : -1;
    }

    // Compare lengths.
    return xdL === ydL ? 0 : xdL > ydL ^ xs < 0 ? 1 : -1;
  };


  /*
   * Return a new Decimal whose value is the cosine of the value in radians of this Decimal.
   *
   * Domain: [-Infinity, Infinity]
   * Range: [-1, 1]
   *
   * cos(0)         = 1
   * cos(-0)        = 1
   * cos(Infinity)  = NaN
   * cos(-Infinity) = NaN
   * cos(NaN)       = NaN
   *
   */
  P.cosine = P.cos = function () {
    var pr, rm,
      x = this,
      Ctor = x.constructor;

    if (!x.d) return new Ctor(NaN);

    // cos(0) = cos(-0) = 1
    if (!x.d[0]) return new Ctor(1);

    pr = Ctor.precision;
    rm = Ctor.rounding;
    Ctor.precision = pr + Math.max(x.e, x.sd()) + LOG_BASE;
    Ctor.rounding = 1;

    x = cosine(Ctor, toLessThanHalfPi(Ctor, x));

    Ctor.precision = pr;
    Ctor.rounding = rm;

    return finalise(quadrant == 2 || quadrant == 3 ? x.neg() : x, pr, rm, true);
  };


  /*
   *
   * Return a new Decimal whose value is the cube root of the value of this Decimal, rounded to
   * `precision` significant digits using rounding mode `rounding`.
   *
   *  cbrt(0)  =  0
   *  cbrt(-0) = -0
   *  cbrt(1)  =  1
   *  cbrt(-1) = -1
   *  cbrt(N)  =  N
   *  cbrt(-I) = -I
   *  cbrt(I)  =  I
   *
   * Math.cbrt(x) = (x < 0 ? -Math.pow(-x, 1/3) : Math.pow(x, 1/3))
   *
   */
  P.cubeRoot = P.cbrt = function () {
    var e, m, n, r, rep, s, sd, t, t3, t3plusx,
      x = this,
      Ctor = x.constructor;

    if (!x.isFinite() || x.isZero()) return new Ctor(x);
    external = false;

    // Initial estimate.
    s = x.s * mathpow(x.s * x, 1 / 3);

     // Math.cbrt underflow/overflow?
     // Pass x to Math.pow as integer, then adjust the exponent of the result.
    if (!s || Math.abs(s) == 1 / 0) {
      n = digitsToString(x.d);
      e = x.e;

      // Adjust n exponent so it is a multiple of 3 away from x exponent.
      if (s = (e - n.length + 1) % 3) n += (s == 1 || s == -2 ? '0' : '00');
      s = mathpow(n, 1 / 3);

      // Rarely, e may be one less than the result exponent value.
      e = mathfloor((e + 1) / 3) - (e % 3 == (e < 0 ? -1 : 2));

      if (s == 1 / 0) {
        n = '5e' + e;
      } else {
        n = s.toExponential();
        n = n.slice(0, n.indexOf('e') + 1) + e;
      }

      r = new Ctor(n);
      r.s = x.s;
    } else {
      r = new Ctor(s.toString());
    }

    sd = (e = Ctor.precision) + 3;

    // Halley's method.
    // TODO? Compare Newton's method.
    for (;;) {
      t = r;
      t3 = t.times(t).times(t);
      t3plusx = t3.plus(x);
      r = divide(t3plusx.plus(x).times(t), t3plusx.plus(t3), sd + 2, 1);

      // TODO? Replace with for-loop and checkRoundingDigits.
      if (digitsToString(t.d).slice(0, sd) === (n = digitsToString(r.d)).slice(0, sd)) {
        n = n.slice(sd - 3, sd + 1);

        // The 4th rounding digit may be in error by -1 so if the 4 rounding digits are 9999 or 4999
        // , i.e. approaching a rounding boundary, continue the iteration.
        if (n == '9999' || !rep && n == '4999') {

          // On the first iteration only, check to see if rounding up gives the exact result as the
          // nines may infinitely repeat.
          if (!rep) {
            finalise(t, e + 1, 0);

            if (t.times(t).times(t).eq(x)) {
              r = t;
              break;
            }
          }

          sd += 4;
          rep = 1;
        } else {

          // If the rounding digits are null, 0{0,4} or 50{0,3}, check for an exact result.
          // If not, then there are further digits and m will be truthy.
          if (!+n || !+n.slice(1) && n.charAt(0) == '5') {

            // Truncate to the first rounding digit.
            finalise(r, e + 1, 1);
            m = !r.times(r).times(r).eq(x);
          }

          break;
        }
      }
    }

    external = true;

    return finalise(r, e, Ctor.rounding, m);
  };


  /*
   * Return the number of decimal places of the value of this Decimal.
   *
   */
  P.decimalPlaces = P.dp = function () {
    var w,
      d = this.d,
      n = NaN;

    if (d) {
      w = d.length - 1;
      n = (w - mathfloor(this.e / LOG_BASE)) * LOG_BASE;

      // Subtract the number of trailing zeros of the last word.
      w = d[w];
      if (w) for (; w % 10 == 0; w /= 10) n--;
      if (n < 0) n = 0;
    }

    return n;
  };


  /*
   *  n / 0 = I
   *  n / N = N
   *  n / I = 0
   *  0 / n = 0
   *  0 / 0 = N
   *  0 / N = N
   *  0 / I = 0
   *  N / n = N
   *  N / 0 = N
   *  N / N = N
   *  N / I = N
   *  I / n = I
   *  I / 0 = I
   *  I / N = N
   *  I / I = N
   *
   * Return a new Decimal whose value is the value of this Decimal divided by `y`, rounded to
   * `precision` significant digits using rounding mode `rounding`.
   *
   */
  P.dividedBy = P.div = function (y) {
    return divide(this, new this.constructor(y));
  };


  /*
   * Return a new Decimal whose value is the integer part of dividing the value of this Decimal
   * by the value of `y`, rounded to `precision` significant digits using rounding mode `rounding`.
   *
   */
  P.dividedToIntegerBy = P.divToInt = function (y) {
    var x = this,
      Ctor = x.constructor;
    return finalise(divide(x, new Ctor(y), 0, 1, 1), Ctor.precision, Ctor.rounding);
  };


  /*
   * Return true if the value of this Decimal is equal to the value of `y`, otherwise return false.
   *
   */
  P.equals = P.eq = function (y) {
    return this.cmp(y) === 0;
  };


  /*
   * Return a new Decimal whose value is the value of this Decimal rounded to a whole number in the
   * direction of negative Infinity.
   *
   */
  P.floor = function () {
    return finalise(new this.constructor(this), this.e + 1, 3);
  };


  /*
   * Return true if the value of this Decimal is greater than the value of `y`, otherwise return
   * false.
   *
   */
  P.greaterThan = P.gt = function (y) {
    return this.cmp(y) > 0;
  };


  /*
   * Return true if the value of this Decimal is greater than or equal to the value of `y`,
   * otherwise return false.
   *
   */
  P.greaterThanOrEqualTo = P.gte = function (y) {
    var k = this.cmp(y);
    return k == 1 || k === 0;
  };


  /*
   * Return a new Decimal whose value is the hyperbolic cosine of the value in radians of this
   * Decimal.
   *
   * Domain: [-Infinity, Infinity]
   * Range: [1, Infinity]
   *
   * cosh(x) = 1 + x^2/2! + x^4/4! + x^6/6! + ...
   *
   * cosh(0)         = 1
   * cosh(-0)        = 1
   * cosh(Infinity)  = Infinity
   * cosh(-Infinity) = Infinity
   * cosh(NaN)       = NaN
   *
   *  x        time taken (ms)   result
   * 1000      9                 9.8503555700852349694e+433
   * 10000     25                4.4034091128314607936e+4342
   * 100000    171               1.4033316802130615897e+43429
   * 1000000   3817              1.5166076984010437725e+434294
   * 10000000  abandoned after 2 minute wait
   *
   * TODO? Compare performance of cosh(x) = 0.5 * (exp(x) + exp(-x))
   *
   */
  P.hyperbolicCosine = P.cosh = function () {
    var k, n, pr, rm, len,
      x = this,
      Ctor = x.constructor,
      one = new Ctor(1);

    if (!x.isFinite()) return new Ctor(x.s ? 1 / 0 : NaN);
    if (x.isZero()) return one;

    pr = Ctor.precision;
    rm = Ctor.rounding;
    Ctor.precision = pr + Math.max(x.e, x.sd()) + 4;
    Ctor.rounding = 1;
    len = x.d.length;

    // Argument reduction: cos(4x) = 1 - 8cos^2(x) + 8cos^4(x) + 1
    // i.e. cos(x) = 1 - cos^2(x/4)(8 - 8cos^2(x/4))

    // Estimate the optimum number of times to use the argument reduction.
    // TODO? Estimation reused from cosine() and may not be optimal here.
    if (len < 32) {
      k = Math.ceil(len / 3);
      n = (1 / tinyPow(4, k)).toString();
    } else {
      k = 16;
      n = '2.3283064365386962890625e-10';
    }

    x = taylorSeries(Ctor, 1, x.times(n), new Ctor(1), true);

    // Reverse argument reduction
    var cosh2_x,
      i = k,
      d8 = new Ctor(8);
    for (; i--;) {
      cosh2_x = x.times(x);
      x = one.minus(cosh2_x.times(d8.minus(cosh2_x.times(d8))));
    }

    return finalise(x, Ctor.precision = pr, Ctor.rounding = rm, true);
  };


  /*
   * Return a new Decimal whose value is the hyperbolic sine of the value in radians of this
   * Decimal.
   *
   * Domain: [-Infinity, Infinity]
   * Range: [-Infinity, Infinity]
   *
   * sinh(x) = x + x^3/3! + x^5/5! + x^7/7! + ...
   *
   * sinh(0)         = 0
   * sinh(-0)        = -0
   * sinh(Infinity)  = Infinity
   * sinh(-Infinity) = -Infinity
   * sinh(NaN)       = NaN
   *
   * x        time taken (ms)
   * 10       2 ms
   * 100      5 ms
   * 1000     14 ms
   * 10000    82 ms
   * 100000   886 ms            1.4033316802130615897e+43429
   * 200000   2613 ms
   * 300000   5407 ms
   * 400000   8824 ms
   * 500000   13026 ms          8.7080643612718084129e+217146
   * 1000000  48543 ms
   *
   * TODO? Compare performance of sinh(x) = 0.5 * (exp(x) - exp(-x))
   *
   */
  P.hyperbolicSine = P.sinh = function () {
    var k, pr, rm, len,
      x = this,
      Ctor = x.constructor;

    if (!x.isFinite() || x.isZero()) return new Ctor(x);

    pr = Ctor.precision;
    rm = Ctor.rounding;
    Ctor.precision = pr + Math.max(x.e, x.sd()) + 4;
    Ctor.rounding = 1;
    len = x.d.length;

    if (len < 3) {
      x = taylorSeries(Ctor, 2, x, x, true);
    } else {

      // Alternative argument reduction: sinh(3x) = sinh(x)(3 + 4sinh^2(x))
      // i.e. sinh(x) = sinh(x/3)(3 + 4sinh^2(x/3))
      // 3 multiplications and 1 addition

      // Argument reduction: sinh(5x) = sinh(x)(5 + sinh^2(x)(20 + 16sinh^2(x)))
      // i.e. sinh(x) = sinh(x/5)(5 + sinh^2(x/5)(20 + 16sinh^2(x/5)))
      // 4 multiplications and 2 additions

      // Estimate the optimum number of times to use the argument reduction.
      k = 1.4 * Math.sqrt(len);
      k = k > 16 ? 16 : k | 0;

      x = x.times(1 / tinyPow(5, k));
      x = taylorSeries(Ctor, 2, x, x, true);

      // Reverse argument reduction
      var sinh2_x,
        d5 = new Ctor(5),
        d16 = new Ctor(16),
        d20 = new Ctor(20);
      for (; k--;) {
        sinh2_x = x.times(x);
        x = x.times(d5.plus(sinh2_x.times(d16.times(sinh2_x).plus(d20))));
      }
    }

    Ctor.precision = pr;
    Ctor.rounding = rm;

    return finalise(x, pr, rm, true);
  };


  /*
   * Return a new Decimal whose value is the hyperbolic tangent of the value in radians of this
   * Decimal.
   *
   * Domain: [-Infinity, Infinity]
   * Range: [-1, 1]
   *
   * tanh(x) = sinh(x) / cosh(x)
   *
   * tanh(0)         = 0
   * tanh(-0)        = -0
   * tanh(Infinity)  = 1
   * tanh(-Infinity) = -1
   * tanh(NaN)       = NaN
   *
   */
  P.hyperbolicTangent = P.tanh = function () {
    var pr, rm,
      x = this,
      Ctor = x.constructor;

    if (!x.isFinite()) return new Ctor(x.s);
    if (x.isZero()) return new Ctor(x);

    pr = Ctor.precision;
    rm = Ctor.rounding;
    Ctor.precision = pr + 7;
    Ctor.rounding = 1;

    return divide(x.sinh(), x.cosh(), Ctor.precision = pr, Ctor.rounding = rm);
  };


  /*
   * Return a new Decimal whose value is the arccosine (inverse cosine) in radians of the value of
   * this Decimal.
   *
   * Domain: [-1, 1]
   * Range: [0, pi]
   *
   * acos(x) = pi/2 - asin(x)
   *
   * acos(0)       = pi/2
   * acos(-0)      = pi/2
   * acos(1)       = 0
   * acos(-1)      = pi
   * acos(1/2)     = pi/3
   * acos(-1/2)    = 2*pi/3
   * acos(|x| > 1) = NaN
   * acos(NaN)     = NaN
   *
   */
  P.inverseCosine = P.acos = function () {
    var halfPi,
      x = this,
      Ctor = x.constructor,
      k = x.abs().cmp(1),
      pr = Ctor.precision,
      rm = Ctor.rounding;

    if (k !== -1) {
      return k === 0
        // |x| is 1
        ? x.isNeg() ? getPi(Ctor, pr, rm) : new Ctor(0)
        // |x| > 1 or x is NaN
        : new Ctor(NaN);
    }

    if (x.isZero()) return getPi(Ctor, pr + 4, rm).times(0.5);

    // TODO? Special case acos(0.5) = pi/3 and acos(-0.5) = 2*pi/3

    Ctor.precision = pr + 6;
    Ctor.rounding = 1;

    x = x.asin();
    halfPi = getPi(Ctor, pr + 4, rm).times(0.5);

    Ctor.precision = pr;
    Ctor.rounding = rm;

    return halfPi.minus(x);
  };


  /*
   * Return a new Decimal whose value is the inverse of the hyperbolic cosine in radians of the
   * value of this Decimal.
   *
   * Domain: [1, Infinity]
   * Range: [0, Infinity]
   *
   * acosh(x) = ln(x + sqrt(x^2 - 1))
   *
   * acosh(x < 1)     = NaN
   * acosh(NaN)       = NaN
   * acosh(Infinity)  = Infinity
   * acosh(-Infinity) = NaN
   * acosh(0)         = NaN
   * acosh(-0)        = NaN
   * acosh(1)         = 0
   * acosh(-1)        = NaN
   *
   */
  P.inverseHyperbolicCosine = P.acosh = function () {
    var pr, rm,
      x = this,
      Ctor = x.constructor;

    if (x.lte(1)) return new Ctor(x.eq(1) ? 0 : NaN);
    if (!x.isFinite()) return new Ctor(x);

    pr = Ctor.precision;
    rm = Ctor.rounding;
    Ctor.precision = pr + Math.max(Math.abs(x.e), x.sd()) + 4;
    Ctor.rounding = 1;
    external = false;

    x = x.times(x).minus(1).sqrt().plus(x);

    external = true;
    Ctor.precision = pr;
    Ctor.rounding = rm;

    return x.ln();
  };


  /*
   * Return a new Decimal whose value is the inverse of the hyperbolic sine in radians of the value
   * of this Decimal.
   *
   * Domain: [-Infinity, Infinity]
   * Range: [-Infinity, Infinity]
   *
   * asinh(x) = ln(x + sqrt(x^2 + 1))
   *
   * asinh(NaN)       = NaN
   * asinh(Infinity)  = Infinity
   * asinh(-Infinity) = -Infinity
   * asinh(0)         = 0
   * asinh(-0)        = -0
   *
   */
  P.inverseHyperbolicSine = P.asinh = function () {
    var pr, rm,
      x = this,
      Ctor = x.constructor;

    if (!x.isFinite() || x.isZero()) return new Ctor(x);

    pr = Ctor.precision;
    rm = Ctor.rounding;
    Ctor.precision = pr + 2 * Math.max(Math.abs(x.e), x.sd()) + 6;
    Ctor.rounding = 1;
    external = false;

    x = x.times(x).plus(1).sqrt().plus(x);

    external = true;
    Ctor.precision = pr;
    Ctor.rounding = rm;

    return x.ln();
  };


  /*
   * Return a new Decimal whose value is the inverse of the hyperbolic tangent in radians of the
   * value of this Decimal.
   *
   * Domain: [-1, 1]
   * Range: [-Infinity, Infinity]
   *
   * atanh(x) = 0.5 * ln((1 + x) / (1 - x))
   *
   * atanh(|x| > 1)   = NaN
   * atanh(NaN)       = NaN
   * atanh(Infinity)  = NaN
   * atanh(-Infinity) = NaN
   * atanh(0)         = 0
   * atanh(-0)        = -0
   * atanh(1)         = Infinity
   * atanh(-1)        = -Infinity
   *
   */
  P.inverseHyperbolicTangent = P.atanh = function () {
    var pr, rm, wpr, xsd,
      x = this,
      Ctor = x.constructor;

    if (!x.isFinite()) return new Ctor(NaN);
    if (x.e >= 0) return new Ctor(x.abs().eq(1) ? x.s / 0 : x.isZero() ? x : NaN);

    pr = Ctor.precision;
    rm = Ctor.rounding;
    xsd = x.sd();

    if (Math.max(xsd, pr) < 2 * -x.e - 1) return finalise(new Ctor(x), pr, rm, true);

    Ctor.precision = wpr = xsd - x.e;

    x = divide(x.plus(1), new Ctor(1).minus(x), wpr + pr, 1);

    Ctor.precision = pr + 4;
    Ctor.rounding = 1;

    x = x.ln();

    Ctor.precision = pr;
    Ctor.rounding = rm;

    return x.times(0.5);
  };


  /*
   * Return a new Decimal whose value is the arcsine (inverse sine) in radians of the value of this
   * Decimal.
   *
   * Domain: [-Infinity, Infinity]
   * Range: [-pi/2, pi/2]
   *
   * asin(x) = 2*atan(x/(1 + sqrt(1 - x^2)))
   *
   * asin(0)       = 0
   * asin(-0)      = -0
   * asin(1/2)     = pi/6
   * asin(-1/2)    = -pi/6
   * asin(1)       = pi/2
   * asin(-1)      = -pi/2
   * asin(|x| > 1) = NaN
   * asin(NaN)     = NaN
   *
   * TODO? Compare performance of Taylor series.
   *
   */
  P.inverseSine = P.asin = function () {
    var halfPi, k,
      pr, rm,
      x = this,
      Ctor = x.constructor;

    if (x.isZero()) return new Ctor(x);

    k = x.abs().cmp(1);
    pr = Ctor.precision;
    rm = Ctor.rounding;

    if (k !== -1) {

      // |x| is 1
      if (k === 0) {
        halfPi = getPi(Ctor, pr + 4, rm).times(0.5);
        halfPi.s = x.s;
        return halfPi;
      }

      // |x| > 1 or x is NaN
      return new Ctor(NaN);
    }

    // TODO? Special case asin(1/2) = pi/6 and asin(-1/2) = -pi/6

    Ctor.precision = pr + 6;
    Ctor.rounding = 1;

    x = x.div(new Ctor(1).minus(x.times(x)).sqrt().plus(1)).atan();

    Ctor.precision = pr;
    Ctor.rounding = rm;

    return x.times(2);
  };


  /*
   * Return a new Decimal whose value is the arctangent (inverse tangent) in radians of the value
   * of this Decimal.
   *
   * Domain: [-Infinity, Infinity]
   * Range: [-pi/2, pi/2]
   *
   * atan(x) = x - x^3/3 + x^5/5 - x^7/7 + ...
   *
   * atan(0)         = 0
   * atan(-0)        = -0
   * atan(1)         = pi/4
   * atan(-1)        = -pi/4
   * atan(Infinity)  = pi/2
   * atan(-Infinity) = -pi/2
   * atan(NaN)       = NaN
   *
   */
  P.inverseTangent = P.atan = function () {
    var i, j, k, n, px, t, r, wpr, x2,
      x = this,
      Ctor = x.constructor,
      pr = Ctor.precision,
      rm = Ctor.rounding;

    if (!x.isFinite()) {
      if (!x.s) return new Ctor(NaN);
      if (pr + 4 <= PI_PRECISION) {
        r = getPi(Ctor, pr + 4, rm).times(0.5);
        r.s = x.s;
        return r;
      }
    } else if (x.isZero()) {
      return new Ctor(x);
    } else if (x.abs().eq(1) && pr + 4 <= PI_PRECISION) {
      r = getPi(Ctor, pr + 4, rm).times(0.25);
      r.s = x.s;
      return r;
    }

    Ctor.precision = wpr = pr + 10;
    Ctor.rounding = 1;

    // TODO? if (x >= 1 && pr <= PI_PRECISION) atan(x) = halfPi * x.s - atan(1 / x);

    // Argument reduction
    // Ensure |x| < 0.42
    // atan(x) = 2 * atan(x / (1 + sqrt(1 + x^2)))

    k = Math.min(28, wpr / LOG_BASE + 2 | 0);

    for (i = k; i; --i) x = x.div(x.times(x).plus(1).sqrt().plus(1));

    external = false;

    j = Math.ceil(wpr / LOG_BASE);
    n = 1;
    x2 = x.times(x);
    r = new Ctor(x);
    px = x;

    // atan(x) = x - x^3/3 + x^5/5 - x^7/7 + ...
    for (; i !== -1;) {
      px = px.times(x2);
      t = r.minus(px.div(n += 2));

      px = px.times(x2);
      r = t.plus(px.div(n += 2));

      if (r.d[j] !== void 0) for (i = j; r.d[i] === t.d[i] && i--;);
    }

    if (k) r = r.times(2 << (k - 1));

    external = true;

    return finalise(r, Ctor.precision = pr, Ctor.rounding = rm, true);
  };


  /*
   * Return true if the value of this Decimal is a finite number, otherwise return false.
   *
   */
  P.isFinite = function () {
    return !!this.d;
  };


  /*
   * Return true if the value of this Decimal is an integer, otherwise return false.
   *
   */
  P.isInteger = P.isInt = function () {
    return !!this.d && mathfloor(this.e / LOG_BASE) > this.d.length - 2;
  };


  /*
   * Return true if the value of this Decimal is NaN, otherwise return false.
   *
   */
  P.isNaN = function () {
    return !this.s;
  };


  /*
   * Return true if the value of this Decimal is negative, otherwise return false.
   *
   */
  P.isNegative = P.isNeg = function () {
    return this.s < 0;
  };


  /*
   * Return true if the value of this Decimal is positive, otherwise return false.
   *
   */
  P.isPositive = P.isPos = function () {
    return this.s > 0;
  };


  /*
   * Return true if the value of this Decimal is 0 or -0, otherwise return false.
   *
   */
  P.isZero = function () {
    return !!this.d && this.d[0] === 0;
  };


  /*
   * Return true if the value of this Decimal is less than `y`, otherwise return false.
   *
   */
  P.lessThan = P.lt = function (y) {
    return this.cmp(y) < 0;
  };


  /*
   * Return true if the value of this Decimal is less than or equal to `y`, otherwise return false.
   *
   */
  P.lessThanOrEqualTo = P.lte = function (y) {
    return this.cmp(y) < 1;
  };


  /*
   * Return the logarithm of the value of this Decimal to the specified base, rounded to `precision`
   * significant digits using rounding mode `rounding`.
   *
   * If no base is specified, return log[10](arg).
   *
   * log[base](arg) = ln(arg) / ln(base)
   *
   * The result will always be correctly rounded if the base of the log is 10, and 'almost always'
   * otherwise:
   *
   * Depending on the rounding mode, the result may be incorrectly rounded if the first fifteen
   * rounding digits are [49]99999999999999 or [50]00000000000000. In that case, the maximum error
   * between the result and the correctly rounded result will be one ulp (unit in the last place).
   *
   * log[-b](a)       = NaN
   * log[0](a)        = NaN
   * log[1](a)        = NaN
   * log[NaN](a)      = NaN
   * log[Infinity](a) = NaN
   * log[b](0)        = -Infinity
   * log[b](-0)       = -Infinity
   * log[b](-a)       = NaN
   * log[b](1)        = 0
   * log[b](Infinity) = Infinity
   * log[b](NaN)      = NaN
   *
   * [base] {number|string|Decimal} The base of the logarithm.
   *
   */
  P.logarithm = P.log = function (base) {
    var isBase10, d, denominator, k, inf, num, sd, r,
      arg = this,
      Ctor = arg.constructor,
      pr = Ctor.precision,
      rm = Ctor.rounding,
      guard = 5;

    // Default base is 10.
    if (base == null) {
      base = new Ctor(10);
      isBase10 = true;
    } else {
      base = new Ctor(base);
      d = base.d;

      // Return NaN if base is negative, or non-finite, or is 0 or 1.
      if (base.s < 0 || !d || !d[0] || base.eq(1)) return new Ctor(NaN);

      isBase10 = base.eq(10);
    }

    d = arg.d;

    // Is arg negative, non-finite, 0 or 1?
    if (arg.s < 0 || !d || !d[0] || arg.eq(1)) {
      return new Ctor(d && !d[0] ? -1 / 0 : arg.s != 1 ? NaN : d ? 0 : 1 / 0);
    }

    // The result will have a non-terminating decimal expansion if base is 10 and arg is not an
    // integer power of 10.
    if (isBase10) {
      if (d.length > 1) {
        inf = true;
      } else {
        for (k = d[0]; k % 10 === 0;) k /= 10;
        inf = k !== 1;
      }
    }

    external = false;
    sd = pr + guard;
    num = naturalLogarithm(arg, sd);
    denominator = isBase10 ? getLn10(Ctor, sd + 10) : naturalLogarithm(base, sd);

    // The result will have 5 rounding digits.
    r = divide(num, denominator, sd, 1);

    // If at a rounding boundary, i.e. the result's rounding digits are [49]9999 or [50]0000,
    // calculate 10 further digits.
    //
    // If the result is known to have an infinite decimal expansion, repeat this until it is clear
    // that the result is above or below the boundary. Otherwise, if after calculating the 10
    // further digits, the last 14 are nines, round up and assume the result is exact.
    // Also assume the result is exact if the last 14 are zero.
    //
    // Example of a result that will be incorrectly rounded:
    // log[1048576](4503599627370502) = 2.60000000000000009610279511444746...
    // The above result correctly rounded using ROUND_CEIL to 1 decimal place should be 2.7, but it
    // will be given as 2.6 as there are 15 zeros immediately after the requested decimal place, so
    // the exact result would be assumed to be 2.6, which rounded using ROUND_CEIL to 1 decimal
    // place is still 2.6.
    if (checkRoundingDigits(r.d, k = pr, rm)) {

      do {
        sd += 10;
        num = naturalLogarithm(arg, sd);
        denominator = isBase10 ? getLn10(Ctor, sd + 10) : naturalLogarithm(base, sd);
        r = divide(num, denominator, sd, 1);

        if (!inf) {

          // Check for 14 nines from the 2nd rounding digit, as the first may be 4.
          if (+digitsToString(r.d).slice(k + 1, k + 15) + 1 == 1e14) {
            r = finalise(r, pr + 1, 0);
          }

          break;
        }
      } while (checkRoundingDigits(r.d, k += 10, rm));
    }

    external = true;

    return finalise(r, pr, rm);
  };


  /*
   * Return a new Decimal whose value is the maximum of the arguments and the value of this Decimal.
   *
   * arguments {number|string|Decimal}
   *
  P.max = function () {
    Array.prototype.push.call(arguments, this);
    return maxOrMin(this.constructor, arguments, 'lt');
  };
   */


  /*
   * Return a new Decimal whose value is the minimum of the arguments and the value of this Decimal.
   *
   * arguments {number|string|Decimal}
   *
  P.min = function () {
    Array.prototype.push.call(arguments, this);
    return maxOrMin(this.constructor, arguments, 'gt');
  };
   */


  /*
   *  n - 0 = n
   *  n - N = N
   *  n - I = -I
   *  0 - n = -n
   *  0 - 0 = 0
   *  0 - N = N
   *  0 - I = -I
   *  N - n = N
   *  N - 0 = N
   *  N - N = N
   *  N - I = N
   *  I - n = I
   *  I - 0 = I
   *  I - N = N
   *  I - I = N
   *
   * Return a new Decimal whose value is the value of this Decimal minus `y`, rounded to `precision`
   * significant digits using rounding mode `rounding`.
   *
   */
  P.minus = P.sub = function (y) {
    var d, e, i, j, k, len, pr, rm, xd, xe, xLTy, yd,
      x = this,
      Ctor = x.constructor;

    y = new Ctor(y);

    // If either is not finite...
    if (!x.d || !y.d) {

      // Return NaN if either is NaN.
      if (!x.s || !y.s) y = new Ctor(NaN);

      // Return y negated if x is finite and y is ±Infinity.
      else if (x.d) y.s = -y.s;

      // Return x if y is finite and x is ±Infinity.
      // Return x if both are ±Infinity with different signs.
      // Return NaN if both are ±Infinity with the same sign.
      else y = new Ctor(y.d || x.s !== y.s ? x : NaN);

      return y;
    }

    // If signs differ...
    if (x.s != y.s) {
      y.s = -y.s;
      return x.plus(y);
    }

    xd = x.d;
    yd = y.d;
    pr = Ctor.precision;
    rm = Ctor.rounding;

    // If either is zero...
    if (!xd[0] || !yd[0]) {

      // Return y negated if x is zero and y is non-zero.
      if (yd[0]) y.s = -y.s;

      // Return x if y is zero and x is non-zero.
      else if (xd[0]) y = new Ctor(x);

      // Return zero if both are zero.
      // From IEEE 754 (2008) 6.3: 0 - 0 = -0 - -0 = -0 when rounding to -Infinity.
      else return new Ctor(rm === 3 ? -0 : 0);

      return external ? finalise(y, pr, rm) : y;
    }

    // x and y are finite, non-zero numbers with the same sign.

    // Calculate base 1e7 exponents.
    e = mathfloor(y.e / LOG_BASE);
    xe = mathfloor(x.e / LOG_BASE);

    xd = xd.slice();
    k = xe - e;

    // If base 1e7 exponents differ...
    if (k) {
      xLTy = k < 0;

      if (xLTy) {
        d = xd;
        k = -k;
        len = yd.length;
      } else {
        d = yd;
        e = xe;
        len = xd.length;
      }

      // Numbers with massively different exponents would result in a very high number of
      // zeros needing to be prepended, but this can be avoided while still ensuring correct
      // rounding by limiting the number of zeros to `Math.ceil(pr / LOG_BASE) + 2`.
      i = Math.max(Math.ceil(pr / LOG_BASE), len) + 2;

      if (k > i) {
        k = i;
        d.length = 1;
      }

      // Prepend zeros to equalise exponents.
      d.reverse();
      for (i = k; i--;) d.push(0);
      d.reverse();

    // Base 1e7 exponents equal.
    } else {

      // Check digits to determine which is the bigger number.

      i = xd.length;
      len = yd.length;
      xLTy = i < len;
      if (xLTy) len = i;

      for (i = 0; i < len; i++) {
        if (xd[i] != yd[i]) {
          xLTy = xd[i] < yd[i];
          break;
        }
      }

      k = 0;
    }

    if (xLTy) {
      d = xd;
      xd = yd;
      yd = d;
      y.s = -y.s;
    }

    len = xd.length;

    // Append zeros to `xd` if shorter.
    // Don't add zeros to `yd` if shorter as subtraction only needs to start at `yd` length.
    for (i = yd.length - len; i > 0; --i) xd[len++] = 0;

    // Subtract yd from xd.
    for (i = yd.length; i > k;) {

      if (xd[--i] < yd[i]) {
        for (j = i; j && xd[--j] === 0;) xd[j] = BASE - 1;
        --xd[j];
        xd[i] += BASE;
      }

      xd[i] -= yd[i];
    }

    // Remove trailing zeros.
    for (; xd[--len] === 0;) xd.pop();

    // Remove leading zeros and adjust exponent accordingly.
    for (; xd[0] === 0; xd.shift()) --e;

    // Zero?
    if (!xd[0]) return new Ctor(rm === 3 ? -0 : 0);

    y.d = xd;
    y.e = getBase10Exponent(xd, e);

    return external ? finalise(y, pr, rm) : y;
  };


  /*
   *   n % 0 =  N
   *   n % N =  N
   *   n % I =  n
   *   0 % n =  0
   *  -0 % n = -0
   *   0 % 0 =  N
   *   0 % N =  N
   *   0 % I =  0
   *   N % n =  N
   *   N % 0 =  N
   *   N % N =  N
   *   N % I =  N
   *   I % n =  N
   *   I % 0 =  N
   *   I % N =  N
   *   I % I =  N
   *
   * Return a new Decimal whose value is the value of this Decimal modulo `y`, rounded to
   * `precision` significant digits using rounding mode `rounding`.
   *
   * The result depends on the modulo mode.
   *
   */
  P.modulo = P.mod = function (y) {
    var q,
      x = this,
      Ctor = x.constructor;

    y = new Ctor(y);

    // Return NaN if x is ±Infinity or NaN, or y is NaN or ±0.
    if (!x.d || !y.s || y.d && !y.d[0]) return new Ctor(NaN);

    // Return x if y is ±Infinity or x is ±0.
    if (!y.d || x.d && !x.d[0]) {
      return finalise(new Ctor(x), Ctor.precision, Ctor.rounding);
    }

    // Prevent rounding of intermediate calculations.
    external = false;

    if (Ctor.modulo == 9) {

      // Euclidian division: q = sign(y) * floor(x / abs(y))
      // result = x - q * y    where  0 <= result < abs(y)
      q = divide(x, y.abs(), 0, 3, 1);
      q.s *= y.s;
    } else {
      q = divide(x, y, 0, Ctor.modulo, 1);
    }

    q = q.times(y);

    external = true;

    return x.minus(q);
  };


  /*
   * Return a new Decimal whose value is the natural exponential of the value of this Decimal,
   * i.e. the base e raised to the power the value of this Decimal, rounded to `precision`
   * significant digits using rounding mode `rounding`.
   *
   */
  P.naturalExponential = P.exp = function () {
    return naturalExponential(this);
  };


  /*
   * Return a new Decimal whose value is the natural logarithm of the value of this Decimal,
   * rounded to `precision` significant digits using rounding mode `rounding`.
   *
   */
  P.naturalLogarithm = P.ln = function () {
    return naturalLogarithm(this);
  };


  /*
   * Return a new Decimal whose value is the value of this Decimal negated, i.e. as if multiplied by
   * -1.
   *
   */
  P.negated = P.neg = function () {
    var x = new this.constructor(this);
    x.s = -x.s;
    return finalise(x);
  };


  /*
   *  n + 0 = n
   *  n + N = N
   *  n + I = I
   *  0 + n = n
   *  0 + 0 = 0
   *  0 + N = N
   *  0 + I = I
   *  N + n = N
   *  N + 0 = N
   *  N + N = N
   *  N + I = N
   *  I + n = I
   *  I + 0 = I
   *  I + N = N
   *  I + I = I
   *
   * Return a new Decimal whose value is the value of this Decimal plus `y`, rounded to `precision`
   * significant digits using rounding mode `rounding`.
   *
   */
  P.plus = P.add = function (y) {
    var carry, d, e, i, k, len, pr, rm, xd, yd,
      x = this,
      Ctor = x.constructor;

    y = new Ctor(y);

    // If either is not finite...
    if (!x.d || !y.d) {

      // Return NaN if either is NaN.
      if (!x.s || !y.s) y = new Ctor(NaN);

      // Return x if y is finite and x is ±Infinity.
      // Return x if both are ±Infinity with the same sign.
      // Return NaN if both are ±Infinity with different signs.
      // Return y if x is finite and y is ±Infinity.
      else if (!x.d) y = new Ctor(y.d || x.s === y.s ? x : NaN);

      return y;
    }

     // If signs differ...
    if (x.s != y.s) {
      y.s = -y.s;
      return x.minus(y);
    }

    xd = x.d;
    yd = y.d;
    pr = Ctor.precision;
    rm = Ctor.rounding;

    // If either is zero...
    if (!xd[0] || !yd[0]) {

      // Return x if y is zero.
      // Return y if y is non-zero.
      if (!yd[0]) y = new Ctor(x);

      return external ? finalise(y, pr, rm) : y;
    }

    // x and y are finite, non-zero numbers with the same sign.

    // Calculate base 1e7 exponents.
    k = mathfloor(x.e / LOG_BASE);
    e = mathfloor(y.e / LOG_BASE);

    xd = xd.slice();
    i = k - e;

    // If base 1e7 exponents differ...
    if (i) {

      if (i < 0) {
        d = xd;
        i = -i;
        len = yd.length;
      } else {
        d = yd;
        e = k;
        len = xd.length;
      }

      // Limit number of zeros prepended to max(ceil(pr / LOG_BASE), len) + 1.
      k = Math.ceil(pr / LOG_BASE);
      len = k > len ? k + 1 : len + 1;

      if (i > len) {
        i = len;
        d.length = 1;
      }

      // Prepend zeros to equalise exponents. Note: Faster to use reverse then do unshifts.
      d.reverse();
      for (; i--;) d.push(0);
      d.reverse();
    }

    len = xd.length;
    i = yd.length;

    // If yd is longer than xd, swap xd and yd so xd points to the longer array.
    if (len - i < 0) {
      i = len;
      d = yd;
      yd = xd;
      xd = d;
    }

    // Only start adding at yd.length - 1 as the further digits of xd can be left as they are.
    for (carry = 0; i;) {
      carry = (xd[--i] = xd[i] + yd[i] + carry) / BASE | 0;
      xd[i] %= BASE;
    }

    if (carry) {
      xd.unshift(carry);
      ++e;
    }

    // Remove trailing zeros.
    // No need to check for zero, as +x + +y != 0 && -x + -y != 0
    for (len = xd.length; xd[--len] == 0;) xd.pop();

    y.d = xd;
    y.e = getBase10Exponent(xd, e);

    return external ? finalise(y, pr, rm) : y;
  };


  /*
   * Return the number of significant digits of the value of this Decimal.
   *
   * [z] {boolean|number} Whether to count integer-part trailing zeros: true, false, 1 or 0.
   *
   */
  P.precision = P.sd = function (z) {
    var k,
      x = this;

    if (z !== void 0 && z !== !!z && z !== 1 && z !== 0) throw Error(invalidArgument + z);

    if (x.d) {
      k = getPrecision(x.d);
      if (z && x.e + 1 > k) k = x.e + 1;
    } else {
      k = NaN;
    }

    return k;
  };


  /*
   * Return a new Decimal whose value is the value of this Decimal rounded to a whole number using
   * rounding mode `rounding`.
   *
   */
  P.round = function () {
    var x = this,
      Ctor = x.constructor;

    return finalise(new Ctor(x), x.e + 1, Ctor.rounding);
  };


  /*
   * Return a new Decimal whose value is the sine of the value in radians of this Decimal.
   *
   * Domain: [-Infinity, Infinity]
   * Range: [-1, 1]
   *
   * sin(x) = x - x^3/3! + x^5/5! - ...
   *
   * sin(0)         = 0
   * sin(-0)        = -0
   * sin(Infinity)  = NaN
   * sin(-Infinity) = NaN
   * sin(NaN)       = NaN
   *
   */
  P.sine = P.sin = function () {
    var pr, rm,
      x = this,
      Ctor = x.constructor;

    if (!x.isFinite()) return new Ctor(NaN);
    if (x.isZero()) return new Ctor(x);

    pr = Ctor.precision;
    rm = Ctor.rounding;
    Ctor.precision = pr + Math.max(x.e, x.sd()) + LOG_BASE;
    Ctor.rounding = 1;

    x = sine(Ctor, toLessThanHalfPi(Ctor, x));

    Ctor.precision = pr;
    Ctor.rounding = rm;

    return finalise(quadrant > 2 ? x.neg() : x, pr, rm, true);
  };


  /*
   * Return a new Decimal whose value is the square root of this Decimal, rounded to `precision`
   * significant digits using rounding mode `rounding`.
   *
   *  sqrt(-n) =  N
   *  sqrt(N)  =  N
   *  sqrt(-I) =  N
   *  sqrt(I)  =  I
   *  sqrt(0)  =  0
   *  sqrt(-0) = -0
   *
   */
  P.squareRoot = P.sqrt = function () {
    var m, n, sd, r, rep, t,
      x = this,
      d = x.d,
      e = x.e,
      s = x.s,
      Ctor = x.constructor;

    // Negative/NaN/Infinity/zero?
    if (s !== 1 || !d || !d[0]) {
      return new Ctor(!s || s < 0 && (!d || d[0]) ? NaN : d ? x : 1 / 0);
    }

    external = false;

    // Initial estimate.
    s = Math.sqrt(+x);

    // Math.sqrt underflow/overflow?
    // Pass x to Math.sqrt as integer, then adjust the exponent of the result.
    if (s == 0 || s == 1 / 0) {
      n = digitsToString(d);

      if ((n.length + e) % 2 == 0) n += '0';
      s = Math.sqrt(n);
      e = mathfloor((e + 1) / 2) - (e < 0 || e % 2);

      if (s == 1 / 0) {
        n = '1e' + e;
      } else {
        n = s.toExponential();
        n = n.slice(0, n.indexOf('e') + 1) + e;
      }

      r = new Ctor(n);
    } else {
      r = new Ctor(s.toString());
    }

    sd = (e = Ctor.precision) + 3;

    // Newton-Raphson iteration.
    for (;;) {
      t = r;
      r = t.plus(divide(x, t, sd + 2, 1)).times(0.5);

      // TODO? Replace with for-loop and checkRoundingDigits.
      if (digitsToString(t.d).slice(0, sd) === (n = digitsToString(r.d)).slice(0, sd)) {
        n = n.slice(sd - 3, sd + 1);

        // The 4th rounding digit may be in error by -1 so if the 4 rounding digits are 9999 or
        // 4999, i.e. approaching a rounding boundary, continue the iteration.
        if (n == '9999' || !rep && n == '4999') {

          // On the first iteration only, check to see if rounding up gives the exact result as the
          // nines may infinitely repeat.
          if (!rep) {
            finalise(t, e + 1, 0);

            if (t.times(t).eq(x)) {
              r = t;
              break;
            }
          }

          sd += 4;
          rep = 1;
        } else {

          // If the rounding digits are null, 0{0,4} or 50{0,3}, check for an exact result.
          // If not, then there are further digits and m will be truthy.
          if (!+n || !+n.slice(1) && n.charAt(0) == '5') {

            // Truncate to the first rounding digit.
            finalise(r, e + 1, 1);
            m = !r.times(r).eq(x);
          }

          break;
        }
      }
    }

    external = true;

    return finalise(r, e, Ctor.rounding, m);
  };


  /*
   * Return a new Decimal whose value is the tangent of the value in radians of this Decimal.
   *
   * Domain: [-Infinity, Infinity]
   * Range: [-Infinity, Infinity]
   *
   * tan(0)         = 0
   * tan(-0)        = -0
   * tan(Infinity)  = NaN
   * tan(-Infinity) = NaN
   * tan(NaN)       = NaN
   *
   */
  P.tangent = P.tan = function () {
    var pr, rm,
      x = this,
      Ctor = x.constructor;

    if (!x.isFinite()) return new Ctor(NaN);
    if (x.isZero()) return new Ctor(x);

    pr = Ctor.precision;
    rm = Ctor.rounding;
    Ctor.precision = pr + 10;
    Ctor.rounding = 1;

    x = x.sin();
    x.s = 1;
    x = divide(x, new Ctor(1).minus(x.times(x)).sqrt(), pr + 10, 0);

    Ctor.precision = pr;
    Ctor.rounding = rm;

    return finalise(quadrant == 2 || quadrant == 4 ? x.neg() : x, pr, rm, true);
  };


  /*
   *  n * 0 = 0
   *  n * N = N
   *  n * I = I
   *  0 * n = 0
   *  0 * 0 = 0
   *  0 * N = N
   *  0 * I = N
   *  N * n = N
   *  N * 0 = N
   *  N * N = N
   *  N * I = N
   *  I * n = I
   *  I * 0 = N
   *  I * N = N
   *  I * I = I
   *
   * Return a new Decimal whose value is this Decimal times `y`, rounded to `precision` significant
   * digits using rounding mode `rounding`.
   *
   */
  P.times = P.mul = function (y) {
    var carry, e, i, k, r, rL, t, xdL, ydL,
      x = this,
      Ctor = x.constructor,
      xd = x.d,
      yd = (y = new Ctor(y)).d;

    y.s *= x.s;

     // If either is NaN, ±Infinity or ±0...
    if (!xd || !xd[0] || !yd || !yd[0]) {

      return new Ctor(!y.s || xd && !xd[0] && !yd || yd && !yd[0] && !xd

        // Return NaN if either is NaN.
        // Return NaN if x is ±0 and y is ±Infinity, or y is ±0 and x is ±Infinity.
        ? NaN

        // Return ±Infinity if either is ±Infinity.
        // Return ±0 if either is ±0.
        : !xd || !yd ? y.s / 0 : y.s * 0);
    }

    e = mathfloor(x.e / LOG_BASE) + mathfloor(y.e / LOG_BASE);
    xdL = xd.length;
    ydL = yd.length;

    // Ensure xd points to the longer array.
    if (xdL < ydL) {
      r = xd;
      xd = yd;
      yd = r;
      rL = xdL;
      xdL = ydL;
      ydL = rL;
    }

    // Initialise the result array with zeros.
    r = [];
    rL = xdL + ydL;
    for (i = rL; i--;) r.push(0);

    // Multiply!
    for (i = ydL; --i >= 0;) {
      carry = 0;
      for (k = xdL + i; k > i;) {
        t = r[k] + yd[i] * xd[k - i - 1] + carry;
        r[k--] = t % BASE | 0;
        carry = t / BASE | 0;
      }

      r[k] = (r[k] + carry) % BASE | 0;
    }

    // Remove trailing zeros.
    for (; !r[--rL];) r.pop();

    if (carry) ++e;
    else r.shift();

    y.d = r;
    y.e = getBase10Exponent(r, e);

    return external ? finalise(y, Ctor.precision, Ctor.rounding) : y;
  };


  /*
   * Return a string representing the value of this Decimal in base 2, round to `sd` significant
   * digits using rounding mode `rm`.
   *
   * If the optional `sd` argument is present then return binary exponential notation.
   *
   * [sd] {number} Significant digits. Integer, 1 to MAX_DIGITS inclusive.
   * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
   *
   */
  P.toBinary = function (sd, rm) {
    return toStringBinary(this, 2, sd, rm);
  };


  /*
   * Return a new Decimal whose value is the value of this Decimal rounded to a maximum of `dp`
   * decimal places using rounding mode `rm` or `rounding` if `rm` is omitted.
   *
   * If `dp` is omitted, return a new Decimal whose value is the value of this Decimal.
   *
   * [dp] {number} Decimal places. Integer, 0 to MAX_DIGITS inclusive.
   * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
   *
   */
  P.toDecimalPlaces = P.toDP = function (dp, rm) {
    var x = this,
      Ctor = x.constructor;

    x = new Ctor(x);
    if (dp === void 0) return x;

    checkInt32(dp, 0, MAX_DIGITS);

    if (rm === void 0) rm = Ctor.rounding;
    else checkInt32(rm, 0, 8);

    return finalise(x, dp + x.e + 1, rm);
  };


  /*
   * Return a string representing the value of this Decimal in exponential notation rounded to
   * `dp` fixed decimal places using rounding mode `rounding`.
   *
   * [dp] {number} Decimal places. Integer, 0 to MAX_DIGITS inclusive.
   * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
   *
   */
  P.toExponential = function (dp, rm) {
    var str,
      x = this,
      Ctor = x.constructor;

    if (dp === void 0) {
      str = finiteToString(x, true);
    } else {
      checkInt32(dp, 0, MAX_DIGITS);

      if (rm === void 0) rm = Ctor.rounding;
      else checkInt32(rm, 0, 8);

      x = finalise(new Ctor(x), dp + 1, rm);
      str = finiteToString(x, true, dp + 1);
    }

    return x.isNeg() && !x.isZero() ? '-' + str : str;
  };


  /*
   * Return a string representing the value of this Decimal in normal (fixed-point) notation to
   * `dp` fixed decimal places and rounded using rounding mode `rm` or `rounding` if `rm` is
   * omitted.
   *
   * As with JavaScript numbers, (-0).toFixed(0) is '0', but e.g. (-0.00001).toFixed(0) is '-0'.
   *
   * [dp] {number} Decimal places. Integer, 0 to MAX_DIGITS inclusive.
   * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
   *
   * (-0).toFixed(0) is '0', but (-0.1).toFixed(0) is '-0'.
   * (-0).toFixed(1) is '0.0', but (-0.01).toFixed(1) is '-0.0'.
   * (-0).toFixed(3) is '0.000'.
   * (-0.5).toFixed(0) is '-0'.
   *
   */
  P.toFixed = function (dp, rm) {
    var str, y,
      x = this,
      Ctor = x.constructor;

    if (dp === void 0) {
      str = finiteToString(x);
    } else {
      checkInt32(dp, 0, MAX_DIGITS);

      if (rm === void 0) rm = Ctor.rounding;
      else checkInt32(rm, 0, 8);

      y = finalise(new Ctor(x), dp + x.e + 1, rm);
      str = finiteToString(y, false, dp + y.e + 1);
    }

    // To determine whether to add the minus sign look at the value before it was rounded,
    // i.e. look at `x` rather than `y`.
    return x.isNeg() && !x.isZero() ? '-' + str : str;
  };


  /*
   * Return an array representing the value of this Decimal as a simple fraction with an integer
   * numerator and an integer denominator.
   *
   * The denominator will be a positive non-zero value less than or equal to the specified maximum
   * denominator. If a maximum denominator is not specified, the denominator will be the lowest
   * value necessary to represent the number exactly.
   *
   * [maxD] {number|string|Decimal} Maximum denominator. Integer >= 1 and < Infinity.
   *
   */
  P.toFraction = function (maxD) {
    var d, d0, d1, d2, e, k, n, n0, n1, pr, q, r,
      x = this,
      xd = x.d,
      Ctor = x.constructor;

    if (!xd) return new Ctor(x);

    n1 = d0 = new Ctor(1);
    d1 = n0 = new Ctor(0);

    d = new Ctor(d1);
    e = d.e = getPrecision(xd) - x.e - 1;
    k = e % LOG_BASE;
    d.d[0] = mathpow(10, k < 0 ? LOG_BASE + k : k);

    if (maxD == null) {

      // d is 10**e, the minimum max-denominator needed.
      maxD = e > 0 ? d : n1;
    } else {
      n = new Ctor(maxD);
      if (!n.isInt() || n.lt(n1)) throw Error(invalidArgument + n);
      maxD = n.gt(d) ? (e > 0 ? d : n1) : n;
    }

    external = false;
    n = new Ctor(digitsToString(xd));
    pr = Ctor.precision;
    Ctor.precision = e = xd.length * LOG_BASE * 2;

    for (;;)  {
      q = divide(n, d, 0, 1, 1);
      d2 = d0.plus(q.times(d1));
      if (d2.cmp(maxD) == 1) break;
      d0 = d1;
      d1 = d2;
      d2 = n1;
      n1 = n0.plus(q.times(d2));
      n0 = d2;
      d2 = d;
      d = n.minus(q.times(d2));
      n = d2;
    }

    d2 = divide(maxD.minus(d0), d1, 0, 1, 1);
    n0 = n0.plus(d2.times(n1));
    d0 = d0.plus(d2.times(d1));
    n0.s = n1.s = x.s;

    // Determine which fraction is closer to x, n0/d0 or n1/d1?
    r = divide(n1, d1, e, 1).minus(x).abs().cmp(divide(n0, d0, e, 1).minus(x).abs()) < 1
        ? [n1, d1] : [n0, d0];

    Ctor.precision = pr;
    external = true;

    return r;
  };


  /*
   * Return a string representing the value of this Decimal in base 16, round to `sd` significant
   * digits using rounding mode `rm`.
   *
   * If the optional `sd` argument is present then return binary exponential notation.
   *
   * [sd] {number} Significant digits. Integer, 1 to MAX_DIGITS inclusive.
   * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
   *
   */
  P.toHexadecimal = P.toHex = function (sd, rm) {
    return toStringBinary(this, 16, sd, rm);
  };


  /*
   * Returns a new Decimal whose value is the nearest multiple of `y` in the direction of rounding
   * mode `rm`, or `Decimal.rounding` if `rm` is omitted, to the value of this Decimal.
   *
   * The return value will always have the same sign as this Decimal, unless either this Decimal
   * or `y` is NaN, in which case the return value will be also be NaN.
   *
   * The return value is not affected by the value of `precision`.
   *
   * y {number|string|Decimal} The magnitude to round to a multiple of.
   * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
   *
   * 'toNearest() rounding mode not an integer: {rm}'
   * 'toNearest() rounding mode out of range: {rm}'
   *
   */
  P.toNearest = function (y, rm) {
    var x = this,
      Ctor = x.constructor;

    x = new Ctor(x);

    if (y == null) {

      // If x is not finite, return x.
      if (!x.d) return x;

      y = new Ctor(1);
      rm = Ctor.rounding;
    } else {
      y = new Ctor(y);
      if (rm === void 0) {
        rm = Ctor.rounding;
      } else {
        checkInt32(rm, 0, 8);
      }

      // If x is not finite, return x if y is not NaN, else NaN.
      if (!x.d) return y.s ? x : y;

      // If y is not finite, return Infinity with the sign of x if y is Infinity, else NaN.
      if (!y.d) {
        if (y.s) y.s = x.s;
        return y;
      }
    }

    // If y is not zero, calculate the nearest multiple of y to x.
    if (y.d[0]) {
      external = false;
      x = divide(x, y, 0, rm, 1).times(y);
      external = true;
      finalise(x);

    // If y is zero, return zero with the sign of x.
    } else {
      y.s = x.s;
      x = y;
    }

    return x;
  };


  /*
   * Return the value of this Decimal converted to a number primitive.
   * Zero keeps its sign.
   *
   */
  P.toNumber = function () {
    return +this;
  };


  /*
   * Return a string representing the value of this Decimal in base 8, round to `sd` significant
   * digits using rounding mode `rm`.
   *
   * If the optional `sd` argument is present then return binary exponential notation.
   *
   * [sd] {number} Significant digits. Integer, 1 to MAX_DIGITS inclusive.
   * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
   *
   */
  P.toOctal = function (sd, rm) {
    return toStringBinary(this, 8, sd, rm);
  };


  /*
   * Return a new Decimal whose value is the value of this Decimal raised to the power `y`, rounded
   * to `precision` significant digits using rounding mode `rounding`.
   *
   * ECMAScript compliant.
   *
   *   pow(x, NaN)                           = NaN
   *   pow(x, ±0)                            = 1

   *   pow(NaN, non-zero)                    = NaN
   *   pow(abs(x) > 1, +Infinity)            = +Infinity
   *   pow(abs(x) > 1, -Infinity)            = +0
   *   pow(abs(x) == 1, ±Infinity)           = NaN
   *   pow(abs(x) < 1, +Infinity)            = +0
   *   pow(abs(x) < 1, -Infinity)            = +Infinity
   *   pow(+Infinity, y > 0)                 = +Infinity
   *   pow(+Infinity, y < 0)                 = +0
   *   pow(-Infinity, odd integer > 0)       = -Infinity
   *   pow(-Infinity, even integer > 0)      = +Infinity
   *   pow(-Infinity, odd integer < 0)       = -0
   *   pow(-Infinity, even integer < 0)      = +0
   *   pow(+0, y > 0)                        = +0
   *   pow(+0, y < 0)                        = +Infinity
   *   pow(-0, odd integer > 0)              = -0
   *   pow(-0, even integer > 0)             = +0
   *   pow(-0, odd integer < 0)              = -Infinity
   *   pow(-0, even integer < 0)             = +Infinity
   *   pow(finite x < 0, finite non-integer) = NaN
   *
   * For non-integer or very large exponents pow(x, y) is calculated using
   *
   *   x^y = exp(y*ln(x))
   *
   * Assuming the first 15 rounding digits are each equally likely to be any digit 0-9, the
   * probability of an incorrectly rounded result
   * P([49]9{14} | [50]0{14}) = 2 * 0.2 * 10^-14 = 4e-15 = 1/2.5e+14
   * i.e. 1 in 250,000,000,000,000
   *
   * If a result is incorrectly rounded the maximum error will be 1 ulp (unit in last place).
   *
   * y {number|string|Decimal} The power to which to raise this Decimal.
   *
   */
  P.toPower = P.pow = function (y) {
    var e, k, pr, r, rm, s,
      x = this,
      Ctor = x.constructor,
      yn = +(y = new Ctor(y));

    // Either ±Infinity, NaN or ±0?
    if (!x.d || !y.d || !x.d[0] || !y.d[0]) return new Ctor(mathpow(+x, yn));

    x = new Ctor(x);

    if (x.eq(1)) return x;

    pr = Ctor.precision;
    rm = Ctor.rounding;

    if (y.eq(1)) return finalise(x, pr, rm);

    // y exponent
    e = mathfloor(y.e / LOG_BASE);

    // If y is a small integer use the 'exponentiation by squaring' algorithm.
    if (e >= y.d.length - 1 && (k = yn < 0 ? -yn : yn) <= MAX_SAFE_INTEGER) {
      r = intPow(Ctor, x, k, pr);
      return y.s < 0 ? new Ctor(1).div(r) : finalise(r, pr, rm);
    }

    s = x.s;

    // if x is negative
    if (s < 0) {

      // if y is not an integer
      if (e < y.d.length - 1) return new Ctor(NaN);

      // Result is positive if x is negative and the last digit of integer y is even.
      if ((y.d[e] & 1) == 0) s = 1;

      // if x.eq(-1)
      if (x.e == 0 && x.d[0] == 1 && x.d.length == 1) {
        x.s = s;
        return x;
      }
    }

    // Estimate result exponent.
    // x^y = 10^e,  where e = y * log10(x)
    // log10(x) = log10(x_significand) + x_exponent
    // log10(x_significand) = ln(x_significand) / ln(10)
    k = mathpow(+x, yn);
    e = k == 0 || !isFinite(k)
      ? mathfloor(yn * (Math.log('0.' + digitsToString(x.d)) / Math.LN10 + x.e + 1))
      : new Ctor(k + '').e;

    // Exponent estimate may be incorrect e.g. x: 0.999999999999999999, y: 2.29, e: 0, r.e: -1.

    // Overflow/underflow?
    if (e > Ctor.maxE + 1 || e < Ctor.minE - 1) return new Ctor(e > 0 ? s / 0 : 0);

    external = false;
    Ctor.rounding = x.s = 1;

    // Estimate the extra guard digits needed to ensure five correct rounding digits from
    // naturalLogarithm(x). Example of failure without these extra digits (precision: 10):
    // new Decimal(2.32456).pow('2087987436534566.46411')
    // should be 1.162377823e+764914905173815, but is 1.162355823e+764914905173815
    k = Math.min(12, (e + '').length);

    // r = x^y = exp(y*ln(x))
    r = naturalExponential(y.times(naturalLogarithm(x, pr + k)), pr);

    // r may be Infinity, e.g. (0.9999999999999999).pow(-1e+40)
    if (r.d) {

      // Truncate to the required precision plus five rounding digits.
      r = finalise(r, pr + 5, 1);

      // If the rounding digits are [49]9999 or [50]0000 increase the precision by 10 and recalculate
      // the result.
      if (checkRoundingDigits(r.d, pr, rm)) {
        e = pr + 10;

        // Truncate to the increased precision plus five rounding digits.
        r = finalise(naturalExponential(y.times(naturalLogarithm(x, e + k)), e), e + 5, 1);

        // Check for 14 nines from the 2nd rounding digit (the first rounding digit may be 4 or 9).
        if (+digitsToString(r.d).slice(pr + 1, pr + 15) + 1 == 1e14) {
          r = finalise(r, pr + 1, 0);
        }
      }
    }

    r.s = s;
    external = true;
    Ctor.rounding = rm;

    return finalise(r, pr, rm);
  };


  /*
   * Return a string representing the value of this Decimal rounded to `sd` significant digits
   * using rounding mode `rounding`.
   *
   * Return exponential notation if `sd` is less than the number of digits necessary to represent
   * the integer part of the value in normal notation.
   *
   * [sd] {number} Significant digits. Integer, 1 to MAX_DIGITS inclusive.
   * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
   *
   */
  P.toPrecision = function (sd, rm) {
    var str,
      x = this,
      Ctor = x.constructor;

    if (sd === void 0) {
      str = finiteToString(x, x.e <= Ctor.toExpNeg || x.e >= Ctor.toExpPos);
    } else {
      checkInt32(sd, 1, MAX_DIGITS);

      if (rm === void 0) rm = Ctor.rounding;
      else checkInt32(rm, 0, 8);

      x = finalise(new Ctor(x), sd, rm);
      str = finiteToString(x, sd <= x.e || x.e <= Ctor.toExpNeg, sd);
    }

    return x.isNeg() && !x.isZero() ? '-' + str : str;
  };


  /*
   * Return a new Decimal whose value is the value of this Decimal rounded to a maximum of `sd`
   * significant digits using rounding mode `rm`, or to `precision` and `rounding` respectively if
   * omitted.
   *
   * [sd] {number} Significant digits. Integer, 1 to MAX_DIGITS inclusive.
   * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
   *
   * 'toSD() digits out of range: {sd}'
   * 'toSD() digits not an integer: {sd}'
   * 'toSD() rounding mode not an integer: {rm}'
   * 'toSD() rounding mode out of range: {rm}'
   *
   */
  P.toSignificantDigits = P.toSD = function (sd, rm) {
    var x = this,
      Ctor = x.constructor;

    if (sd === void 0) {
      sd = Ctor.precision;
      rm = Ctor.rounding;
    } else {
      checkInt32(sd, 1, MAX_DIGITS);

      if (rm === void 0) rm = Ctor.rounding;
      else checkInt32(rm, 0, 8);
    }

    return finalise(new Ctor(x), sd, rm);
  };


  /*
   * Return a string representing the value of this Decimal.
   *
   * Return exponential notation if this Decimal has a positive exponent equal to or greater than
   * `toExpPos`, or a negative exponent equal to or less than `toExpNeg`.
   *
   */
  P.toString = function () {
    var x = this,
      Ctor = x.constructor,
      str = finiteToString(x, x.e <= Ctor.toExpNeg || x.e >= Ctor.toExpPos);

    return x.isNeg() && !x.isZero() ? '-' + str : str;
  };


  /*
   * Return a new Decimal whose value is the value of this Decimal truncated to a whole number.
   *
   */
  P.truncated = P.trunc = function () {
    return finalise(new this.constructor(this), this.e + 1, 1);
  };


  /*
   * Return a string representing the value of this Decimal.
   * Unlike `toString`, negative zero will include the minus sign.
   *
   */
  P.valueOf = P.toJSON = function () {
    var x = this,
      Ctor = x.constructor,
      str = finiteToString(x, x.e <= Ctor.toExpNeg || x.e >= Ctor.toExpPos);

    return x.isNeg() ? '-' + str : str;
  };


  /*
  // Add aliases to match BigDecimal method names.
  // P.add = P.plus;
  P.subtract = P.minus;
  P.multiply = P.times;
  P.divide = P.div;
  P.remainder = P.mod;
  P.compareTo = P.cmp;
  P.negate = P.neg;
   */


  // Helper functions for Decimal.prototype (P) and/or Decimal methods, and their callers.


  /*
   *  digitsToString           P.cubeRoot, P.logarithm, P.squareRoot, P.toFraction, P.toPower,
   *                           finiteToString, naturalExponential, naturalLogarithm
   *  checkInt32               P.toDecimalPlaces, P.toExponential, P.toFixed, P.toNearest,
   *                           P.toPrecision, P.toSignificantDigits, toStringBinary, random
   *  checkRoundingDigits      P.logarithm, P.toPower, naturalExponential, naturalLogarithm
   *  convertBase              toStringBinary, parseOther
   *  cos                      P.cos
   *  divide                   P.atanh, P.cubeRoot, P.dividedBy, P.dividedToIntegerBy,
   *                           P.logarithm, P.modulo, P.squareRoot, P.tan, P.tanh, P.toFraction,
   *                           P.toNearest, toStringBinary, naturalExponential, naturalLogarithm,
   *                           taylorSeries, atan2, parseOther
   *  finalise                 P.absoluteValue, P.atan, P.atanh, P.ceil, P.cos, P.cosh,
   *                           P.cubeRoot, P.dividedToIntegerBy, P.floor, P.logarithm, P.minus,
   *                           P.modulo, P.negated, P.plus, P.round, P.sin, P.sinh, P.squareRoot,
   *                           P.tan, P.times, P.toDecimalPlaces, P.toExponential, P.toFixed,
   *                           P.toNearest, P.toPower, P.toPrecision, P.toSignificantDigits,
   *                           P.truncated, divide, getLn10, getPi, naturalExponential,
   *                           naturalLogarithm, ceil, floor, round, trunc
   *  finiteToString           P.toExponential, P.toFixed, P.toPrecision, P.toString, P.valueOf,
   *                           toStringBinary
   *  getBase10Exponent        P.minus, P.plus, P.times, parseOther
   *  getLn10                  P.logarithm, naturalLogarithm
   *  getPi                    P.acos, P.asin, P.atan, toLessThanHalfPi, atan2
   *  getPrecision             P.precision, P.toFraction
   *  getZeroString            digitsToString, finiteToString
   *  intPow                   P.toPower, parseOther
   *  isOdd                    toLessThanHalfPi
   *  maxOrMin                 max, min
   *  naturalExponential       P.naturalExponential, P.toPower
   *  naturalLogarithm         P.acosh, P.asinh, P.atanh, P.logarithm, P.naturalLogarithm,
   *                           P.toPower, naturalExponential
   *  nonFiniteToString        finiteToString, toStringBinary
   *  parseDecimal             Decimal
   *  parseOther               Decimal
   *  sin                      P.sin
   *  taylorSeries             P.cosh, P.sinh, cos, sin
   *  toLessThanHalfPi         P.cos, P.sin
   *  toStringBinary           P.toBinary, P.toHexadecimal, P.toOctal
   *  truncate                 intPow
   *
   *  Throws:                  P.logarithm, P.precision, P.toFraction, checkInt32, getLn10, getPi,
   *                           naturalLogarithm, config, parseOther, random, Decimal
   */


  function digitsToString(d) {
    var i, k, ws,
      indexOfLastWord = d.length - 1,
      str = '',
      w = d[0];

    if (indexOfLastWord > 0) {
      str += w;
      for (i = 1; i < indexOfLastWord; i++) {
        ws = d[i] + '';
        k = LOG_BASE - ws.length;
        if (k) str += getZeroString(k);
        str += ws;
      }

      w = d[i];
      ws = w + '';
      k = LOG_BASE - ws.length;
      if (k) str += getZeroString(k);
    } else if (w === 0) {
      return '0';
    }

    // Remove trailing zeros of last w.
    for (; w % 10 === 0;) w /= 10;

    return str + w;
  }


  function checkInt32(i, min, max) {
    if (i !== ~~i || i < min || i > max) {
      throw Error(invalidArgument + i);
    }
  }


  /*
   * Check 5 rounding digits if `repeating` is null, 4 otherwise.
   * `repeating == null` if caller is `log` or `pow`,
   * `repeating != null` if caller is `naturalLogarithm` or `naturalExponential`.
   */
  function checkRoundingDigits(d, i, rm, repeating) {
    var di, k, r, rd;

    // Get the length of the first word of the array d.
    for (k = d[0]; k >= 10; k /= 10) --i;

    // Is the rounding digit in the first word of d?
    if (--i < 0) {
      i += LOG_BASE;
      di = 0;
    } else {
      di = Math.ceil((i + 1) / LOG_BASE);
      i %= LOG_BASE;
    }

    // i is the index (0 - 6) of the rounding digit.
    // E.g. if within the word 3487563 the first rounding digit is 5,
    // then i = 4, k = 1000, rd = 3487563 % 1000 = 563
    k = mathpow(10, LOG_BASE - i);
    rd = d[di] % k | 0;

    if (repeating == null) {
      if (i < 3) {
        if (i == 0) rd = rd / 100 | 0;
        else if (i == 1) rd = rd / 10 | 0;
        r = rm < 4 && rd == 99999 || rm > 3 && rd == 49999 || rd == 50000 || rd == 0;
      } else {
        r = (rm < 4 && rd + 1 == k || rm > 3 && rd + 1 == k / 2) &&
          (d[di + 1] / k / 100 | 0) == mathpow(10, i - 2) - 1 ||
            (rd == k / 2 || rd == 0) && (d[di + 1] / k / 100 | 0) == 0;
      }
    } else {
      if (i < 4) {
        if (i == 0) rd = rd / 1000 | 0;
        else if (i == 1) rd = rd / 100 | 0;
        else if (i == 2) rd = rd / 10 | 0;
        r = (repeating || rm < 4) && rd == 9999 || !repeating && rm > 3 && rd == 4999;
      } else {
        r = ((repeating || rm < 4) && rd + 1 == k ||
        (!repeating && rm > 3) && rd + 1 == k / 2) &&
          (d[di + 1] / k / 1000 | 0) == mathpow(10, i - 3) - 1;
      }
    }

    return r;
  }


  // Convert string of `baseIn` to an array of numbers of `baseOut`.
  // Eg. convertBase('255', 10, 16) returns [15, 15].
  // Eg. convertBase('ff', 16, 10) returns [2, 5, 5].
  function convertBase(str, baseIn, baseOut) {
    var j,
      arr = [0],
      arrL,
      i = 0,
      strL = str.length;

    for (; i < strL;) {
      for (arrL = arr.length; arrL--;) arr[arrL] *= baseIn;
      arr[0] += NUMERALS.indexOf(str.charAt(i++));
      for (j = 0; j < arr.length; j++) {
        if (arr[j] > baseOut - 1) {
          if (arr[j + 1] === void 0) arr[j + 1] = 0;
          arr[j + 1] += arr[j] / baseOut | 0;
          arr[j] %= baseOut;
        }
      }
    }

    return arr.reverse();
  }


  /*
   * cos(x) = 1 - x^2/2! + x^4/4! - ...
   * |x| < pi/2
   *
   */
  function cosine(Ctor, x) {
    var k, y,
      len = x.d.length;

    // Argument reduction: cos(4x) = 8*(cos^4(x) - cos^2(x)) + 1
    // i.e. cos(x) = 8*(cos^4(x/4) - cos^2(x/4)) + 1

    // Estimate the optimum number of times to use the argument reduction.
    if (len < 32) {
      k = Math.ceil(len / 3);
      y = (1 / tinyPow(4, k)).toString();
    } else {
      k = 16;
      y = '2.3283064365386962890625e-10';
    }

    Ctor.precision += k;

    x = taylorSeries(Ctor, 1, x.times(y), new Ctor(1));

    // Reverse argument reduction
    for (var i = k; i--;) {
      var cos2x = x.times(x);
      x = cos2x.times(cos2x).minus(cos2x).times(8).plus(1);
    }

    Ctor.precision -= k;

    return x;
  }


  /*
   * Perform division in the specified base.
   */
  var divide = (function () {

    // Assumes non-zero x and k, and hence non-zero result.
    function multiplyInteger(x, k, base) {
      var temp,
        carry = 0,
        i = x.length;

      for (x = x.slice(); i--;) {
        temp = x[i] * k + carry;
        x[i] = temp % base | 0;
        carry = temp / base | 0;
      }

      if (carry) x.unshift(carry);

      return x;
    }

    function compare(a, b, aL, bL) {
      var i, r;

      if (aL != bL) {
        r = aL > bL ? 1 : -1;
      } else {
        for (i = r = 0; i < aL; i++) {
          if (a[i] != b[i]) {
            r = a[i] > b[i] ? 1 : -1;
            break;
          }
        }
      }

      return r;
    }

    function subtract(a, b, aL, base) {
      var i = 0;

      // Subtract b from a.
      for (; aL--;) {
        a[aL] -= i;
        i = a[aL] < b[aL] ? 1 : 0;
        a[aL] = i * base + a[aL] - b[aL];
      }

      // Remove leading zeros.
      for (; !a[0] && a.length > 1;) a.shift();
    }

    return function (x, y, pr, rm, dp, base) {
      var cmp, e, i, k, logBase, more, prod, prodL, q, qd, rem, remL, rem0, sd, t, xi, xL, yd0,
        yL, yz,
        Ctor = x.constructor,
        sign = x.s == y.s ? 1 : -1,
        xd = x.d,
        yd = y.d;

      // Either NaN, Infinity or 0?
      if (!xd || !xd[0] || !yd || !yd[0]) {

        return new Ctor(// Return NaN if either NaN, or both Infinity or 0.
          !x.s || !y.s || (xd ? yd && xd[0] == yd[0] : !yd) ? NaN :

          // Return ±0 if x is 0 or y is ±Infinity, or return ±Infinity as y is 0.
          xd && xd[0] == 0 || !yd ? sign * 0 : sign / 0);
      }

      if (base) {
        logBase = 1;
        e = x.e - y.e;
      } else {
        base = BASE;
        logBase = LOG_BASE;
        e = mathfloor(x.e / logBase) - mathfloor(y.e / logBase);
      }

      yL = yd.length;
      xL = xd.length;
      q = new Ctor(sign);
      qd = q.d = [];

      // Result exponent may be one less than e.
      // The digit array of a Decimal from toStringBinary may have trailing zeros.
      for (i = 0; yd[i] == (xd[i] || 0); i++);

      if (yd[i] > (xd[i] || 0)) e--;

      if (pr == null) {
        sd = pr = Ctor.precision;
        rm = Ctor.rounding;
      } else if (dp) {
        sd = pr + (x.e - y.e) + 1;
      } else {
        sd = pr;
      }

      if (sd < 0) {
        qd.push(1);
        more = true;
      } else {

        // Convert precision in number of base 10 digits to base 1e7 digits.
        sd = sd / logBase + 2 | 0;
        i = 0;

        // divisor < 1e7
        if (yL == 1) {
          k = 0;
          yd = yd[0];
          sd++;

          // k is the carry.
          for (; (i < xL || k) && sd--; i++) {
            t = k * base + (xd[i] || 0);
            qd[i] = t / yd | 0;
            k = t % yd | 0;
          }

          more = k || i < xL;

        // divisor >= 1e7
        } else {

          // Normalise xd and yd so highest order digit of yd is >= base/2
          k = base / (yd[0] + 1) | 0;

          if (k > 1) {
            yd = multiplyInteger(yd, k, base);
            xd = multiplyInteger(xd, k, base);
            yL = yd.length;
            xL = xd.length;
          }

          xi = yL;
          rem = xd.slice(0, yL);
          remL = rem.length;

          // Add zeros to make remainder as long as divisor.
          for (; remL < yL;) rem[remL++] = 0;

          yz = yd.slice();
          yz.unshift(0);
          yd0 = yd[0];

          if (yd[1] >= base / 2) ++yd0;

          do {
            k = 0;

            // Compare divisor and remainder.
            cmp = compare(yd, rem, yL, remL);

            // If divisor < remainder.
            if (cmp < 0) {

              // Calculate trial digit, k.
              rem0 = rem[0];
              if (yL != remL) rem0 = rem0 * base + (rem[1] || 0);

              // k will be how many times the divisor goes into the current remainder.
              k = rem0 / yd0 | 0;

              //  Algorithm:
              //  1. product = divisor * trial digit (k)
              //  2. if product > remainder: product -= divisor, k--
              //  3. remainder -= product
              //  4. if product was < remainder at 2:
              //    5. compare new remainder and divisor
              //    6. If remainder > divisor: remainder -= divisor, k++

              if (k > 1) {
                if (k >= base) k = base - 1;

                // product = divisor * trial digit.
                prod = multiplyInteger(yd, k, base);
                prodL = prod.length;
                remL = rem.length;

                // Compare product and remainder.
                cmp = compare(prod, rem, prodL, remL);

                // product > remainder.
                if (cmp == 1) {
                  k--;

                  // Subtract divisor from product.
                  subtract(prod, yL < prodL ? yz : yd, prodL, base);
                }
              } else {

                // cmp is -1.
                // If k is 0, there is no need to compare yd and rem again below, so change cmp to 1
                // to avoid it. If k is 1 there is a need to compare yd and rem again below.
                if (k == 0) cmp = k = 1;
                prod = yd.slice();
              }

              prodL = prod.length;
              if (prodL < remL) prod.unshift(0);

              // Subtract product from remainder.
              subtract(rem, prod, remL, base);

              // If product was < previous remainder.
              if (cmp == -1) {
                remL = rem.length;

                // Compare divisor and new remainder.
                cmp = compare(yd, rem, yL, remL);

                // If divisor < new remainder, subtract divisor from remainder.
                if (cmp < 1) {
                  k++;

                  // Subtract divisor from remainder.
                  subtract(rem, yL < remL ? yz : yd, remL, base);
                }
              }

              remL = rem.length;
            } else if (cmp === 0) {
              k++;
              rem = [0];
            }    // if cmp === 1, k will be 0

            // Add the next digit, k, to the result array.
            qd[i++] = k;

            // Update the remainder.
            if (cmp && rem[0]) {
              rem[remL++] = xd[xi] || 0;
            } else {
              rem = [xd[xi]];
              remL = 1;
            }

          } while ((xi++ < xL || rem[0] !== void 0) && sd--);

          more = rem[0] !== void 0;
        }

        // Leading zero?
        if (!qd[0]) qd.shift();
      }

      // logBase is 1 when divide is being used for base conversion.
      if (logBase == 1) {
        q.e = e;
        inexact = more;
      } else {

        // To calculate q.e, first get the number of digits of qd[0].
        for (i = 1, k = qd[0]; k >= 10; k /= 10) i++;
        q.e = i + e * logBase - 1;

        finalise(q, dp ? pr + q.e + 1 : pr, rm, more);
      }

      return q;
    };
  })();


  /*
   * Round `x` to `sd` significant digits using rounding mode `rm`.
   * Check for over/under-flow.
   */
   function finalise(x, sd, rm, isTruncated) {
    var digits, i, j, k, rd, roundUp, w, xd, xdi,
      Ctor = x.constructor;

    // Don't round if sd is null or undefined.
    out: if (sd != null) {
      xd = x.d;

      // Infinity/NaN.
      if (!xd) return x;

      // rd: the rounding digit, i.e. the digit after the digit that may be rounded up.
      // w: the word of xd containing rd, a base 1e7 number.
      // xdi: the index of w within xd.
      // digits: the number of digits of w.
      // i: what would be the index of rd within w if all the numbers were 7 digits long (i.e. if
      // they had leading zeros)
      // j: if > 0, the actual index of rd within w (if < 0, rd is a leading zero).

      // Get the length of the first word of the digits array xd.
      for (digits = 1, k = xd[0]; k >= 10; k /= 10) digits++;
      i = sd - digits;

      // Is the rounding digit in the first word of xd?
      if (i < 0) {
        i += LOG_BASE;
        j = sd;
        w = xd[xdi = 0];

        // Get the rounding digit at index j of w.
        rd = w / mathpow(10, digits - j - 1) % 10 | 0;
      } else {
        xdi = Math.ceil((i + 1) / LOG_BASE);
        k = xd.length;
        if (xdi >= k) {
          if (isTruncated) {

            // Needed by `naturalExponential`, `naturalLogarithm` and `squareRoot`.
            for (; k++ <= xdi;) xd.push(0);
            w = rd = 0;
            digits = 1;
            i %= LOG_BASE;
            j = i - LOG_BASE + 1;
          } else {
            break out;
          }
        } else {
          w = k = xd[xdi];

          // Get the number of digits of w.
          for (digits = 1; k >= 10; k /= 10) digits++;

          // Get the index of rd within w.
          i %= LOG_BASE;

          // Get the index of rd within w, adjusted for leading zeros.
          // The number of leading zeros of w is given by LOG_BASE - digits.
          j = i - LOG_BASE + digits;

          // Get the rounding digit at index j of w.
          rd = j < 0 ? 0 : w / mathpow(10, digits - j - 1) % 10 | 0;
        }
      }

      // Are there any non-zero digits after the rounding digit?
      isTruncated = isTruncated || sd < 0 ||
        xd[xdi + 1] !== void 0 || (j < 0 ? w : w % mathpow(10, digits - j - 1));

      // The expression `w % mathpow(10, digits - j - 1)` returns all the digits of w to the right
      // of the digit at (left-to-right) index j, e.g. if w is 908714 and j is 2, the expression
      // will give 714.

      roundUp = rm < 4
        ? (rd || isTruncated) && (rm == 0 || rm == (x.s < 0 ? 3 : 2))
        : rd > 5 || rd == 5 && (rm == 4 || isTruncated || rm == 6 &&

          // Check whether the digit to the left of the rounding digit is odd.
          ((i > 0 ? j > 0 ? w / mathpow(10, digits - j) : 0 : xd[xdi - 1]) % 10) & 1 ||
            rm == (x.s < 0 ? 8 : 7));

      if (sd < 1 || !xd[0]) {
        xd.length = 0;
        if (roundUp) {

          // Convert sd to decimal places.
          sd -= x.e + 1;

          // 1, 0.1, 0.01, 0.001, 0.0001 etc.
          xd[0] = mathpow(10, (LOG_BASE - sd % LOG_BASE) % LOG_BASE);
          x.e = -sd || 0;
        } else {

          // Zero.
          xd[0] = x.e = 0;
        }

        return x;
      }

      // Remove excess digits.
      if (i == 0) {
        xd.length = xdi;
        k = 1;
        xdi--;
      } else {
        xd.length = xdi + 1;
        k = mathpow(10, LOG_BASE - i);

        // E.g. 56700 becomes 56000 if 7 is the rounding digit.
        // j > 0 means i > number of leading zeros of w.
        xd[xdi] = j > 0 ? (w / mathpow(10, digits - j) % mathpow(10, j) | 0) * k : 0;
      }

      if (roundUp) {
        for (;;) {

          // Is the digit to be rounded up in the first word of xd?
          if (xdi == 0) {

            // i will be the length of xd[0] before k is added.
            for (i = 1, j = xd[0]; j >= 10; j /= 10) i++;
            j = xd[0] += k;
            for (k = 1; j >= 10; j /= 10) k++;

            // if i != k the length has increased.
            if (i != k) {
              x.e++;
              if (xd[0] == BASE) xd[0] = 1;
            }

            break;
          } else {
            xd[xdi] += k;
            if (xd[xdi] != BASE) break;
            xd[xdi--] = 0;
            k = 1;
          }
        }
      }

      // Remove trailing zeros.
      for (i = xd.length; xd[--i] === 0;) xd.pop();
    }

    if (external) {

      // Overflow?
      if (x.e > Ctor.maxE) {

        // Infinity.
        x.d = null;
        x.e = NaN;

      // Underflow?
      } else if (x.e < Ctor.minE) {

        // Zero.
        x.e = 0;
        x.d = [0];
        // Ctor.underflow = true;
      } // else Ctor.underflow = false;
    }

    return x;
  }


  function finiteToString(x, isExp, sd) {
    if (!x.isFinite()) return nonFiniteToString(x);
    var k,
      e = x.e,
      str = digitsToString(x.d),
      len = str.length;

    if (isExp) {
      if (sd && (k = sd - len) > 0) {
        str = str.charAt(0) + '.' + str.slice(1) + getZeroString(k);
      } else if (len > 1) {
        str = str.charAt(0) + '.' + str.slice(1);
      }

      str = str + (x.e < 0 ? 'e' : 'e+') + x.e;
    } else if (e < 0) {
      str = '0.' + getZeroString(-e - 1) + str;
      if (sd && (k = sd - len) > 0) str += getZeroString(k);
    } else if (e >= len) {
      str += getZeroString(e + 1 - len);
      if (sd && (k = sd - e - 1) > 0) str = str + '.' + getZeroString(k);
    } else {
      if ((k = e + 1) < len) str = str.slice(0, k) + '.' + str.slice(k);
      if (sd && (k = sd - len) > 0) {
        if (e + 1 === len) str += '.';
        str += getZeroString(k);
      }
    }

    return str;
  }


  // Calculate the base 10 exponent from the base 1e7 exponent.
  function getBase10Exponent(digits, e) {
    var w = digits[0];

    // Add the number of digits of the first word of the digits array.
    for ( e *= LOG_BASE; w >= 10; w /= 10) e++;
    return e;
  }


  function getLn10(Ctor, sd, pr) {
    if (sd > LN10_PRECISION) {

      // Reset global state in case the exception is caught.
      external = true;
      if (pr) Ctor.precision = pr;
      throw Error(precisionLimitExceeded);
    }
    return finalise(new Ctor(LN10), sd, 1, true);
  }


  function getPi(Ctor, sd, rm) {
    if (sd > PI_PRECISION) throw Error(precisionLimitExceeded);
    return finalise(new Ctor(PI), sd, rm, true);
  }


  function getPrecision(digits) {
    var w = digits.length - 1,
      len = w * LOG_BASE + 1;

    w = digits[w];

    // If non-zero...
    if (w) {

      // Subtract the number of trailing zeros of the last word.
      for (; w % 10 == 0; w /= 10) len--;

      // Add the number of digits of the first word.
      for (w = digits[0]; w >= 10; w /= 10) len++;
    }

    return len;
  }


  function getZeroString(k) {
    var zs = '';
    for (; k--;) zs += '0';
    return zs;
  }


  /*
   * Return a new Decimal whose value is the value of Decimal `x` to the power `n`, where `n` is an
   * integer of type number.
   *
   * Implements 'exponentiation by squaring'. Called by `pow` and `parseOther`.
   *
   */
  function intPow(Ctor, x, n, pr) {
    var isTruncated,
      r = new Ctor(1),

      // Max n of 9007199254740991 takes 53 loop iterations.
      // Maximum digits array length; leaves [28, 34] guard digits.
      k = Math.ceil(pr / LOG_BASE + 4);

    external = false;

    for (;;) {
      if (n % 2) {
        r = r.times(x);
        if (truncate(r.d, k)) isTruncated = true;
      }

      n = mathfloor(n / 2);
      if (n === 0) {

        // To ensure correct rounding when r.d is truncated, increment the last word if it is zero.
        n = r.d.length - 1;
        if (isTruncated && r.d[n] === 0) ++r.d[n];
        break;
      }

      x = x.times(x);
      truncate(x.d, k);
    }

    external = true;

    return r;
  }


  function isOdd(n) {
    return n.d[n.d.length - 1] & 1;
  }


  /*
   * Handle `max` and `min`. `ltgt` is 'lt' or 'gt'.
   */
  function maxOrMin(Ctor, args, ltgt) {
    var y,
      x = new Ctor(args[0]),
      i = 0;

    for (; ++i < args.length;) {
      y = new Ctor(args[i]);
      if (!y.s) {
        x = y;
        break;
      } else if (x[ltgt](y)) {
        x = y;
      }
    }

    return x;
  }


  /*
   * Return a new Decimal whose value is the natural exponential of `x` rounded to `sd` significant
   * digits.
   *
   * Taylor/Maclaurin series.
   *
   * exp(x) = x^0/0! + x^1/1! + x^2/2! + x^3/3! + ...
   *
   * Argument reduction:
   *   Repeat x = x / 32, k += 5, until |x| < 0.1
   *   exp(x) = exp(x / 2^k)^(2^k)
   *
   * Previously, the argument was initially reduced by
   * exp(x) = exp(r) * 10^k  where r = x - k * ln10, k = floor(x / ln10)
   * to first put r in the range [0, ln10], before dividing by 32 until |x| < 0.1, but this was
   * found to be slower than just dividing repeatedly by 32 as above.
   *
   * Max integer argument: exp('20723265836946413') = 6.3e+9000000000000000
   * Min integer argument: exp('-20723265836946411') = 1.2e-9000000000000000
   * (Math object integer min/max: Math.exp(709) = 8.2e+307, Math.exp(-745) = 5e-324)
   *
   *  exp(Infinity)  = Infinity
   *  exp(-Infinity) = 0
   *  exp(NaN)       = NaN
   *  exp(±0)        = 1
   *
   *  exp(x) is non-terminating for any finite, non-zero x.
   *
   *  The result will always be correctly rounded.
   *
   */
  function naturalExponential(x, sd) {
    var denominator, guard, j, pow, sum, t, wpr,
      rep = 0,
      i = 0,
      k = 0,
      Ctor = x.constructor,
      rm = Ctor.rounding,
      pr = Ctor.precision;

    // 0/NaN/Infinity?
    if (!x.d || !x.d[0] || x.e > 17) {

      return new Ctor(x.d
        ? !x.d[0] ? 1 : x.s < 0 ? 0 : 1 / 0
        : x.s ? x.s < 0 ? 0 : x : 0 / 0);
    }

    if (sd == null) {
      external = false;
      wpr = pr;
    } else {
      wpr = sd;
    }

    t = new Ctor(0.03125);

    // while abs(x) >= 0.1
    while (x.e > -2) {

      // x = x / 2^5
      x = x.times(t);
      k += 5;
    }

    // Use 2 * log10(2^k) + 5 (empirically derived) to estimate the increase in precision
    // necessary to ensure the first 4 rounding digits are correct.
    guard = Math.log(mathpow(2, k)) / Math.LN10 * 2 + 5 | 0;
    wpr += guard;
    denominator = pow = sum = new Ctor(1);
    Ctor.precision = wpr;

    for (;;) {
      pow = finalise(pow.times(x), wpr, 1);
      denominator = denominator.times(++i);
      t = sum.plus(divide(pow, denominator, wpr, 1));

      if (digitsToString(t.d).slice(0, wpr) === digitsToString(sum.d).slice(0, wpr)) {
        j = k;
        while (j--) sum = finalise(sum.times(sum), wpr, 1);

        // Check to see if the first 4 rounding digits are [49]999.
        // If so, repeat the summation with a higher precision, otherwise
        // e.g. with precision: 18, rounding: 1
        // exp(18.404272462595034083567793919843761) = 98372560.1229999999 (should be 98372560.123)
        // `wpr - guard` is the index of first rounding digit.
        if (sd == null) {

          if (rep < 3 && checkRoundingDigits(sum.d, wpr - guard, rm, rep)) {
            Ctor.precision = wpr += 10;
            denominator = pow = t = new Ctor(1);
            i = 0;
            rep++;
          } else {
            return finalise(sum, Ctor.precision = pr, rm, external = true);
          }
        } else {
          Ctor.precision = pr;
          return sum;
        }
      }

      sum = t;
    }
  }


  /*
   * Return a new Decimal whose value is the natural logarithm of `x` rounded to `sd` significant
   * digits.
   *
   *  ln(-n)        = NaN
   *  ln(0)         = -Infinity
   *  ln(-0)        = -Infinity
   *  ln(1)         = 0
   *  ln(Infinity)  = Infinity
   *  ln(-Infinity) = NaN
   *  ln(NaN)       = NaN
   *
   *  ln(n) (n != 1) is non-terminating.
   *
   */
  function naturalLogarithm(y, sd) {
    var c, c0, denominator, e, numerator, rep, sum, t, wpr, x1, x2,
      n = 1,
      guard = 10,
      x = y,
      xd = x.d,
      Ctor = x.constructor,
      rm = Ctor.rounding,
      pr = Ctor.precision;

    // Is x negative or Infinity, NaN, 0 or 1?
    if (x.s < 0 || !xd || !xd[0] || !x.e && xd[0] == 1 && xd.length == 1) {
      return new Ctor(xd && !xd[0] ? -1 / 0 : x.s != 1 ? NaN : xd ? 0 : x);
    }

    if (sd == null) {
      external = false;
      wpr = pr;
    } else {
      wpr = sd;
    }

    Ctor.precision = wpr += guard;
    c = digitsToString(xd);
    c0 = c.charAt(0);

    if (Math.abs(e = x.e) < 1.5e15) {

      // Argument reduction.
      // The series converges faster the closer the argument is to 1, so using
      // ln(a^b) = b * ln(a),   ln(a) = ln(a^b) / b
      // multiply the argument by itself until the leading digits of the significand are 7, 8, 9,
      // 10, 11, 12 or 13, recording the number of multiplications so the sum of the series can
      // later be divided by this number, then separate out the power of 10 using
      // ln(a*10^b) = ln(a) + b*ln(10).

      // max n is 21 (gives 0.9, 1.0 or 1.1) (9e15 / 21 = 4.2e14).
      //while (c0 < 9 && c0 != 1 || c0 == 1 && c.charAt(1) > 1) {
      // max n is 6 (gives 0.7 - 1.3)
      while (c0 < 7 && c0 != 1 || c0 == 1 && c.charAt(1) > 3) {
        x = x.times(y);
        c = digitsToString(x.d);
        c0 = c.charAt(0);
        n++;
      }

      e = x.e;

      if (c0 > 1) {
        x = new Ctor('0.' + c);
        e++;
      } else {
        x = new Ctor(c0 + '.' + c.slice(1));
      }
    } else {

      // The argument reduction method above may result in overflow if the argument y is a massive
      // number with exponent >= 1500000000000000 (9e15 / 6 = 1.5e15), so instead recall this
      // function using ln(x*10^e) = ln(x) + e*ln(10).
      t = getLn10(Ctor, wpr + 2, pr).times(e + '');
      x = naturalLogarithm(new Ctor(c0 + '.' + c.slice(1)), wpr - guard).plus(t);
      Ctor.precision = pr;

      return sd == null ? finalise(x, pr, rm, external = true) : x;
    }

    // x1 is x reduced to a value near 1.
    x1 = x;

    // Taylor series.
    // ln(y) = ln((1 + x)/(1 - x)) = 2(x + x^3/3 + x^5/5 + x^7/7 + ...)
    // where x = (y - 1)/(y + 1)    (|x| < 1)
    sum = numerator = x = divide(x.minus(1), x.plus(1), wpr, 1);
    x2 = finalise(x.times(x), wpr, 1);
    denominator = 3;

    for (;;) {
      numerator = finalise(numerator.times(x2), wpr, 1);
      t = sum.plus(divide(numerator, new Ctor(denominator), wpr, 1));

      if (digitsToString(t.d).slice(0, wpr) === digitsToString(sum.d).slice(0, wpr)) {
        sum = sum.times(2);

        // Reverse the argument reduction. Check that e is not 0 because, besides preventing an
        // unnecessary calculation, -0 + 0 = +0 and to ensure correct rounding -0 needs to stay -0.
        if (e !== 0) sum = sum.plus(getLn10(Ctor, wpr + 2, pr).times(e + ''));
        sum = divide(sum, new Ctor(n), wpr, 1);

        // Is rm > 3 and the first 4 rounding digits 4999, or rm < 4 (or the summation has
        // been repeated previously) and the first 4 rounding digits 9999?
        // If so, restart the summation with a higher precision, otherwise
        // e.g. with precision: 12, rounding: 1
        // ln(135520028.6126091714265381533) = 18.7246299999 when it should be 18.72463.
        // `wpr - guard` is the index of first rounding digit.
        if (sd == null) {
          if (checkRoundingDigits(sum.d, wpr - guard, rm, rep)) {
            Ctor.precision = wpr += guard;
            t = numerator = x = divide(x1.minus(1), x1.plus(1), wpr, 1);
            x2 = finalise(x.times(x), wpr, 1);
            denominator = rep = 1;
          } else {
            return finalise(sum, Ctor.precision = pr, rm, external = true);
          }
        } else {
          Ctor.precision = pr;
          return sum;
        }
      }

      sum = t;
      denominator += 2;
    }
  }


  // ±Infinity, NaN.
  function nonFiniteToString(x) {
    // Unsigned.
    return String(x.s * x.s / 0);
  }


  /*
   * Parse the value of a new Decimal `x` from string `str`.
   */
  function parseDecimal(x, str) {
    var e, i, len;

    // Decimal point?
    if ((e = str.indexOf('.')) > -1) str = str.replace('.', '');

    // Exponential form?
    if ((i = str.search(/e/i)) > 0) {

      // Determine exponent.
      if (e < 0) e = i;
      e += +str.slice(i + 1);
      str = str.substring(0, i);
    } else if (e < 0) {

      // Integer.
      e = str.length;
    }

    // Determine leading zeros.
    for (i = 0; str.charCodeAt(i) === 48; i++);

    // Determine trailing zeros.
    for (len = str.length; str.charCodeAt(len - 1) === 48; --len);
    str = str.slice(i, len);

    if (str) {
      len -= i;
      x.e = e = e - i - 1;
      x.d = [];

      // Transform base

      // e is the base 10 exponent.
      // i is where to slice str to get the first word of the digits array.
      i = (e + 1) % LOG_BASE;
      if (e < 0) i += LOG_BASE;

      if (i < len) {
        if (i) x.d.push(+str.slice(0, i));
        for (len -= LOG_BASE; i < len;) x.d.push(+str.slice(i, i += LOG_BASE));
        str = str.slice(i);
        i = LOG_BASE - str.length;
      } else {
        i -= len;
      }

      for (; i--;) str += '0';
      x.d.push(+str);

      if (external) {

        // Overflow?
        if (x.e > x.constructor.maxE) {

          // Infinity.
          x.d = null;
          x.e = NaN;

        // Underflow?
        } else if (x.e < x.constructor.minE) {

          // Zero.
          x.e = 0;
          x.d = [0];
          // x.constructor.underflow = true;
        } // else x.constructor.underflow = false;
      }
    } else {

      // Zero.
      x.e = 0;
      x.d = [0];
    }

    return x;
  }


  /*
   * Parse the value of a new Decimal `x` from a string `str`, which is not a decimal value.
   */
  function parseOther(x, str) {
    var base, Ctor, divisor, i, isFloat, len, p, xd, xe;

    if (str === 'Infinity' || str === 'NaN') {
      if (!+str) x.s = NaN;
      x.e = NaN;
      x.d = null;
      return x;
    }

    if (isHex.test(str))  {
      base = 16;
      str = str.toLowerCase();
    } else if (isBinary.test(str))  {
      base = 2;
    } else if (isOctal.test(str))  {
      base = 8;
    } else {
      throw Error(invalidArgument + str);
    }

    // Is there a binary exponent part?
    i = str.search(/p/i);

    if (i > 0) {
      p = +str.slice(i + 1);
      str = str.substring(2, i);
    } else {
      str = str.slice(2);
    }

    // Convert `str` as an integer then divide the result by `base` raised to a power such that the
    // fraction part will be restored.
    i = str.indexOf('.');
    isFloat = i >= 0;
    Ctor = x.constructor;

    if (isFloat) {
      str = str.replace('.', '');
      len = str.length;
      i = len - i;

      // log[10](16) = 1.2041... , log[10](88) = 1.9444....
      divisor = intPow(Ctor, new Ctor(base), i, i * 2);
    }

    xd = convertBase(str, base, BASE);
    xe = xd.length - 1;

    // Remove trailing zeros.
    for (i = xe; xd[i] === 0; --i) xd.pop();
    if (i < 0) return new Ctor(x.s * 0);
    x.e = getBase10Exponent(xd, xe);
    x.d = xd;
    external = false;

    // At what precision to perform the division to ensure exact conversion?
    // maxDecimalIntegerPartDigitCount = ceil(log[10](b) * otherBaseIntegerPartDigitCount)
    // log[10](2) = 0.30103, log[10](8) = 0.90309, log[10](16) = 1.20412
    // E.g. ceil(1.2 * 3) = 4, so up to 4 decimal digits are needed to represent 3 hex int digits.
    // maxDecimalFractionPartDigitCount = {Hex:4|Oct:3|Bin:1} * otherBaseFractionPartDigitCount
    // Therefore using 4 * the number of digits of str will always be enough.
    if (isFloat) x = divide(x, divisor, len * 4);

    // Multiply by the binary exponent part if present.
    if (p) x = x.times(Math.abs(p) < 54 ? mathpow(2, p) : Decimal.pow(2, p));
    external = true;

    return x;
  }


  /*
   * sin(x) = x - x^3/3! + x^5/5! - ...
   * |x| < pi/2
   *
   */
  function sine(Ctor, x) {
    var k,
      len = x.d.length;

    if (len < 3) return taylorSeries(Ctor, 2, x, x);

    // Argument reduction: sin(5x) = 16*sin^5(x) - 20*sin^3(x) + 5*sin(x)
    // i.e. sin(x) = 16*sin^5(x/5) - 20*sin^3(x/5) + 5*sin(x/5)
    // and  sin(x) = sin(x/5)(5 + sin^2(x/5)(16sin^2(x/5) - 20))

    // Estimate the optimum number of times to use the argument reduction.
    k = 1.4 * Math.sqrt(len);
    k = k > 16 ? 16 : k | 0;

    x = x.times(1 / tinyPow(5, k));
    x = taylorSeries(Ctor, 2, x, x);

    // Reverse argument reduction
    var sin2_x,
      d5 = new Ctor(5),
      d16 = new Ctor(16),
      d20 = new Ctor(20);
    for (; k--;) {
      sin2_x = x.times(x);
      x = x.times(d5.plus(sin2_x.times(d16.times(sin2_x).minus(d20))));
    }

    return x;
  }


  // Calculate Taylor series for `cos`, `cosh`, `sin` and `sinh`.
  function taylorSeries(Ctor, n, x, y, isHyperbolic) {
    var j, t, u, x2,
      i = 1,
      pr = Ctor.precision,
      k = Math.ceil(pr / LOG_BASE);

    external = false;
    x2 = x.times(x);
    u = new Ctor(y);

    for (;;) {
      t = divide(u.times(x2), new Ctor(n++ * n++), pr, 1);
      u = isHyperbolic ? y.plus(t) : y.minus(t);
      y = divide(t.times(x2), new Ctor(n++ * n++), pr, 1);
      t = u.plus(y);

      if (t.d[k] !== void 0) {
        for (j = k; t.d[j] === u.d[j] && j--;);
        if (j == -1) break;
      }

      j = u;
      u = y;
      y = t;
      t = j;
      i++;
    }

    external = true;
    t.d.length = k + 1;

    return t;
  }


  // Exponent e must be positive and non-zero.
  function tinyPow(b, e) {
    var n = b;
    while (--e) n *= b;
    return n;
  }


  // Return the absolute value of `x` reduced to less than or equal to half pi.
  function toLessThanHalfPi(Ctor, x) {
    var t,
      isNeg = x.s < 0,
      pi = getPi(Ctor, Ctor.precision, 1),
      halfPi = pi.times(0.5);

    x = x.abs();

    if (x.lte(halfPi)) {
      quadrant = isNeg ? 4 : 1;
      return x;
    }

    t = x.divToInt(pi);

    if (t.isZero()) {
      quadrant = isNeg ? 3 : 2;
    } else {
      x = x.minus(t.times(pi));

      // 0 <= x < pi
      if (x.lte(halfPi)) {
        quadrant = isOdd(t) ? (isNeg ? 2 : 3) : (isNeg ? 4 : 1);
        return x;
      }

      quadrant = isOdd(t) ? (isNeg ? 1 : 4) : (isNeg ? 3 : 2);
    }

    return x.minus(pi).abs();
  }


  /*
   * Return the value of Decimal `x` as a string in base `baseOut`.
   *
   * If the optional `sd` argument is present include a binary exponent suffix.
   */
  function toStringBinary(x, baseOut, sd, rm) {
    var base, e, i, k, len, roundUp, str, xd, y,
      Ctor = x.constructor,
      isExp = sd !== void 0;

    if (isExp) {
      checkInt32(sd, 1, MAX_DIGITS);
      if (rm === void 0) rm = Ctor.rounding;
      else checkInt32(rm, 0, 8);
    } else {
      sd = Ctor.precision;
      rm = Ctor.rounding;
    }

    if (!x.isFinite()) {
      str = nonFiniteToString(x);
    } else {
      str = finiteToString(x);
      i = str.indexOf('.');

      // Use exponential notation according to `toExpPos` and `toExpNeg`? No, but if required:
      // maxBinaryExponent = floor((decimalExponent + 1) * log[2](10))
      // minBinaryExponent = floor(decimalExponent * log[2](10))
      // log[2](10) = 3.321928094887362347870319429489390175864

      if (isExp) {
        base = 2;
        if (baseOut == 16) {
          sd = sd * 4 - 3;
        } else if (baseOut == 8) {
          sd = sd * 3 - 2;
        }
      } else {
        base = baseOut;
      }

      // Convert the number as an integer then divide the result by its base raised to a power such
      // that the fraction part will be restored.

      // Non-integer.
      if (i >= 0) {
        str = str.replace('.', '');
        y = new Ctor(1);
        y.e = str.length - i;
        y.d = convertBase(finiteToString(y), 10, base);
        y.e = y.d.length;
      }

      xd = convertBase(str, 10, base);
      e = len = xd.length;

      // Remove trailing zeros.
      for (; xd[--len] == 0;) xd.pop();

      if (!xd[0]) {
        str = isExp ? '0p+0' : '0';
      } else {
        if (i < 0) {
          e--;
        } else {
          x = new Ctor(x);
          x.d = xd;
          x.e = e;
          x = divide(x, y, sd, rm, 0, base);
          xd = x.d;
          e = x.e;
          roundUp = inexact;
        }

        // The rounding digit, i.e. the digit after the digit that may be rounded up.
        i = xd[sd];
        k = base / 2;
        roundUp = roundUp || xd[sd + 1] !== void 0;

        roundUp = rm < 4
          ? (i !== void 0 || roundUp) && (rm === 0 || rm === (x.s < 0 ? 3 : 2))
          : i > k || i === k && (rm === 4 || roundUp || rm === 6 && xd[sd - 1] & 1 ||
            rm === (x.s < 0 ? 8 : 7));

        xd.length = sd;

        if (roundUp) {

          // Rounding up may mean the previous digit has to be rounded up and so on.
          for (; ++xd[--sd] > base - 1;) {
            xd[sd] = 0;
            if (!sd) {
              ++e;
              xd.unshift(1);
            }
          }
        }

        // Determine trailing zeros.
        for (len = xd.length; !xd[len - 1]; --len);

        // E.g. [4, 11, 15] becomes 4bf.
        for (i = 0, str = ''; i < len; i++) str += NUMERALS.charAt(xd[i]);

        // Add binary exponent suffix?
        if (isExp) {
          if (len > 1) {
            if (baseOut == 16 || baseOut == 8) {
              i = baseOut == 16 ? 4 : 3;
              for (--len; len % i; len++) str += '0';
              xd = convertBase(str, base, baseOut);
              for (len = xd.length; !xd[len - 1]; --len);

              // xd[0] will always be be 1
              for (i = 1, str = '1.'; i < len; i++) str += NUMERALS.charAt(xd[i]);
            } else {
              str = str.charAt(0) + '.' + str.slice(1);
            }
          }

          str =  str + (e < 0 ? 'p' : 'p+') + e;
        } else if (e < 0) {
          for (; ++e;) str = '0' + str;
          str = '0.' + str;
        } else {
          if (++e > len) for (e -= len; e-- ;) str += '0';
          else if (e < len) str = str.slice(0, e) + '.' + str.slice(e);
        }
      }

      str = (baseOut == 16 ? '0x' : baseOut == 2 ? '0b' : baseOut == 8 ? '0o' : '') + str;
    }

    return x.s < 0 ? '-' + str : str;
  }


  // Does not strip trailing zeros.
  function truncate(arr, len) {
    if (arr.length > len) {
      arr.length = len;
      return true;
    }
  }


  // Decimal methods


  /*
   *  abs
   *  acos
   *  acosh
   *  add
   *  asin
   *  asinh
   *  atan
   *  atanh
   *  atan2
   *  cbrt
   *  ceil
   *  clone
   *  config
   *  cos
   *  cosh
   *  div
   *  exp
   *  floor
   *  hypot
   *  ln
   *  log
   *  log2
   *  log10
   *  max
   *  min
   *  mod
   *  mul
   *  pow
   *  random
   *  round
   *  set
   *  sign
   *  sin
   *  sinh
   *  sqrt
   *  sub
   *  tan
   *  tanh
   *  trunc
   */


  /*
   * Return a new Decimal whose value is the absolute value of `x`.
   *
   * x {number|string|Decimal}
   *
   */
  function abs(x) {
    return new this(x).abs();
  }


  /*
   * Return a new Decimal whose value is the arccosine in radians of `x`.
   *
   * x {number|string|Decimal}
   *
   */
  function acos(x) {
    return new this(x).acos();
  }


  /*
   * Return a new Decimal whose value is the inverse of the hyperbolic cosine of `x`, rounded to
   * `precision` significant digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal} A value in radians.
   *
   */
  function acosh(x) {
    return new this(x).acosh();
  }


  /*
   * Return a new Decimal whose value is the sum of `x` and `y`, rounded to `precision` significant
   * digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal}
   * y {number|string|Decimal}
   *
   */
  function add(x, y) {
    return new this(x).plus(y);
  }


  /*
   * Return a new Decimal whose value is the arcsine in radians of `x`, rounded to `precision`
   * significant digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal}
   *
   */
  function asin(x) {
    return new this(x).asin();
  }


  /*
   * Return a new Decimal whose value is the inverse of the hyperbolic sine of `x`, rounded to
   * `precision` significant digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal} A value in radians.
   *
   */
  function asinh(x) {
    return new this(x).asinh();
  }


  /*
   * Return a new Decimal whose value is the arctangent in radians of `x`, rounded to `precision`
   * significant digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal}
   *
   */
  function atan(x) {
    return new this(x).atan();
  }


  /*
   * Return a new Decimal whose value is the inverse of the hyperbolic tangent of `x`, rounded to
   * `precision` significant digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal} A value in radians.
   *
   */
  function atanh(x) {
    return new this(x).atanh();
  }


  /*
   * Return a new Decimal whose value is the arctangent in radians of `y/x` in the range -pi to pi
   * (inclusive), rounded to `precision` significant digits using rounding mode `rounding`.
   *
   * Domain: [-Infinity, Infinity]
   * Range: [-pi, pi]
   *
   * y {number|string|Decimal} The y-coordinate.
   * x {number|string|Decimal} The x-coordinate.
   *
   * atan2(±0, -0)               = ±pi
   * atan2(±0, +0)               = ±0
   * atan2(±0, -x)               = ±pi for x > 0
   * atan2(±0, x)                = ±0 for x > 0
   * atan2(-y, ±0)               = -pi/2 for y > 0
   * atan2(y, ±0)                = pi/2 for y > 0
   * atan2(±y, -Infinity)        = ±pi for finite y > 0
   * atan2(±y, +Infinity)        = ±0 for finite y > 0
   * atan2(±Infinity, x)         = ±pi/2 for finite x
   * atan2(±Infinity, -Infinity) = ±3*pi/4
   * atan2(±Infinity, +Infinity) = ±pi/4
   * atan2(NaN, x) = NaN
   * atan2(y, NaN) = NaN
   *
   */
  function atan2(y, x) {
    y = new this(y);
    x = new this(x);
    var r,
      pr = this.precision,
      rm = this.rounding,
      wpr = pr + 4;

    // Either NaN
    if (!y.s || !x.s) {
      r = new this(NaN);

    // Both ±Infinity
    } else if (!y.d && !x.d) {
      r = getPi(this, wpr, 1).times(x.s > 0 ? 0.25 : 0.75);
      r.s = y.s;

    // x is ±Infinity or y is ±0
    } else if (!x.d || y.isZero()) {
      r = x.s < 0 ? getPi(this, pr, rm) : new this(0);
      r.s = y.s;

    // y is ±Infinity or x is ±0
    } else if (!y.d || x.isZero()) {
      r = getPi(this, wpr, 1).times(0.5);
      r.s = y.s;

    // Both non-zero and finite
    } else if (x.s < 0) {
      this.precision = wpr;
      this.rounding = 1;
      r = this.atan(divide(y, x, wpr, 1));
      x = getPi(this, wpr, 1);
      this.precision = pr;
      this.rounding = rm;
      r = y.s < 0 ? r.minus(x) : r.plus(x);
    } else {
      r = this.atan(divide(y, x, wpr, 1));
    }

    return r;
  }


  /*
   * Return a new Decimal whose value is the cube root of `x`, rounded to `precision` significant
   * digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal}
   *
   */
  function cbrt(x) {
    return new this(x).cbrt();
  }


  /*
   * Return a new Decimal whose value is `x` rounded to an integer using `ROUND_CEIL`.
   *
   * x {number|string|Decimal}
   *
   */
  function ceil(x) {
    return finalise(x = new this(x), x.e + 1, 2);
  }


  /*
   * Configure global settings for a Decimal constructor.
   *
   * `obj` is an object with one or more of the following properties,
   *
   *   precision  {number}
   *   rounding   {number}
   *   toExpNeg   {number}
   *   toExpPos   {number}
   *   maxE       {number}
   *   minE       {number}
   *   modulo     {number}
   *   crypto     {boolean|number}
   *   defaults   {true}
   *
   * E.g. Decimal.config({ precision: 20, rounding: 4 })
   *
   */
  function config(obj) {
    if (!obj || typeof obj !== 'object') throw Error(decimalError + 'Object expected');
    var i, p, v,
      useDefaults = obj.defaults === true,
      ps = [
        'precision', 1, MAX_DIGITS,
        'rounding', 0, 8,
        'toExpNeg', -EXP_LIMIT, 0,
        'toExpPos', 0, EXP_LIMIT,
        'maxE', 0, EXP_LIMIT,
        'minE', -EXP_LIMIT, 0,
        'modulo', 0, 9
      ];

    for (i = 0; i < ps.length; i += 3) {
      if (p = ps[i], useDefaults) this[p] = DEFAULTS[p];
      if ((v = obj[p]) !== void 0) {
        if (mathfloor(v) === v && v >= ps[i + 1] && v <= ps[i + 2]) this[p] = v;
        else throw Error(invalidArgument + p + ': ' + v);
      }
    }

    if (p = 'crypto', useDefaults) this[p] = DEFAULTS[p];
    if ((v = obj[p]) !== void 0) {
      if (v === true || v === false || v === 0 || v === 1) {
        if (v) {
          if (typeof crypto != 'undefined' && crypto &&
            (crypto.getRandomValues || crypto.randomBytes)) {
            this[p] = true;
          } else {
            throw Error(cryptoUnavailable);
          }
        } else {
          this[p] = false;
        }
      } else {
        throw Error(invalidArgument + p + ': ' + v);
      }
    }

    return this;
  }


  /*
   * Return a new Decimal whose value is the cosine of `x`, rounded to `precision` significant
   * digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal} A value in radians.
   *
   */
  function cos(x) {
    return new this(x).cos();
  }


  /*
   * Return a new Decimal whose value is the hyperbolic cosine of `x`, rounded to precision
   * significant digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal} A value in radians.
   *
   */
  function cosh(x) {
    return new this(x).cosh();
  }


  /*
   * Create and return a Decimal constructor with the same configuration properties as this Decimal
   * constructor.
   *
   */
  function clone(obj) {
    var i, p, ps;

    /*
     * The Decimal constructor and exported function.
     * Return a new Decimal instance.
     *
     * v {number|string|Decimal} A numeric value.
     *
     */
    function Decimal(v) {
      var e, i, t,
        x = this;

      // Decimal called without new.
      if (!(x instanceof Decimal)) return new Decimal(v);

      // Retain a reference to this Decimal constructor, and shadow Decimal.prototype.constructor
      // which points to Object.
      x.constructor = Decimal;

      // Duplicate.
      if (v instanceof Decimal) {
        x.s = v.s;

        if (external) {
          if (!v.d || v.e > Decimal.maxE) {

            // Infinity.
            x.e = NaN;
            x.d = null;
          } else if (v.e < Decimal.minE) {

            // Zero.
            x.e = 0;
            x.d = [0];
          } else {
            x.e = v.e;
            x.d = v.d.slice();
          }
        } else {
          x.e = v.e;
          x.d = v.d ? v.d.slice() : v.d;
        }

        return;
      }

      t = typeof v;

      if (t === 'number') {
        if (v === 0) {
          x.s = 1 / v < 0 ? -1 : 1;
          x.e = 0;
          x.d = [0];
          return;
        }

        if (v < 0) {
          v = -v;
          x.s = -1;
        } else {
          x.s = 1;
        }

        // Fast path for small integers.
        if (v === ~~v && v < 1e7) {
          for (e = 0, i = v; i >= 10; i /= 10) e++;

          if (external) {
            if (e > Decimal.maxE) {
              x.e = NaN;
              x.d = null;
            } else if (e < Decimal.minE) {
              x.e = 0;
              x.d = [0];
            } else {
              x.e = e;
              x.d = [v];
            }
          } else {
            x.e = e;
            x.d = [v];
          }

          return;

        // Infinity, NaN.
        } else if (v * 0 !== 0) {
          if (!v) x.s = NaN;
          x.e = NaN;
          x.d = null;
          return;
        }

        return parseDecimal(x, v.toString());

      } else if (t !== 'string') {
        throw Error(invalidArgument + v);
      }

      // Minus sign?
      if ((i = v.charCodeAt(0)) === 45) {
        v = v.slice(1);
        x.s = -1;
      } else {
        // Plus sign?
        if (i === 43) v = v.slice(1);
        x.s = 1;
      }

      return isDecimal.test(v) ? parseDecimal(x, v) : parseOther(x, v);
    }

    Decimal.prototype = P;

    Decimal.ROUND_UP = 0;
    Decimal.ROUND_DOWN = 1;
    Decimal.ROUND_CEIL = 2;
    Decimal.ROUND_FLOOR = 3;
    Decimal.ROUND_HALF_UP = 4;
    Decimal.ROUND_HALF_DOWN = 5;
    Decimal.ROUND_HALF_EVEN = 6;
    Decimal.ROUND_HALF_CEIL = 7;
    Decimal.ROUND_HALF_FLOOR = 8;
    Decimal.EUCLID = 9;

    Decimal.config = Decimal.set = config;
    Decimal.clone = clone;
    Decimal.isDecimal = isDecimalInstance;

    Decimal.abs = abs;
    Decimal.acos = acos;
    Decimal.acosh = acosh;        // ES6
    Decimal.add = add;
    Decimal.asin = asin;
    Decimal.asinh = asinh;        // ES6
    Decimal.atan = atan;
    Decimal.atanh = atanh;        // ES6
    Decimal.atan2 = atan2;
    Decimal.cbrt = cbrt;          // ES6
    Decimal.ceil = ceil;
    Decimal.cos = cos;
    Decimal.cosh = cosh;          // ES6
    Decimal.div = div;
    Decimal.exp = exp;
    Decimal.floor = floor;
    Decimal.hypot = hypot;        // ES6
    Decimal.ln = ln;
    Decimal.log = log;
    Decimal.log10 = log10;        // ES6
    Decimal.log2 = log2;          // ES6
    Decimal.max = max;
    Decimal.min = min;
    Decimal.mod = mod;
    Decimal.mul = mul;
    Decimal.pow = pow;
    Decimal.random = random;
    Decimal.round = round;
    Decimal.sign = sign;          // ES6
    Decimal.sin = sin;
    Decimal.sinh = sinh;          // ES6
    Decimal.sqrt = sqrt;
    Decimal.sub = sub;
    Decimal.tan = tan;
    Decimal.tanh = tanh;          // ES6
    Decimal.trunc = trunc;        // ES6

    if (obj === void 0) obj = {};
    if (obj) {
      if (obj.defaults !== true) {
        ps = ['precision', 'rounding', 'toExpNeg', 'toExpPos', 'maxE', 'minE', 'modulo', 'crypto'];
        for (i = 0; i < ps.length;) if (!obj.hasOwnProperty(p = ps[i++])) obj[p] = this[p];
      }
    }

    Decimal.config(obj);

    return Decimal;
  }


  /*
   * Return a new Decimal whose value is `x` divided by `y`, rounded to `precision` significant
   * digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal}
   * y {number|string|Decimal}
   *
   */
  function div(x, y) {
    return new this(x).div(y);
  }


  /*
   * Return a new Decimal whose value is the natural exponential of `x`, rounded to `precision`
   * significant digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal} The power to which to raise the base of the natural log.
   *
   */
  function exp(x) {
    return new this(x).exp();
  }


  /*
   * Return a new Decimal whose value is `x` round to an integer using `ROUND_FLOOR`.
   *
   * x {number|string|Decimal}
   *
   */
  function floor(x) {
    return finalise(x = new this(x), x.e + 1, 3);
  }


  /*
   * Return a new Decimal whose value is the square root of the sum of the squares of the arguments,
   * rounded to `precision` significant digits using rounding mode `rounding`.
   *
   * hypot(a, b, ...) = sqrt(a^2 + b^2 + ...)
   *
   * arguments {number|string|Decimal}
   *
   */
  function hypot() {
    var i, n,
      t = new this(0);

    external = false;

    for (i = 0; i < arguments.length;) {
      n = new this(arguments[i++]);
      if (!n.d) {
        if (n.s) {
          external = true;
          return new this(1 / 0);
        }
        t = n;
      } else if (t.d) {
        t = t.plus(n.times(n));
      }
    }

    external = true;

    return t.sqrt();
  }


  /*
   * Return true if object is a Decimal instance (where Decimal is any Decimal constructor),
   * otherwise return false.
   *
   */
  function isDecimalInstance(obj) {
    return obj instanceof Decimal || obj && obj.name === '[object Decimal]' || false;
  }


  /*
   * Return a new Decimal whose value is the natural logarithm of `x`, rounded to `precision`
   * significant digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal}
   *
   */
  function ln(x) {
    return new this(x).ln();
  }


  /*
   * Return a new Decimal whose value is the log of `x` to the base `y`, or to base 10 if no base
   * is specified, rounded to `precision` significant digits using rounding mode `rounding`.
   *
   * log[y](x)
   *
   * x {number|string|Decimal} The argument of the logarithm.
   * y {number|string|Decimal} The base of the logarithm.
   *
   */
  function log(x, y) {
    return new this(x).log(y);
  }


  /*
   * Return a new Decimal whose value is the base 2 logarithm of `x`, rounded to `precision`
   * significant digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal}
   *
   */
  function log2(x) {
    return new this(x).log(2);
  }


  /*
   * Return a new Decimal whose value is the base 10 logarithm of `x`, rounded to `precision`
   * significant digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal}
   *
   */
  function log10(x) {
    return new this(x).log(10);
  }


  /*
   * Return a new Decimal whose value is the maximum of the arguments.
   *
   * arguments {number|string|Decimal}
   *
   */
  function max() {
    return maxOrMin(this, arguments, 'lt');
  }


  /*
   * Return a new Decimal whose value is the minimum of the arguments.
   *
   * arguments {number|string|Decimal}
   *
   */
  function min() {
    return maxOrMin(this, arguments, 'gt');
  }


  /*
   * Return a new Decimal whose value is `x` modulo `y`, rounded to `precision` significant digits
   * using rounding mode `rounding`.
   *
   * x {number|string|Decimal}
   * y {number|string|Decimal}
   *
   */
  function mod(x, y) {
    return new this(x).mod(y);
  }


  /*
   * Return a new Decimal whose value is `x` multiplied by `y`, rounded to `precision` significant
   * digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal}
   * y {number|string|Decimal}
   *
   */
  function mul(x, y) {
    return new this(x).mul(y);
  }


  /*
   * Return a new Decimal whose value is `x` raised to the power `y`, rounded to precision
   * significant digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal} The base.
   * y {number|string|Decimal} The exponent.
   *
   */
  function pow(x, y) {
    return new this(x).pow(y);
  }


  /*
   * Returns a new Decimal with a random value equal to or greater than 0 and less than 1, and with
   * `sd`, or `Decimal.precision` if `sd` is omitted, significant digits (or less if trailing zeros
   * are produced).
   *
   * [sd] {number} Significant digits. Integer, 0 to MAX_DIGITS inclusive.
   *
   */
  function random(sd) {
    var d, e, k, n,
      i = 0,
      r = new this(1),
      rd = [];

    if (sd === void 0) sd = this.precision;
    else checkInt32(sd, 1, MAX_DIGITS);

    k = Math.ceil(sd / LOG_BASE);

    if (!this.crypto) {
      for (; i < k;) rd[i++] = Math.random() * 1e7 | 0;

    // Browsers supporting crypto.getRandomValues.
    } else if (crypto.getRandomValues) {
      d = crypto.getRandomValues(new Uint32Array(k));

      for (; i < k;) {
        n = d[i];

        // 0 <= n < 4294967296
        // Probability n >= 4.29e9, is 4967296 / 4294967296 = 0.00116 (1 in 865).
        if (n >= 4.29e9) {
          d[i] = crypto.getRandomValues(new Uint32Array(1))[0];
        } else {

          // 0 <= n <= 4289999999
          // 0 <= (n % 1e7) <= 9999999
          rd[i++] = n % 1e7;
        }
      }

    // Node.js supporting crypto.randomBytes.
    } else if (crypto.randomBytes) {

      // buffer
      d = crypto.randomBytes(k *= 4);

      for (; i < k;) {

        // 0 <= n < 2147483648
        n = d[i] + (d[i + 1] << 8) + (d[i + 2] << 16) + ((d[i + 3] & 0x7f) << 24);

        // Probability n >= 2.14e9, is 7483648 / 2147483648 = 0.0035 (1 in 286).
        if (n >= 2.14e9) {
          crypto.randomBytes(4).copy(d, i);
        } else {

          // 0 <= n <= 2139999999
          // 0 <= (n % 1e7) <= 9999999
          rd.push(n % 1e7);
          i += 4;
        }
      }

      i = k / 4;
    } else {
      throw Error(cryptoUnavailable);
    }

    k = rd[--i];
    sd %= LOG_BASE;

    // Convert trailing digits to zeros according to sd.
    if (k && sd) {
      n = mathpow(10, LOG_BASE - sd);
      rd[i] = (k / n | 0) * n;
    }

    // Remove trailing words which are zero.
    for (; rd[i] === 0; i--) rd.pop();

    // Zero?
    if (i < 0) {
      e = 0;
      rd = [0];
    } else {
      e = -1;

      // Remove leading words which are zero and adjust exponent accordingly.
      for (; rd[0] === 0; e -= LOG_BASE) rd.shift();

      // Count the digits of the first word of rd to determine leading zeros.
      for (k = 1, n = rd[0]; n >= 10; n /= 10) k++;

      // Adjust the exponent for leading zeros of the first word of rd.
      if (k < LOG_BASE) e -= LOG_BASE - k;
    }

    r.e = e;
    r.d = rd;

    return r;
  }


  /*
   * Return a new Decimal whose value is `x` rounded to an integer using rounding mode `rounding`.
   *
   * To emulate `Math.round`, set rounding to 7 (ROUND_HALF_CEIL).
   *
   * x {number|string|Decimal}
   *
   */
  function round(x) {
    return finalise(x = new this(x), x.e + 1, this.rounding);
  }


  /*
   * Return
   *   1    if x > 0,
   *  -1    if x < 0,
   *   0    if x is 0,
   *  -0    if x is -0,
   *   NaN  otherwise
   *
   * x {number|string|Decimal}
   *
   */
  function sign(x) {
    x = new this(x);
    return x.d ? (x.d[0] ? x.s : 0 * x.s) : x.s || NaN;
  }


  /*
   * Return a new Decimal whose value is the sine of `x`, rounded to `precision` significant digits
   * using rounding mode `rounding`.
   *
   * x {number|string|Decimal} A value in radians.
   *
   */
  function sin(x) {
    return new this(x).sin();
  }


  /*
   * Return a new Decimal whose value is the hyperbolic sine of `x`, rounded to `precision`
   * significant digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal} A value in radians.
   *
   */
  function sinh(x) {
    return new this(x).sinh();
  }


  /*
   * Return a new Decimal whose value is the square root of `x`, rounded to `precision` significant
   * digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal}
   *
   */
  function sqrt(x) {
    return new this(x).sqrt();
  }


  /*
   * Return a new Decimal whose value is `x` minus `y`, rounded to `precision` significant digits
   * using rounding mode `rounding`.
   *
   * x {number|string|Decimal}
   * y {number|string|Decimal}
   *
   */
  function sub(x, y) {
    return new this(x).sub(y);
  }


  /*
   * Return a new Decimal whose value is the tangent of `x`, rounded to `precision` significant
   * digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal} A value in radians.
   *
   */
  function tan(x) {
    return new this(x).tan();
  }


  /*
   * Return a new Decimal whose value is the hyperbolic tangent of `x`, rounded to `precision`
   * significant digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal} A value in radians.
   *
   */
  function tanh(x) {
    return new this(x).tanh();
  }


  /*
   * Return a new Decimal whose value is `x` truncated to an integer.
   *
   * x {number|string|Decimal}
   *
   */
  function trunc(x) {
    return finalise(x = new this(x), x.e + 1, 1);
  }


  // Create and configure initial Decimal constructor.
  Decimal = clone(DEFAULTS);

  Decimal['default'] = Decimal.Decimal = Decimal;

  // Create the internal constants from their string values.
  LN10 = new Decimal(LN10);
  PI = new Decimal(PI);


  // Export.


  // AMD.
  if (typeof define == 'function' && define.amd) {
    define(function () {
      return Decimal;
    });

  // Node and other environments that support module.exports.
  } else if (typeof module != 'undefined' && module.exports) {
    if (typeof Symbol == 'function' && typeof Symbol.iterator == 'symbol') {
      P[Symbol.for('nodejs.util.inspect.custom')] = P.toString;
      P[Symbol.toStringTag] = 'Decimal';
    }

    module.exports = Decimal;

  // Browser.
  } else {
    if (!globalScope) {
      globalScope = typeof self != 'undefined' && self && self.self == self ? self : window;
    }

    noConflict = globalScope.Decimal;
    Decimal.noConflict = function () {
      globalScope.Decimal = noConflict;
      return Decimal;
    };

    globalScope.Decimal = Decimal;
  }
})(this);

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
    const   Task = require('./Tasks/Task'),
            EventListener = require('./EventListener'),
            Decimal = require('decimal.js');

    class CPUFullError extends Error{};
    class CPUDuplicateTaskError extends Error{};
    class InvalidTaskError extends Error{};

    const DEFAULT_PROCESSOR_SPEED = 20;

    class CPU extends EventListener
    {
        constructor(name, speed)
        {
            super();
            /**
             * @type {string}
             */
            this.name = name?name:"Garbo Processor";
            /**
             * @type {Decimal}
             */
            this.speed = speed?speed:Decimal(DEFAULT_PROCESSOR_SPEED);
            /**
             * @type {Array.<Task>}
             */
            this.tasks = [];
        }

        /**
         *  @param task
         * @returns {Decimal}
         */
        getCyclesForTask(task)
        {
            // the amount of cycles the cpu is going to devote to each task is 1/nth of the total cycles
            // where n is the total of tasks that will be run including this task
            // I'm going to fudge with that a bit to make sure no rogue amounts start appearing and dissappearing
            return Decimal.max(task.minimumRequiredCycles, Decimal.floor(this.speed.div(this.tasks.length + 1)));
        }

        addTask(task)
        {
            if (!(task instanceof Task))
            {
                throw new InvalidTaskError('Tried to add a non task object to a processor');
            }
            if(this.tasks.indexOf(task)>=0)
            {
                throw new CPUDuplicateTaskError('This task is already on the CPU');
            }


            let cyclesToAssign = this.getCyclesForTask(task),
                idealCyclesToAssign = cyclesToAssign;
            //if(cyclesToAssign > (this.speed - this.load))
            if(cyclesToAssign.greaterThan(this.speed.sub(this.load)))
            {
                throw new CPUFullError('Tried to add more cycles to the CPU than there are free cycles for');
            }

            if(this.tasks.length > 0)
            {
                let cyclesToTryToTakeAwayFromEachProcess = Math.ceil(idealCyclesToAssign / this.tasks.length),
                    cyclesFreedUp = 0;

                for(let task of this.tasks)
                {
                    cyclesFreedUp += task.freeCycles(cyclesToTryToTakeAwayFromEachProcess);
                }
                cyclesToAssign = cyclesFreedUp;
            }
            task.setCyclesPerTick(cyclesToAssign);
            this.tasks.push(task);
            task.on('complete', ()=>{ this.completeTask(task); });
            return this;
        }

        completeTask(task)
        {
            let freedCycles = task.cyclesPerTick;
            this.tasks.removeElement(task);

            if(this.tasks.length >= 1)
            {
                let freedCyclesPerTick = Math.floor(freedCycles/this.tasks.length);
                let i = 0;
                while(i < this.tasks.length && freedCycles > 0)
                {
                    let task = this.tasks[i];
                    freedCycles -= freedCyclesPerTick;
                    task.addCycles(freedCyclesPerTick);
                    i++;
                }
            }
            this.trigger('taskComplete');
        }

        tick()
        {
            for(let task of this.tasks)
            {
                task.tick();
            }
        }

        get load()
        {
            let minimum = new Decimal(0);
            for(let task of this.tasks)
            {
                minimum = minimum.plus(task.minimumRequiredCycles);
            }
            return minimum;
        }
    }

module.exports = CPU;

},{"./EventListener":11,"./Tasks/Task":20,"decimal.js":1}],4:[function(require,module,exports){
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
     * A method to signal to the Mission Computer, or localhost that a Challenge has been complete.
     */
    signalSolved()
    {
        this.solved = true;
        this.trigger('solved');
        return this;
    }
}

module.exports = Challenge;

},{"../EventListener":11}],5:[function(require,module,exports){
const Decimal = require('decimal.js');

/**
 * @type {{}}
 */
const DIFFICULTIES = {
    'EASY':{name:'Linear', size:{min:7, max:11}},
    'MEDIUM':{name:'Quadratic', size:{min:10,max:15}},
    'HARD':{name:'Cubic', size:{min:15,max:20}}
};

function getRandomIntBetween(min, max)
{
    return Math.floor(Math.random() * (+max - +min)) + +min
}
const Challenge = require('./Challenge');
class Encryption extends Challenge
{
    constructor(difficulty)
    {
        let rows = getRandomIntBetween(difficulty.size.min, difficulty.size.max),
            cols = getRandomIntBetween(difficulty.size.min, difficulty.size.max),
            difficultyRatio = Math.floor(Math.sqrt(rows * cols));
        super(difficulty.name + ' Encryption', new Decimal(difficultyRatio));
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

},{"./Challenge":4,"decimal.js":1}],6:[function(require,module,exports){
const   dictionary = require('./dictionary'),
        Challenge = require('./Challenge'),
        Decimal = require('decimal.js');

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
        super(type + ' Password', new Decimal(difficulty));
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
        let reduction = 10 - difficulty,
            usedDictionary = [];
        dictionary.forEach((entry, index)=>{if(index%PASSWORD_DICTIONARY_DIFFICULTIES.HARDEST >= reduction){usedDictionary.push(entry);}});
        let dictionaryPassword = new Password(usedDictionary.randomElement(), PASSWORD_TYPES.DICTIONARY, difficulty);
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

},{"./Challenge":4,"./dictionary":7,"decimal.js":1}],7:[function(require,module,exports){
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

},{}],8:[function(require,module,exports){
const   Computer = require('./Computer'),
        Decimal = require('decimal.js');


let companyNames = [
    "Mike Rowe soft",
    "Pear",
    "Outel",
    "Ice",
    "Tomsung",
    "Popsy",
    "Ohm Djezis"
];
let companies = [];


class Company
{
    constructor(name)
    {
        this.name = name;
        this.publicServer = new Computer(`${this.name} Public Server`);
        this.computers = [];
        this.addComputer(this.publicServer);
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
        this.missionSuccessIncreaseExponent = new Decimal(1.05);
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

    static get allCompanies()
    {
        return companies;
    }
}

for(let companyName of companyNames)
{
    companies.push(new Company(companyName));
}

module.exports = Company;

},{"./Computer":9,"decimal.js":1}],9:[function(require,module,exports){
const EventListener = require('./EventListener');

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

class Computer extends EventListener
{
    constructor(name, company, ipAddress)
    {
        super();
        this.name= name;
        this.ipAddress = ipAddress?ipAddress:randomIPAddress();
        this.location = null;
        this.company = company;
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

    static fromJSON(json)
    {
        let computer = new Computer(json.name, json.ipAddress);
        computer.setLocation(json.location);
    }

    toJSON()
    {
        let json = {
            name:this.name,
            ipAddress:this.ipAddress,
            location:this.location
        };
    }
}

module.exports = Computer;

},{"./EventListener":11}],10:[function(require,module,exports){
const   MissionGenerator = require('./Missions/MissionGenerator'),
        PlayerComputer = require('./PlayerComputer'),
        EventListener = require('./EventListener'),
        Company = require('./Company'),
        Decimal = require('decimal.js');

/**
 * This exists as an instantiable class only because it's really difficult to get static classes to have events
 */
class Downlink extends EventListener
{
    constructor()
    {
        super();
        this.playerComputer = PlayerComputer.getMyFirstComputer();
        this.currency = new Decimal(0);
    }

    tick()
    {
        this.playerComputer.tick();
        this.activeMission.tick();
    }

    getNextMission()
    {
        this.activeMission = MissionGenerator.getFirstAvailableMission().on("complete", ()=>{
            this.finishCurrentMission(this.activeMission);
        });
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

    /**
     *
     * @returns {[<Company>]}
     */
    get companies()
    {
        return Company.allCompanies;
    }
}

module.exports = new Downlink();

},{"./Company":8,"./EventListener":11,"./Missions/MissionGenerator":16,"./PlayerComputer":17,"decimal.js":1}],11:[function(require,module,exports){
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

},{}],12:[function(require,module,exports){
// namespace for the entire game;

(($)=>{$(()=>{
    const   Downlink = require('./Downlink'),
            TICK_INTERVAL_LENGTH=100,
            MISSION_LIST_CLASS = 'mission-list-row',
            COMPANY_REP_CLASS = 'company-rep-row',
            PLAYER_COMPUTER_CPU_ROW_CLASS = "cpu-row";

    let game = {
        interval:null,
        ticking:true,
        initialised:false,
        mission:false,
        computer:null,
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
        initialise:function()
        {
            if(this.initialised)
            {
                return;
            }
            /*
             * Bind the UI elements
             */
            this.$missionContainer = $('#mission-list');
            this.$activeMissionName = $('#active-mission');
            this.$activeMissionPassword = $('#active-mission-password-input');
            this.$activeMissionEncryptionGrid = $('#active-mission-encryption-grid');
            this.$activeMissionEncryptionType = $('#active-mission-encryption-type');
            this.$activeMissionIPAddress = $('#active-mission-server-ip-address');
            this.$activeMissionServerName = $('#active-mission-server-name');
            this.$playerCurrencySpan = $('#player-currency');
            this.$playerStandingsTitle = $('#player-company-standings-title');
            this.$playerComputerCPUListContainer = $('#player-computer-processors');

            // build the html elements that are used without missions stuff
            this.updatePlayerReputations();
            this.updateComputerBuild();

            /*
             * expose the player computer class for test purposes
             */
            this.computer = Downlink.playerComputer;

            this.getNewMission();
            this.initialised = true;
        },
        start:function(){
            this.initialise();
            this.ticking = true;

            this.tick();
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
                    Downlink.tick();
                    this.animateTick();
                    this.interval = window.setTimeout(() => {this.tick()}, TICK_INTERVAL_LENGTH);
                }
            }
            catch(e)
            {
                console.log(e);
            }
        },
        animateTick:function()
        {
            let tasks = Downlink.currentMissionTasks;
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
        },
        getNewMission:function(){
            this.mission = Downlink.getNextMission()
                .on('complete', ()=>{
                    this.updatePlayerDetails();
                    this.getNewMission();
                });
            Downlink
                .on("challengeSolved", (task)=>{this.updateChallenge(task)});
            this.updateMissionInterface(this.mission);
        },
        updatePlayerDetails:function()
        {
            this.$playerCurrencySpan.html(Downlink.currency.toFixed(2));
            this.updatePlayerReputations();
        },
        updatePlayerReputations:function()
        {
            $(`.${COMPANY_REP_CLASS}`).remove();
            let html = '';
            for(let company of Downlink.companies)
            {
                html += `<div class="row ${COMPANY_REP_CLASS}"><div class="col">${company.name}</div><div class="col">${company.playerRespectModifier.toFixed(2)}</div></div>`;
            }
            this.$playerStandingsTitle.after(html);
        },
        updateComputerBuild:function()
        {
            $(`.${PLAYER_COMPUTER_CPU_ROW_CLASS}`).remove();

            let html = '';
            for(let cpu of Downlink.playerComputer.cpus)
            {
                html += `<div class="row ${PLAYER_COMPUTER_CPU_ROW_CLASS}"><div class="col">${cpu.name}</div><div class="col">${cpu.speed}MHz</div></div>`;
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
            for(let mission of Downlink.availableMissions)
            {
                html += `<div class="row ${MISSION_LIST_CLASS}">${mission.name}</div>`;
            }
            let $html = $(html);
            this.$missionContainer.append($html);
        }
    };

    game.start();

    window.game = game;
})})(window.jQuery);

},{"./Downlink":10}],13:[function(require,module,exports){
const   Company = require('../Company'),
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
        return this.difficulty.modifier.times(this.computer.difficultyModifier).times(this.sponsor.playerRespectModifier);
    }

    signalComplete()
    {
        this.status="Complete";
        this.sponsor.finishMission(this);
        this.trigger('complete');
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

},{"../Challenges/Encryption":5,"../Challenges/Password":6,"../Company":8,"../EventListener":11,"./MissionComputer":14,"./MissionDifficulty":15}],14:[function(require,module,exports){
const   Computer = require('../Computer'),
        Decimal = require('decimal.js');
class MissionComputer extends Computer
{
    constructor(company, serverType)
    {
        let name = company.name+' '+serverType;
        super(name, company);
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

},{"../Computer":9,"decimal.js":1}],15:[function(require,module,exports){
const Decimal = require('decimal.js');

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

},{"decimal.js":1}],16:[function(require,module,exports){
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

},{"./Mission":13}],17:[function(require,module,exports){
const   Password = require('./Challenges/Password'),
        {DictionaryCracker, PasswordCracker} = require('./Tasks/PasswordCracker'),
        Encryption = require('./Challenges/Encryption'),
        EncryptionCracker = require('./Tasks/EncryptionCracker'),
        Computer = require('./Computer'),
        CPU = require('./CPU.js');

class InvalidTaskError extends Error{};
class NoFreeCPUCyclesError extends Error{};

class PlayerComputer extends Computer
{
    constructor(cpus)
    {
        super('Home', null, '127.0.0.1');
        /**
         * @type {Array.<CPU>}
         */
        this.cpus = cpus;
        this.queuedTasks = [];
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
        let task = this.getTaskForChallenge(challenge),
            i= 0, searching = true, found = false;
        while(searching)
        {
            try
            {
                let cpu = this.cpus[i];
                cpu.addTask(task);
                searching = false;
                found = true;
            }
            catch(e)
            {
                i++;
            }
        }
        if(!found)
        {
            throw new NoFreeCPUCyclesError(`Cannot find the cycles for ${challenge.name} on any of the CPUs`);
        }
    }

    tick()
    {
        for(let cpu of this.cpus)
        {
            cpu.tick();
        }
    }

    static getMyFirstComputer()
    {
        let potato = new PlayerComputer([
            new CPU()
        ]);
        return potato;
    }

    get tasks()
    {
        let tasks = {};
        for(let cpu of this.cpus)
        {
            for(let task of cpu.tasks)
            {
                tasks[task.name] = task;
            }
        }
        return tasks;
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
}

module.exports = PlayerComputer;

},{"./CPU.js":3,"./Challenges/Encryption":5,"./Challenges/Password":6,"./Computer":9,"./Tasks/EncryptionCracker":18,"./Tasks/PasswordCracker":19}],18:[function(require,module,exports){
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
            let fullCells = parseInt(this.currentTickPercentage);
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

},{"../Alphabet":2,"./Task":20}],19:[function(require,module,exports){
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
        this.dictionary = [...Password.dictionary];
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

},{"../Challenges/Password":6,"./Task":20}],20:[function(require,module,exports){
const EventListener = require('../EventListener');

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
     * @param tickReduction
     * @returns {number|*}
     */
    freeCycles(tickReduction)
    {
        if(this.cyclesPerTick <= (tickReduction + this.minimumRequiredCycles))
        {

            if(this.cyclesPerTick > 1)
            {
                let halfMyCyclesRoundedDown = Math.floor(this.cyclesPerTick / 2);
                this.cyclesPerTick -= halfMyCyclesRoundedDown;
                return halfMyCyclesRoundedDown;
            }
            return 0;
        }
        this.cyclesPerTick -= tickReduction;
        return tickReduction;
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

},{"../EventListener":11}]},{},[12]);
