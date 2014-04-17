class Sprite
  constructor: (@x, @y, @width, @height, @color = '#F00') ->
  
  update: ->

  render: (ctx) ->
    ctx.fillStyle = @color
    ctx.fillRect @x, @y, @width, @height

class Target extends Sprite
  constructor: (color = '#FFF') ->
    if Math.random() > 0.5
      @velox = Math.random() + 0.5
      @veloy = Math.random() - 0.5
      super -10, Math.random() * 480, 10, 10, color
    else
      @velox = -(Math.random() + 0.5)
      @veloy = Math.random() - 0.5
      super 500, Math.random() * 480, 10, 10, color

  update: ->
    @x += @velox; @y += @veloy
    if @y > 490 or @y < 0then @veloy *= -1

canvas = document.getElementById 'canvas'

ctx = canvas.getContext '2d'

gameStarted = false
gameIsOver = false

score = 0
lives = 5

startGame = ->
  if gameStarted then return

  targets = []
  avoids = []

  player = new Sprite 0, 490, 70, 10

  shake = (n) ->
    if n is 0
      ctx.setTransform 1, 0, 0, 1, 0, 0
    else
      if n % 2 is 0
        canvas.style.backgroundColor = '#F00'
      else
        canvas.style.backgroundColor = '#000'
      ctx.setTransform 1, 0, 0, 1, Math.random() * 10 - 5, Math.random() * 10 - 5
      unless gameIsOver
        setTimeout (->
          shake n - 1), 50


  keyBindings = [
    [38, -> # up arrow
      newTargets = []
      for object in targets
        unless object.x < player.x + player.width and object.x + object.width > player.x
          newTargets.push object
        else
          score += 1
      targets = newTargets

      newAvoids = []
      for object in avoids
        unless object.x < player.x + player.width and object.x + object.width > player.x
          newAvoids.push object
        else
          lives -= 1
          if lives is 0
            gameOver()
          shake 5

      avoids = newAvoids

      targets = newTargets
      ctx.fillStyle = '#F00'
      ctx.fillRect player.x, 0, player.width, 500]
    [37, -> # left arrow
      player.x = Math.max player.x - 10, 0]
    [39, -> # right arrow
      player.x = Math.min player.x + 10, 500 - player.width]
  ]

  keysdown = {}

  tick = ->
    ctx.clearRect 0, 0, canvas.width, canvas.height
    
    ctx.fillStyle = '#0F0'
    ctx.fillRect 500 - 15 * lives, 0, 15 * lives, 15

    ctx.fillStyle = '#FFF'
    ctx.font = '20px Arial'
    ctx.fillText score.toString(), 5, 25

    for object in targets
      object.update()
      object.render ctx

    for object in avoids
      object.update()
      object.render ctx
    
    player.update()
    player.render ctx

    for binding in keyBindings
      if keysdown[binding[0]] then binding[1]()

    unless gameIsOver
      setTimeout tick, 1000 / 60

  addEnemyTick = ->
    targets.push new Target()
    
    unless gameIsOver
      setTimeout addEnemyTick, Math.random() * 3000 / (1 + Math.log(score + 1))

  addAvoidTick = ->
    avoids.push new Target '#F00'
    
    unless gameIsOver
      setTimeout addAvoidTick, (Math.random() * 10000 + 10000) / (1 + Math.log(score + 1) * 2)

  garbageCollectTick = ->
    newObjects = []
    for object in targets
      unless object.x > 500 or object.x < -10
        newObjects.push object
    target = newObjects

    newObjects = []
    for object in avoids
      unless object.x > 500 or object.x < -10
        newObjects.push object
    avoids = newObjects
    
    unless gameIsOver
      setTimeout garbageCollectTick, 1000

  document.body.addEventListener 'keydown', (event) ->
    keysdown[event.keyCode] = true

  document.body.addEventListener 'keyup', (event) ->
    keysdown[event.keyCode] = false

  tick(); addEnemyTick(); addAvoidTick(); garbageCollectTick()
  gameStarted = true

gameOver = ->
  gameIsOver = true
  setTimeout (->
    ctx.setTransform 1, 0, 0, 1, 0, 0
    ctx.clearRect 0, 0, canvas.width, canvas.height
    ctx.fillStyle = '#FFF'
    ctx.font = '50px Arial'
    writeCentered 'GAME OVER', 250
    writeCentered "Score: #{score}", 300
  ), 100

writeCentered = (text, pos) ->
  ctx.fillText text, 250 - ctx.measureText(text).width / 2, pos
ctx.fillStyle = '#FFF'
ctx.fillRect 0, 160, 500, 50

ctx.fillStyle = '#F00'
ctx.font = '50px Arial'
writeCentered 'FIRE', 200
ctx.fillStyle = '#FFF'
ctx.font = '20px Arial'
writeCentered 'Move: left/right; Shoot: up', 250
writeCentered 'Hit white, avoid red', 270
writeCentered 'Any key to start', 300

document.body.addEventListener 'keydown', ->
  startGame()
