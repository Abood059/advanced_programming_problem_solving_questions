package main

const (
	Limit       = 100
	WindowMs    = int64(60_000)
	SampleLimit = 10_000
	LightIters  = 5
	HeavyIters  = 3
)

var (
	GcraT   = WindowMs / Limit // 600
	GcraTau = WindowMs - GcraT // 59,400
)
