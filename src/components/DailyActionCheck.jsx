import { useState, useMemo, useEffect } from "react";
import dayjs from "dayjs";

export default function DailyActionCheck({
    dailyActionId,
    dailyActionTitle,
    dailyActionTargetNum,
    dailyActionContent,
    checkedDate,
    color,
    onUpdateCheckedDate
}) {
    const days = ["월", "화", "수", "목", "금", "토", "일"];

    // checkedDate -> 요일 index 배열로 변환
    const initialCheckedDays = useMemo(() => {
        return checkedDate.map((date) => {
            const dayIndex = new Date(date).getDay(); // 0(일)~6(토)
            return dayIndex === 0 ? 6 : dayIndex - 1; // 월=0 ... 일=6
        });
    }, [checkedDate]);

    // 상태로 관리하여 클릭 시 토글 가능하도록 설정
    const [checkedDays, setCheckedDays] = useState(initialCheckedDays);

    // props가 바뀌면 로컬 state도 동기화
    useEffect(() => {
        setCheckedDays(initialCheckedDays);
    }, [initialCheckedDays]);

    const toDates = (dayIdxList) => {
        const today = new Date();
        const todayIdx = today.getDay() === 0 ? 6 : today.getDay() - 1;

        return dayIdxList.map((dayIdx) => {
            const diff = dayIdx - todayIdx;
            const newDate = new Date(today);
            newDate.setDate(today.getDate() + diff);
            return dayjs(newDate).format("YYYY-MM-DD");
        });
    };

    const toggleDay = (index) => {
        // 다음 상태를 먼저 계산 (setState updater 내부에서 부모 업데이트 호출 X)
        const updated = checkedDays.includes(index)
            ? checkedDays.filter((day) => day !== index)
            : [...checkedDays, index];

        setCheckedDays(updated);

        const updatedDates = toDates(updated);
        onUpdateCheckedDate?.(dailyActionId, updatedDates);
    };

    return (
        <div className="p-4 mb-2">
            <div className="flex justify-between items-center">
                <h3 className="font-bold text-sm mb-1">{dailyActionTitle}</h3>
                <div className="bg-customMain text-[10px] font-medium py-1 px-2 rounded-md text-white">
                    {dailyActionTargetNum}회
                </div>
            </div>
            <p className="text-gray-600 text-xs">{dailyActionContent}</p>
            <div className="flex justify-between mt-2">
                {days.map((day, index) => (
                    <div key={index} className="flex flex-col items-center">
                        <span className="text-xs mb-1">{day}</span>
                        <button
                            className={`w-6 h-6 rounded-md ${checkedDays.includes(index) ? `${color}` : "bg-gray-200"
                                }`}
                            onClick={() => toggleDay(index)}
                        ></button>
                    </div>
                ))}
            </div>
        </div>
    );
}
