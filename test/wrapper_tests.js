var assert = require("assert");
var path = require("path");
var fs = require('fs');

var wrapper = require("../components/wrapper.js");
describe('Wrapper', function(){
    describe('#require', function(){
        it('should return an exported teemserver wrapper', function(){
            assert.equal(typeof(wrapper), 'function')
        })
    });

    var handler = wrapper(path.resolve("./test/") + "/", path.resolve("./test/") + "/");

    describe('#wrapper()', function(){

        describe('with invalid path', function() {
            it('should return 404', function(done) {
                handler({ path: "notfound", xhr: true }, {
                    writeHead : function(sc, h) {
                        assert.equal(404, sc);
                        assert.deepEqual({"Content-Type": 'text/plain'}, h);
                    },
                    end : function(resp) {
                        assert.equal("'notfound' not found", resp)
                        done();
                    }
                });
            })
        });

        describe('with xhr', function(){
            it('should return the raw content of the file', function(done) {
                handler({ path: "test.dre", xhr: true }, {
                    writeHead : function(sc, h) {
                        assert.equal(200, sc);
                        assert.deepEqual({"Content-Type": 'text/html'}, h);
                    },
                    end : function(resp) {
                        assert.equal('<view id="testview" name="test"></view>', resp);
                        done();
                    }
                });
            })
        });

        describe('no xhr', function(){
            describe('when internal/core class', function(){
                it('should redirect to documentation', function(done) {
                    handler({ path: "/classes/test.dre", xhr: false }, {
                        redirect: function(url) {
                            assert.equal('/docs/api/#!/api/dr.test', url);
                            done();
                        }
                    });
                })
            });

            it('should return wrapped content', function(done) {
                handler({ path: "test.dre", xhr: false }, {
                    writeHead : function(sc, h) {
                        assert.equal(200, sc);
                        assert.deepEqual({"Content-Type": 'text/html'}, h);
                    },
                    end : function(resp) {
                        fs.readFile(path.resolve('./wrapper.html'), 'utf8', function (wrapreaderr, template) {
                            assert.equal(template.replace('~[CONTENT]~', '<view id="testview" name="test"></view>'), resp);
                            done();
                        });
                    }
                });
            })
        });
    })
});