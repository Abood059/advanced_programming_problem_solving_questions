package scenarios

import (
	"cachetest/core"
	"fmt"
	"time"
)

func RunDeepNarrow() {
	fmt.Printf("Total nodes: %d\n", core.NTotal)
	fmt.Printf("Chain length: %d\n", core.ChainLen)
	fmt.Printf("Tree type: caterpillar (DEEP and NARROW)\n")
	fmt.Printf("BFS queue capacity: %d entries (circular)\n", core.QueueCap)
	fmt.Printf("Node size: 4 bytes (int32)\n\n")

	// Warmup
	for i := 0; i < core.WARMUP; i++ {
		core.DfsDeep()
		core.BfsCircularDeep()
	}

	// Sanity check
	dfsCount := core.DfsDeep()
	bfsCount := core.BfsCircularDeep()

	fmt.Printf("DFS visited: %d\n", dfsCount)
	fmt.Printf("BFS visited: %d\n", bfsCount)
	fmt.Printf("Expected   : %d\n", core.NTotal)
	if dfsCount != core.NTotal || bfsCount != core.NTotal {
		fmt.Println("WARNING: traversal did not visit all nodes!")
	}
	fmt.Println()

	var dt, bt time.Duration
	for i := 0; i < core.RUNS; i++ {
		t := time.Now()
		core.DfsDeep()
		dt += time.Since(t)

		t = time.Now()
		core.BfsCircularDeep()
		bt += time.Since(t)
	}

	dfsAvg := float64(dt.Microseconds()) / float64(core.RUNS) / 1000.0
	bfsAvg := float64(bt.Microseconds()) / float64(core.RUNS) / 1000.0

	fmt.Printf("DFS: %.3f ms\n", dfsAvg)
	fmt.Printf("BFS (circular): %.3f ms\n", bfsAvg)
	fmt.Printf("DFS/BFS ratio: %.3f\n", dfsAvg/bfsAvg)

	winner := "DFS"
	if bfsAvg < dfsAvg {
		winner = "BFS"
	}
	diff := core.Abs(dfsAvg-bfsAvg) / core.Max(dfsAvg, bfsAvg) * 100
	fmt.Printf("-> %s is faster by %.1f%%\n\n", winner, diff)

	core.DfsDeep()
	dStack := core.PeakStack
	core.BfsCircularDeep()
	bQueue := core.PeakQueueLogical

	fmt.Println("Memory usage:")
	fmt.Printf("  DFS stack:\n")
	fmt.Printf("    Physical buffer : %s (%d entries)\n", core.FormatBytes(int64(core.ChainLen+1)*4), core.ChainLen+1)
	fmt.Printf("    Logical peak    : %s (%d entries)\n", core.FormatBytes(int64(dStack)*4), dStack)
	fmt.Printf("  BFS circular queue:\n")
	fmt.Printf("    Physical buffer : %s (%d entries)\n", core.FormatBytes(int64(core.QueueCap)*4), core.QueueCap)
	fmt.Printf("    Logical peak    : %s (%d entries)\n", core.FormatBytes(int64(bQueue)*4), bQueue)
	fmt.Println()

	fmt.Println("=== Summary ===")
	fmt.Println("On a deep narrow tree:")
	fmt.Println("- DFS logical stack grows to O(L) = ~N/2 entries.")
	fmt.Println("- BFS logical queue stays tiny (~3 entries).")
	fmt.Println("- Compare with the wide tree test to see which factor dominates.")
}
