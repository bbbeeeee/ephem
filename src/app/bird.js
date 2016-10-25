let getRotatedPoint = (x, y, rotationAngle, size) => {
  rotationAngle = (rotationAngle / 180)  * Math.PI;

  x = x + size * Math.cos(rotationAngle);
  y = y - size * Math.sin(rotationAngle);

  return [x, y];
};

class Birds {
  constructor({type, color, selector, amount, direction, maxVelocity, size, maxSize, maxX, maxY}) {
    amount = amount || 2;
    let birds = [];

    maxX = maxX || $(selector).width();
    maxY = maxY || $(selector).height();

    $(selector).prepend(`
      <canvas id="birdies" height="${maxY}" width="${maxX}"></canvas>
    `);

    this.canvas = document.getElementById('birdies');
    this.ctx = this.canvas.getContext('2d');
    this.ctx.fillStyle = color || '#000000';

    type = type || 'multidirectional';
    if(type === 'unidirectional') {
      if(!direction) {
        direction = 0.01;
      }
    }

    this.mouseX = 0;
    this.mouseY = 0;

    document.addEventListener(
      'mousemove',
      (e) => {
        this.mouseX = e.pageX;
        this.mouseY = e.pageY;
      },
      false
    );

    maxVelocity = maxVelocity || 5;

    for(let i = 0; i < amount; i++) {
      birds.push(new Bird({
        type,
        ctx: this.ctx,
        x: getRandom(1, maxX),
        y: getRandom(1, maxY),
        flapFrames: getRandom(10, 50),
        flapFrame: getRandom(1, 50),
        velocity: getRandom(1, 3),
        rotationAngle: direction || getRandom(1, 360),
        size: size || getRandom(3, 10 || maxSize),
        boundaries: [0, 0, maxX, maxY]
      }));
    }

    setInterval(() => {
      this.ctx.clearRect(0, 0, maxX, maxY);
      birds.forEach((bird, index) => {
        bird.update({
          mouseX: this.mouseX,
          mouseY: this.mouseY
        });
      });

      this.drawBirds(birds);
    }, 33);
  };

  drawBirds(birds) {
    birds.forEach((bird, index) => {
      bird.draw();
    });
  }
};

class Bird {
  constructor({type, ctx, x, y, flapFrame, flapFrames, velocity, rotationAngle, size, boundaries}) {
    this.type = type;
    this.ctx = ctx;
    this.x = x;
    this.y = y;
    this.flapFrame = 1;
    this.flapFrames = flapFrames;
    this.flapRatio = Math.floor(flapFrames / 3);
    this.flapAmount = 1.5;
    this.velocity = velocity;
    this.rotationAngle = rotationAngle;
    this.turn = 0;
    this.size = size;
    this.outOfBounds = false;
    this.boundaries = boundaries;
  }

  update({mouseX, mouseY}) {
    if(this.type === 'multidirectional') {
      this.multidirectionalUpdate({mouseX, mouseY})
    } else if('unidirectional') {
      this.unidirectionalUpdate();
    }
  }

  unidirectionalUpdate() {
    if(this.x > this.boundaries[2] + 50) {
      this.x = -50;
      this.y = getRandom(0, this.boundaries[3]);
    }

    this.x = this.x + this.velocity;
    this.updateFlapFrame();
  }

  multidirectionalUpdate({mouseX, mouseY}) {
    if(this.turn > 0) {
      this.rotationAngle += getRandom(1, 5);
      this.turn -= getRandom(1, 5);
    } else if(this.turn < 0){
      this.rotationAngle -= getRandom(1, 5);
      this.turn += getRandom(1, 5);
    }

    let [oldX, oldY] = [this.x, this.y];
    this.x = this.x + this.velocity * Math.cos(this.rotationAngle * Math.PI / 180);
    this.y = this.y + this.velocity * Math.sin(this.rotationAngle * Math.PI / 180);
    this.updateFlapFrame();

    this.updateTurn({
      mouseX,
      mouseY,
      oldX,
      oldY,
    });
  }

  updateTurn({mouseX, mouseY, oldX, oldY}) {
    // check if approaching mouse or wall, then add or subtract to turn accordingly
    let [x, y] = [this.x, this.y];
    let turnChange = 0;

    let oldMouseDistance = this.getDistance(oldX, oldY, mouseX, mouseY);
    let newMouseDistance = this.getDistance(x, y, mouseX, mouseY);

    if(newMouseDistance < oldMouseDistance && newMouseDistance < 100) {
      if(x > mouseX || y < mouseY) {
        turnChange += getRandom(1, 5);
      } else {
        turnChange -= getRandom(1, 5);
      }
    }

    let boundaries = this.boundaries;
    if(this.x < boundaries[0] + 20 || this.y < boundaries[1] + 20) {
      this.outOfBounds = true;
      turnChange += getRandom(10, 20);
    } else if(this.x > boundaries[2] - 40 || this.y > boundaries[3] - 40) {
      this.outOfBounds = true;
      turnChange -= getRandom(10, 20);
    } else {
      if(this.outOfBounds === true) {
        this.outOfBounds = false;
        this.turn = 0;
        turnChange = 0;
      }
    }

    this.turn += turnChange;
  }

  getDistance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2));
  }

  updateFlapFrame() {
    if(this.flapFrame >= this.flapFrames) {
      this.flapFrame = 0;
    }

    this.flapFrame += 1;

    if(this.flapFrame > this.flapRatio) {
      this.flapAmount += 1.5 / (this.flapFrames - this.flapRatio);
    } else {
      this.flapAmount -= 1.5 / (this.flapRatio);
    }

  }

  draw(x, y, flapAmount, rotationAngle, size) {
    this.drawWing();
  }

  drawWing() {
    let {
      x,
      y,
      flapAmount,
      rotationAngle,
      size
    } = this;

    let x1 = size;
    let y1 = 0;

    let x2 = 0;
    let y2 = -size * flapAmount;

    let x3 = -size;
    let y3 = 0;

    //console.log(x, y, x1, y1, x2, y2, x3, y3);
    this.ctx.beginPath();
    this.ctx.translate(x, y);
    this.ctx.rotate(rotationAngle * Math.PI / 180);
    this.ctx.lineTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    this.ctx.lineTo(x3, y3);
    this.ctx.fill();
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
  }
};

let getRandom = (min, max) => {
  return  Math.floor(Math.random() * (max - min)) + min;
};

export default Birds;
