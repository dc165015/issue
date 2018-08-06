import { } from "mocha";
import { assert, expect, should } from "chai";
import { DocSchema, scheme } from "./docschema-checker";

describe('checkers', function () {

  class A extends DocSchema {
    constructor() {
      super();
      console.log('in A constr');
    }

    @scheme().max(2)
    ap = '11';
  }

  describe('A', function () {
    var a ;

    this.beforeEach(function () {
      a = new A();
    });

    it('has own prop _schema and own schema.checkers', function () {
      expect(A).to.has.ownProperty('_schema');
      expect(A.schema).to.equal(A[`_schema`]);
      expect(A.schema).to.has.ownProperty('checkers');
    });

    describe('checker on ap', function () {
      var checker = A.schema.checkers.get('ap');

      it('has a exclusive prototype', function () {
        expect(checker).to.be.a('function');
        expect(checker).to.has.property('rules');
      });
    });

  });

  describe('B, which contain a prop that is a instance of A', function () {

    class B extends DocSchema {

      constructor() {
        super();
        console.log('in B constr');
      }

      @scheme(A)
      bp0 = new A;

      @scheme().optional()
      bp1;
    }
    var b;

    beforeEach(function () {
      b = new B;
     });

    it('pass the validateObj', function () {
      var res = B.validateObj(b);
      assert.isUndefined(res)
    });

    it('should report bp1 error: 值类型不匹配', function () {
      b.bp1 = 5;
      var res = B.validateObj(b);
      var err = res.get('bp1');
      expect(err.get('类型错误')).to.equal('值类型不匹配');
    });

    it('should report bp0 error: length exceeded', function () {
      b.bp0.ap = 'long string...';
      var res = B.validateObj(b);
      expect(res.get('bp0').get('内层错误').get('ap').get('超过最大长度')).to.be.equal('长度不能超过2');
    });

    describe('BC, which inherited from B', function () {

      class BC extends B {
        @scheme(Number).min(3)
        cp = 2;
      }

      var c = new BC();

      it('should report bp0, bp1, cp errors', function () {
        c.bp0.ap = 'long string...';
        c.bp1 = 5;
        var res = BC.validateObj(c);
        expect(res.size).to.be.equal(3);
        expect(res.get('bp0').get('内层错误').get('ap').get('超过最大长度')).to.be.equal('长度不能超过2');
        expect(res.get('bp1').get('类型错误')).to.equal('值类型不匹配');
        expect(res.get('cp').get('超过最小值')).to.be.equal('不能小于最小值3');
      });
    });
  });

  describe('AC, which inherited from A', function () {

    class AC extends A {
      @scheme(Number).min(3)
      cp = 2;
    }

    var c = new AC();

    it('should report error: exceed min', function () {
      var err = AC.validateObj(c).get('cp');
      console.log('cp err', err);
      expect(err.get('超过最小值')).to.be.equal('不能小于最小值3');
    });
  });

  describe('A1', function () {
    class A1 extends DocSchema {
      @scheme([String]).optional()
      a1p;
    }
    var a1;
    beforeEach(function () {
      a1 = new A1();
    });
    it('should report error: ', function () {
      a1.a1p = 8;
      var err = A1.validateObj(a1);
      expect(err.get('a1p').get('类型错误')).to.be.a('string');
    })
  });
});
