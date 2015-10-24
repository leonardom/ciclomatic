String.prototype.endsWith = function(suffix) {
  return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

var $baseUrl = 'http://192.168.137.176/ciclomatic_web/endpoint';

angular.module('starter.services', [])

.service('AuthService', function($q, $http, AppService) {
  return {
    authenticate: function(name, pw) {
      var deferred = $q.defer();
      var promise = deferred.promise;

      /*
      Para teste de comentar
      if (name === "User" || name === "user") {
        deferred.resolve(true);
      } else {
        deferred.reject(false);
      }
      */

      var url = $baseUrl + '/login';

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
  var race = { id : -1 };
  var device = {};
  var data = "";

  function postData(obj) {
    
    var url = $baseUrl + '/dados';

    var options = {enableHighAccuracy: true};

    $cordovaGeolocation
      .getCurrentPosition(options)
        .then(function(position) {
          var lat  = position.coords.latitude;
          var lng = position.coords.longitude;
          var alt = position.coords.altitude;

          alt = alt || 0;

          var r =/(\d+)[a-z]+,\s*(\d+)[a-z]+,\s*\s*(\d+)[a-z]+/;

          var aceleracao = r.exec(obj['aceleracao']);
          var giro = r.exec(obj['giro']);

          var data = {
            id_ciclista : user.id,
            id_prova : race.id_prova,
            bpm : obj['bpm'],
            corp_temperatura : obj['temperatura_corporal'],
            giro_x : giro[1],
            giro_y : giro[2],
            giro_z : giro[3],
            acel_x : aceleracao[1],
            acel_y : aceleracao[2],
            acel_z : aceleracao[3],
            direcao : obj['direcao'],
            lat : lat,
            lon : lng,
            altitude : alt,
            ar_temperatura : obj['temperatura'],
            ar_umidade : obj['ar_umidade'],
            ar_pressao : obj['ar_pressao']
          };

          $http.post(url, data).then(function (res) {
            console.log(res.data);
          });;
      });
  }

  return {
    setUser: function(value) {
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
          var alt = position.coords.altitude;

          alt = alt || 0;

          var url = $baseUrl + '/msg';

          $http.post(
            url, 
            {
              id_ciclista : user.id, 
              id_prova : race.id_prova,
              tipo : 'SOCORRO',
              lat : lat,
              lon : lng,
              altitude : alt
            }
          ).then(function (res) {
            callback(res.data === "1");
          });
        }, function(err) {
          console.log('Error: ' + err);
          callback(false);
        });
    },

    sendMessage: function(tipo, callback) {
      var options = {enableHighAccuracy: true};

      $cordovaGeolocation
        .getCurrentPosition(options)
        .then(function(position) {
          var lat  = position.coords.latitude;
          var lng = position.coords.longitude;
          var alt = position.coords.altitude;

          alt = alt || 0;

          var url = $baseUrl + '/msg';

          $http.post(
            url, 
            {
              id_ciclista : user.id, 
              id_prova : race.id_prova,
              tipo : tipo,
              lat : lat,
              lon : lng,
              altitude : alt
            }
          ).then(function (res) {
            callback(res.data === "1");
          });

        }, function(err) {
          console.log('Error: ' + err);
          callback(false);
        });
    },

    process: function(chunk) {
      if (chunk) {
        data += chunk;

        console.log(data);

        if (data.endsWith('\n')) {

          //remove o \n do final
          var tmp = data.substring(0, data.length - 1);

          //limpa
          data = "";

          //verifica se tem mais de um bloco
          if (tmp.indexOf('\n') > -1) {
            //quebra os blocos
            tmp = tmp.split("\n");

            //se tiver mais de um bloco
            //usa o último que é mais atualizado
            if (tmp.length > 1) {
              tmp = tmp[tmp.length-1];
            } else {
              tmp = tmp[0];
            }
          }

          var obj = JSON.parse(tmp);

          Sensors.onData(obj);

          postData(obj);

          return;
        }
      }
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
      return $http.get($baseUrl + "/provas");
      //return races;
    }
  };
})

.factory('Sensors', function() {
  // Might use a resource here that returns a JSON array

  var sensors = [
  {
    id: 'BMP',
    name: 'BPM',
    value: '',
  }, {
    id: 'Temperatura',
    name: 'Temperatura',
    value: '',
  }, {
    id: 'Pressao_Atmosferica',
    name: 'Pressão Ar',
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
      alert('Error:' + reason);
    },
    onData: function(obj) {

      for (var i = 0; i < sensors.length; i++) {
        if (sensors[i].id in obj) {
          sensors[i].value = obj[sensors[i].id];
        }
      }
    },
    all: function() {
      return sensors;
    }
  };
})