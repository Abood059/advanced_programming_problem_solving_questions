package main

type RetryHeap []*TaskRecord

func (h RetryHeap) Len() int { return len(h) }
func (h RetryHeap) Less(i, j int) bool {
	a, b := h[i], h[j]
	if !a.ReadyAt.Equal(b.ReadyAt) {
		return a.ReadyAt.Before(b.ReadyAt)
	}
	if a.Priority != b.Priority {
		return a.Priority == PriorityHigh
	}
	if a.Attempts != b.Attempts {
		return a.Attempts < b.Attempts
	}
	return a.CreatedAt.Before(b.CreatedAt)
}
func (h RetryHeap) Swap(i, j int) { h[i], h[j] = h[j], h[i] }
func (h *RetryHeap) Push(x interface{}) { *h = append(*h, x.(*TaskRecord)) }
func (h *RetryHeap) Pop() interface{} {
	old := *h
	n := len(old)
	item := old[n-1]
	*h = old[:n-1]
	return item
}
