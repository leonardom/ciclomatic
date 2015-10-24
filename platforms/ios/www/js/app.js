// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers','starter.services','ngCordova'])

.filter('millSecondsToTimeString', function() {
  return function(millseconds) {
    var seconds = Math.floor(millseconds / 1000);
    var days = Math.floor(seconds / 86400);
    var hours = Math.floor((seconds % 86400) / 3600);
    var minutes = Math.floor(((seconds % 86400) % 3600) / 60);
    var timeString = '';

    //hours
    timeString += (hours > 9 ? hours : '0' + hours);
    //minutes
    timeString +=  ":" + (minutes > 9 ? minutes : '0' + minutes);
    //seconds
    seconds %= 60;
    timeString +=  ":" + (seconds > 9 ? seconds : '0' + seconds);

    return timeString;
  }
})

.config(["$httpProvider",function($httpProvider) 
{
    $httpProvider.interceptors.push(['$q', function($q) {
    return {
            request: function(config) {
                if (config.data && typeof config.data === 'object') {
                    // Check https://gist.github.com/brunoscopelliti/7492579 
                    // for a possible way to implement the serialize function.
                    config.data = serialize(config.data);
                }
                return config || $q.when(config);
            }
        };
    }]);

    var serialize = function(obj, prefix) {
        // http://stackoverflow.com/questions/1714786/querystring-encoding-of-a-javascript-object
        var str = [];
        for(var p in obj) {
            var k = prefix ? prefix + "[" + p + "]" : p, v = obj[p];
            str.push(typeof v == "object" ? serialize(v, k) : encodeURIComponent(k) + "=" + encodeURIComponent(v));
        }
        return str.join("&");
    }

}])

.run(function($ionicPlatform, $http) {
  $http.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded; charset=UTF-8;";

  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleLightContent();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  // setup an abstract state for the tabs directive
  // Each tab has its own nav history stack:

  .state('login', {
      url: '/login',
      templateUrl: 'templates/login.html',
      controller: 'LoginCtrl'
  })

  .state('races', {
      url: '/races',
      templateUrl: 'templates/races.html',
      controller: 'RaceCtrl'
  })

  .state('devices', {
      url: '/devices',
      templateUrl: 'templates/devices.html',
      controller: 'DeviceCtrl'
  })

  .state('monitor', {
      url: '/monitor',
      templateUrl: 'templates/monitor.html',
      controller: 'MonitorCtrl'
  })

  // if none of the above states are matched, use this as the fallback
  //$urlRouterProvider.otherwise('/tab/dash');
  $urlRouterProvider.otherwise('/login');

});
