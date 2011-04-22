describe("path search algorithm", function() {
	beforeEach(function() {
		startGame();
	});
	describe("when field is empty", function() {
		it("1-step path", function() {
			fillCell(5, "style1");
			var path = findPath(5, 6);
			expect(path).toEqual([5, 6]);
		});
		it("2-step path", function() {
			fillCell(5, "style1");
			var path = findPath(5, 7);
			expect(path).toEqual([5, 6, 7]);
		});
		it("vertical path", function() {
			fillCell(99, "style1");
			var path = findPath(90, 0);
			expect(path).toEqual([90, 80, 70, 60, 50, 40, 30, 20, 10, 0]);
		});
		it("horisontal path", function() {
			fillCell(20, "style1");
			var path = findPath(20, 29);
			expect(path).toEqual([20, 21, 22, 23, 24, 25, 26, 27, 28, 29]);
		});

		it("From top-left to bottom-right", function() {
			fillCell(0, "style1");
			var path = findPath(0, 99);
			expect(path).toEqual([0,1,2,3,4,5,6,7,8,9,19, 29, 39, 49, 59, 69, 79, 89, 99]);
		});
		it("From bottom-right to top-left", function() {
			fillCell(99, "style1");
			var path = findPath(99, 0);
			expect(path).toEqual([99, 98, 97, 96, 95, 94, 93, 92, 91, 90, 80, 70, 60, 50, 40, 30, 20, 10, 0]);
		});
	});
	describe("when some cells contain balls", function() {
		it("finds a path around the ball", function() {
			fillCell(5, "style1");
			fillCell(6, "style1");
			var path = findPath(5, 7);
			expect(path).toEqual([5, 15, 16, 17, 7]);
		});
		it("finds the shortest path around the ball", function() {
			fillCell(91, "style1");
			fillCell(92, "style1");
			fillCell(93, "style1");
			var path = findPath(91, 94);
			expect(path).toEqual([91, 81, 82, 83, 84, 94]);
		});
		it("vertical path around the ball", function() {
			fillCell(19, "style1");
			fillCell(29, "style1");
			var path = findPath(19, 49);
			expect(path).toEqual([19, 18, 28, 38, 39, 49]);
		});
	});
	describe("when there is no possible path", function() {
		it("returns null", function() {
			fillCell(0, "style1");
			fillCell(1, "style1");
			fillCell(10, "style1");
			var path = findPath(0, 11);
			expect(path).toBe(null);
		});
	});
});