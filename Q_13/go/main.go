package main


func main() {
	printMainHeader()

	scenarios := buildScenarios()

	var summaries []ScenarioSummary

	for idx, scenario := range scenarios {
		iters := LightIters
		if scenario.Heavy {
			iters = HeavyIters
		}

		printScenarioHeader(idx+1, len(scenarios), scenario, iters)

		var rows []AlgoRow
		for _, alg := range Algorithms {
			results := executeWithIterations(alg, scenario, iters)
			agg := aggregate(results)
			rows = append(rows, AlgoRow{Name: alg.Name, Aggregate: agg})
		}
		printAlgoTable(rows)

		summaries = append(summaries, ScenarioSummary{
			Scenario: scenario,
			Rows:     rows,
		})
	}

	printSummary(summaries)
	fmt.Println("\nDone.\n")
}
