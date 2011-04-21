var width = 10;
var height = 10;
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
	var html = "<table>";
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
 
var startGame = function() {
	animation = false;
	selectedCellId = -1;
	clearTimeout(blinkSelectedCellThread);
	
	freeCells = width*height;
	
	for (var i=0; i < width*height; i++) {
		cellStyles[i] = "";
		getCell(i).removeClass( 'filled' );
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
	while (cellStyles[cellId] != "") {
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
		// console.log("next cell: " + cellId);
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
	if (!gameStarted || animation) {
		return;
	}
	else if (cell.id == selectedCellId) {
		// clicked the same cell. Nothing to do.
		return;
	}
	/*
	else if (hasSelectedCell()) {
		// restore previously selected cell    // WTF?
		getSelectedCell().addClass(cellStyles[selectedCellId]);
	}
	*/
	
	if (cellStyles[cell.id] == "") {
		if (hasSelectedCell()) {
			// User clicked empty cell - let's find path to it
			console.log("Find path from " + selectedCellId + " to " + cell.id);
			var path = findPath(selectedCellId, cell.id);
			if (path == null) {
				// path not found
				console.log("path not found from " + selectedCellId + " to " + cell.id);
			}
			else {
				console.log("path is found: " + path+", start animation from " + selectedCellId + " to " + cell.id);
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
		
		selectedCellId = cell.id;
		enqueue(blinkSelectedCell);
	}
}

var animatePath = function() {
	// console.log("animate (" + animationPath + "; step=" + animationStep + ")");
	var cell = getCell(animationPath[animationStep]);
	cell.addClass(cellStyles[selectedCellId]);
	if (animationStep > 0) {
		var previousCell = getCell(animationPath[animationStep-1]);
		previousCell.removeClass(cellStyles[selectedCellId]);
	}
	if (animationStep < animationPath.length-1) {
		animationStep++;
		setTimeout(animatePath, 100);
	}
	else {
		//console.log("animate: fillCell(" + animationPath[animationStep] + " with style" + cellStyles[selectedCellId] + ")");
		fillCell(animationPath[animationStep], cellStyles[selectedCellId]);
		selectedCellId = -1;
		animationPath = null;
		animationStep = -1;
		animation = false;
		enqueue(fillNextCells);
	}
}

function tryToAddCell(steps, nextWaveCells, currentCellId, nextCellId) {
	if (steps[nextCellId] == 0 && cellStyles[nextCellId] == "") {
		nextWaveCells.push(nextCellId);
		steps[nextCellId] = currentCellId;
		// getCell(nextCellId).append(""+currentCellId);
	}
}

function findPath(fromCellId, toCellId) {
	if (fromCellId == toCellId) {
		return;
	}
	var steps = [];
	for (var i=0; i<width*height; i++) {
		steps[i] = 0;
		getCell(i).append("");
	}
	steps[fromCellId] = fromCellId;
	var currentWaveCells = Array();
	currentWaveCells.push(fromCellId);

	search:
	while (true) {
		var nextWaveCells = [];
		// console.log("Start wave: " + currentWaveCells);
		for (var j=0; j<currentWaveCells.length; j++) {
			if (currentWaveCells[j] == toCellId) {
				// path is found
				break search;
			}
			if (currentWaveCells[j] % width > 0)
				tryToAddCell(steps, nextWaveCells, currentWaveCells[j], currentWaveCells[j]-1);
			if (currentWaveCells[j] % width < width-1)
				tryToAddCell(steps, nextWaveCells, currentWaveCells[j], currentWaveCells[j]+1);
			if (currentWaveCells[j] >= width)
				tryToAddCell(steps, nextWaveCells, currentWaveCells[j], currentWaveCells[j]-width);
			if (currentWaveCells[j] < width*height-width)
				tryToAddCell(steps, nextWaveCells, currentWaveCells[j], currentWaveCells[j]+width);
		}
		// alert("Wave done: " + nextWaveCells);
		
		if (nextWaveCells.length == 0) {
			// path is not found
			console.log("Path is not found.. fromCellId=" + fromCellId + ", toCellId=" + toCellId + 
				", steps[fromCellId]=" + steps[fromCellId] + ", steps[toCellId]="+steps[toCellId]);
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
