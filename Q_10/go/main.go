package main

import (
	"cachetest/scenarios"
	"fmt"
)

func main() {
	fmt.Println("==================================================")
	fmt.Println("RUNNING DEEP NARROW SCENARIO")
	fmt.Println("==================================================")
	scenarios.RunDeepNarrow()
	fmt.Println("\n==================================================")
	fmt.Println("RUNNING WIDE TREE SCENARIO")
	fmt.Println("==================================================")
	scenarios.RunWideTree()
}
