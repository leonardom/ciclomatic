 function mock($cordovaBluetoothSerial) {
  /*
    $cordovaBluetoothSerial = {
      data: '',
      isEnabled: function() {
        return new Promise(function(resolve, reject) {
          return resolve(false);
        });
      },
      list: function() {
        return new Promise(function(resolve, reject) {
          return resolve(
                  [
                    {name:'mock1',id:'10:10:10'}, 
                    {name:'mock2',id:'20:20:20'}
                  ]);
        });        
      },
      connect: function() {
        return new Promise(function(resolve, reject) {
          return resolve();
        });
      },
      available: function() {
        return new Promise(function(resolve, reject) {
          return resolve(data.length);
        });
      },
      read: function() {
        return new Promise(function(resolve, reject) {
          return resolve(data);
        });
      },
      start: function($interval) {
        $interval(function() {
          data = new Date().getTime().toString(); 
        }, 1000);
      }
    };
*/
  return $cordovaBluetoothSerial;
}


angular.module('starter.controllers', [])

.controller('LoginCtrl', function($scope, $state, $ionicPopup, $ionicLoading, AuthService, AppService) {
    $scope.data = {};
 
    $scope.login = function(data) {
      $ionicLoading.show({
        template: 'Aguarde...'
      });

      AuthService.authenticate(data.username, data.password)
        .then(function(authenticated) {
          $ionicLoading.hide();
          $state.go('devices', {}, {reload: true});
        }, 
        function(err) {
          $ionicLoading.hide();
          var alertPopup = $ionicPopup.alert({
            title: 'Login Falou!',
            template: 'Por favor verifique suas credenciais!'
          });
        });
    }
})

.controller('RaceCtrl', function($scope, $state, $ionicPopup, Races, AppService) {
  $scope.races = [];
  $scope.data = {};

  $scope.races = Races.all();
  /*
  Races.all().then(function(res) {
    $scope.races = res.data;
  });
  */

  $scope.startRace = function(data) {
    if (data.selected === undefined) {
      var alertPopup = $ionicPopup.alert({
        title: 'Prova',
        template: 'Nenhuma prova selecionada'
      });      
    } else {

      AppService.setRace(data.selected);

      $state.go('monitor', {}, {reload: true});
    }
  };
})

.controller('DeviceCtrl', function($scope, $state, $ionicPopup, $ionicLoading, $cordovaBluetoothSerial, Sensors) {
  $scope.devices = [];
  $scope.data = {};
  
  //Mock Blutooth to test
  $cordovaBluetoothSerial = mock($cordovaBluetoothSerial);

  $cordovaBluetoothSerial.isEnabled().then(
      function() {
        $cordovaBluetoothSerial.isConnected().then(
          function() {
            $cordovaBluetoothSerial.disconnect();
          }
        );
      },
      function() {
        alert('Bluetooth desligado');
      }
  );

  var onDeviceList = function(devices) {
    $scope.devices = devices;
  };

  var onError = function(reason) {
    $ionicLoading.hide();
    alert("ERROR: " + reason); // real apps should use notification.alert
  };

  var onConnect = function() {
    $ionicLoading.hide();
    $state.go('races', {}, {reload: true});
  }

  $cordovaBluetoothSerial.list().then(
      onDeviceList, 
      onError
  );

  $scope.connect = function(data) {
    if (data.selected === undefined) {
      var alertPopup = $ionicPopup.alert({
        title: 'CicloMatic',
        template: 'Nenhum dispositivo selecionado'
      });      
    } else {
      $ionicLoading.show({
        template: 'Aguarde, conectando com dispositivo...'
      });
      var deviceId = data.selected.id;
      $cordovaBluetoothSerial.connect(deviceId).then(
        onConnect, 
        onError
      );
    }
  };
})

.controller('MonitorCtrl', function($scope, $state, $ionicNavBarDelegate, $ionicPopup, $ionicLoading, $cordovaBluetoothSerial, $interval, Sensors, AppService) {
  $scope.sensors = Sensors.all();
  $scope.race = AppService.getRace();
  $scope.dados = 'Nada';
  $scope.timer = 0;
  $scope.mensagem = {};
  $scope.listMsg = [
    'FOME', 'SEDE', 'ACIDENTE', 'QUEDA', 'DESISTENCIA'
  ];

  var startTime = new Date().getTime();

  $cordovaBluetoothSerial = mock($cordovaBluetoothSerial);
  //$cordovaBluetoothSerial.start($interval);

  var readData = $interval(function() {
    $scope.timer = (new Date().getTime() - startTime);

    $cordovaBluetoothSerial.available().then(
      function (numBytes) {
        $cordovaBluetoothSerial.read().then(
          function (data) {
            AppService.process(data);
          }, 
          function (err) {
           alert('Error:' +err);
          }
        );
      }, 
      function (err) {
        alert('Error:' +err);
      }
    )}, 
    999
  );

  $ionicNavBarDelegate.showBackButton(false);

  $scope.stop = function(data) {
    var confirmPopup = $ionicPopup.confirm({
      title: 'CicloMatic',
      cancelText: 'Não',
      okText: 'Sim',
      template: 'Deseja parar prova?'
    });
    
    confirmPopup.then(function(res) {
      if(res) {
        $interval.cancel(readData);
        $state.go('races', {}, {reload: true});
        $ionicNavBarDelegate.showBackButton(true);
      }
    });
  };

  $scope.sos = function(data) {
    $ionicLoading.show({
      template: 'Aguarde, enviando SOS...'
    });
    AppService.sendSOS(function(result) {
      $ionicLoading.hide();

      var msg = (
        result ? 'SOS enviado com sucesso!'
               : 'Erro ao enviar SOS'
      );

      $ionicPopup.alert({
        title: 'CicloMatic',
        template: msg
      });
    });
  };

  $scope.message = function(data) {
    
    $scope.mensagem = {};

    var messagePopup = $ionicPopup.confirm({
      template: '<ion-radio ng-repeat="item in listMsg"' +
                  'ng-value="item"' +
                  'ng-model="mensagem.tipo">' +
                  '<h2>{{item}}</h2>' +
                  '</ion-radio>',
      title: 'Enviar Mensagem',
      scope: $scope,
      cancelText: 'Cancelar',
      okText: 'Enviar',
    }); 

    messagePopup.then(function(res) {
      if (!res) return;

      if ($scope.mensagem.tipo === undefined) {
        $ionicPopup.alert({
          title: 'CicloMatic',
          template: 'Nenhum tipo de mensagem selecionado!'
        });
      } else {
        $ionicLoading.show({
          template: 'Aguarde, enviando mensagem...'
        });
        AppService.sendMessage($scope.mensagem.tipo, function(result) {
          $ionicLoading.hide();

          var msg = (
            result ? 'Mensagem enviada com sucesso!'
                   : 'Erro ao enviar mensagem'
          );

          $ionicPopup.alert({
            title: 'CicloMatic',
            template: msg
          });
        });
      }
    });
  };
});
