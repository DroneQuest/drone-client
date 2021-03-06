'use strict';
const angular = require('angular');
require('angular-route');

angular.module('droneApp', ['ngRoute'])
  .controller('DroneController', ['$http', '$interval', function($http, $interval) {
    var vm = this;
    var route = 'http://127.0.0.1:3000/do/';
    vm.battery = 'connecting...';
    vm.altitude = 'connecting...';
    vm.png = null;
    vm.connected = false;

    vm.codes = {
      13: 'takeoff', // TAKEOFF enter
      32: 'land', // LAND space
      65: 'move_left', // MOVE_LEFT a
      68: 'move_right', // MOVE_RIGHT d
      38: 'move_up', // MOVE_UP up
      40: 'move_down', // MOVE_DOWN down
      87: 'move_forward', // MOVE_FORWARD w
      83: 'move_backward', // MOVE_BACKWARD s
      37: 'turn_left', // TURN_LEFT left
      39: 'turn_right', // TURN_RIGHT right
      8:  'reset', // RESET bs
      69: 'trim', // TRIM e
      187:'increase_speed', // INCREASE SPEED +
      189:'decrease_speed', // DECREASE SPEED -
      27: 'halt' // HALT esc
    };
    vm.command = null;

    vm.setFocus = function() {
      var element = document.getElementById('flightcontrol');
      element.focus();
    };

    vm.getCommands = function() {
      $http.get('http://127.0.0.1:3000/navdata')
        .then((res) => {
          vm.battery = res.data['0'].battery + '%';
          vm.altitude = res.data['0'].altitude/1000 + 'm';
          vm.connected = true;
        }, err => console.log('GET error: ', err));
    };

    vm.getImg = function() {
      $http.get('http://127.0.0.1:8081/')
        .then((res) => {
          vm.png = res.data.Image;
          // var png = getElementById('pngStream');

        }, err => console.log('GET error: ', err));
    };

    vm.postCommands = function(path) {
      $http.post(route + path)
        .then((res) => {
          console.log('POST res: ', res);
        }, err => console.log('GET error: ', err));
    };

    vm.intervalCall = function() { //GETs on a interval to update DOM info
      $interval(vm.getCommands, 1000);
      $interval(vm.getImg, 1000);
    };

    vm.keyPress = function(e) { //handles key input
      vm.command = null;
      if(e.keyCode in vm.codes) {
        vm.command = vm.codes[e.keyCode];
        vm.postCommands(vm.command);
      } else {
        console.log('not a valid key input.');
      }
    };

    vm.hover = function() { //hovers on keyup
      vm.command = 'hovering';
      vm.postCommands('hover');
    };
  }])

  .controller('PanelController', ['$location', function($location) {
    var vm = this;
    vm.tab = '/fly';
    vm.isActive = function(sometab) {
      if (vm.tab == sometab) return true;
    };
    this.setTab = function(newtab) {
      vm.tab = newtab;
      $location.path(this.tab);
    };
  }])
  .directive('panelDirective', function() {
    return {
      restrict: 'E',
      controller: 'PanelController',
      controllerAs: 'panelctrl',
      templateUrl: '/templates/nav.html'
    };
  })
  .config(['$routeProvider', function(router) {
    router
      .when('/', {
        controller: 'DroneController',
        controllerAs: 'dronectrl',
        templateUrl: '/templates/fly-template.html'
      })
      .when('/fly', {
        controller: 'DroneController',
        controllerAs: 'dronectrl',
        templateUrl: '/templates/fly-template.html'
      })
      .when('/docs', {
        templateUrl: '/templates/docs-template.html'
      })
      .when('/faq', {
        templateUrl: '/templates/faq-template.html'
      });
  }]);
