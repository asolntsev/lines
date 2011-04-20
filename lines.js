var width = 10;
var height = 10;
var selectedCellId = -1;
var freeCells = width*height;
var cellStyles=new Array();
var gameStarted = false;

var animation = false;
var animationPath;
var animationStep;

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
 
function startGame() {
	selectedCellId = -1;
	
	 for (var i=0; i < width*height; i++) {
		cellStyles[i] = "";
	}
	
	fillNextCells();
	gameStarted = true;
	paint();
 }
 
 function getRandomCellId() {
	return Math.floor(width*height*Math.random());
 }
 
 function getRandomStyle() {
	return "style" + Math.floor(14*Math.random());
 }
 
 function fillNextCells() {
	 if (freeCells < 3) {
		gameStarted = false;
		if (confirm("Game over...  Play againg?")){
			startGame();
		}
	}
	for (var i=0; i<3; i++) {
		var cellId = getRandomCellId();
		while (cellStyles[cellId] != "") {
			var cellId = getRandomCellId();
		}
		// console.log("next cell: " + cellId);
		fillCell(cellId, getRandomStyle());
	}
 }
 
 function fillCell(cellId, cellStyle) {
	cellStyles[cellId] = cellStyle;
	getCell(cellId).addClass( cellStyle );
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
	else if (hasSelectedCell()) {
		// restore previously selected cell
		getSelectedCell().addClass(cellStyles[selectedCellId]);
	}
	
	if (cellStyles[cell.id] == "") {
		// User clicked empty cell - let's find path to it
		var path = findPath(selectedCellId, cell.id);
		if (path == null) {
			// path not found
			console.log("path not found");
		}
		else {
			console.log("path is found: " + path);
			animation = true;
			animationPath = path;
			animationStep = 0;
			animatePath();
		}
	}
	else {
		// User clicked filled cell - let's select it.
		selectedCellId = cell.id;
	}
}

function animatePath() {
	// console.log("animate (" + animationPath + "; step=" + animationStep + ")");
	var cell = getCell(animationPath[animationStep]);
	cell.addClass(cellStyles[selectedCellId]);
	if (animationStep > 0) {
		var previousCell = getCell(animationPath[animationStep-1]);
		previousCell.removeClass(cellStyles[selectedCellId]);
	}
	if (animationStep < animationPath.length-1) {
		animationStep++;
		setTimeout("animatePath()", 100);
	}
	else {
		//console.log("animate: fillCell(" + animationPath[animationStep] + " with style" + cellStyles[selectedCellId] + ")");
		fillCell(animationPath[animationStep], cellStyles[selectedCellId]);
		selectedCellId = -1;
		animationPath = null;
		animationStep = -1;
		animation = false;
		fillNextCells();
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
	var steps = new Array();
	for (var i=0; i<width*height; i++) {
		steps[i] = 0;
		getCell(i).append("");
	}
	steps[fromCellId] = fromCellId;
	var currentWaveCells = Array();
	currentWaveCells.push(fromCellId);

	search:
	while (true) {
		var nextWaveCells = new Array();
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
	var path = new Array();
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
	return (selectedCellId > -1)
}

function paint() {
	if (!gameStarted) {
		return;
	}
	
	if (!animation && hasSelectedCell()) {
		var cell = getSelectedCell();
		if (cell.hasClass(cellStyles[selectedCellId])) {
			cell.removeClass(cellStyles[selectedCellId]);	// TODO Draw a little bit shifted image to create movement affect
		}
		else {
			cell.addClass(cellStyles[selectedCellId]);
		}
	}
	
	setTimeout("paint()", 300);
}
