package main

type Decision struct {
	Allowed      bool
	Remaining    int
	RetryAfterMs int64
}

type Footprint struct {
	Users   int
	Entries int
}

type RateLimiter interface {
	Allow(userID string, nowMs int64) Decision
	Footprint() Footprint
	Reset()
}
