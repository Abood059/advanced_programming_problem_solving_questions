package scenarios

import (
	"cachetest/core"
	"fmt"
	"time"
)

func RunWideTree() {
	fmt.Printf("Nodes: %d\n", core.NWide)
	fmt.Printf("Tree type: complete binary tree (WIDE)\n")
	fmt.Printf("Node size: 4 bytes (int32)\n\n")

	fmt.Println("=== Layout 1: BFS-order storage (Heap Layout) ===")
	fmt.Println()

	for i := 0; i < core.WARMUP; i++ {
		core.DfsHeapWide()
		core.BfsHeapWide()
	}

	var d1, b1 time.Duration
	for i := 0; i < core.RUNS; i++ {
		t := time.Now()
		core.DfsHeapWide()
		d1 += time.Since(t)

		t = time.Now()
		core.BfsHeapWide()
		b1 += time.Since(t)
	}

	dfsAvg1 := float64(d1.Microseconds()) / float64(core.RUNS) / 1000.0
	bfsAvg1 := float64(b1.Microseconds()) / float64(core.RUNS) / 1000.0

	fmt.Printf("DFS: %.3f ms\n", dfsAvg1)
	fmt.Printf("BFS: %.3f ms\n", bfsAvg1)
	fmt.Printf("DFS/BFS ratio: %.3f\n", dfsAvg1/bfsAvg1)

	winner1 := "DFS"
	if bfsAvg1 < dfsAvg1 {
		winner1 = "BFS"
	}
	diff1 := core.Abs(dfsAvg1-bfsAvg1) / core.Max(dfsAvg1, bfsAvg1) * 100
	fmt.Printf("-> %s is faster by %.1f%%\n\n", winner1, diff1)

	core.DfsHeapWide()
	dStack1 := core.PeakStack
	core.BfsHeapWide()
	bQueue1 := core.PeakQueue

	fmt.Println("Memory usage (Layout 1):")
	fmt.Printf("  DFS stack:\n")
	fmt.Printf("    Physical buffer : %s (%d entries)\n", core.FormatBytes(int64(core.NWide)*4), core.NWide)
	fmt.Printf("    Logical peak    : %s (%d entries)\n", core.FormatBytes(int64(dStack1)*4), dStack1)
	fmt.Printf("  BFS queue:\n")
	fmt.Printf("    Physical buffer : %s (%d entries)\n", core.FormatBytes(int64(core.NWide)*4), core.NWide)
	fmt.Printf("    Logical peak    : %s (%d entries)\n", core.FormatBytes(int64(bQueue1)*4), bQueue1)
	fmt.Println()

	fmt.Println("=== Layout 2: DFS Preorder storage ===")
	fmt.Println()

	core.H = int(core.Log2(float64(core.NWide+1))) - 1
	core.DfsChildren = make([]int32, core.NWide*2)
	for i := range core.DfsChildren {
		core.DfsChildren[i] = -1
	}
	core.Counter = 0
	core.BuildWide(0)

	for i := 0; i < core.WARMUP; i++ {
		core.DfsPreorderWide()
		core.BfsPreorderWide()
	}

	var d2, b2 time.Duration
	for i := 0; i < core.RUNS; i++ {
		t := time.Now()
		core.DfsPreorderWide()
		d2 += time.Since(t)

		t = time.Now()
		core.BfsPreorderWide()
		b2 += time.Since(t)
	}

	dfsAvg2 := float64(d2.Microseconds()) / float64(core.RUNS) / 1000.0
	bfsAvg2 := float64(b2.Microseconds()) / float64(core.RUNS) / 1000.0

	fmt.Printf("DFS: %.3f ms\n", dfsAvg2)
	fmt.Printf("BFS: %.3f ms\n", bfsAvg2)
	fmt.Printf("DFS/BFS ratio: %.3f\n", dfsAvg2/bfsAvg2)

	winner2 := "DFS"
	if bfsAvg2 < dfsAvg2 {
		winner2 = "BFS"
	}
	diff2 := core.Abs(dfsAvg2-bfsAvg2) / core.Max(dfsAvg2, bfsAvg2) * 100
	fmt.Printf("-> %s is faster by %.1f%%\n\n", winner2, diff2)

	core.DfsPreorderWide()
	dStack2 := core.PeakStack
	core.BfsPreorderWide()
	bQueue2 := core.PeakQueue

	fmt.Println("Memory usage (Layout 2):")
	fmt.Printf("  DFS stack:\n")
	fmt.Printf("    Physical buffer : %s (%d entries)\n", core.FormatBytes(int64(core.NWide)*4), core.NWide)
	fmt.Printf("    Logical peak    : %s (%d entries)\n", core.FormatBytes(int64(dStack2)*4), dStack2)
	fmt.Printf("  BFS queue:\n")
	fmt.Printf("    Physical buffer : %s (%d entries)\n", core.FormatBytes(int64(core.NWide)*4), core.NWide)
	fmt.Printf("    Logical peak    : %s (%d entries)\n", core.FormatBytes(int64(bQueue2)*4), bQueue2)
	fmt.Println()

	fmt.Println("=== Summary ===")
	fmt.Printf("Layout 1 (BFS order): DFS/BFS = %.3f\n", dfsAvg1/bfsAvg1)
	fmt.Printf("Layout 2 (DFS order): DFS/BFS = %.3f\n", dfsAvg2/bfsAvg2)
	fmt.Println()
	fmt.Println("Key insight:")
	fmt.Println("- DFS logical stack stays small (~log2 N) in a wide tree.")
	fmt.Println("- BFS logical queue grows to ~N/2 at the widest level.")
	fmt.Println("- If the same algorithm wins in both layouts, the dominant")
	fmt.Println("  factor is working-set size, not storage order.")
}
