package main

type Algorithm struct {
	Key     string
	Name    string
	Factory func() RateLimiter
}

var Algorithms = []Algorithm{
	{"Fixed", "Fixed Window Counter", func() RateLimiter { return NewFixedWindowCounter() }},
	{"SLog", "Sliding Window Log", func() RateLimiter { return NewSlidingWindowLog() }},
	{"SCount", "Sliding Window Counter", func() RateLimiter { return NewSlidingWindowCounter() }},
	{"Token", "Token Bucket", func() RateLimiter { return NewTokenBucket() }},
	{"Leaky", "Leaky Bucket", func() RateLimiter { return NewLeakyBucket() }},
	{"GCRA", "GCRA", func() RateLimiter { return NewGCRA() }},
}

