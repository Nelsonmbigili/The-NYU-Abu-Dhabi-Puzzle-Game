//------------------------------------------- Global Variables ---------------------------------- 
let joystickX = 0; 
let Smoothmusic;
let celebrationSound; 
let snapSound;
let particles = []; 
let joystickY = 0; 
let pieceWidth=0;
let pieceHeight=0;
let activeGroup = null; 
let pieceCount = 2;
let selectedGroupIndex = -1;
let selectedGroup = null;
let timeManager;
let celebrationTriggered = false;
let pieces = [];
let images = []; 
let currentChapter =-1; 
let gridSize = 500; 
let pieceSize;
let startTime; 
let fadeAlpha = 255; 
let fadeSpeed = 0.5;
let Unlock=true;
let completed = false;
let change;
let showingInstructions = false;
let Speed=0;
let sendtoarduino=0;

// Stories for different chapters of the play
let stories = 
[ 
{
  reveal: "Stand before the iconic A6B, where modern architecture meets a vibrant community spirit.",
  unlock: "A place where friendships grow and life thrives—what building is at the heart of residential life?"
},
  {
  reveal: "Relax under the shade of the Palms, a peaceful escape from the hustle of campus life.",
  unlock: "A tranquil oasis with swaying trees and cool breezes—where can you pause and recharge?"
},
 {
  reveal: "Experience the energy of the Football Field, where teamwork and passion come alive under the Saadiyat sky.",
  unlock: "A place of boundless energy and shared victories—where can you run free and chase goals?"
},

{
  reveal: "Discover the comfort of the Dorms, your cozy home away from home at NYUAD.",
  unlock: "Your sanctuary on campus—where can you relax, reflect, and dream after a busy day?"
},
{
  reveal: "Take in the vibrant beauty of the Highline, a stunning space that inspires creativity and connection.",
  unlock: "Where nature and art unite to spark ideas and conversations—what place draws you to explore?"
}
];

//------------------------------------------- Assets --------------------------------------- 
function loadAssets() 
{
  images.push(loadImage("Assets/A6Building.jpg"));
  images.push(loadImage("Assets/Palms.jpg"));
  images.push(loadImage("Assets/Field.jpg"));
  images.push(loadImage("Assets/dorm.jpg"));
  images.push(loadImage("Assets/highline.png"));
  
  
  
  
  celebrationSound = loadSound("Assets/Tada.mp3"); 
  snapSound = loadSound("Assets/snap.mp3"); 
  Smoothmusic=loadSound("Assets/melody.mp3");
}


function setupGame() 
{
  createCanvas(windowWidth, windowHeight)
  startTime = millis();
  pieceSize = gridSize / pieceCount;
  completed=false; 
  
// Fade for a simple hinbt before a puzzle is solved 
  fadeAlpha =255;
  if
    (currentChapter+1>=images.length)
  {
    currentChapter=(currentChapter+1)%images.length;
    pieceCount++;
  }else
  {
    currentChapter++;
  }
  selectedGroupIndex = -1;
  timeManager = new TimeManager(); 
  timeManager.start();
  celebrationTriggered = false;
  initializePieces();
}

// Initialising Piece's image cropping and positioning
function initializePieces() 
{
  completed = false; 
  pieces = []; 
  let img = images[currentChapter];
  let centerX = width / 2;
  let centerY = 50 + height / 2;
  let halfGrid = gridSize / 2;

  for (let row = 0; row < pieceCount; row++) 
  {
    for (let col = 0; col < pieceCount; col++) 
    {
      let x, y;
      do 
      {
        x = random(pieceSize / 2, width - pieceSize / 2);
        y = random(pieceSize / 2 + 50, height - pieceSize / 2);
      } while (
        x > centerX - halfGrid &&
        x < centerX + halfGrid &&
        y > centerY - halfGrid &&
        y < centerY + halfGrid
      );
      pieces.push(new Piece(x, y, pieceSize, row, col, img));
    }
  }
}

