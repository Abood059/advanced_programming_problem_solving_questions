package main
import "strconv"
type Scenario struct {
	Name  string
	Total int
	Heavy bool
	Run   func(check func(userID string, nowMs int64))
}

func buildScenarios() []Scenario {
	return []Scenario{
		{
			Name:  "Normal",
			Total: 50,
			Heavy: false,
			Run: func(check func(string, int64)) {
				for i := 0; i < 50; i++ {
					check("u1", int64(i)*1200)
				}
			},
		},
		{
			Name:  "AtLimit",
			Total: 100,
			Heavy: false,
			Run: func(check func(string, int64)) {
				for i := 0; i < 100; i++ {
					check("u1", int64(i)*600)
				}
			},
		},
		{
			Name:  "Boundary",
			Total: 200,
			Heavy: false,
			Run: func(check func(string, int64)) {
				for i := 0; i < 100; i++ {
					check("u1", 59_900+int64(i))
				}
				for i := 0; i < 100; i++ {
					check("u1", 60_000+int64(i))
				}
			},
		},
		{
			Name:  "ExtremeBurst",
			Total: 10_000,
			Heavy: false,
			Run: func(check func(string, int64)) {
				for i := 0; i < 10_000; i++ {
					check("u1", 0)
				}
			},
		},
		{
			Name:  "HundredKUsers",
			Total: 100_000,
			Heavy: true,
			Run: func(check func(string, int64)) {
				for u := 0; u < 100_000; u++ {
					check("user_"+strconv.Itoa(u), 0)
				}
			},
		},
		{
			Name:  "MillionUsers",
			Total: 1_000_000,
			Heavy: true,
			Run: func(check func(string, int64)) {
				for u := 0; u < 1_000_000; u++ {
					check("user_"+strconv.Itoa(u), 0)
				}
			},
		},
		{
			Name:  "HeavySingleUser",
			Total: 1_000_000,
			Heavy: true,
			Run: func(check func(string, int64)) {
				for i := 0; i < 1_000_000; i++ {
					check("heavy", int64(i)*36/10)
				}
			},
		},
		{
			Name:  "LongSustained",
			Total: 1_000_000,
			Heavy: true,
			Run: func(check func(string, int64)) {
				ids := make([]string, 100)
				for u := 0; u < 100; u++ {
					ids[u] = "u_" + strconv.Itoa(u)
				}
				for i := 0; i < 10_000; i++ {
					t := int64(i) * 360
					for u := 0; u < 100; u++ {
						check(ids[u], t)
					}
				}
			},
		},
		{
			Name:  "MixedHotCold",
			Total: 1_009_000,
			Heavy: true,
			Run: func(check func(string, int64)) {
				for u := 0; u < 9_000; u++ {
					check("cold_"+strconv.Itoa(u), 0)
				}
				for u := 0; u < 1_000; u++ {
					id := "hot_" + strconv.Itoa(u)
					for i := 0; i < 1_000; i++ {
						check(id, int64(i)*60)
					}
				}
			},
		},
	}
}

