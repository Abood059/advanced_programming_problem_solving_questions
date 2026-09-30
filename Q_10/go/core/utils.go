package core

import "fmt"

func FormatBytes(b int64) string {
	switch {
	case b < 1024:
		return fmt.Sprintf("%d B", b)
	case b < 1024*1024:
		return fmt.Sprintf("%.2f KB", float64(b)/1024.0)
	default:
		return fmt.Sprintf("%.2f MB", float64(b)/1024.0/1024.0)
	}
}

func Abs(x float64) float64 {
	if x < 0 {
		return -x
	}
	return x
}

func Max(a, b float64) float64 {
	if a > b {
		return a
	}
	return b
}

func Log2(x float64) float64 {
	var result float64
	for x > 1 {
		x /= 2
		result++
	}
	return result
}
