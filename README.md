NYUAD Puzzle Adventure

Overview

NYUAD Puzzle Adventure is a game inspired by the beauty of the NYU Abu Dhabi campus. The game combines visuals of campus landmarks (captured by me and online sources) with an interactive puzzle-solving experience. Players start with a scrambled image divided into four square pieces, rearranging them to form the complete image.

As players progress, the difficulty increases with more precise movements required and additional pieces added to the puzzles. The game is designed to loop endlessly, challenging players with progressively harder levels.

Features
	•	Custom Controller: Built using four switches and a joystick for full gameplay control.
	•	Dynamic Gameplay: Tracks time for each puzzle and provides audio feedback for actions like attaching pieces and solving puzzles.
	•	Visuals and Audio: Includes celebratory sounds and visually appealing graphics for an engaging experience

Implementation

Interaction

Interaction is a key focus of the game. A custom controller allows players to move and arrange puzzle pieces.
	•	Controller Components:
	•	Four switches for game state control.
	•	Joystick for moving puzzle pieces.
	•	Sound feedback for player actions.
	•	Controller Design: The electrical connections are illustrated in the included schematic.

Arduino Code

The Arduino code reads data from the controller and communicates with the game via a serial connection. Key functionalities include:
	1.	Reading button and joystick inputs.
	2.	Sending data to the P5.js sketch.
	3.	Controlling speakers based on game states.

P5.js Sketch

The P5.js sketch manages game states such as “WELCOME,” “INSTRUCTIONS,” and “PLAY.” It processes inputs from the controller and updates the game dynamically. Features include:
	1.	Welcome Screen: Displays an introduction and summary.
	2.	Controller Integration: Reads data for smooth interactions.
	3.	Dynamic Feedback: Hints, timers, and celebration effects.
	4.	State Management: Transitions between screens based on progress.

Communication

Arduino and P5.js communicate using a serial connection. Arduino sends data strings (e.g., button states, joystick values), and P5.js interprets this data to control the game.

Highlights
	•	Controller Design: This project helped me learn how controllers work and inspired ideas for future enhancements.
	•	Graphics: The simple but appealing visuals contribute to the overall player experience.

Future Improvements
	•	Using more complex shapes like jigsaw patterns for puzzle pieces.
	•	Enhancing the controller by adding touch sensors and vibration motors for better interactivity.