//The Game play
function PlayGame() 
{
  background(200);
  fill(0, fadeAlpha);
  textAlign(CENTER, CENTER);
  textSize(24);
  console.log(currentChapter);
  text(stories[currentChapter].unlock, width / 2, 70);
  if (fadeAlpha > 0) 
  {
    fadeAlpha -= fadeSpeed;
  }
  drawTimer();
  readJoystick();
  dragWithJoystick(joystickX, joystickY);
  if (completed)  
  {
    drawStoryReveal();
    selectedGroupIndex = -1;
    timeManager.stop();
    triggerCelebration(); 
    Unlock=false;
  } else 
  {
    for (let piece of pieces)
    {
      piece.show();
    }

    if (isPuzzleComplete())
    {
      completed=true;
    }
  }
  for (let i = particles.length - 1; i >= 0; i--) 
  {
    particles[i].update();
    particles[i].show();
    if (particles[i].alpha <= 0) 
    {
      particles.splice(i, 1); 
    }
  } 
  writeSerial(sendtoarduino +'\n');
}


//------------------------Class To manage Image Pieces -------------------------------------------- 

class Piece 
{
  constructor(x, y, size, row, col, img) 
  {
    this.x = x;
    this.y = y;
    this.size = size;
    this.row = row;
    this.col = col;
    this.dragging = false;
    this.offsetX = 0;
    this.offsetY = 0;
    this.img = img; 
    this.group = [this];
  }

  show() 
  {
    push();
    translate(this.x, this.y);
    imageMode(CENTER);
// Display the cropped section of the image
    let imgX = this.col * (this.img.width / pieceCount);
    let imgY = this.row * (this.img.height / pieceCount);
    let imgW = this.img.width / pieceCount;
    let imgH = this.img.height / pieceCount;
    pieceWidth=imgW;
    pieceHeight=imgH;
    image(this.img, 0, 0, this.size, this.size, imgX, imgY, imgW, imgH);
    pop();
  }
//---------------------Class functions for Mouse usage for easy debbugging ------------------------- 
  contains(mx, my) 
  {
    return (
      mx > this.x - this.size / 2 &&
      mx < this.x + this.size / 2 &&
      my > this.y - this.size / 2 &&
      my < this.y + this.size / 2
    );
  }

  startDrag(mx, my) 
  {
    this.dragging = true;
    this.offsetX = this.x - mx;
    this.offsetY = this.y - my;
  }
  stopDrag()
  {
    this.dragging = false;
  }
   drag(mx, my)
  {
  if (this.dragging) 
  {
// Calculate the movement 
    let dx = mx + this.offsetX - this.x;
    let dy = my + this.offsetY - this.y;

// Determine the boundaries of the group
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (let piece of this.group) 
    {
      let halfSize = piece.size / 2;
      minX = min(minX, piece.x - halfSize);
      maxX = max(maxX, piece.x + halfSize);
      minY = min(minY, piece.y - halfSize);
      maxY = max(maxY, piece.y + halfSize);
    }

// Check if moving the group would go outside the canvas
    let groupDx = dx, groupDy = dy;
    if (minX + dx < 0) groupDx = -minX;
    if (maxX + dx > width) groupDx = width - maxX; 
    if (minY + dy < 50) groupDy = 50 - minY; 
    if (maxY + dy > height) groupDy = height - maxY; 
    let Num=0;
// Move the group
    for (let piece of this.group)
    {
      if(Num<piece.length)
      {
        Num=piece.length();
      }
      piece.x += groupDx;
      piece.y += groupDy;
    }
  } 
}
  
// Check if two adjacent pieces are close enough to attach 
 checkSnap()
  {
  for (let other of pieces) 
  {
    if (other !== this && !this.group.includes(other))
    {
      let dRow = other.row - this.row;
      let dCol = other.col - this.col;
      let targetX = this.x + dCol * this.size;
      let targetY = this.y + dRow * this.size;

      if (dist(other.x, other.y, targetX, targetY) < 3)
    {
        other.x = targetX;
        other.y = targetY;
        snapSound.play();
// Merge groups
        let newGroup = [...new Set([...this.group, ...other.group])]; 
        for (let piece of newGroup) {
          piece.group = newGroup; 
        }
      }
    }
  }
}
}

