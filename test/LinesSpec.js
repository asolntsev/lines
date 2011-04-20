describe("Lines", function() {
	var field = createField();
	startGame();

	beforeEach(function() {
		queue = [];
	});
	
	describe("when page is opened", function() {
		it("creates filed 10x10 by default", function() {
			expect(width).toEqual(10);
			expect(height).toEqual(10);
			expect(allCells().length).toEqual(10*10);
		});

		it("all cells are free", function() {
			expect(freeCells).toEqual(10*10);
			expect(filledCells().length).toEqual(0);
		});
		
		it("no cell is selected", function() {
			expectNothingEnqueued();
			expectNothingSelected();
		});
		
		it("the game is automatically started", function() {
			expect(gameStarted).toBe(true);
		});
	});
	
	describe("during every iteration", function() {
		it("3 balls are added into random free cells", function() {
			fillNextCells();
			expect(freeCells).toEqual(100-3);
			expect(filledCells().length).toEqual(3);
		});
		it("user can move any ball to another free cell", function() {
			var filledCellId = findFilledCellId();
			var emptyCellId = findEmptyCellId();
			getCell(filledCellId).click();
			expect(selectedCellId).toEqual(filledCellId);
			getCell(emptyCellId).click();
			
			expect(animation).toBe(true);
		});		
	});

	describe("Movement", function() {
		it("user clicks one of balls", function() {
			var cellId = findFilledCellId();
			getCell(cellId).click();
			expect(selectedCellId).toEqual(cellId);
		});
		
		it("the selected ball starts blinking", function() {
			// TODO
		});
		
		it("clicking the same cell does not take effect", function() {
			var cellId = selectedCellId;
			getSelectedCell().click();
			getSelectedCell().click();
			getSelectedCell().click();
			expect(selectedCellId).toEqual(cellId);
		});
		
		it("clicking another ball unselects the previous one", function() {
			var cellId1 = $(filledCells()[0]).attr('id');
			var cellId2 = $(filledCells()[1]).attr('id');
			getCell(cellId1).click();
			expect(selectedCellId).toEqual(cellId1);
			getCell(cellId2).click();
			expect(selectedCellId).toEqual(cellId2);
		});
		
		it("if user clicks empty cell, nothing happens", function() {
			startGame();
			resetQueue();
			var cellId = findEmptyCellId();
			expectNothingEnqueued();
			expectNothingSelected();
		});

	});

	describe("when less than 3 free cells left", function() {
		it("the game is over", function() {
			freeCells = 2;
			fillNextCells();
			expectEnqueued(gameOver);
		});
	});
	
	describe("logic processing is event-driven", function() {
		it("any function can add actions to the queue", function() {
			var counter = 0;
			var inc = function() {counter++; if (counter < 10) enqueue(inc); };
			enqueue(inc);
			runEventProcessingThread();
			expect(counter).toEqual(10);
			stopEventProcessingThread();
		});
	});
	
	describe("random generation algorithm", function() {
		it("is good enough", function() {
			var numberOfTests = 3000;
			var expectedErrorPercentage = 7;

			var density = [];
			for (var i=0; i<numberOfTests*width*height; i++) {
				var rand = getRandomCellId();
				if (!density[rand]) {
					density[rand] = 1;
				}
				else {
					density[rand] = density[rand] + 1;
				}
			}

			for (var i=0; i<width*height; i++) {
				expect(density[i]).toBeGreaterThan(numberOfTests * (1-expectedErrorPercentage/100)) 
				expect(density[i]).toBeLessThan(numberOfTests * (1+expectedErrorPercentage/100)) 
			}
		});
	});
});
