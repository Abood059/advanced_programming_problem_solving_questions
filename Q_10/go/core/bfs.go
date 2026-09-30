package core

func BfsCircularDeep() int {
	head := 0
	tail := 0
	maxSize := 0
	QueueBuf[tail] = 0
	tail = (tail + 1) & QueueMask
	count := 0
	for head != tail {
		size := (tail - head) & QueueMask
		if size > maxSize {
			maxSize = size
		}
		node := QueueBuf[head]
		head = (head + 1) & QueueMask
		count++
		left := GetLeftDeep(node)
		right := GetRightDeep(node)
		if left != -1 {
			QueueBuf[tail] = left
			tail = (tail + 1) & QueueMask
		}
		if right != -1 {
			QueueBuf[tail] = right
			tail = (tail + 1) & QueueMask
		}
	}
	PeakQueueLogical = maxSize
	return count
}

func BfsHeapWide() int {
	head := 0
	tail := 0
	maxSize := 0
	QueueBuf[tail] = 0
	tail++
	count := 0
	for head < tail {
		size := tail - head
		if size > maxSize {
			maxSize = size
		}
		node := QueueBuf[head]
		head++
		count++
		left := 2*node + 1
		right := 2*node + 2
		if left < NWide {
			QueueBuf[tail] = left
			tail++
		}
		if right < NWide {
			QueueBuf[tail] = right
			tail++
		}
	}
	PeakQueue = maxSize
	return count
}

func BfsPreorderWide() int {
	head := 0
	tail := 0
	maxSize := 0
	QueueBuf[tail] = 0
	tail++
	count := 0
	for head < tail {
		size := tail - head
		if size > maxSize {
			maxSize = size
		}
		node := QueueBuf[head]
		head++
		count++
		left := DfsChildren[2*node]
		right := DfsChildren[2*node+1]
		if left != -1 {
			QueueBuf[tail] = left
			tail++
		}
		if right != -1 {
			QueueBuf[tail] = right
			tail++
		}
	}
	PeakQueue = maxSize
	return count
}
