'use strict';

/* Exp levels */
var levels = [300, 1500, 3000, 4500, 9000, 15000, 20000, 25000, 32000, 45000, 60000, 750000, 100000, 125000, 175000, 250000, 320000, 520000, 1020000];

/* Services */

// TODO: Refactor this into seperate files

var jog = 0;

angular.module('devnull.services', []).
  value('config', {
    'api' : {
      'key' : '6fa07022-ed02-4ef8-9ba8-66d70ea65927',
      //'url' : 'https://genericwitticism.com:8000/api3/'
      'url': 'https://89.238.206.198:8000/api3/'
    }
  }).
  service('state', ["$rootScope", function ($rootScope) {

    var state = {}
    $rootScope.state = state

    var api = {};
    api.called = 0;
    api.answered = 0;
    api.failed = 0;

    state.api = api;
    state.characters = {};
    state.entities = {};
    state.character = null;
    state.highscore = [];
    state.template = null;
    state.newChar = {};
    state.info = {};
    state.logs = [];

    return state
  }]).
  service('ApiService', ['$http', 'config', 'state', function ($http, config, state) {

    this.call = function(command, args, callback) {
      var url = config.api.url + "?session=" + config.api.key

      if (command)          url += "&command=" + command;
      if (args && args[0])  url += "&arg=" + args[0];
      if (args && args[1])  url += "&arg2=" + args[1];

      url+="&mid="+jog;
      jog++;
      if(jog > 1000) jog = 0;

      //console.debug("Sending: " + url)
      state.api.called++
      if(command === "move")
      {
          console.debug("Sending: .... " + url);
      }
      try
      {
          $.ajax(
          {
            crossDomain: true,
              url: url,
              success: function(data, status, headers, config)
              {
                state.api.answered++
                // console.debug("Receving: " + url, JSON.stringify(data))
                if (data.error) { // This is Peter Svensson error
                  state.api.failed++
                  console.log(data.error)
                  state.logs.unshift({message : data.error, type: "error"})
                  if (callback)
                    callback(data.error, null);
                }
                else
                  if (callback)
                    callback(null, data);
              },
              error: function(data, status, headers, config)
              {
                state.api.answered++
                state.api.failed++
                // This is HTTP error
                console.error("Failed request: " + url);
              }
          });

      }
      catch(eee)
      {
        console.log("++++++++++++++ Exception "+eee);
      }
    };

    return this;
  }]).
  service('PartyService', [ 'ApiService', 'state', function (api, state) {
    var self = this // Protect "this"

    self.updateParty = function() {
      var numOfCharacters = 0;
      api.call("getparty", null, function (err, data) {
        if (err) return console.error(err)

        var _characters = {}
        data.characters.forEach(function (characterId) {
          numOfCharacters++;

          if (state.characters[characterId])
            _characters[characterId] = state.characters[characterId]
          else {
            _characters[characterId] = {"id" : characterId, "lastMove" : "right"}
            getInfoAboutId(characterId, function (err, data) {
              for(var key in data){
                _characters[characterId][key] = data[key]
              }
            });
          }

        });


        state.characters = _characters
        if (!state.charactersSize && data.characters.length > 0) { // Find better way to detect first scan
          state.character = state.characters[data.characters[0]];
          state.newChar = null;
        }
        state.charactersSize = numOfCharacters
      });
    };

    self.scanCharacter = function () {
      if (!state.character) return;

      api.call("scan", [state.character.id], function (err, data) {
        if (err) return console.error(err);
        state.character.scan = data;

        // Replace the matrix/dubbel-array with an object
        var area = [];
        for (var y = data.area.length - 1; y >= 0; y--) {
          for (var x = data.area[y].length - 1; x >= 0; x--) {
            area.push({"y":y, "x":x, "value":data.area[y][x]});
          };
        };

        state.character.scan.mapRows = data.area.length;
        state.character.scan.mapCols = data.area[0].length;
        state.character.scan.area = area;

        // Populate the items with more information
        for (var i = 0; i < data.items.length; i++) {
          var item = data.items[i];
          getInfoAboutId(item._id, function (err, data) {
            for(var key in data){
              item[key] = data[key];
            }
          });
        }

        // Print data about the updates
        if (data.updates) {
          for (var i = data.updates.length - 1; i >= 0; i--) {
            var update = data.updates[i]
            if (update.message)
			{
				console.log("msg: "+update.message);
              state.logs.unshift({message : update.message, type: "update"})
			}
          };
        }

        // Entities
        for (var i = data.entities.length - 1; i >= 0; i--) {
          var entity = data.entities[i]

          if (state.character.id === entity._id) {
             // Removes the active char from lists of entities
             state.character.scan.entities.splice(i, 1);
             continue;
          }

          if (state.entities[entity._id])  {
            for(var key in entity){
              state.entities[entity._id][key] = entity[key];
            }
          }
          else {
             state.entities[entity._id] = entity;
          }

          getInfoAboutId(entity._id, function (err, data) {
            for(var key in data){
				if(state.entities[entity._id])
				{
              state.entities[entity._id][key] = data[key]
				}
            }
          });
        };

      });
    };

    // Async gets info about an item or entity in the dungeon
    function getInfoAboutId (id, cb) {
      if (state.info[id]){
        // If the information is cached - use that insted.
        cb(null, state.info[id]);
      }
      else {
        api.call("getinfofor", [id], function (err, data) {
          state.info[id] = data
          cb(err, state.info[id]);
        });
      }
    }

    self.getHighscore = function() {
      api.call("gethighscores", [], function (err, data) {
        if (err) return console.error(err);

        function compare(a, b) {
          if (a.score > b.score) {
            return -1;
          }
          if (a.score < b.score) {
            return 1;
          }
          return 0;
        }

        state.highscore = data.success.sort(compare);
      });
    }


    self.updateCharacter = function  (argument) {
      if (state.character == undefined)
        return;

      api.call("getcharacter", [state.character.id], function (err, data) {
        for(var key in data){
          if (key == "inventory") {
            var inventory = []
            for (var i = 0; i < data.inventory.length; i++) {
              var itemID = data.inventory[i]
              getInfoAboutId(itemID, function (err, data) {
                inventory.push(data)
              });
            }
            state.character.inventory = inventory
          }
          else {
            state.character[key] = data[key]
          }
        }
        state.character.exp = state.character.exp
        state.character.expPercent = (state.character.exp/levels[state.character.level - 1])*100;
        state.character.hpMin = state.character.hp.split("/")[0];
        state.character.hpMax = state.character.hp.split("/")[1];
        state.character.hpPercent = (state.character.hpMin/state.character.hpMax)*100;
      });
    }

    self.getCharTemplate = function(callback) {
      api.call("getchartemplate", null, function (err, data) {
        if (err) return console.error(err);
        state.template = data;
      });
    };

    self.createcharacter = function () {
      var clearStr = JSON.stringify(state.newChar).replace(/["'{}]/g, "")
      api.call("createcharacter", [clearStr], function (err, data) {
        if (err) return console.error(err);
        var character = data;
        character.lastMove = "right";
        character.id = data._id;
        state.characters[data._id] = character;
        state.character = character;
        state.newChar = null;
      });
    };

    return self;
  }]);
