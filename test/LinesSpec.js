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
		it("when balls compose a figure, they are destroyed, and user score increases", function() {
			startGame();
			resetQueue();
			fillCells(1,2,3,4,5);
			// TODO
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
});