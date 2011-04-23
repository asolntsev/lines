var width = 10;
var height = 10;
var score = 0;
var selectedCellId = -1;
var freeCells;
var cellStyles=[];
var gameStarted = false;

var animation = false;
var animationPath;
var animationStep;

var blinkSelectedCellThread;
var eventProcessingThread;
var queue = [];

function enqueue(func) {
	queue.push(func);
}

var runEventProcessingThread = function() {
	while (queue.length > 0) {
		var firstAction = queue.shift();
		firstAction();
	}
	eventProcessingThread = setTimeout(runEventProcessingThread, 100);
}

var stopEventProcessingThread = function() {
	clearTimeout(eventProcessingThread);
}

function createField() {
	var gameArea = $("#gameArea");
	var html = "<h3>Score: <span id='score'>0</span></h3>";
	html += "<table>";
	for (var y=0; y<height; y++) {
		html = html + "<tr>";
		for (var x=0; x<width; x++) {
			<!-- "<img src='img/collaboration.png' id='" + x + "-" + y + "'/>" -->
			var cellId = (x+y*width);
			html = html + "<td class='cell' onClick='onCellClicked(this);' id='" + cellId + "'>&nbsp;</td>";
		}
		html = html + "</tr>";
	}
	html = html + "</table>";
	gameArea.append(html);
	return gameArea;
}

function showScore() {
	$("#score").text(score);
} 

var startGame = function() {
	score = 0;
	showScore();
	animation = false;
	selectedCellId = -1;
	clearTimeout(blinkSelectedCellThread);
	
	freeCells = width*height;
	
	for (var i=0; i < width*height; i++) {
		getCell(i).removeClass( 'filled' );
		// getCell(i).removeClass( cellStyles[i] );
		cellStyles[i] = "";
	}

	gameStarted = true;
	enqueue(fillNextCells);
 }
 
 function getRandomCellId() {
	return Math.floor(width*height*Math.random());
 }
 
function getRandomStyle() {
	return "style" + Math.floor(14*Math.random());
}

var gameOver = function() {
	gameStarted = false;
	if (confirm("Game over...  Play againg?")){
		enqueue(startGame);
	}
}

function _findFreeCell() {
	var cellId = getRandomCellId();
	while (!isEmpty(cellId)) {
		var cellId = getRandomCellId();
	}
	return cellId;
}

var fillNextCells = function() {
	 if (freeCells < 3) {
		enqueue(gameOver);
	}
	for (var i=0; i<3; i++) {
		var cellId = _findFreeCell();
		fillCell(cellId, getRandomStyle());
	}
	enqueue(blinkSelectedCell);
 }
 
 function fillCell(cellId, cellStyle) {
	cellStyles[cellId] = cellStyle;
	getCell(cellId).addClass( 'filled' );
	getCell(cellId).addClass( cellStyle );
	freeCells--;
 }
 
function clearCell(cellId) {
	getCell(cellId).removeClass( 'filled' );
	getCell(cellId).removeClass( cellStyles[cellId] );
	cellStyles[cellId] = '';
	freeCells++;
}
 
 function getCell(cellNr) {
	return $("#"+cellNr);
}

function getSelectedCell() {
	return getCell(selectedCellId);
}

/**
 * The main click handler for cells
 */
function onCellClicked(cell) {
	var cellId = parseInt(cell.id);
	if (!gameStarted || animation) {
		return;
	}
	else if (cellId == selectedCellId) {
		// clicked the same cell. Nothing to do.
		return;
	}
	/*
	else if (hasSelectedCell()) {
		// restore previously selected cell    // WTF?
		getSelectedCell().addClass(cellStyles[selectedCellId]);
	}
	*/
	
	if (isEmpty(cellId)) {
		if (hasSelectedCell()) {
			// User clicked empty cell - let's find path to it
			//console.log("Find path from " + selectedCellId + " to " + cellId);
			var path = findPath(selectedCellId, cellId);
			if (path == null) {
				// path not found
				//console.log("path not found from " + selectedCellId + " to " + cellId);
			}
			else {
				//console.log("path is found: " + path+", start animation from " + selectedCellId + " to " + cellId);
				animation = true;
				animationPath = path;
				animationStep = 0;
				enqueue(animatePath);
			}
		}
	}
	else {
		// User clicked filled cell - let's select it.
		
		if (hasSelectedCell()) {
			// unselect the previous selected
			getSelectedCell().removeClass('selectedHightlightedCell');			
			clearTimeout(blinkSelectedCellThread);
		}
		
		selectedCellId = cellId;
		enqueue(blinkSelectedCell);
	}
}

