package main
import "math"
type fixedWindowState struct {
	windowStart int64
	count       int
}

type FixedWindowCounter struct {
	limit    int
	windowMs int64
	buckets  map[string]*fixedWindowState
}

func NewFixedWindowCounter() *FixedWindowCounter {
	return &FixedWindowCounter{
		limit:    Limit,
		windowMs: WindowMs,
		buckets:  make(map[string]*fixedWindowState),
	}
}

func (f *FixedWindowCounter) Allow(userID string, nowMs int64) Decision {
	windowStart := (nowMs / f.windowMs) * f.windowMs
	b, ok := f.buckets[userID]
	if !ok || b.windowStart != windowStart {
		b = &fixedWindowState{windowStart: windowStart, count: 0}
		f.buckets[userID] = b
	}
	if b.count >= f.limit {
		return Decision{false, 0, b.windowStart + f.windowMs - nowMs}
	}
	b.count++
	return Decision{true, f.limit - b.count, 0}
}

func (f *FixedWindowCounter) Footprint() Footprint {
	return Footprint{len(f.buckets), len(f.buckets)}
}

func (f *FixedWindowCounter) Reset() {
	f.buckets = make(map[string]*fixedWindowState)
}

type SlidingWindowLog struct {
	limit    int
	windowMs int64
	logs     map[string][]int64
}

func NewSlidingWindowLog() *SlidingWindowLog {
	return &SlidingWindowLog{
		limit:    Limit,
		windowMs: WindowMs,
		logs:     make(map[string][]int64),
	}
}

func (s *SlidingWindowLog) Allow(userID string, nowMs int64) Decision {
	arr := s.logs[userID]

	cutoff := nowMs - s.windowMs
	i := 0
	for i < len(arr) && arr[i] <= cutoff {
		i++
	}
	if i > 0 {
		n := copy(arr, arr[i:])
		arr = arr[:n]
	}

	if len(arr) >= s.limit {
		s.logs[userID] = arr
		return Decision{false, 0, arr[0] + s.windowMs - nowMs}
	}

	arr = append(arr, nowMs)
	s.logs[userID] = arr
	return Decision{true, s.limit - len(arr), 0}
}

func (s *SlidingWindowLog) Footprint() Footprint {
	entries := 0
	for _, arr := range s.logs {
		entries += len(arr)
	}
	return Footprint{len(s.logs), entries}
}

func (s *SlidingWindowLog) Reset() {
	s.logs = make(map[string][]int64)
}

type slidingCounterState struct {
	windowStart int64
	curr        int
	prev        int
}

type SlidingWindowCounter struct {
	limit    int
	windowMs int64
	buckets  map[string]*slidingCounterState
}

func NewSlidingWindowCounter() *SlidingWindowCounter {
	return &SlidingWindowCounter{
		limit:    Limit,
		windowMs: WindowMs,
		buckets:  make(map[string]*slidingCounterState),
	}
}

func (s *SlidingWindowCounter) Allow(userID string, nowMs int64) Decision {
	windowStart := (nowMs / s.windowMs) * s.windowMs
	b, ok := s.buckets[userID]
	if !ok {
		b = &slidingCounterState{windowStart: windowStart, curr: 0, prev: 0}
		s.buckets[userID] = b
	} else if b.windowStart != windowStart {
		if b.windowStart+s.windowMs == windowStart {
			b.prev = b.curr
		} else {
			b.prev = 0
		}
		b.curr = 0
		b.windowStart = windowStart
	}

	elapsed := nowMs - b.windowStart
	weight := float64(s.windowMs-elapsed) / float64(s.windowMs)
	estimated := float64(b.curr) + float64(b.prev)*weight

	if estimated >= float64(s.limit) {
		return Decision{false, 0, s.windowMs - elapsed}
	}

	b.curr++
	after := float64(b.curr) + float64(b.prev)*weight
	remaining := int(math.Floor(float64(s.limit) - after))
	if remaining < 0 {
		remaining = 0
	}
	return Decision{true, remaining, 0}
}

