package core

func DfsDeep() int {
	top := 0
	maxTop := 0
	StackBuf[top] = 0
	top++
	count := 0
	for top > 0 {
		if top > maxTop {
			maxTop = top
		}
		top--
		node := StackBuf[top]
		count++
		left := GetLeftDeep(node)
		right := GetRightDeep(node)
		if right != -1 {
			StackBuf[top] = right
			top++
		}
		if left != -1 {
			StackBuf[top] = left
			top++
		}
	}
	PeakStack = maxTop
	return count
}

func DfsHeapWide() int {
	top := 0
	maxTop := 0
	StackBuf[top] = 0
	top++
	count := 0
	for top > 0 {
		if top > maxTop {
			maxTop = top
		}
		top--
		node := StackBuf[top]
		count++
		left := 2*node + 1
		right := 2*node + 2
		if right < NWide {
			StackBuf[top] = right
			top++
		}
		if left < NWide {
			StackBuf[top] = left
			top++
		}
	}
	PeakStack = maxTop
	return count
}

func DfsPreorderWide() int {
	top := 0
	maxTop := 0
	StackBuf[top] = 0
	top++
	count := 0
	for top > 0 {
		if top > maxTop {
			maxTop = top
		}
		top--
		node := StackBuf[top]
		count++
		left := DfsChildren[2*node]
		right := DfsChildren[2*node+1]
		if right != -1 {
			StackBuf[top] = right
			top++
		}
		if left != -1 {
			StackBuf[top] = left
			top++
		}
	}
	PeakStack = maxTop
	return count
}
