function expectEnqueued(func) {
	expect(queue[0]).toEqual(func);
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

function findFilledCellId() {
	return $($.find("td.filled:first")).attr('id');
}

function findEmptyCellId() {
	return $($.find("td:not(.filled):first")).attr('id');
}
