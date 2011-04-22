describe("Lines", function() {
	var field = createField();
	startGame();

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
			fillCell(14, "style4");
			getCell(14).click();
			expect(selectedCellId).toEqual(14);
			getCell(79).click();
			
			expect(animation).toBe(true);
			expectEnqueued(blinkSelectedCell, animatePath);
		});		
	});

	describe("Movement", function() {
		it("user clicks one of balls - it starts blinking", function() {
			startGame();
			resetQueue();
			fillCell(22, "style4");
			expect(animation).toBe(false);

			getCell(22).click();
			expect(selectedCellId).toEqual(22);
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
			expect(selectedCellId).toEqual(12);
			expect(animation).toBe(false);
			
			getCell(76).click();
			expect(selectedCellId).toEqual(76);
			
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
		
		it("ball movement in animated", function(){
			fillCell(13, "style66");
			getCell(13).click();
			getCell(17).click();
			expectEnqueued(blinkSelectedCell, animatePath);
			
			resetQueue();
			animatePath(true);
			expectEnqueued(fillNextCells);
			expect(filledCells().length).toEqual(1);
			expect(freeCells).toEqual(99);
			expect(animation).toBe(false);
			expect(animationPath).toBe(null);
			
			for (var i=0; i<100; i++) {
				var cell = getCell(i);
				expect(cell.hasClass('filled')).toBe(i == 17);
				expect(cell.hasClass('style66')).toBe(i == 17);
				if (i == 17)
					expect(cellStyles[i]).toEqual("style66");
				else
					expect(cellStyles[i]).toEqual("");
			}
		});

	});

	describe("when less than 3 free cells left", function() {
		it("the game is over", function() {
			freeCells = 2;
			fillNextCells();
			expectEnqueued(gameOver);
		});
	});

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
		describe("when some cells contain filled", function() {
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
