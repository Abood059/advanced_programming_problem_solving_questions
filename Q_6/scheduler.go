package main

import (
	"container/heap"
	"sync"
	"time"
)

type Scheduler struct {
	mu sync.Mutex

	highQueue []string
	lowQueue  []string
	retryHeap RetryHeap
	taskMap   map[string]*TaskRecord

	timeCounter time.Duration
	timeLimit   time.Duration
	maxRetries  int
	backoffBase time.Duration

	highWait WaitStats
	lowWait  WaitStats
}

func NewScheduler() *Scheduler {
	s := &Scheduler{
		taskMap:     make(map[string]*TaskRecord),
		timeLimit:   3 * time.Second,
		maxRetries:  3,
		backoffBase: 500 * time.Millisecond,
	}
	heap.Init(&s.retryHeap)
	return s
}

func (s *Scheduler) AddTask(id, priority string, duration time.Duration) bool {
	s.mu.Lock()
	defer s.mu.Unlock()

	if existing, ok := s.taskMap[id]; ok {
		if existing.State == StatePending ||
			existing.State == StateRunning ||
			existing.State == StateRetryWait {
			return false
		}
	}

	now := time.Now()
	rec := &TaskRecord{
		ID:         id,
		Priority:   priority,
		Duration:   duration,
		CreatedAt:  now,
		EnqueuedAt: now,
		State:      StatePending,
	}
	s.taskMap[id] = rec

	if priority == PriorityHigh {
		s.highQueue = append(s.highQueue, id)
	} else {
		s.lowQueue = append(s.lowQueue, id)
	}
	return true
}

func (s *Scheduler) AcquireTask() *TaskRecord {
	s.mu.Lock()
	defer s.mu.Unlock()

	now := time.Now()
	for s.retryHeap.Len() > 0 {
		top := s.retryHeap[0]
		if top.ReadyAt.After(now) {
			break
		}
		heap.Pop(&s.retryHeap)
		top.State = StatePending
		top.EnqueuedAt = now
		if top.Priority == PriorityHigh {
			s.highQueue = append([]string{top.ID}, s.highQueue...)
		} else {
			s.lowQueue = append([]string{top.ID}, s.lowQueue...)
		}
	}

	var chosenID string
	switch {
	case s.timeCounter >= s.timeLimit && len(s.lowQueue) > 0:
		chosenID = s.lowQueue[0]
		s.lowQueue = s.lowQueue[1:]
		s.timeCounter = 0
	case len(s.highQueue) > 0:
		chosenID = s.highQueue[0]
		s.highQueue = s.highQueue[1:]
		s.timeCounter += s.taskMap[chosenID].Duration
	case len(s.lowQueue) > 0:
		chosenID = s.lowQueue[0]
		s.lowQueue = s.lowQueue[1:]
		s.timeCounter = 0
	default:
		return nil
	}

	rec := s.taskMap[chosenID]

	wait := now.Sub(rec.EnqueuedAt)
	if rec.Priority == PriorityHigh {
		s.highWait.Record(wait)
	} else {
		s.lowWait.Record(wait)
	}

	rec.State = StateRunning
	return rec
}

func (s *Scheduler) MarkCompleted(id string) {
	s.mu.Lock()
	defer s.mu.Unlock()
	if rec, ok := s.taskMap[id]; ok {
		rec.State = StateCompleted
	}
}

func (s *Scheduler) MarkFailed(id string) {
	s.mu.Lock()
	defer s.mu.Unlock()

	rec, ok := s.taskMap[id]
	if !ok {
		return
	}
	rec.Attempts++
	if rec.Attempts < s.maxRetries {
		rec.State = StateRetryWait
		rec.ReadyAt = time.Now().Add(s.backoffBase * time.Duration(rec.Attempts))
		heap.Push(&s.retryHeap, rec)
	} else {
		rec.State = StateFailed
	}
}

func (s *Scheduler) Stats() map[string]int {
	s.mu.Lock()
	defer s.mu.Unlock()

	counts := map[string]int{
		"highQueue": len(s.highQueue),
		"lowQueue":  len(s.lowQueue),
		"retryHeap": s.retryHeap.Len(),
	}
	for _, rec := range s.taskMap {
		counts[rec.State]++
	}
	return counts
}

func (s *Scheduler) WaitSnapshot() (WaitStats, WaitStats) {
	s.mu.Lock()
	defer s.mu.Unlock()
	return s.highWait, s.lowWait
}
