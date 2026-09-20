package main

import (
	"fmt"
	"math/rand"
	"time"
)

func main() {
	rand.Seed(time.Now().UnixNano())

	const shortMin = 1 * time.Millisecond
	const shortMax = 10 * time.Millisecond

	scenarios := []Scenario{
		// Worker scaling
		{"Workers_1", 1, 2000, 0.70, 0.02, shortMin, shortMax, 150 * time.Microsecond, 0, 0, 60 * time.Second},
		{"Workers_2", 2, 2000, 0.70, 0.02, shortMin, shortMax, 150 * time.Microsecond, 0, 0, 45 * time.Second},
		{"Workers_5", 5, 2000, 0.70, 0.02, shortMin, shortMax, 150 * time.Microsecond, 0, 0, 30 * time.Second},
		{"Workers_10", 10, 2000, 0.70, 0.02, shortMin, shortMax, 150 * time.Microsecond, 0, 0, 25 * time.Second},
		{"Workers_20", 20, 2000, 0.70, 0.02, shortMin, shortMax, 150 * time.Microsecond, 0, 0, 25 * time.Second},

		// Task scaling
		{"Tasks_500", 5, 500, 0.70, 0.02, shortMin, shortMax, 150 * time.Microsecond, 0, 0, 20 * time.Second},
		{"Tasks_5000", 5, 5000, 0.70, 0.02, shortMin, shortMax, 150 * time.Microsecond, 0, 0, 40 * time.Second},

		// Priority pressure
		{"High_50pct", 5, 2000, 0.50, 0.02, shortMin, shortMax, 150 * time.Microsecond, 0, 0, 30 * time.Second},
		{"High_90pct", 5, 2000, 0.90, 0.02, shortMin, shortMax, 150 * time.Microsecond, 0, 0, 30 * time.Second},
		{"High_99pct", 5, 2000, 0.99, 0.02, shortMin, shortMax, 150 * time.Microsecond, 0, 0, 30 * time.Second},

		// Failure pressure
		{"Fail_10pct", 5, 2000, 0.70, 0.10, shortMin, shortMax, 150 * time.Microsecond, 0, 0, 40 * time.Second},
		{"Fail_30pct", 5, 2000, 0.70, 0.30, shortMin, shortMax, 150 * time.Microsecond, 0, 0, 60 * time.Second},

		// Low dominance
		{"Low_90pct", 5, 2000, 0.10, 0.02, shortMin, shortMax, 150 * time.Microsecond, 0, 0, 30 * time.Second},
		{"Low_99pct", 5, 2000, 0.01, 0.02, shortMin, shortMax, 150 * time.Microsecond, 0, 0, 30 * time.Second},

		// Long mixed durations
		{"Long_Mixed", 5, 500, 0.70, 0.02, 1 * time.Millisecond, 200 * time.Millisecond, 500 * time.Microsecond, 0, 0, 60 * time.Second},

		// Bursts
		{"Burst_Small", 5, 2000, 0.70, 0.02, shortMin, shortMax, 5 * time.Millisecond, 100, 500 * time.Millisecond, 40 * time.Second},
		{"Burst_Large", 5, 2000, 0.70, 0.02, shortMin, shortMax, 10 * time.Millisecond, 500, 1 * time.Second, 60 * time.Second},
	}

	fmt.Printf("Running %d scenarios × %d runs each = %d total executions\n",
		len(scenarios), RunsPerScenario, len(scenarios)*RunsPerScenario)
	fmt.Println("Arrival mode: Poisson (exponential inter-arrival times)")
	fmt.Println("Wait time = time from enqueue to serve, measured per priority")

	results := make([]Result, 0, len(scenarios))
	for i, sc := range scenarios {
		fmt.Printf("\n[%d/%d]", i+1, len(scenarios))
		res := runScenarioRepeated(sc, RunsPerScenario)
		results = append(results, res)
		time.Sleep(200 * time.Millisecond)
	}

	printSummary(results)
}
