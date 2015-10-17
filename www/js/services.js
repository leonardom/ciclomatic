String.prototype.endsWith = function(suffix) {
  return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

//var $baseUrl = 'http://localhost';
//var $baseUrl = 'http://192.168.1.109';
var $baseUrl = 'http://172.31.14.5';

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

      var url = $baseUrl + '/ciclomatic/endpoint/login';

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
  var race = {};
  var device = {};
  var data = "";

  function postData(data) {
    var url = $baseUrl + '/ciclomatic/endpoint/dados';

    $cordovaGeolocation
      .getCurrentPosition(options)
        .then(function(position) {
          var lat  = position.coords.latitude;
          var lng = position.coords.longitude;
          var alt = position.coords.altitude;

          data = {
            'bmp' : '123',
            'temperatura' : '35',
            'pressao' : '900',
            'altitude' : '123',
            'temperatura_corporal' : '37'
            'direcao' : '180',
            'aceleracao' : '10x, 20y, 30z',
            'giro' : '1x, 2y, 3z',
          }

          var r =/(\d+)[a-z]+,\s*(\d+)[a-z]+,\s*\s*(\d+)[a-z]+/;

          var aceleracao = r.exec(data['aceleracao']);
          var giro = r.exec(data['giro']);

          var obj = {
            id_ciclista : user.id,
            id_prova : race.id,
            bpm : data['bpm'],
            corp_temperatura : data['temperatura_corporal'],
            giro_x : giro[1],
            giro_y : giro[2],
            giro_z : giro[3],
            acel_x : aceleracao[1],
            acel_y : aceleracao[2],
            acel_z : aceleracao[3],
            direcao : data['direcao'],
            lat : lat,
            lon : lng,
            altitude : alt,
            ar_temperatura : data['temperatura'],
            ar_umidade : data['umidade_ar'],
            ar_pressao : data['pressao_atmosferica']
          }

          $http.post(url, obj);
      }
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
          var alt = position.coords.altitude;

          var url = $baseUrl + '/mensagem.php';

          $http.post(
            url, 
            {
              id_ciclista : user.id, 
              id_prova : race.id,
              tipo : 'SOCORRO',
              lat : lat,
              lon : lng,
              altitude : alt
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
          var alt = position.coords.altitude;

          var url = $baseUrl + '/mensagem.php';

          $http.post(
            url, 
            {
              id_ciclista : user.id, 
              id_prova : race.id,
              tipo : tipo,
              lat : lat,
              lon : lng,
              altitude : alt
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

          //remove o \n do final
          var tmp = data.substring(0, data.length - 1);

          //limpa
          data = "";

          //quebra os blocos
          var tmp = data.split("\n");

          //se tiver mais de um bloco
          //usa o último
          if (tmp.length > 1) {
            tmp = tmp[tmp.length-1];
          } else {
            tmp = tmp[0];
          }

          Sensors.onData(tmp);

          postData(tmp);

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
      return $http.get($baseUrl + "/ciclomatic/endpoint/provas");
      //return races;
    }
  };
})

.factory('Sensors', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var sensors = [
  {
    id: 'bmp',
    name: 'BMP',
    value: '',
  }, {
    id: 'temperatura',
    name: 'Temperatura',
    value: '',
  }, {
    id: 'pressao',
    name: 'Pressão',
    value: '',
  }, {
    id: 'altitude',
    name: 'Altitude',
    value: '',
  }, {
    id: 'temperatura_corporal',
    name: 'Temp. Corp.',
    value: '',
  }, {
    id: 'direcao',
    name: 'Bussola',
    value: '',
  }, {
    id: 'aceleracao',
    name: 'Aceleração',
    value: '',
  }, {
    id: 'giro',
    name: 'Giro',
    value: '',
  }];

  return {
    onError: function(reason) {
      data = 'Error:' + reason;
    },
    onData: function(obj) {
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