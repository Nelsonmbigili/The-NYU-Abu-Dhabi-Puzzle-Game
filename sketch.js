let myFont;
let state="WELCOME" ;
let Gazelle;
let Horizontal=0;
let Vertical=0;

//------------------------------------------- The Preload Function ----------------------------------------
function preload() 
{
  myFont = loadFont("Assets/Merienda-Regular.ttf");
  Gazelle = loadImage("Assets/Gazelle.png");
  loadAssets();
}

//------------------------------------------- The Setup Function ------------------------------------------
function setup() 
{
  createCanvas(windowWidth, windowHeight);
  textSize(18);
  textFont(myFont);
  Smoothmusic.loop();
}

//------------------------------------------- The draw Function -------------------------------------------
function draw() 
{
  background(200);
  
  if (!serialActive)
  {
    showSelectPort();
  }
  
  if (state === "WELCOME" && serialActive) 
  {
    showWelcomeScreen();
  } else if (state === "INSTRUCTIONS" && serialActive)
  {
    if(!showingInstructions)
    {
      showInstructions();
    }
    
  }
  else if(state === "PLAY" && currentChapter<images.length && serialActive)
  {
    PlayGame();
  }
}


//------------------------------------------- Function to display Screens ---------------------------------- 
function showSelectPort() 
{
  textAlign(CENTER, CENTER);
  fill(0);
  textSize(32);
  text("Press Space Bar to select Serial Port", width / 2, height / 2);
}

function showWelcomeScreen() 
{
  textAlign(CENTER, CENTER);
  textSize(40);
  fill(137, 0, 225);
  text("Welcome to the", width * 0.2, height * 0.2);
  text("The NYU Abu Dhabi Puzzle Adventure!", width * 0.5, height * 0.3);

  textSize(20);
  fill(0);
  let introText =
    "Your mission is to piece together stories from life at NYU Abu Dhabi. Each puzzle represents a unique moment on campus—whether it’s a scientific discovery, an artistic creation, or a display of teamwork.";
  textWrap(WORD);
  textAlign(LEFT, TOP);
  let textX = width * 0.2;
  let textY = height * 0.4;
  let textWidth = width * 0.7;
  text(introText, textX, textY, textWidth);

  textAlign(CENTER, CENTER);
  textSize(24);
  fill(50);
  text("Press 'play' on controller to begin your journey!", width / 2, height / 2 + 100);

  let imgWidth = 200;
  let imgHeight = 150;
  let imgX = width * 0.2;
  let imgY = height * 0.8;
  image(Gazelle, imgX, imgY, imgWidth, imgHeight);

  textAlign(LEFT, CENTER);
  textSize(30);
  fill(0);
  text("Learn to Play?", imgX + 150, imgY);
  textSize(20);
  text("Press 'L' on the Keyboard", imgX + 150, imgY + 50);
}

function showInstructions()
{
 let instructions = `
Your goal is to arrange the pieces to complete the picture. 
Use the controls to move the pieces into the correct positions.

How to Play:


1. Select and Place a Piece
   • Press  "Change" button to change a piece to move with joystick
   • Move the piece to the desired position and if its a correct attachment
     and precise it will attach
   
2. Move the Pieces
   • Use the "Joy stick" to move pieces up, down, left or right.
  
3. Precision
   • Pressing the Joy stick fully to a side will move pieces faster 
   • Partial pressing the joystick will let pieces move slowly, consider this 
     when attaching pieces

Tips:

• Think ahead about where you want to place pieces.
• Simultaneously Press 'N AND P' to reset the Game.
`;
  background(200);
  let imgWidth = 200;
  let imgHeight = 150;
  let imgX = width * 0.15;
  let imgY = height * 0.2;
  image(Gazelle, imgX, imgY, imgWidth, imgHeight);
  textAlign(CENTER, CENTER);
  fill(137, 0, 225);
  textSize(30);
  text("Welcome to the NYU Abu Dhabi Puzzle Adventure!", width*0.5, height*0.05);
  textAlign(LEFT, TOP);
  textSize(20);
  textWrap(WORD);
  fill(0);
  text(instructions, width * 0.3, height * 0.15, width * 0.8);
  fill(255,0,0);
  textAlign(CENTER, CENTER);
  textSize(30);
  text("Press 'P' to begin your puzzle-solving journey!", width * 0.5, height * 0.9);
}

//------------------------------------------- Call Back Functions----------------------------------- 
function keyPressed() 
{
    
  if(key ==="R")
  {
    pieceCount = 2;
  }
  if (key === 'f' ||key === 'F')
  {
    toggleFullScreen();
  }
  if (key === " ") 
  {
    if (!serialActive) 
    {
    setUpSerial().then(() => 
                       {
      if (serialActive) 
      {
        state = "WELCOME";
      }
    }).catch((err) => 
    {
      console.error("Failed to set up serial:", err);
    });
    }
    
  } else if (key === "L") 
  {
    state = "INSTRUCTIONS";
  }  
  else if(key === 'N' && completed)
  { 
    if (currentChapter < images.length) 
    {
      state="PLAY";
      setupGame();
    }
  }
  else if(key === "P")
    {
      state="PLAY";
      setupGame();
    }
}

function windowResized() 
{
  resizeCanvas(windowWidth, windowHeight);
}


//--------------------------------Key Board Functions for testing--------------------------------- 
function mousePressed() 
{
  if (state === "PLAY") mousePressedGame();
}

function mouseReleased() 
{
  if (state === "PLAY") mouseReleasedGame();
}

function mouseDragged() 
{
  if (state === "PLAY") 
    mouseDraggedGame();
}

// Button Global Variables 
let playButton="LOW";
let changeButton="LOW";
let InstructionsButton="LOW";
let nextButton="LOW";


// Variables enable detecting change
let prevPlayButton = "LOW";
let prevInstructionsButton = "LOW";
let prevNextButton = "LOW";
let prevChangeButton = "LOW";

// Read data comming inthe following order : Instructions,change,next,play,x,y
function readSerial(data) 
{
  if (data != null)
{
    let values = data.trim().split(",");
    if (values.length === 6)
  {
    InstructionsButton=values[0];
    changeButton= values[1];
    nextButton= values[2];
    playButton= values[3];
    Horizontal =  int(values[4]);
    Vertical=  int(values[5]);
  }
}
  
// Check for state changes and trigger actions (Button Pressed)
  if (playButton === "HIGH" && prevPlayButton === "LOW" && serialActive) 
  {
    state = "PLAY";
    setupGame();
  }

  if (InstructionsButton === "HIGH" && prevInstructionsButton === "LOW" && serialActive) 
  {
    state = "INSTRUCTIONS";
  }

  if (nextButton === "HIGH" && prevNextButton === "LOW" && completed) 
  {
    state = "PLAY";
    setupGame();
  }

  if (changeButton === "HIGH" && prevChangeButton === "LOW") 
  {
    updateSelectedGroupIndex();
  }

// Update previous states
  prevPlayButton = playButton;
  prevInstructionsButton = InstructionsButton;
  prevNextButton = nextButton;
  prevChangeButton = changeButton;
  
}
  
// Go full screen 
function toggleFullScreen() 
{
  let fs = fullscreen();
  fullscreen(!fs);  
}