//---------------------Class To manage Time in the Game ------------------------- 
class TimeManager 
{
  constructor() 
  {
    this.startTime = null; 
    this.elapsedTime = 0; 
    this.isRunning = false; 
  }

// Start or resume the timer
  start() 
  {
    if (!this.isRunning) 
    {
      this.startTime = millis();
      this.isRunning = true;
    }
  }
  
  stop() 
  {
    if (this.isRunning)
    {
      this.elapsedTime += millis() - this.startTime;
      this.isRunning = false;
    }
  }
  
  reset() 
  {
  this.elapsedTime = 0;
  }

  getElapsedSeconds() 
  {
    if (this.isRunning) 
    {
      return floor((this.elapsedTime + (millis() - this.startTime)) / 1000);
    }
    return floor(this.elapsedTime / 1000);
  }
}


// Draw a Section for Time display during Game play
function drawTimer()
{
  let elapsedSeconds = timeManager.getElapsedSeconds();
  fill(137, 0, 225);
  rectMode(CORNER);
  rect(0, 0, width, 50);
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(24);

// Calculate minutes and seconds
  let min = Math.floor(elapsedSeconds / 60);
  let secs = Math.floor(elapsedSeconds % 60);

// Display the time
  if (elapsedSeconds < 60)
  {
    text(`Time: ${elapsedSeconds}s`, width / 2, 25);
  } else {
// Format the minutes and seconds properly 
    text(`Time: ${min}:${secs < 10 ? '0' + secs : secs}`, width / 2, 25);
  }
}

// Reveal the story when Image is solved correctly 
function drawStoryReveal()
{
  fill(0);
  textAlign(CENTER, CENTER);
  textSize(20);
  fill(255,0,0);
  text("Press 'Next' to continue to the next chapter.", width / 2, height-200);
  
  if(currentChapter==images.length)
     {
     drawFinalScreen();
     }
}

// Check if puzzle is completed
function isPuzzleComplete()
{
  if (pieces.length === 0) return false; 
  let masterGroup = pieces[0].group;
  return pieces.every(piece => piece.group === masterGroup); 
}

// Make a celebration when puzzle is solved 
function triggerCelebration() 
{
  if (!celebrationTriggered) 
  {
    celebrationTriggered = true; 
    if (!celebrationSound.isPlaying())
    {
      celebrationSound.play(); 
    }

    for (let i = 0; i < 100; i++) 
    {
      particles.push(new Particle(width / 2, 0));
    }
  }
  let img = images[currentChapter];
  let imgX = width / 2;
  let imgY = height / 2;
  let imgWidth = min(width * 0.6, gridSize); 
  let imgHeight = (img.height / img.width) * imgWidth; 
  imageMode(CENTER);
  image(img, imgX, imgY, imgWidth, imgHeight);
  fill(0);
  textAlign(CENTER, CENTER);
  textSize(20);
  text(stories[currentChapter].reveal, imgX, height*0.2);
  fill(255,0,0);
  text("You Solved the Puzzle in "+ timeManager.getElapsedSeconds()+ " Seconds", imgX, height*0.1);
}

//---------------------Class To manage bubles for celebration------------------------- 
class Particle 
{
  constructor(x, y) 
  {
    this.x = x;
    this.y = y;
    this.size = random(5, 30);
    this.alpha = 255;
    this.color = color(random(255), random(255), random(255));
    this.speedX = random(-5, 5);
    this.speedY = random(-5, 5);
  }

  update()
  {
    this.x += this.speedX;
    this.y += this.speedY;
    this.alpha -= 1;
  }

  show() 
  {
    fill(this.color.levels[0], this.color.levels[1], this.color.levels[2], this.alpha);
    noStroke();
    ellipse(this.x, this.y, this.size);
  }
}

