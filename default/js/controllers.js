'use strict';


/* Controllers */

angular.module('devnull.controllers', []).
  controller('AppCtrl',
    ["$scope","PartyService", "state", "config",
    function($scope, PartyService, state, config) {

      $scope.auth = function(key) {
        config.api.key = key;
        $scope.init();
      };

      $scope.changeCharacter = function (id) {
        state.character = state.characters[id]
        PartyService.updateCharacter()
        PartyService.scanCharacter()
        state.newChar = null
      }

      $scope.show = function(show_id, hide_id) {
       var show = document.getElementById(show_id);
       var hide = document.getElementById(hide_id);
       show.style.display = "block";
       hide.style.display = "none";
      }

      $scope.showNewCharacter = function() {
        state.character = null
        state.newChar = {}
      };

      $scope.init = function () {
        function startInterval (fn, miliseconds) {
          setInterval(function(){
              $scope.$apply(function() {
                  fn();
              });
          }, miliseconds);
          fn();
        }

        startInterval(PartyService.getHighscore, 20000)
        startInterval(PartyService.updateParty, 5000)
        startInterval(PartyService.scanCharacter, 250)
        startInterval(PartyService.updateCharacter, 10000)
        startInterval(PartyService.getCharTemplate, 30000)
      }
  }]).
  controller('NewCharacterCtrl',
    ["$scope", "PartyService", "state",
    function($scope, PartyService, state) {

    $scope.translation = {
      "name": "Name",
      "dex": "Dexterity",
      "con": "Constitution",
      "str": "Strength",
      "int": "Intelligence",
      "wis": "Wisdom",
    }

    $scope.availablePoints = function() {
      var base = 10;
      var maxPoints = 8;

      var placedPoints = 0;
      var fields = ["dex", "con", "str", "int", "wis"];
      for (var i = fields.length - 1; i >= 0; i--) {
        var points = state.newChar[fields[i]];
        if (points) placedPoints += Math.max(points-base, 0);
      };
      return (maxPoints-placedPoints);
    };

    $scope.createCharacter = function () {
      PartyService.createcharacter();
    }

    $scope.templateKeyTranslation = function(key) {
      return $scope.translation[key];
    };

    $scope.filterTemplate = function(template) {
      var result = {};
      angular.forEach(template, function(value, key) {
        if ($scope.translation[key] != null) {
            result[key] = value;
        }
      });
      return result;
    };
  }]).
  controller('MapCtrl', ["$scope", "state", "ApiService", function($scope, state, ApiService) {
    $scope.cellSize = 25;

    $scope.entityImages = {
        "Skeleton" : "skeleton.png",
        "Kobold" : "kobold.png",
        "Ghoul" : "ghoul.png",
        "Goblin" : "goblin.png",
        "Ogre" : "ogre.png",
        "Black pudding" : "black-pudding.png",
        "Orc" : "orc.png",
        "Purple worm" : "purple-worm.png",
        "Hell hound" : "hell-hound.png",
        "Berserker" : "berserker.png",
        "Gelatinous cube" : "gelatin-cube.png",
        "Zombie" : "zombie.png",
        "Troll" : "troll.png",
        "Displacer beast" : "displacer-beast.png",
        "Hobgoblin" : "hobgoblin.png",
        "Stone giant" : "stone-giant.png",
        "Gargoyle" : "gargoyle.png",
        "Bugbear" : "bugbear.png",
        "Carrion crawler" : "carrion-crawler.png"
    }

    $scope.itemImages = {
        "ring" : "ring.png",
        "armor" : "armor.png",
        "potion" : "potion.png",
        "weapon" : "weapon.png",
        "book" : "book.png"
    }

    $scope.legend = [
        {"type" : "ROOM_ID", "mask": 0x0000FFC0, "color": "#FFFFFF"},     // rum
        {"type" : "LABEL", "mask": 0xFF000000, "color": "#FFFFFF"},       // beskrivning av saker
        {"type" : "CORRIDOR", "mask": 0x00000004, "color": "#FFFFFF"},    // korridor
        {"type" : "NOTHING", "mask": 0x00000000, "color": "#8DC9CD"},
        {"type" : "BLOCKED", "mask": 0x00000001, "color": "#8DC9CD"},
        {"type" : "ROOM", "mask": 0x00000002, "color": "#FFFFFF"},        // rum
        {"type" : "PERIMETER", "mask": 0x00000010, "color": "#6E6C5F"},   // walls
        {"type" : "ENTRANCE", "mask": 0x00000020, "color": "#8DC9CD"},
        {"type" : "ARCH", "mask": 0x00010000, "color": "#FFFFFF"},
        {"type" : "DOOR", "mask": 0x00020000, "color": "#FFFFFF"},        // dörr
        {"type" : "DOOR", "mask": 0x00040000, "color": "#FFFFFF"},        // dörr
        {"type" : "DOOR", "mask": 0x00080000, "color": "#FFFFFF"},        // dörr
        {"type" : "DOOR", "mask": 0x00100000, "color": "#FFFFFF"},        // dörr
        {"type" : "PORTCULLIS", "mask": 0x00200000, "color": "#8DC9CD"},  // Man kan gå igenom tror det är som ett valv
        {"type" : "STAIR_DOWN", "mask": 0x00400000, "color": "#FF9200"},  // ner
        {"type" : "STAIR_UP",   "mask": 0x00800000, "color": "#FF9200"},  // upp
        {"type" : "FORGE",   "mask": 0x02000000, "color": "#0F9200"}  // forge
      ]

    $scope.getMapColor = function (value) {
      for (var i = $scope.legend.length - 1; i >= 0; i--) {
        var element = $scope.legend[i];

        if ((value & element.mask) > 0 ) {
          return element.color
        }
      };
      return "#6E6C5F"
    };

    $scope.planeshift = function (where) {
      ApiService.call("planeshift", [state.character.id, where])
    };

    $scope.getHealthColor = function(procent) {
      var red = Math.round(255*((100-procent)/100))
      var green = Math.round(255*(procent/100))
      return "rgb("+red+","+green+",0)";
    };

    $scope.getEntityImage = function (key) {
      return "img/" + ($scope.entityImages[key] || "other-character.png")
    }

    $scope.getItemImage = function(key) {
      return "img/" + ($scope.itemImages[key] || "default-item.png")
    };

  }]).
  controller('CharacterCtrl', ["$scope", "ApiService", "state", function($scope, ApiService, state) {

    $scope.actions = [
      // Movements.
      {"command" : "move", "arg" : "left", "key" : "a"},
      {"command" : "move", "arg" : "right", "key" : "d"},
      {"command" : "move", "arg" : "up", "key" : "w"},
      {"command" : "move", "arg" : "down", "key" : "s"},
      {"command" : "move", "arg" : "upleft", "key" : "q"},
      {"command" : "move", "arg" : "upright", "key" : "e"},
      {"command" : "move", "arg" : "downleft", "key" : "z"},
      {"command" : "move", "arg" : "downright", "key" : "x"},

      // Upgrade/downgrade.
      {"command" : "levelup", "key" : "up"},
      {"command" : "leveldown", "key" : "down"},

      // Get item from the floor.
      {"command" : "get", "key" : "g"},
    ]

    $scope.drop = function(itemId) {
      ApiService.call("drop", [itemId, state.character.id])
    }

    $scope.wield = function(itemId) {
      ApiService.call("wield", [itemId, state.character.id])
    }

    $scope.unwield = function(itemId) {
      ApiService.call("unwield", [itemId, state.character.id])
    }

    $scope.equip = function(itemId) {
      ApiService.call("equip", [itemId, state.character.id])
    }

    $scope.unequip = function(itemId) {
      ApiService.call("unequip", [itemId, state.character.id])
    }

    $scope.quaff = function (itemId) {
      ApiService.call("quaff", [itemId, state.character.id])
    }

    $scope.deleteCharacter = function (characterId) {
      delete state.characters[state.character._id]
      state.charactersSize--;
      state.character = null
      state.newChar = {}
      ApiService.call("deletecharacter", [characterId])
    }

    $scope.upgrade = function (characteristic) {
      ApiService.call("allocatepoints", [characteristic, state.character.id])
    }

    $scope.getProgressBarClass = function (percent) {
      if (percent < 30)
        return "progress-danger"
      if (percent < 80)
        return "progress-warning"
      return "progress-success"
    }

    /* Exp levels */
    $scope.levels = [300, 1500, 4000, 7000, 14000, 25000, 40000, 65000, 90000, 145000, 190000, 250000, 330000, 500000, 675000, 800000, 1000000, 1520000, 2000000, 3000000, 5000000, 8000000, 12000000];

    $scope.getExpProgress = function (level) {
      return $scope.levels[level - 1];
    }

    $scope.bind = function (key, command, arg) {
      Mousetrap.bind(key, function() {
        if (state.character == undefined) return;

        if (command == "move" && arg) {
          if (arg.match('left')) state.character.lastMove = "left"
          if (arg.match('right')) state.character.lastMove = "right"
        }

        ApiService.call(command, [state.character.id, arg], function(err, data) {
          if(err) {
           //console.error(err);
          }
          else if(data.success != null && typeof data.success !== "object" &&  typeof data.success !== "boolean") {
            if (data.success.match('damage') != null) {
              // hehe :(
              var hp = data.success.match('HP [0-9]+')[0].substring(3);
              var monsterId = data.success.substring(data.success.length - (hp.length + 15), data.success.length - (hp.length + 6))
              var monster = state.entities[monsterId]
              state.entities[monsterId].currentHealth = hp
              state.entities[monsterId].currentHealthProcent = (monster.currentHealth/monster.hp)*100
            }
          }
        });
      });
    };

    $scope.init = function() {
      for (var i = $scope.actions.length - 1; i >= 0; i--) {
        var action = $scope.actions[i];
        $scope.bind(action.key, action.command, action.arg)
      }
    }

    $scope.init()

  }]);
