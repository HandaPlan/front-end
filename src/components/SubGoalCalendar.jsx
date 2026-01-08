import { useMemo } from "react";
import { format, parseISO, isValid, isAfter } from "date-fns";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import { MdVerified } from "react-icons/md";
import slotColors from "../constants/soltNumMappings";
import slotTextColors from "../constants/slotColorHex";
import api from "../api/axiosInstance";

export default function SubGoalCalendar({
  mainGoalId,
  subGoals = [],
  progress = [],
  start_date,
  end_date,
  week_of_month,
  currentWeekStart,
  onChangeWeekStart,
}) {
  // 기존 useMemo → 확장
  const formattedRange = useMemo(() => {
    try {
      if (!start_date || !end_date) return { range: "날짜 정보 없음", year: "", month: "" };

      const startParsed = parseISO(start_date);
      const endParsed = parseISO(end_date);

      if (!isValid(startParsed) || !isValid(endParsed)) {
        return { range: "날짜 형식 오류", year: "", month: "" };
      }

      const start = format(startParsed, "yy.MM.dd");
      const end = format(endParsed, "yy.MM.dd");
      const year = format(startParsed, "yyyy");
      const month = format(startParsed, "M"); // 1~12로 표시

      return {
        range: `(${start}~${end})`,
        year,
        month,
      };
    } catch {
      return { range: "날짜 파싱 실패", year: "", month: "" };
    }
  }, [start_date, end_date, week_of_month]);

  // 구조 분해
  const { range: formattedDateRange, year: parsedYear, month: parsedMonth } = formattedRange;

  // 오늘 날짜와 비교해서 NEXT 버튼 비활성화 여부 판단
  const isNextDisabled = useMemo(() => {
    if (!end_date) return false;
    const today = new Date();
    const endParsed = parseISO(end_date);
    return isAfter(endParsed, today); // end_date가 오늘보다 미래라면 NEXT 막기
  }, [end_date]);


  // 날짜 이동 핸들러
  const handlePrevDate = async () => {
    const current = parseISO(currentWeekStart);
    if (!isValid(current)) return;

    try {
      const res = await api.get(`/api/main-goals/${mainGoalId}/sub-progress`, {
        params: {
          date: format(current, "yyyy-MM-dd"), // 현재 날짜만 보냄
          direction: "PREV",
        },
      });

      // 응답 데이터 구조에 맞게 상태 갱신
      const { startDate, endDate, weekOfMonth, subProgress } = res.data.data;

      onChangeWeekStart(startDate, {
        start_date: startDate,
        end_date: endDate,
        week_of_month: weekOfMonth,
        progress: subProgress,
      });
    } catch (err) {
      console.error("서브골 진행도 조회 실패:", err);
      alert("데이터를 불러오는 데 실패했습니다.");
    }
  };

  const handleNextDate = async () => {
    const current = parseISO(currentWeekStart);
    if (!isValid(current)) return;

    try {
      const res = await api.get(`/api/main-goals/${mainGoalId}/sub-progress`, {
        params: {
          date: format(current, "yyyy-MM-dd"), // 현재 날짜만 보냄
          direction: "NEXT",
        },
      });

      const { startDate, endDate, weekOfMonth, subProgress } = res.data.data;

      onChangeWeekStart(startDate, {
        start_date: startDate,
        end_date: endDate,
        week_of_month: weekOfMonth,
        progress: subProgress,
      });
    } catch (err) {
      console.error("서브골 진행도 조회 실패:", err);
      alert("데이터를 불러오는 데 실패했습니다.");
    }
  };

  // 진행중/달성 분리: API subProgress(progress) 기준으로!
  const { pendingGoals, achievedGoals } = useMemo(() => {
    const list = Array.isArray(progress) ? progress : [];

    const pending = list
      .filter((g) => !g.attainment)
      .sort((a, b) => (b.rate ?? 0) - (a.rate ?? 0));

    const achieved = list
      .filter((g) => g.attainment)
      .sort((a, b) => (b.rate ?? 0) - (a.rate ?? 0));

    return { pendingGoals: pending, achievedGoals: achieved };
  }, [progress]);

  return (
    <div className="w-full mt-6 bg-white p-6 rounded-lg shadow-customShadow">
      {/* 날짜 네비게이션 */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex gap-1 items-center">
          <h2 className="text-base font-semibold">
            {parsedYear}년 {parsedMonth}월 {week_of_month}주차
          </h2>
          <h2 className="text-sm font-medium text-gray-400">{formattedDateRange}</h2>
        </div>
        <div className="flex items-center space-x-3">
          <button onClick={handlePrevDate} className="text-lg font-bold">
            <BsChevronLeft />
          </button>
          <button
            onClick={handleNextDate}
            className={`text-lg font-bold ${isNextDisabled ? "text-gray-300 cursor-not-allowed" : ""}`}
            disabled={isNextDisabled} // ✅ 버튼 자체도 비활성화
          >
            <BsChevronRight />
          </button>
        </div>
      </div>

      {/* 진행 중인 서브골 */}
      <ul className="space-y-4">
        {pendingGoals.map((goal, index) => (
          <li
            key={`${goal.subGoalName}-${index}`}
            className="bg-gray-50 px-4 py-3 rounded-md shadow-sm"
          >
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                <span className="font-medium flex items-center gap-1">
                  {goal.subGoalName}
                </span>
              </div>
              <span className="text-sm font-medium text-gray-600">
                {goal.rate}%
              </span>
            </div>
            <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
              <div
                className={`h-3 rounded-full transition-all duration-300 ${slotColors[goal.slotNum] || "bg-gray-400"
                  }`}
                style={{
                  width: `${goal.rate}%`,
                }}
              />
            </div>
          </li>
        ))}
      </ul>

      {/* 달성된 서브골 */}
      {achievedGoals.length > 0 && (
        <div className="mt-8">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700 pb-2 border-b border-gray-200 mb-4">
            <MdVerified className="text-green-500 text-xl" />
            달성된 서브골
          </h3>
          <div className="flex flex-wrap gap-2">
            {achievedGoals.map((goal) => (
              <span
                key={goal.id}
                className={`inline-flex items-center gap-1 text-sm font-medium px-3 py-1 rounded-full transition ${slotColors[goal.slotNum]} bg-opacity-20`}
                style={{
                  color: slotTextColors[goal.slotNum],
                }}
              >
                <MdVerified />
                {goal.subGoalName}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
