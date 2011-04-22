function expectEnqueued(func1, func2, func3) {
	if (func1) {
		expect(queue[0]).toEqual(func1);
		if (func2) {
			expect(queue[1]).toEqual(func2);
			if (func3) {
				expect(queue[2]).toEqual(func3);
			}
		}
	}
}

function expectNothingEnqueued() {
	expect(queue.length).toEqual(0);
}

function expectNothingSelected() {
	expect(selectedCellId).toEqual(-1);
}

function resetQueue() {
	queue = [];
}

function allCells() {
	return $.find("td.cell");
}

function filledCells() {
	return $.find("td.filled");
}

function fillCells() {
	for( var i = 0; i < arguments.length; i++ ) {
		fillCell(arguments[i], "style22");
	}
}

var sortNumber = function (a,b) {
	return a - b;
}

function sortr(multiArray) {
	for (var i=0; i<multiArray.length; i++) {
		multiArray[i] = multiArray[i].sort(sortNumber);
	}
	return multiArray;
}

beforeEach(function() {
	resetQueue();
});