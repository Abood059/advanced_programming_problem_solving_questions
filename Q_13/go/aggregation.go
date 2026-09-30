package main
import (
	"math"
	"sort"
)
type Aggregate struct {
	Allowed      int
	Denied       int
	TotalReqs    int
	TimeMeanMs   float64
	TimeStdMs    float64
	Throughput   float64
	LatMeanUs    float64
	P50Us        float64
	P99Us        float64
	HeapDeltaKB  float64
	AllocDeltaKB float64
	Users        int
	Entries      int
	Consistent   bool
}

func aggregate(results []RunResult) Aggregate {
	timesMs := make([]float64, len(results))
	for i, r := range results {
		timesMs[i] = float64(r.TotalNs) / 1e6
	}

	allowedSet := make(map[int]struct{})
	deniedSet := make(map[int]struct{})
	for _, r := range results {
		allowedSet[r.Allowed] = struct{}{}
		deniedSet[r.Denied] = struct{}{}
	}

	pooled := make([]int64, 0, len(results)*SampleLimit)
	for _, r := range results {
		pooled = append(pooled, r.Samples...)
	}
	sort.Slice(pooled, func(i, j int) bool { return pooled[i] < pooled[j] })

	p50 := float64(percentile(pooled, 0.50)) / 1e3
	p99 := float64(percentile(pooled, 0.99)) / 1e3
	latMean := float64(meanInt64(pooled)) / 1e3

	heapMax := int64(math.MinInt64)
	allocMax := uint64(0)
	for _, r := range results {
		if r.HeapDelta > heapMax {
			heapMax = r.HeapDelta
		}
		if r.TotalAllocDelta > allocMax {
			allocMax = r.TotalAllocDelta
		}
	}

	totalReqs := results[0].Allowed + results[0].Denied
	meanMs := meanFloat64(timesMs)
	throughput := 0.0
	if meanMs > 0 {
		throughput = float64(totalReqs) / (meanMs / 1000)
	}

	return Aggregate{
		Allowed:      results[0].Allowed,
		Denied:       results[0].Denied,
		TotalReqs:    totalReqs,
		TimeMeanMs:   meanMs,
		TimeStdMs:    stddevFloat64(timesMs),
		Throughput:   throughput,
		LatMeanUs:    latMean,
		P50Us:        p50,
		P99Us:        p99,
		HeapDeltaKB:  float64(heapMax) / 1024,
		AllocDeltaKB: float64(allocMax) / 1024,
		Users:        results[0].Users,
		Entries:      results[0].Entries,
		Consistent:   len(allowedSet) == 1 && len(deniedSet) == 1,
	}
}

