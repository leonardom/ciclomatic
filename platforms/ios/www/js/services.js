var $baseUrl = 'http://172.31.20.9';

angular.module('starter.services', [])

.service('AuthService', function($q, $http) {
    return {
        authenticate: function(name, pw) {
            var deferred = $q.defer();
            var promise = deferred.promise;

            var url = $baseUrl + '/login.php';

            $http.post(
              url, 
              {
                username : name,
                password : pw
              }
            ).then(function (res){
              if (res.data === "ok") {
                deferred.resolve(true);
              } else {
                deferred.reject(false);
              }
            });

            promise.success = function(fn) {
                promise.then(fn);
                return promise;
            }
            promise.error = function(fn) {
                promise.then(null, fn);
                return promise;
            }
            return promise;
        }
    }
})

.service('AppService', function() {
  var race = {}

  return {
    setRace: function(value) {
      race = value;
    },

    getRace: function() {
      return race;
    }
  }

})

.factory('Races', function($http) {
  var races = [];

  return {
    all: function() {
      return $http.get($baseUrl + "/races.php");
    },
    get: function(id) {
      for (var i = 0; i < races.length; i++) {
        if (races[i].id === parseInt(id)) {
          return races[i];
        }
      }
      return null;
    }
  };
})

.factory('Sensors', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var sensors = [{
    id: 0,
    name: 'Tempo',
    value: '00:00:00',
  }, {
    id: 1,
    name: 'BMP',
    value: '102',
  }, {
    id: 2,
    name: 'Latitude',
    value: '-46',
  }, {
    id: 3,
    name: 'Longitude',
    value: '-21',
  }, {
    id: 4,
    name: 'Umidade do Ar',
    value: '50%',
  }, {
    id: 5,
    name: 'Pressão',
    value: '900 mg',
  }, {
    id: 6,
    name: 'Giro',
    value: '0x, 0y, 0z',
  }, {
    id: 7,
    name: 'Temperatura Corporal',
    value: '37º C',
  }, {
    id: 8,
    name: 'Direção',
    value: '280º',
  }, {
    id: 9,
    name: 'Temperatura do Ar',
    value: '28º C',
  }];

  return {
    all: function() {
      return sensors;
    },
    get: function(id) {
      for (var i = 0; i < sensors.length; i++) {
        if (sensors[i].id === parseInt(id)) {
          return sensors[i];
        }
      }
      return null;
    }
  };
})