var MongoRest = require('../lib/index')
  , _ = require('underscore')
;

describe('MongoRest', function() {

  describe("constructor", function() {
    it("should store the options", function() {
      var mongoRest
        , app = { };

      mongoRest = new MongoRest(app, null, true); // dont register routes
      mongoRest.options.should.eql({ urlPath: '/', entityViewTemplate: 'resource_{{singularName}}', collectionViewTemplate: 'resource_{{pluralName}}', enableXhr: false, singleView: true });

      var options = { urlPath: '/some_url', entityViewTemplate: 'resources/{{singularName}}', collectionViewTemplate: 'resources/{{pluralName}}', enableXhr: true, singleView: false };
      mongoRest = new MongoRest(app, options, true); // dont register routes
      mongoRest.options.should.eql(options);

    });

    describe("routes", function() {
      var mongoRest
        , registered
        , app = {
              all: function(address) { registered.push([ 'all', address ]) }
            , get: function(address) { registered.push([ 'get', address ]) }
            , post: function(address) { registered.push([ 'post', address ]) }
            , put: function(address) { registered.push([ 'put', address ]) }
            , delete: function(address) { registered.push([ 'delete', address ]) }
          };
      it("should register routes if asked nicely", function() {
        registered = [];
        mongoRest = new MongoRest(app, { urlPath: '/some/url/' });
        registered.should.eql([
          [ 'all', '/some/url/:resourceName' ],
          [ 'get', '/some/url/:resourceName' ],
          [ 'post', '/some/url/:resourceName' ],
          [ 'all', '/some/url/:resourceName/:id' ],
          [ 'get', '/some/url/:resourceName/:id' ],
          [ 'put', '/some/url/:resourceName/:id' ],
          [ 'delete', '/some/url/:resourceName/:id' ] 
        ]);
      });

      it("shouldn't register routes if asked nicely", function() {
        registered = [];
        mongoRest = new MongoRest(app, { urlPath: '/some/url/' }, true); // Don't register routes.
        registered.should.eql([]);
      });
    });

  });

  describe("addResource()", function() {
    it("should handle singular and plurar names correctly", function() {
      var mongoRest
        , app = { }
        , model1 = new function() { this.model1 = true; }
        , model2 = new function() { this.model2 = true; }
        ;

      mongoRest = new MongoRest(app, null, true); // dont register routes

      mongoRest.addResource("user", model1);
      mongoRest.addResource("hobby", model2, "hobbies");

      mongoRest.resources.should.eql([ { singularName: 'user', pluralName: 'users', model: model1 }, { singularName: 'hobby', pluralName: 'hobbies', model: model2 } ] );
    });
  });

  describe("getResource()", function() {
    it("should return singular or plural names", function() {
      var mongoRest
        , app = { }
        , model1 = new function() { this.model1 = true; }
        , model2 = new function() { this.model2 = true; }
        ;

      mongoRest = new MongoRest(app, null, true); // dont register routes

      mongoRest.addResource("user", model1);
      mongoRest.addResource("hobby", model2, "hobbies");

      mongoRest.getResource("hobbies").should.eql({ singularName: 'hobby', pluralName: 'hobbies', model: model2 });
      mongoRest.getResource("hobby").should.eql({ singularName: 'hobby', pluralName: 'hobbies', model: model2 });
      mongoRest.getResource("user").should.eql({ singularName: 'user', pluralName: 'users', model: model1 });
      mongoRest.getResource("users").should.eql({ singularName: 'user', pluralName: 'users', model: model1 });

    });
  });

  describe("parseViewTemplate()", function() {
    it("should replace all values properly", function() {
      var mongoRest
        , app = { }
        ;

      mongoRest = new MongoRest(app, null, true); // dont register routes

      mongoRest.parseViewTemplate("abc.{{singularName}}.def.{{pluralName}}", { singularName: 'user', pluralName: 'users' }).should.equal("abc.user.def.users")
    });
  });

  describe("getCollectionUrl()", function() {
    it("should return the correct url", function() {
      var mongoRest, app = { };

      mongoRest = new MongoRest(app, { urlPath: "/resource/" }, true); // dont register routes
      mongoRest.getCollectionUrl({ singularName: 'user', pluralName: 'users' }).should.equal("/resource/users");

    });
  })

  describe("getEntityUrl()", function() {
    it("should return the correct url", function() {
      var mongoRest, app = { };

      mongoRest = new MongoRest(app, { urlPath: "/resource/", singleView: true }, true); // dont register routes
      mongoRest.getEntityUrl({ singularName: 'user', pluralName: 'users' }, { _id: 123 }).should.equal("/resource/user/123");

    });
    it("should return the colleciton url if no single view", function() {
      var mongoRest, app = { };

      mongoRest = new MongoRest(app, { urlPath: "/resource/", singleView: false }, true); // dont register routes
      mongoRest.getEntityUrl({ singularName: 'user', pluralName: 'users' }, { _id: 123 }).should.equal("/resource/users");

    });
  })


});