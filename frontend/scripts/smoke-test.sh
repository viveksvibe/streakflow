#!/usr/bin/env bash
# End-to-end smoke test: simulates the browser flows the frontend performs.
set -u
API="http://localhost:3000/api/v1"
ORIGIN="http://localhost:5173"
EMAIL="smoke-$RANDOM$RANDOM@example.com"
JAR=$(mktemp)
FAILURES=0

check() {
  local name="$1" expected="$2" actual="$3"
  if [ "$expected" = "$actual" ]; then
    echo "PASS  $name"
  else
    echo "FAIL  $name (expected $expected, got $actual)"
    FAILURES=$((FAILURES + 1))
  fi
}

# 1. CORS preflight from the Vite dev server origin
PREFLIGHT=$(curl -s -o /dev/null -w "%{http_code}" -X OPTIONS "$API/auth/register" \
  -H "Origin: $ORIGIN" -H "Access-Control-Request-Method: POST")
check "CORS preflight allowed" 204 "$PREFLIGHT"

# 2. Register (as SignUpPage does)
REGISTER=$(curl -s -w "\n%{http_code}" -X POST "$API/auth/register" \
  -H "Origin: $ORIGIN" -H "Content-Type: application/json" \
  -c "$JAR" \
  -d "{\"fullName\":\"Smoke User\",\"email\":\"$EMAIL\",\"password\":\"password123\",\"timezone\":\"UTC\"}")
CODE=$(echo "$REGISTER" | tail -1)
BODY=$(echo "$REGISTER" | head -1)
check "register returns 201" 201 "$CODE"
TOKEN=$(echo "$BODY" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
[ -n "$TOKEN" ] && echo "PASS  register returns access token" || { echo "FAIL  register returns access token"; FAILURES=$((FAILURES+1)); }

# 3. Create habit (as AddHabitModal does)
CREATE=$(curl -s -w "\n%{http_code}" -X POST "$API/habits" \
  -H "Origin: $ORIGIN" -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" -b "$JAR" \
  -d '{"name":"Smoke Habit","icon":"🔥","reminderEnabled":true,"reminderTime":"08:30"}')
CODE=$(echo "$CREATE" | tail -1)
BODY=$(echo "$CREATE" | head -1)
check "create habit returns 201" 201 "$CODE"
HABIT_ID=$(echo "$BODY" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
[ -n "$HABIT_ID" ] && echo "PASS  habit id present" || { echo "FAIL  habit id present"; FAILURES=$((FAILURES+1)); }

# 4. List habits (as HomePage does)
LIST=$(curl -s -w "\n%{http_code}" "$API/habits" \
  -H "Origin: $ORIGIN" -H "Authorization: Bearer $TOKEN" -b "$JAR")
CODE=$(echo "$LIST" | tail -1)
check "list habits returns 200" 200 "$CODE"
echo "$LIST" | grep -q '"completedToday":false' && echo "PASS  habit listed with completedToday flag" || { echo "FAIL  habit listed with completedToday flag"; FAILURES=$((FAILURES+1)); }

# 5. Complete habit (as HabitItem check does)
COMPLETE=$(curl -s -w "\n%{http_code}" -X POST "$API/habits/$HABIT_ID/complete-today" \
  -H "Origin: $ORIGIN" -H "Authorization: Bearer $TOKEN" -b "$JAR")
CODE=$(echo "$COMPLETE" | tail -1)
check "complete habit returns 200" 200 "$CODE"
echo "$COMPLETE" | grep -q '"currentStreak":1' && echo "PASS  streak incremented to 1" || { echo "FAIL  streak incremented to 1"; FAILURES=$((FAILURES+1)); }

# 6. Dashboard (as DashboardPage does)
DASH=$(curl -s -w "\n%{http_code}" "$API/stats/dashboard" \
  -H "Origin: $ORIGIN" -H "Authorization: Bearer $TOKEN" -b "$JAR")
CODE=$(echo "$DASH" | tail -1)
check "dashboard returns 200" 200 "$CODE"
echo "$DASH" | grep -q '"completedHabits":1' && echo "PASS  dashboard reflects completion" || { echo "FAIL  dashboard reflects completion"; FAILURES=$((FAILURES+1)); }

# 7. Update profile (as ProfilePage does)
PROFILE=$(curl -s -w "\n%{http_code}" -X PATCH "$API/auth/me" \
  -H "Origin: $ORIGIN" -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" -b "$JAR" \
  -d '{"fullName":"Smoke Updated"}')
CODE=$(echo "$PROFILE" | tail -1)
check "update profile returns 200" 200 "$CODE"

# 8. Refresh session (cookie-based, as the axios interceptor does)
REFRESH=$(curl -s -w "\n%{http_code}" -X POST "$API/auth/refresh" \
  -H "Origin: $ORIGIN" -b "$JAR" -c "$JAR")
CODE=$(echo "$REFRESH" | tail -1)
check "refresh returns 200" 200 "$CODE"

# 9. Weekly progress + heatmap + leaderboard (StreakPage/DashboardPage)
WP=$(curl -s -o /dev/null -w "%{http_code}" "$API/stats/weekly-progress" -H "Origin: $ORIGIN" -H "Authorization: Bearer $TOKEN" -b "$JAR")
check "weekly progress returns 200" 200 "$WP"
HM=$(curl -s -o /dev/null -w "%{http_code}" "$API/stats/activity-heatmap" -H "Origin: $ORIGIN" -H "Authorization: Bearer $TOKEN" -b "$JAR")
check "activity heatmap returns 200" 200 "$HM"
LB=$(curl -s -o /dev/null -w "%{http_code}" "$API/stats/habit-leaderboard" -H "Origin: $ORIGIN" -H "Authorization: Bearer $TOKEN" -b "$JAR")
check "habit leaderboard returns 200" 200 "$LB"

# 10. Logout (as Navbar does)
LOGOUT=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API/auth/logout" \
  -H "Origin: $ORIGIN" -b "$JAR")
check "logout returns 200" 200 "$LOGOUT"

# 11. Refresh after logout must fail (token revoked)
REPLAY=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API/auth/refresh" -H "Origin: $ORIGIN" -b "$JAR")
check "refresh after logout rejected" 401 "$REPLAY"

# 12. Frontend dev server serves the app
FE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5173/)
check "frontend dev server responds" 200 "$FE"
FE_TITLE=$(curl -s http://localhost:5173/ | grep -c "root")
[ "$FE_TITLE" -ge 1 ] && echo "PASS  frontend serves index with root mount" || { echo "FAIL  frontend serves index with root mount"; FAILURES=$((FAILURES+1)); }

echo ""
if [ "$FAILURES" -eq 0 ]; then
  echo "ALL SMOKE CHECKS PASSED"
else
  echo "SMOKE FAILURES: $FAILURES"
fi
rm -f "$JAR"
