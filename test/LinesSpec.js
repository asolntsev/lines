describe("Lines", function() {
	var field = createField();
	
	describe("when page is opened", function() {
		//console.log(field);
		//console.log(field.find("td.cell").length);
		
		it("creates filed 10x10 by default", function() {
			expect(width).toEqual(10);
			expect(height).toEqual(10);
			
			// console.log($.find("td.cell"));
			expect($.find("td.cell").length).toEqual(10*10);
		});
	  
	  it("no cell is selected", function() {
		expect(selectedCellId).toEqual(-1);
	  });
	});
	
	describe("random generation algorithm", function() {
		console.log(field);
		it("is good enough", function() {
			var numberOfTests = 5000;
			var expectedErrorPercentage = 5;
			
			var density = [];
			for (var i=0; i<numberOfTests*width*height; i++) {
				var rand = getRandomCellId();
				//console.log(rand);
				if (!density[rand]) {
					density[rand] = 1;
				}
				else {
					density[rand] = density[rand] + 1;
				}
			}
			
			// console.log(density);
			
			for (var i=0; i<width*height; i++) {
				expect(density[i]).toBeGreaterThan(numberOfTests * (1-expectedErrorPercentage/100)) 
				expect(density[i]).toBeLessThan(numberOfTests * (1+expectedErrorPercentage/100)) 
			}
		});
	});
});