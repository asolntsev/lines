describe("Lines", function() {
	var field = createField();
	startGame();

	beforeEach(function() {
//		resetQueue();
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
			var filledCell = '13';
			var emptyCell = '79';
			fillCell(filledCell, "style4");
			getCell(filledCell).click();
			expect(selectedCellId).toEqual(filledCell);
			getCell(emptyCell).click();
			
			expect(animation).toBe(true);
			expectEnqueued(blinkSelectedCell, animatePath);
		});		
	});

	describe("Movement", function() {
		it("user clicks one of balls - it starts blinking", function() {
			startGame();
			resetQueue();
			fillCell('22', "style4");
			expect(animation).toBe(false);

			getCell('22').click();
			expect(selectedCellId).toEqual('22');
			expectEnqueued(blinkSelectedCell);
		});
		
		it("clicking the same cell does not take effect", function() {
			var cellId = selectedCellId;
			getSelectedCell().click();
			getSelectedCell().click();
			getSelectedCell().click();
			expect(selectedCellId).toEqual(cellId);
		});
		
		it("clicking another ball unselects the previous one", function() {
			startGame();
			fillCell(12, "style1");
			fillCell(76, "style2");
			fillCell(99, "style3");
			
			expect(filledCells().length).toEqual(3);
			
			getCell(12).click();
			expect(selectedCellId).toEqual('12');
			expect(animation).toBe(false);
			
			getCell(76).click();
			expect(selectedCellId).toEqual('76');
			
			expect(animation).toBe(false);
			expect(getCell(12).hasClass("style1")).toBe(true);
			expect(getCell(76).hasClass("style2")).toBe(true);
		});
		
		it("if user clicks empty cell, nothing happens", function() {
			startGame();
			resetQueue();
			getCell(34).click();
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