func (s *SlidingWindowCounter) Footprint() Footprint {
	return Footprint{len(s.buckets), len(s.buckets)}
}

func (s *SlidingWindowCounter) Reset() {
	s.buckets = make(map[string]*slidingCounterState)
}

type tokenBucketState struct {
	tokens       float64
	lastRefillMs int64
}

type TokenBucket struct {
	capacity   float64
	refillRate float64
	buckets    map[string]*tokenBucketState
}

func NewTokenBucket() *TokenBucket {
	return &TokenBucket{
		capacity:   float64(Limit),
		refillRate: float64(Limit) / float64(WindowMs),
		buckets:    make(map[string]*tokenBucketState),
	}
}

func (t *TokenBucket) Allow(userID string, nowMs int64) Decision {
	b, ok := t.buckets[userID]
	if !ok {
		b = &tokenBucketState{tokens: t.capacity, lastRefillMs: nowMs}
		t.buckets[userID] = b
	} else {
		elapsed := nowMs - b.lastRefillMs
		if elapsed > 0 {
			b.tokens = math.Min(t.capacity, b.tokens+float64(elapsed)*t.refillRate)
			b.lastRefillMs = nowMs
		}
	}

	if b.tokens < 1 {
		retry := math.Ceil((1 - b.tokens) / t.refillRate)
		return Decision{false, 0, int64(retry)}
	}

	b.tokens--
	return Decision{true, int(b.tokens), 0}
}

func (t *TokenBucket) Footprint() Footprint {
	return Footprint{len(t.buckets), len(t.buckets)}
}

func (t *TokenBucket) Reset() {
	t.buckets = make(map[string]*tokenBucketState)
}

type leakyBucketState struct {
	level      float64
	lastLeakMs int64
}

type LeakyBucket struct {
	capacity float64
	leakRate float64
	buckets  map[string]*leakyBucketState
}

func NewLeakyBucket() *LeakyBucket {
	return &LeakyBucket{
		capacity: float64(Limit),
		leakRate: float64(Limit) / float64(WindowMs),
		buckets:  make(map[string]*leakyBucketState),
	}
}

func (l *LeakyBucket) Allow(userID string, nowMs int64) Decision {
	b, ok := l.buckets[userID]
	if !ok {
		b = &leakyBucketState{level: 0, lastLeakMs: nowMs}
		l.buckets[userID] = b
	} else {
		elapsed := nowMs - b.lastLeakMs
		if elapsed > 0 {
			b.level = math.Max(0, b.level-float64(elapsed)*l.leakRate)
			b.lastLeakMs = nowMs
		}
	}

	if b.level+1 > l.capacity {
		retry := math.Ceil((b.level + 1 - l.capacity) / l.leakRate)
		return Decision{false, 0, int64(retry)}
	}

	b.level++
	return Decision{true, int(l.capacity - b.level), 0}
}

func (l *LeakyBucket) Footprint() Footprint {
	return Footprint{len(l.buckets), len(l.buckets)}
}

func (l *LeakyBucket) Reset() {
	l.buckets = make(map[string]*leakyBucketState)
}

type gcraState struct {
	tat int64
}

type GCRA struct {
	T      int64
	tau    int64
	states map[string]*gcraState
}

func NewGCRA() *GCRA {
	return &GCRA{
		T:      GcraT,
		tau:    GcraTau,
		states: make(map[string]*gcraState),
	}
}

func (g *GCRA) Allow(userID string, nowMs int64) Decision {
	s, ok := g.states[userID]
	if !ok {
		s = &gcraState{tat: 0}
		g.states[userID] = s
	}

	if nowMs < s.tat-g.tau {
		return Decision{false, 0, s.tat - g.tau - nowMs}
	}

	if s.tat < nowMs {
		s.tat = nowMs
	}
	s.tat += g.T
	return Decision{true, 0, 0}
}

func (g *GCRA) Footprint() Footprint {
	return Footprint{len(g.states), len(g.states)}
}

func (g *GCRA) Reset() {
	g.states = make(map[string]*gcraState)
}

