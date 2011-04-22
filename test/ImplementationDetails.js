describe("Implementation details", function() {
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