package main
import (
	"runtime"
	"time"
)
type RunResult struct {
	Allowed         int
	Denied          int
	TotalNs         int64
	Samples         []int64
	Users           int
	Entries         int
	HeapDelta       int64
	TotalAllocDelta uint64
}

func executeOnce(alg Algorithm, scenario Scenario) RunResult {
	limiter := alg.Factory()

	runtime.GC()
	var msBefore runtime.MemStats
	runtime.ReadMemStats(&msBefore)

	samples := make([]int64, 0, SampleLimit)
	allowed := 0
	denied := 0

	check := func(userID string, nowMs int64) {
		var d Decision
		if len(samples) < SampleLimit {
			t0 := time.Now()
			d = limiter.Allow(userID, nowMs)
			t1 := time.Now()
			samples = append(samples, int64(t1.Sub(t0)))
		} else {
			d = limiter.Allow(userID, nowMs)
		}
		if d.Allowed {
			allowed++
		} else {
			denied++
		}
	}

	t0 := time.Now()
	scenario.Run(check)
	elapsed := int64(time.Since(t0))

	runtime.GC()
	var msAfter runtime.MemStats
	runtime.ReadMemStats(&msAfter)

	fp := limiter.Footprint()
	runtime.KeepAlive(limiter)

	return RunResult{
		Allowed:         allowed,
		Denied:          denied,
		TotalNs:         elapsed,
		Samples:         samples,
		Users:           fp.Users,
		Entries:         fp.Entries,
		HeapDelta:       int64(msAfter.HeapAlloc) - int64(msBefore.HeapAlloc),
		TotalAllocDelta: msAfter.TotalAlloc - msBefore.TotalAlloc,
	}
}

func executeWithIterations(alg Algorithm, scenario Scenario, iters int) []RunResult {
	results := make([]RunResult, iters)
	for i := 0; i < iters; i++ {
		results[i] = executeOnce(alg, scenario)
	}
	return results
}

