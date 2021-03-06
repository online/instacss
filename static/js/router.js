// Filename: router.js
define([
  'libs/require/domReady-min!', // Use with the ! suffix (http://requirejs.org/docs/api.html#pageload)

  'jQuery',
  'Underscore',
  'Backbone',

  // Views
  'views/topnav',
  'views/languageview',
  'views/fullwindow',

  // Collections
  'collections/mozdevcssprops',
  'collections/mdnhtmlelements',
  'collections/mdnjsobjs',
  'collections/mdndomobjs',
  'collections/phpexts',
  'collections/jqentries',
], function(doc, $, _, Backbone,
            TopNavView, LanguageView, FullWindowView,
            MozDevCSSPropCollection, MDNHtmlElementsCollection, MDNJsObjsCollection,
            MDNDomObjsCollection, PHPExtensionsCollection, JQEntriesCollection) {

  var InstaCSS = Backbone.Router.extend({
    routes: {
      ''      : 'main',
      'about' : 'about'
    },

    initialize: function() {
      _.bindAll(this, 'changeLanguage', 'setLanguage');

      this.languageViews = {
        'html' : new LanguageView({
          languageName: 'HTML',
          resultsClassNames: 'pageText',
          collection: new MDNHtmlElementsCollection(),
          placeholder: 'Type an HTML element name'
        }),
        'css' : new LanguageView({
          languageName: 'CSS',
          resultsClassNames: 'pageText',
          collection: new MozDevCSSPropCollection(),
          placeholder: 'Type a CSS property name'
        }),
        'javascript' : new LanguageView({
          languageName: 'JavaScript',
          resultsClassNames: 'pageText',
          collection: new MDNJsObjsCollection(),
          placeholder: 'Type a JavaScript class/function name'
        }),
        'dom' : new LanguageView({
          languageName: 'DOM',
          resultsClassNames: 'pageText',
          collection: new MDNDomObjsCollection(),
          placeholder: 'Type a DOM object name'
        }),
        'php' : new LanguageView({
          languageName: 'PHP',
          resultsClassNames: 'pageText',
          collection: new PHPExtensionsCollection(),
          placeholder: 'Type a PHP function name'
        }),
        'jquery' : new LanguageView({
          languageName: 'jQuery',
          resultsClassNames: 'jq-primaryContent',
          collection: new JQEntriesCollection(),
          placeholder: 'Type a jQuery entry name'
        }),
      };

      this.currentLanguage = null;

      var self = this;
      this.renderTopNav = _.once(function() {
        self.topNavView = new TopNavView({
          el: $('#topbar-inner')
        });
        self.topNavView.render();
        self.topNavView.bind('changeLanguage', self.changeLanguage);
      });

      // Make a different route for each language:
      //  insta.com/#css
      //  insta.com/#html
      //  insta.com/#javascript
      //  ...
      for (languageName in this.languageViews) {
        console.log('Creating route for ' + languageName);
        var cb = {
          languageName: languageName,
          fn: function(query) {
            console.log('ROUTING ' + this.languageName + ' : ' + query);
            self.renderTopNav();  // _.once'd
            self.topNavView.setActiveElement('nav-' + this.languageName);
            self.languageViews[this.languageName].setQuery(query);
          }
        };
        _.bindAll(cb, 'fn');
        this.route(languageName + '/:query', languageName, cb.fn);
      }
    },

    changeLanguage: function(newLanguage) {
      // Hide about
      $('#about').css({'display': 'none'});

      // Show search
      $('#toc').css({'display': 'block'});
      $('#search-results').css({'display': 'block'});

      if (newLanguage === this.currentLanguage) {
        return;
      }
      if (this.currentLanguage !== null) {
        this.languageViews[this.currentLanguage].setActive(false);
      }
      this.setLanguage(newLanguage);
    },

    setLanguage: function(newLanguage) {
      console.log('Setting language to ' + newLanguage);
      this.languageViews[newLanguage].setActive(true);
      $('#search-box').focus();

      if (!this.fullWindow) {
        this.fullWindow = new FullWindowView();
      }
      // Make sure toc well height is set correctly (TODO: move this into tocbarview)
      this.languageViews[newLanguage].collection.bind('reset', this.fullWindow.onResize);

      this.currentLanguage = newLanguage;
    },

    main: function(query) {
      if (this.currentLanguage === null) {
        this.currentLanguage = 'css';
      }

      this.renderTopNav();  // _.once'd

      // Start everything
      this.setLanguage(this.currentLanguage);
    },

    about: function() {
      this.renderTopNav();  // _.once'd
      this.topNavView.setActiveElement('nav-about');

      // Hide search
      $('#toc').css({'display': 'none'});
      $('#search-results').css({'display': 'none'});

      // Show about
      $('#about').css({'display': 'block'});
    }
  });

  var initialize = function() {
    var mainApp = new InstaCSS();
    Backbone.history.start(); // can't do pushstate until we handle all routes on backend ({pushState: true});
  };

  return { initialize: initialize };
});

