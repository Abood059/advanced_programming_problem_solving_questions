package main
import (
	"math"
	"strconv"
	"strings"
)
func meanFloat64(arr []float64) float64 {
	if len(arr) == 0 {
		return 0
	}
	var s float64
	for _, v := range arr {
		s += v
	}
	return s / float64(len(arr))
}

func stddevFloat64(arr []float64) float64 {
	if len(arr) < 2 {
		return 0
	}
	m := meanFloat64(arr)
	var s float64
	for _, v := range arr {
		s += (v - m) * (v - m)
	}
	return math.Sqrt(s / float64(len(arr)-1))
}

func meanInt64(arr []int64) float64 {
	if len(arr) == 0 {
		return 0
	}
	var s int64
	for _, v := range arr {
		s += v
	}
	return float64(s) / float64(len(arr))
}

func percentile(sorted []int64, p float64) int64 {
	if len(sorted) == 0 {
		return 0
	}
	idx := int(float64(len(sorted)) * p)
	if idx >= len(sorted) {
		idx = len(sorted) - 1
	}
	return sorted[idx]
}

func withCommas(n int) string {
	neg := n < 0
	if neg {
		n = -n
	}
	s := strconv.Itoa(n)
	if len(s) <= 3 {
		if neg {
			return "-" + s
		}
		return s
	}
	var b strings.Builder
	pre := len(s) % 3
	if pre > 0 {
		b.WriteString(s[:pre])
		if len(s) > pre {
			b.WriteByte(',')
		}
	}
	for i := pre; i < len(s); i += 3 {
		b.WriteString(s[i : i+3])
		if i+3 < len(s) {
			b.WriteByte(',')
		}
	}
	if neg {
		return "-" + b.String()
	}
	return b.String()
}

func fmtF(n float64, d int) string {
	return strconv.FormatFloat(n, 'f', d, 64)
}

func padL(s string, w int) string {
	if len(s) >= w {
		return s
	}
	return s + strings.Repeat(" ", w-len(s))
}

func padR(s string, w int) string {
	if len(s) >= w {
		return s
	}
	return strings.Repeat(" ", w-len(s)) + s
}

