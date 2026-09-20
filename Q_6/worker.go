package main

import (
	"math/rand"
	"sync"
	"time"
)

func Worker(id int, s *Scheduler, wg *sync.WaitGroup, stop <-chan struct{}, failureRate float64) {
	defer wg.Done()

	for {
		select {
		case <-stop:
			return
		default:
		}

		task := s.AcquireTask()
		if task == nil {
			time.Sleep(20 * time.Millisecond)
			continue
		}

		time.Sleep(task.Duration)

		if rand.Float64() < failureRate {
			s.MarkFailed(task.ID)
		} else {
			s.MarkCompleted(task.ID)
		}
	}
}
