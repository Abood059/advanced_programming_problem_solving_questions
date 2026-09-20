package main

import (
	"fmt"
	"math"
	"math/rand"
	"time"
)

func poissonInterval(mean time.Duration) time.Duration {
	if mean <= 0 {
		return 0
	}
	u := rand.Float64()
	if u < 1e-9 {
		u = 1e-9
	}
	return time.Duration(-float64(mean) * math.Log(u))
}

func addRandomTask(s *Scheduler, id int, sc Scenario) {
	priority := PriorityLow
	if rand.Float64() < sc.HighRatio {
		priority = PriorityHigh
	}

	var duration time.Duration
	if sc.DurationMax > sc.DurationMin {
		span := int64(sc.DurationMax - sc.DurationMin)
		duration = sc.DurationMin + time.Duration(rand.Int63n(span+1))
	} else {
		duration = sc.DurationMin
	}

	s.AddTask(fmt.Sprintf("T%d", id), priority, duration)
}
