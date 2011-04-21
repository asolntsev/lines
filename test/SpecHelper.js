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

beforeEach(function() {
	resetQueue();
});