//---------------------Custom Call back functions---------------------------------- 
// Mouse controll for Testing
function mousePressedGame() 
{
  for (let i = pieces.length - 1; i >= 0; i--) 
  {
    if (pieces[i].contains(mouseX, mouseY)) {
      let clickedPiece = pieces.splice(i, 1)[0];
      pieces.push(...clickedPiece.group);
      clickedPiece.startDrag(mouseX, mouseY);
      break;
    }
  }
}

function mouseDraggedGame() 
{
  for (let piece of pieces) 
  {
    piece.drag(mouseX, mouseY);
  }
}

function mouseReleasedGame() 
{
  for (let piece of pieces) 
  {
    piece.stopDrag();
    piece.checkSnap();
  }
}


//---------------------Function for Joystick controll OF PIECES ---------------------------------- 
function dragWithJoystick(joystickX, joystickY) 
{
  let selectedGroup = pieces[selectedGroupIndex];
  if (selectedGroup) 
  {
    let groupMinX = Infinity, groupMaxX = -Infinity, groupMinY = Infinity, groupMaxY = -Infinity;
    for (let piece of selectedGroup.group)
    {
      groupMinX = Math.min(groupMinX, piece.x - piece.size / 2);
      groupMaxX = Math.max(groupMaxX, piece.x + piece.size / 2);
      groupMinY = Math.min(groupMinY, piece.y - piece.size / 2);
      groupMaxY = Math.max(groupMaxY, piece.y + piece.size / 2);
    }

    if (groupMinX + joystickX < 0) {
      joystickX = Math.max(0, joystickX); 
    } else if (groupMaxX + joystickX > width)
    {
      joystickX = Math.min(0, joystickX); 
    }

    if (groupMinY + joystickY < 50)
    {
      joystickY = Math.max(0, joystickY);
    } else if (groupMaxY + joystickY > height)
    {
      joystickY = Math.min(0, joystickY); 
    }

    for (let piece of selectedGroup.group) 
    {
      let newX = piece.x + joystickX;
      let newY = piece.y + joystickY;

      for (let otherPiece of selectedGroup.group) 
      {
        if (otherPiece !== piece)
        {
          let dx = newX - otherPiece.x;
          let dy = newY - otherPiece.y;
          let distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < piece.size) 
          {
            newX = piece.x;
            newY = piece.y;
            break; 
          }
        }
      }
      piece.x = newX;
      piece.y = newY;
      piece.checkSnap(); 
    }
  }
  
   if(selectedGroupIndex>=0)
  {
   let selectedPiece = pieces[selectedGroupIndex];
   rectMode(CENTER);
   let x = selectedPiece.x;  
   let y = selectedPiece.y; 
   let size = selectedPiece.size;  
   fill(0);  
   strokeWeight(2);  
   rect(x, y, size * 1.02, size * 1.02);
   console.log("Inside rectangle");
  }

}




// Reading readJoystick movements
function readJoystick() 
{
  joystickX = (Horizontal < 480) ? (Horizontal < 270 ? -5 : -1) : (Horizontal > 530)  ? (Horizontal > 750 ? 5 : 1) : 0;
  joystickY = (Vertical < 480)  ? (Vertical < 270 ? 5 : 1) : (Vertical > 530)  ? (Vertical > 750 ? -5 : -1)  : 0;
  if(joystickX==5||joystickX==-5||joystickY==5||joystickY==-5 )
  {
    sendtoarduino=1;
  }else if(joystickX==1||joystickX==-1||joystickY==1||joystickY==-1)
  {
    sendtoarduino=2;
  }else
  {
    sendtoarduino=0;
  }
}

//Get selested group to allow user to see what piece will move
function updateSelectedGroupIndex() 
{
  selectedGroupIndex = (selectedGroupIndex + 1) % pieces.length; 
}

// Make selected piece come on  top of others 
function bringGroupToTop(index) 
{
  let selectedGroup = pieces[index].group; 
  let otherGroups = pieces.filter(piece => piece.group !== selectedGroup); 
  pieces = [...otherGroups, ...selectedGroup]; 
}
