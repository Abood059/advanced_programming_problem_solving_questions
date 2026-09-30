package main
import (
	"fmt"
	"runtime"
	"strings"
)
type AlgoRow struct {
	Name string
	Aggregate
}

type ScenarioSummary struct {
	Scenario Scenario
	Rows     []AlgoRow
}

func repeat(s string, n int) string { return strings.Repeat(s, n) }

func printMainHeader() {
	var ms runtime.MemStats
	runtime.ReadMemStats(&ms)
	heapSysMB := float64(ms.HeapSys) / 1024 / 1024

	fmt.Println()
	fmt.Println(repeat("═", 160))
	fmt.Println("  Rate Limiter Benchmark — Heavy Load Edition (Go)")
	fmt.Println(repeat("═", 160))
	fmt.Printf("  Go: %s   |   Platform: %s/%s   |   CPUs: %d   |   HeapSys: %.0f MB\n",
		runtime.Version(), runtime.GOOS, runtime.GOARCH, runtime.NumCPU(), heapSysMB)
	fmt.Printf("  Iterations per scenario:  light=%d   heavy=%d   |   Latency samples/run: %d\n",
		LightIters, HeavyIters, SampleLimit)
	fmt.Println(repeat("═", 160))
}

func printScenarioHeader(idx, total int, scenario Scenario, iters int) {
	fmt.Println()
	fmt.Println(repeat("─", 160))
	fmt.Printf("  [%2d/%d]  %-18s %12s requests  |  %d iterations\n",
		idx, total, scenario.Name, withCommas(scenario.Total), iters)
	fmt.Println(repeat("─", 160))
}

func printAlgoTable(rows []AlgoRow) {
	wAlg := 24
	wAllowed := 14
	wDenied := 14
	wTotal := 12
	wStd := 9
	wTput := 14
	wMean := 10
	wP50 := 9
	wP99 := 9
	wHeap := 12
	wAlloc := 13
	wEntries := 12

	header := padL("Algorithm", wAlg) + " | " +
		padR("Allowed", wAllowed) + " | " +
		padR("Denied", wDenied) + " | " +
		padR("Total ms", wTotal) + " | " +
		padR("±std", wStd) + " | " +
		padR("Req/s", wTput) + " | " +
		padR("Mean µs", wMean) + " | " +
		padR("P50 µs", wP50) + " | " +
		padR("P99 µs", wP99) + " | " +
		padR("Heap KB", wHeap) + " | " +
		padR("Alloc KB", wAlloc) + " | " +
		padR("Entries", wEntries)

	fmt.Println(header)
	fmt.Println(repeat("─", len(header)))

	for _, r := range rows {
		line := padL(r.Name, wAlg) + " | " +
			padR(withCommas(r.Allowed), wAllowed) + " | " +
			padR(withCommas(r.Denied), wDenied) + " | " +
			padR(fmtF(r.TimeMeanMs, 3), wTotal) + " | " +
			padR(fmtF(r.TimeStdMs, 3), wStd) + " | " +
			padR(withCommas(int(r.Throughput)), wTput) + " | " +
			padR(fmtF(r.LatMeanUs, 3), wMean) + " | " +
			padR(fmtF(r.P50Us, 3), wP50) + " | " +
			padR(fmtF(r.P99Us, 3), wP99) + " | " +
			padR(fmtF(r.HeapDeltaKB, 1), wHeap) + " | " +
			padR(fmtF(r.AllocDeltaKB, 1), wAlloc) + " | " +
			padR(withCommas(r.Entries), wEntries)
		fmt.Println(line)
	}
}

func printSummary(scenarioRows []ScenarioSummary) {
	fmt.Println()
	fmt.Println(repeat("═", 160))
	fmt.Println("  SUMMARY — allowed / total per algorithm per scenario")
	fmt.Println(repeat("═", 160))

	wAlg := 13
	wScn := 18

	header := padL("Scenario", wScn) + " | " +
		padR("Fixed", wAlg) + " | " +
		padR("SLog", wAlg) + " | " +
		padR("SCount", wAlg) + " | " +
		padR("Token", wAlg) + " | " +
		padR("Leaky", wAlg) + " | " +
		padR("GCRA", wAlg)
	fmt.Println(header)
	fmt.Println(repeat("─", len(header)))

	for _, sr := range scenarioRows {
		line := padL(sr.Scenario.Name, wScn) + " | "
		for _, r := range sr.Rows {
			total := r.Allowed + r.Denied
			mark := ""
			if !r.Consistent {
				mark = "(!)"
			}
			cell := withCommas(r.Allowed) + "/" + withCommas(total) + mark
			line += padR(cell, wAlg) + " | "
		}
		fmt.Println(line)
	}

	fmt.Println()
	fmt.Println(repeat("─", 160))
	fmt.Println("  Notes:")
	fmt.Println("    - '(!)' marks a scenario where iterations disagreed on the allowed count.")
	fmt.Println("    - Boundary: Fixed Window allows 200/200 (known window-edge bug).")
	fmt.Println("    - Sustained-style: Token/Leaky/GCRA allow ~199/200 due to burst allowance.")
	fmt.Println(repeat("─", 160))
}

