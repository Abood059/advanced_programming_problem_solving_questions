package core

var StackBuf = make([]int32, NWide) // allocate max needed
var QueueBuf = make([]int32, NWide)

var PeakStack int
var PeakQueue int
var PeakQueueLogical int

var DfsChildren []int32
var Counter int
var H int

func GetLeftDeep(i int32) int32 {
	if i < ChainLen-1 {
		return i + 1
	}
	return -1
}

func GetRightDeep(i int32) int32 {
	if i < ChainLen {
		return int32(ChainLen) + i
	}
	return -1
}

func BuildWide(depth int) int {
	myIndex := Counter
	Counter++
	if depth < H {
		DfsChildren[2*myIndex] = int32(BuildWide(depth + 1))
		DfsChildren[2*myIndex+1] = int32(BuildWide(depth + 1))
	}
	return myIndex
}
