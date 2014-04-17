(function() {
  var Sprite, Target, canvas, ctx, gameIsOver, gameOver, gameStarted, lives, score, startGame, writeCentered,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Sprite = (function() {
    function Sprite(x, y, width, height, color) {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
      this.color = color != null ? color : '#F00';
    }

    Sprite.prototype.update = function() {};

    Sprite.prototype.render = function(ctx) {
      ctx.fillStyle = this.color;
      return ctx.fillRect(this.x, this.y, this.width, this.height);
    };

    return Sprite;

  })();

  Target = (function(_super) {
    __extends(Target, _super);

    function Target(color) {
      if (color == null) {
        color = '#FFF';
      }
      if (Math.random() > 0.5) {
        this.velox = Math.random() + 0.5;
        this.veloy = Math.random() - 0.5;
        Target.__super__.constructor.call(this, -10, Math.random() * 480, 10, 10, color);
      } else {
        this.velox = -(Math.random() + 0.5);
        this.veloy = Math.random() - 0.5;
        Target.__super__.constructor.call(this, 500, Math.random() * 480, 10, 10, color);
      }
    }

    Target.prototype.update = function() {
      this.x += this.velox;
      this.y += this.veloy;
      if (this.y > 490 || this.y < 0) {
        return this.veloy *= -1;
      }
    };

    return Target;

  })(Sprite);

  canvas = document.getElementById('canvas');

  ctx = canvas.getContext('2d');

  gameStarted = false;

  gameIsOver = false;

  score = 0;

  lives = 5;

  startGame = function() {
    var addAvoidTick, addEnemyTick, avoids, garbageCollectTick, keyBindings, keysdown, player, shake, targets, tick;
    if (gameStarted) {
      return;
    }
    targets = [];
    avoids = [];
    player = new Sprite(0, 490, 70, 10);
    shake = function(n) {
      if (n === 0) {
        return ctx.setTransform(1, 0, 0, 1, 0, 0);
      } else {
        if (n % 2 === 0) {
          canvas.style.backgroundColor = '#F00';
        } else {
          canvas.style.backgroundColor = '#000';
        }
        ctx.setTransform(1, 0, 0, 1, Math.random() * 10 - 5, Math.random() * 10 - 5);
        if (!gameIsOver) {
          return setTimeout((function() {
            return shake(n - 1);
          }), 50);
        }
      }
    };
    keyBindings = [
      [
        38, function() {
          var newAvoids, newTargets, object, _i, _j, _len, _len1;
          newTargets = [];
          for (_i = 0, _len = targets.length; _i < _len; _i++) {
            object = targets[_i];
            if (!(object.x < player.x + player.width && object.x + object.width > player.x)) {
              newTargets.push(object);
            } else {
              score += 1;
            }
          }
          targets = newTargets;
          newAvoids = [];
          for (_j = 0, _len1 = avoids.length; _j < _len1; _j++) {
            object = avoids[_j];
            if (!(object.x < player.x + player.width && object.x + object.width > player.x)) {
              newAvoids.push(object);
            } else {
              lives -= 1;
              if (lives === 0) {
                gameOver();
              }
              shake(5);
            }
          }
          avoids = newAvoids;
          targets = newTargets;
          ctx.fillStyle = '#F00';
          return ctx.fillRect(player.x, 0, player.width, 500);
        }
      ], [
        37, function() {
          return player.x = Math.max(player.x - 10, 0);
        }
      ], [
        39, function() {
          return player.x = Math.min(player.x + 10, 500 - player.width);
        }
      ]
    ];
    keysdown = {};
    tick = function() {
      var binding, object, _i, _j, _k, _len, _len1, _len2;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#0F0';
      ctx.fillRect(500 - 15 * lives, 0, 15 * lives, 15);
      ctx.fillStyle = '#FFF';
      ctx.font = '20px Arial';
      ctx.fillText(score.toString(), 5, 25);
      for (_i = 0, _len = targets.length; _i < _len; _i++) {
        object = targets[_i];
        object.update();
        object.render(ctx);
      }
      for (_j = 0, _len1 = avoids.length; _j < _len1; _j++) {
        object = avoids[_j];
        object.update();
        object.render(ctx);
      }
      player.update();
      player.render(ctx);
      for (_k = 0, _len2 = keyBindings.length; _k < _len2; _k++) {
        binding = keyBindings[_k];
        if (keysdown[binding[0]]) {
          binding[1]();
        }
      }
      if (!gameIsOver) {
        return setTimeout(tick, 1000 / 60);
      }
    };
    addEnemyTick = function() {
      targets.push(new Target());
      if (!gameIsOver) {
        return setTimeout(addEnemyTick, Math.random() * 3000 / (1 + Math.log(score + 1)));
      }
    };
    addAvoidTick = function() {
      avoids.push(new Target('#F00'));
      if (!gameIsOver) {
        return setTimeout(addAvoidTick, (Math.random() * 10000 + 10000) / (1 + Math.log(score + 1) * 2));
      }
    };
    garbageCollectTick = function() {
      var newObjects, object, target, _i, _j, _len, _len1;
      newObjects = [];
      for (_i = 0, _len = targets.length; _i < _len; _i++) {
        object = targets[_i];
        if (!(object.x > 500 || object.x < -10)) {
          newObjects.push(object);
        }
      }
      target = newObjects;
      newObjects = [];
      for (_j = 0, _len1 = avoids.length; _j < _len1; _j++) {
        object = avoids[_j];
        if (!(object.x > 500 || object.x < -10)) {
          newObjects.push(object);
        }
      }
      avoids = newObjects;
      if (!gameIsOver) {
        return setTimeout(garbageCollectTick, 1000);
      }
    };
    document.body.addEventListener('keydown', function(event) {
      return keysdown[event.keyCode] = true;
    });
    document.body.addEventListener('keyup', function(event) {
      return keysdown[event.keyCode] = false;
    });
    tick();
    addEnemyTick();
    addAvoidTick();
    garbageCollectTick();
    return gameStarted = true;
  };

  gameOver = function() {
    gameIsOver = true;
    return setTimeout((function() {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#FFF';
      ctx.font = '50px Arial';
      writeCentered('GAME OVER', 250);
      return writeCentered("Score: " + score, 300);
    }), 100);
  };

  writeCentered = function(text, pos) {
    return ctx.fillText(text, 250 - ctx.measureText(text).width / 2, pos);
  };

  ctx.fillStyle = '#FFF';

  ctx.fillRect(0, 160, 500, 50);

  ctx.fillStyle = '#F00';

  ctx.font = '50px Arial';

  writeCentered('FIRE', 200);

  ctx.fillStyle = '#FFF';

  ctx.font = '20px Arial';

  writeCentered('Move: left/right; Shoot: up', 250);

  writeCentered('Hit white, avoid red', 270);

  writeCentered('Any key to start', 300);

  document.body.addEventListener('keydown', function() {
    return startGame();
  });

}).call(this);

//# sourceMappingURL=script.js.map
