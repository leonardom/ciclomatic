
angular.module('starter.controllers', [])

.controller('LoginCtrl', function($scope, $state, $ionicPopup, AuthService) {
    $scope.data = {};
 
    $scope.login = function(data) {
      AuthService.authenticate(data.username, data.password)
      .then(function(authenticated) {
        $state.go('races', {}, {reload: true});
      }, 
      function(err) {
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

  Races.all().then(function(races) {
    $scope.races = races.data;
  });

  $scope.startRace = function(data) {
    if (data.selected === undefined) {
      var alertPopup = $ionicPopup.alert({
        title: 'Prova',
        template: 'Nenhuma prova selecionada'
      });      
    } else {
      //$state.go('devices', {}, {reload: true});
      $state.go('monitor', {}, {reload: true});
      AppService.setRace(data.selected);
    }
  };
})

.controller('DeviceCtrl', function($scope, $state, $ionicPopup, $cordovaBluetoothSerial, Races, AppService) {
  $scope.devices = [];
  $scope.data = {};

  $cordovaBluetoothSerial.isEnabled().then(function(){
    alert("Bluetooth Enable");
  },
  function() {
    alert("Bluetooth Disable");
  });

  $scope.getDevices = function() {
    console.log($cordovaBluetoothSerial);

    if ($cordovaBluetoothSerial.isEnabled()) {
      console.log("Bluetooth ligado");
    } else {
      console.log("Bluetooth desligado");
    }

  };

  $scope.pair = function(data) {
    if (data.selected === undefined) {
      var alertPopup = $ionicPopup.alert({
        title: 'CicloMatic',
        template: 'Nenhum dispositivo selecionado'
      });      
    } else {
      $state.go('monitor', {}, {reload: true});
      //AppService.setDevice(data.selected);
    }
  };
})

.controller('MonitorCtrl', function($scope, $state, $ionicNavBarDelegate, $ionicPopup, Sensors, AppService) {
  $scope.sensors = Sensors.all();
  $scope.race = AppService.getRace();
  $scope.data = {};
  $scope.listMsg = [
    'FOME', 'SEDE', 'ACIDENTE', 'QUEDA', 'DESISTENCIA'
  ];

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
        $state.go('races', {}, {reload: true});
        $ionicNavBarDelegate.showBackButton(true);
      }
    });
  };

  $scope.sos = function(data) {
    var alertPopup = $ionicPopup.alert({
      title: 'CicloMatic',
      template: 'SOS enviado com sucesso!'
    });
  };

  $scope.message = function(data) {

    var messagePopup = $ionicPopup.confirm({
      template: '<ion-radio ng-repeat="item in listMsg"' +
                  'ng-value="item"' +
                  'ng-model="data.messageSelected">' +
                  '<h2>{{item}}</h2>' +
                  '</ion-radio>',
      title: 'Enviar Mensagem',
      scope: $scope,
      cancelText: 'Cancelar',
      okText: 'Enviar',
    }); 

    messagePopup.then(function(res) {
      if(res) {
        alert($scope.data.messageSelected);
      }
    });
  };
});
