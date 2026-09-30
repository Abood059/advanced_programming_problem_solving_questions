package core

const (
	NTotal      = (1 << 25)
	ChainLen    = NTotal >> 1
	NWide       = (1 << 25) - 1
	WARMUP      = 3
	RUNS        = 10
	QueueCap    = 16
	QueueMask   = QueueCap - 1
)
