String.prototype.endsWith = function(suffix) {
  return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

var $baseUrl = 'http://localhost';
//var $baseUrl = 'http://192.168.1.109';

angular.module('starter.services', [])

.service('AuthService', function($q, $http, AppService) {
  return {
    authenticate: function(name, pw) {
      var deferred = $q.defer();
      var promise = deferred.promise;

      /*
      Para teste de comentar
      */
      if (name === "User" || name === "user") {
        deferred.resolve(true);
      } else {
        deferred.reject(false);
      }

      /*
      var url = $baseUrl + '/login.php';

      $http.post(
        url, 
        {
          username : name,
          password : pw
        }
      ).then(function (res){
        if (res.data !== "-1") {
          AppService.setUser({
            id: res.data
          });
          deferred.resolve(true);
        } else {
          deferred.reject(false);
        }
      });
  */

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

.service('AppService', function($cordovaGeolocation, $http, Sensors) {
  var user = { id : -1 };
  var race = {};
  var device = {};
  var data = "";

  function postData(data) {
    var url = $baseUrl + '/dados.php';
    $http.post(url, data);
  }

  return {
    setUser: function(value) {
      console.log(value);
      user = value;
    },

    getUser: function() {
      return user;
    },

    setRace: function(value) {
      race = value;
    },

    getRace: function() {
      return race;
    },

    setDevice: function(value) {
      device = value;
    },

    getDevice: function() {
      return device;
    },

    sendSOS: function(callback) {
      var options = {enableHighAccuracy: true};

      $cordovaGeolocation
        .getCurrentPosition(options)
        .then(function(position) {
          var lat  = position.coords.latitude;
          var lng = position.coords.longitude;

          var url = $baseUrl + '/mensagem.php';

          $http.post(
            url, 
            {
              tipo : 'SOS',
              lat : lat,
              lng : lng,
            }
          ).then(function (res) {
            console.log(res.data);
            callback(res.data === "ok");
          });
        }, function(err) {
          console.log('Error: ' + err);
        });
    },

    sendMessage: function(tipo, callback) {
      var options = {enableHighAccuracy: true};

      $cordovaGeolocation
        .getCurrentPosition(options)
        .then(function(position) {
          var lat  = position.coords.latitude;
          var lng = position.coords.longitude;

          var url = $baseUrl + '/mensagem.php';

          $http.post(
            url, 
            {
              tipo : tipo,
              lat : lat,
              lng : lng,
            }
          ).then(function (res) {
            console.log(res.data);
            callback(res.data === "ok");
          });

        }, function(err) {
          console.log('Error: ' + err);
        });
    },

    process: function(chunk) {
      if (chunk) {
        data += chunk;

        if (data.endsWith('\n')) {
          var tmp = data.substring(0, data.length - 1);;
          data = "";

          Sensors.onData(tmp);

          return tmp;
        }
      }

      /*
      postData({
        user_id : user.id,
        prova_id : race.id,
        mock : data
      });*/
    }
  }
})

.factory('Races', function($http) {
  var races = [
    {id: 1, name: 'Ciclomatic', date:'01/01/2015'},
    {id: 2, name: 'Unfeob', date:'01/01/2015'},
    {id: 3, name: 'Codebikers', date:'01/01/2015'},
  ];

  return {
    all: function() {
      /**
      return $http.get($baseUrl + "/races.php");
      */
      
      return races;
    }
  };
})

.factory('Sensors', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var sensors = [{
    id: 'Temperatura',
    name: 'Temperatura',
    value: '',
  }, {
    id: 'Pressao',
    name: 'Pressão',
    value: '',
  }, {
    id: 'Altitude',
    name: 'Altitude',
    value: '',
  }, {
    id: 'Temperatura_Corporal',
    name: 'Temp. Corp.',
    value: '',
  }, {
    id: 'Bussola',
    name: 'Bussola',
    value: '',
  }, {
    id: 'Aceleracao',
    name: 'Aceleração',
    value: '',
  }, {
    id: 'Giro',
    name: 'Giro',
    value: '',
  }];

  return {
    onError: function(reason) {
      data = 'Error:' + reason;
    },
    onData: function(data) {
      var data = data.split("\n");

      if (data.length > 1) {
        data = data[data.length-1];
      } else {
        data = data[0];
      }

      var obj = JSON.parse(data);

      for (var i = 0; i < sensors.length; i++) {
        if (sensors[i].id in obj) {
          sensors[i].value = obj[sensors[i].id];
        }
      }
    },
    data: function() {
      return data;
    },
    all: function() {
      return sensors;
    }
  };
})