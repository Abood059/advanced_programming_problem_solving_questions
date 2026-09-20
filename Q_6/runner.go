package main

import (
	"fmt"
	"strings"
	"sync"
	"time"
)

func runScenarioOnce(sc Scenario) Result {
	scheduler := NewScheduler()
	stop := make(chan struct{})
	var wg sync.WaitGroup

	for i := 1; i <= sc.Workers; i++ {
		wg.Add(1)
		go Worker(i, scheduler, &wg, stop, sc.FailureRate)
	}

	start := time.Now()
	generated := make(chan struct{})

	go func() {
		defer close(generated)
		id := 0

		var burstTimer <-chan time.Time
		if sc.BurstSize > 0 && sc.BurstEvery > 0 {
			t := time.NewTicker(sc.BurstEvery)
			defer t.Stop()
			burstTimer = t.C
		}

		for id < sc.Tasks {
			select {
			case <-time.After(poissonInterval(sc.MeanInterval)):
				id++
				addRandomTask(scheduler, id, sc)
			case <-burstTimer:
				for k := 0; k < sc.BurstSize && id < sc.Tasks; k++ {
					id++
					addRandomTask(scheduler, id, sc)
				}
			}
		}
	}()

	<-generated

	deadline := time.Now().Add(sc.MaxDuration)
	timedOut := false
	for {
		s := scheduler.Stats()
		terminal := s[StateCompleted] + s[StateFailed]
		if terminal >= sc.Tasks {
			break
		}
		if time.Now().After(deadline) {
			timedOut = true
			break
		}
		time.Sleep(50 * time.Millisecond)
	}

	elapsed := time.Since(start)
	close(stop)
	wg.Wait()

	final := scheduler.Stats()
	hw, lw := scheduler.WaitSnapshot()

	return Result{
		Name:        sc.Name,
		Workers:     sc.Workers,
		Tasks:       sc.Tasks,
		HighRatio:   sc.HighRatio,
		FailureRate: sc.FailureRate,
		Duration:    elapsed,
		Throughput:  float64(final[StateCompleted]) / elapsed.Seconds(),
		Completed:   final[StateCompleted],
		Failed:      final[StateFailed],
		Pending:     final[StatePending],
		RetryLeft:   final[StateRetryWait],
		TimedOut:    timedOut,
		HighWaitAvg: hw.Avg(),
		HighWaitMax: hw.Max,
		LowWaitAvg:  lw.Avg(),
		LowWaitMax:  lw.Max,
		CompletedF:  float64(final[StateCompleted]),
		FailedF:     float64(final[StateFailed]),
	}
}

func runScenarioRepeated(sc Scenario, runs int) Result {
	fmt.Printf("\n--- %s (workers=%d, tasks=%d, high=%.0f%%, fail=%.0f%%) ×%d ---\n",
		sc.Name, sc.Workers, sc.Tasks, sc.HighRatio*100, sc.FailureRate*100, runs)

	var (
		sumDur, sumHighAvg, sumHighMax, sumLowAvg, sumLowMax time.Duration
		sumThroughput                                          float64
		sumCompleted, sumFailed                                float64
		anyTimeout                                             bool
	)

	for r := 1; r <= runs; r++ {
		res := runScenarioOnce(sc)

		sumDur += res.Duration
		sumThroughput += res.Throughput
		sumCompleted += res.CompletedF
		sumFailed += res.FailedF
		sumHighAvg += res.HighWaitAvg
		sumHighMax += res.HighWaitMax
		sumLowAvg += res.LowWaitAvg
		sumLowMax += res.LowWaitMax
		if res.TimedOut {
			anyTimeout = true
		}

		fmt.Printf("  run %d/%d: dur=%v tp=%.0f/s done=%d fail=%d | H_wait avg=%v max=%v | L_wait avg=%v max=%v\n",
			r, runs,
			res.Duration.Round(10*time.Millisecond),
			res.Throughput,
			res.Completed, res.Failed,
			res.HighWaitAvg.Round(100*time.Microsecond),
			res.HighWaitMax.Round(100*time.Microsecond),
			res.LowWaitAvg.Round(100*time.Microsecond),
			res.LowWaitMax.Round(100*time.Microsecond),
		)
	}

	n := time.Duration(runs)
	nf := float64(runs)
	avg := Result{
		Name:        sc.Name,
		Workers:     sc.Workers,
		Tasks:       sc.Tasks,
		HighRatio:   sc.HighRatio,
		FailureRate: sc.FailureRate,
		Duration:    sumDur / n,
		Throughput:  sumThroughput / nf,
		Completed:   int(sumCompleted / nf),
		Failed:      int(sumFailed / nf),
		TimedOut:    anyTimeout,
		HighWaitAvg: sumHighAvg / n,
		HighWaitMax: sumHighMax / n,
		LowWaitAvg:  sumLowAvg / n,
		LowWaitMax:  sumLowMax / n,
	}

	fmt.Printf("  [AVG] dur=%v tp=%.0f/s done=%d fail=%d | H_wait avg=%v max=%v | L_wait avg=%v max=%v\n",
		avg.Duration.Round(10*time.Millisecond),
		avg.Throughput,
		avg.Completed, avg.Failed,
		avg.HighWaitAvg.Round(100*time.Microsecond),
		avg.HighWaitMax.Round(100*time.Microsecond),
		avg.LowWaitAvg.Round(100*time.Microsecond),
		avg.LowWaitMax.Round(100*time.Microsecond),
	)

	return avg
}

func printSummary(results []Result) {
	fmt.Println("\n\n" + strings.Repeat("=", 140))
	fmt.Println("                                              FINAL SUMMARY (averaged over " + fmt.Sprint(RunsPerScenario) + " runs)")
	fmt.Println(strings.Repeat("=", 140))
	fmt.Printf("%-14s %7s %7s %6s %6s %10s %11s %9s %7s %13s %13s\n",
		"Scenario", "Workers", "Tasks", "High%", "Fail%",
		"Duration", "Throughput", "Completed", "Failed",
		"H_wait(avg/max)", "L_wait(avg/max)")
	fmt.Println(strings.Repeat("-", 140))

	for _, r := range results {
		note := ""
		if r.TimedOut {
			note = " *"
		}
		fmt.Printf("%-14s %7d %7d %5.0f%% %5.0f%% %10s %11.0f %9d %7d %13s %13s%s\n",
			r.Name, r.Workers, r.Tasks, r.HighRatio*100, r.FailureRate*100,
			r.Duration.Round(10*time.Millisecond).String(),
			r.Throughput, r.Completed, r.Failed,
			fmt.Sprintf("%v/%v",
				r.HighWaitAvg.Round(100*time.Microsecond),
				r.HighWaitMax.Round(100*time.Microsecond)),
			fmt.Sprintf("%v/%v",
				r.LowWaitAvg.Round(100*time.Microsecond),
				r.LowWaitMax.Round(100*time.Microsecond)),
			note,
		)
	}
	fmt.Println(strings.Repeat("-", 140))
	fmt.Println("H_wait = HIGH-priority queue wait time | L_wait = LOW-priority queue wait time")
}
