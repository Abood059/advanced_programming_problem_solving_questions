package main

import (
	"time"
)

const RunsPerScenario = 5

const (
	StatePending   = "PENDING"
	StateRunning   = "RUNNING"
	StateRetryWait = "RETRY_WAIT"
	StateCompleted = "COMPLETED"
	StateFailed    = "FAILED"
)

const (
	PriorityHigh = "HIGH"
	PriorityLow  = "LOW"
)

type WaitStats struct {
	Count int
	Total time.Duration
	Max   time.Duration
}

func (w *WaitStats) Record(d time.Duration) {
	w.Count++
	w.Total += d
	if d > w.Max {
		w.Max = d
	}
}

func (w WaitStats) Avg() time.Duration {
	if w.Count == 0 {
		return 0
	}
	return w.Total / time.Duration(w.Count)
}

type TaskRecord struct {
	ID         string
	Priority   string
	Duration   time.Duration
	CreatedAt  time.Time
	EnqueuedAt time.Time
	State      string
	Attempts   int
	ReadyAt    time.Time
}

type Scenario struct {
	Name         string
	Workers      int
	Tasks        int
	HighRatio    float64
	FailureRate  float64
	DurationMin  time.Duration
	DurationMax  time.Duration
	MeanInterval time.Duration
	BurstSize    int
	BurstEvery   time.Duration
	MaxDuration  time.Duration
}

type Result struct {
	Name        string
	Workers     int
	Tasks       int
	HighRatio   float64
	FailureRate float64

	Duration   time.Duration
	Throughput float64
	Completed  int
	Failed     int
	Pending    int
	RetryLeft  int
	TimedOut   bool

	HighWaitAvg time.Duration
	HighWaitMax time.Duration
	LowWaitAvg  time.Duration
	LowWaitMax  time.Duration

	CompletedF float64
	FailedF    float64
}
