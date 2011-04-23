describe("Figure", function() {
	beforeEach(function() {
		startGame();
	});

	it("is a line of 5+ balls on horisontal", function() {
		fillCells(1,2,3,4,5,7,8,9); // horisontal
		fillCells(15, 25, 35); // 4 balls vertically
		fillCells(16, 27, 38); // 3 balls on diagonal
		console.log(filledCells());
		expect(sortr(detectFigures(5))).toEqual([[1,2,3,4,5]]);
	});
	it("or line of 5+ balls on vertical", function() {
		fillCells(14,24,34,44,54,64,74);
		expect(sortr(detectFigures(54))).toEqual([[14,24,34,44,54,64,74]]);
	});
	it("or line of 5+ balls on diagonal", function() {
		fillCells(0, 22,33,44,55,66, 88);
		expect(sortr(detectFigures(44))).toEqual([[22,33,44,55,66]]);
	});
	it("can be composed of 2 lines", function() {
		fillCells(1,2,3,4,5,7,8,9); // horisontal
		fillCells(15, 25, 35, 45, 65, 75); // 5 balls vertically
		expect(sortr(detectFigures(5))).toEqual([[1,2,3,4,5], [5,15,25,35,45]]);
	});
	it("or even 3 lines", function() {
		fillCells(1,2,3,4,5,7,8,9); // horisontal
		fillCells(15, 25, 35, 45, 65, 75); // 5 balls vertically
		fillCells(16, 27, 38, 49); // 5 balls on diagonal
		expect(sortr(detectFigures(5))).toEqual([[1,2,3,4,5], [5,15,25,35,45], [5, 16, 27, 38, 49]]);
	});
});