var animatePath = function(ultrafast) {
	// console.log("animate (" + animationPath + "; step=" + animationStep + ")");
	var cell = getCell(animationPath[animationStep]);
	cell.addClass(cellStyles[selectedCellId]);
	if (animationStep > 0) {
		var previousCellId = animationPath[animationStep-1];
		var previousCell = getCell(previousCellId);
		if (!previousCell.hasClass(cellStyles[selectedCellId])) {
			throw "Previous cell in the path ("+previousCellId+") hasn't class " + cellStyles[selectedCellId] + " (path=" +animationPath+")";
		}
		
		previousCell.removeClass(cellStyles[selectedCellId]);
		if (!isEmpty(animationPath[animationStep])) {
			throw "Some of cells in path is not empty: " + animationPath[animationStep] + ", but has class " + cellStyles[animationPath[animationStep]] + " (path=" + animationPath + ")";
		}
		if (cell.hasClass('filled')) { 
			throw "Some of cells in path is filled: " + animationPath[animationStep] + " (path=" + animationPath + ")";
		}
	}
	if (animationStep < animationPath.length-1) {
		animationStep++;
		if (ultrafast && ultrafast == 'fast') {
			//console.log({ultrafast:ultrafast});
			animatePath(ultrafast);
		}
		else {
			//console.log("setTimeout(animatePath, 100);");
			setTimeout(animatePath, 100);
		}
	}
	else {
		//console.log("animate: fillCell(" + animationPath[animationStep] + " with style" + cellStyles[selectedCellId] + ")");
		targetCellId = animationPath[animationStep];
		
		fillCell(targetCellId, cellStyles[selectedCellId]);
		clearCell(selectedCellId);

		selectedCellId = -1;
		animationPath = null;
		animationStep = -1;
		animation = false;
		
		ballAdded(targetCellId);
		enqueue(fillNextCells);
	}
}

var ballAdded = function(cellId) {
	if (!isEmpty(cellId)) {
		var detectedFigures = detectFigures(cellId);
		if (detectedFigures.length > 0) {
			for (var i=0; i<detectedFigures.length; i++) {
				score += detectedFigures[i].length * detectedFigures.length;
				for (var j=0; j<detectedFigures[i].length; j++) {
					clearCell(detectedFigures[i][j]);
				}
			}
			showScore();
		}
	}
}

function detectFigures(cellId) {
	var horisontalLineLeftPart = goAlongLine(cellId, {x:-1,y:0});
	var horisontalLineRightPart = goAlongLine(cellId, {x:1,y:0});
	var verticalLineUpperPart = goAlongLine(cellId, {x:0,y:-1});
	var verticalLineLowerPart = goAlongLine(cellId, {x:0,y:1});
	
	var diagonalLeftPart = goAlongLine(cellId, {x:-1,y:-1});
	var diagonalRightPart = goAlongLine(cellId, {x:1,y:1});
	var ortoDiagonalLeftPart = goAlongLine(cellId, {x:-1,y:1});
	var ortoDiagonalRightPart = goAlongLine(cellId, {x:1,y:-1});
	
	var figures = [];
	addFigure(figures, horisontalLineLeftPart, horisontalLineRightPart);
	addFigure(figures, verticalLineUpperPart, verticalLineLowerPart);
	addFigure(figures, diagonalLeftPart, diagonalRightPart);
	addFigure(figures, ortoDiagonalLeftPart, ortoDiagonalRightPart);
	return figures;
}

function addFigure(result, linePart1, linePart2) {
	if (linePart1.length + linePart2.length > 5) {
		linePart2.shift();
		var line = linePart1.concat(linePart2);
		result.push(line);
	}
	return result;
}

function goAlongLine(cellId, direction) {
	var lineStyle = cellStyles[cellId];
	var result = [];
	var x = _x(cellId);
	var y = _y(cellId);
	
	while (x >= 0 && x < width && y >= 0 && y < height && cellStyles[width*y+x] == lineStyle) {
		result.push(width*y+x);
		x += direction.x;
		y += direction.y;
	}
	return result;
}

function isEmpty(cellId) {
	return cellStyles[cellId] == "";
}

function tryToAddCell(steps, nextWaveCells, currentCellId, nextCellId) {
	if (steps[nextCellId] == -1 && isEmpty(nextCellId)) {
		nextWaveCells.push(nextCellId);
		steps[nextCellId] = currentCellId;
		// getCell(nextCellId).append(""+currentCellId);
	}
}

function _x(cellId) {
	return cellId % width;
}

function _y(cellId) {
	return Math.floor(cellId/width);
}

function findPath(fromCellId, toCellId) {
	if (fromCellId == toCellId) {
		return;
	}
	var steps = [];
	for (var i=0; i<width*height; i++) {
		steps[i] = -1;
		// getCell(i).append(""); // wtf?
	}
	steps[fromCellId] = fromCellId;
	var currentWaveCells = [];
	currentWaveCells.push(fromCellId);

	var waveNumber = 0;
	search:
	while (currentWaveCells.length > 0) {
		if (waveNumber++ > width*height) {
			throw "Too many waves: " + waveNumber;
		}
		
		var nextWaveCells = [];
		// console.log("Start wave: " + currentWaveCells);
		for (var j=0; j<currentWaveCells.length; j++) {
			if (currentWaveCells[j] == toCellId) {
				// path is found
				break search;
			}
			if (_x(currentWaveCells[j]) > 0)
				tryToAddCell(steps, nextWaveCells, currentWaveCells[j], currentWaveCells[j]-1);
			if (_x(currentWaveCells[j]) < width-1)
				tryToAddCell(steps, nextWaveCells, currentWaveCells[j], currentWaveCells[j]+1);
			if (_y(currentWaveCells[j]) > 0)
				tryToAddCell(steps, nextWaveCells, currentWaveCells[j], currentWaveCells[j]-width);
			if (_y(currentWaveCells[j]) < height)
				tryToAddCell(steps, nextWaveCells, currentWaveCells[j], currentWaveCells[j]+width);
		}
		// alert("Wave done: " + nextWaveCells);
		
		if (nextWaveCells.length == 0) {
			// path is not found
			//console.log("Path is not found.. fromCellId=" + fromCellId + ", toCellId=" + toCellId + 
			//	", steps[fromCellId]=" + steps[fromCellId] + ", steps[toCellId]="+steps[toCellId]);
			return null;
		}
		
		currentWaveCells = nextWaveCells;
	}
	
	
	// Restore the path
	var path = [];
	var currentPathCell = toCellId;
	while (currentPathCell != fromCellId) {
		path.push(currentPathCell);
		currentPathCell = steps[currentPathCell];
		if (path.length > width * height) {
			throw "Too long path: " + path;
		}
	};
	path.push(fromCellId);
	path = path.reverse();
	
	// alert("Path is found: " + path);
	return path;
}

function hasSelectedCell() {
	return selectedCellId > -1;
}

var blinkSelectedCell = function() {
	if (!gameStarted) {
		return;
	}
	
	if (!animation && hasSelectedCell()) {
		getSelectedCell().toggleClass('selectedHightlightedCell');
		blinkSelectedCellThread = setTimeout(blinkSelectedCell, 300);
	}
}
