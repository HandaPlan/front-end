import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LogoHeader from "../components/LogoHeader";
import GoalSelectionDropdown from "../components/GoalSelectionDropdown";
import CompletionRate from "../components/CompletionRate";
import TowerCalendar from "../components/TowerCalendar";
import CheckList from "../components/CheckList";
import Navbar from "../components/Navbar";
import MottoCard from "../components/MottoCard";
import { useAuth } from "../contexts/AuthContext";
import api from "../api/axiosInstance";

export default function HomePage() {
    const navigate = useNavigate();
    const { user } = useAuth();

    // API 데이터 상태
    const [goals, setGoals] = useState([]); // mainGoal 리스트 저장
    const [mainGoals, setMainGoals] = useState([]);
    const [currentGoalId, setCurrentGoalId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);


    // 메인골 목록 불러오기
    const fetchMainGoals = async () => {
        try {
            const response = await api.get("/api/main-goals", {
                params: { state: "activity" }
            });
            const data = response.data.data.mainGoals;
            setMainGoals(data);

            // 첫 번째 메인골을 기본값으로 선택
            if (data.length > 0 && !currentGoalId) {
                setCurrentGoalId(data[0].id);
            }
        } catch (err) {
            console.error("메인골 목록 불러오기 실패:", err);
            setError("메인골 목록을 불러오는 중 문제가 발생했습니다.");
        }
    };

    // 홈 데이터 불러오기
    const fetchHomeData = async (goalId) => {
        try {
            setLoading(true);

            // goalId가 있으면 params 포함, 없으면 params 없이 호출
            const response = goalId
                ? await api.get("/api/home", { params: { mainGoalId: goalId } })
                : await api.get("/api/home");

            const data = response.data.data;

            // ⭐ 메인골이 없는 경우 처리
            if (!data.mainGoal) {
                // 기존 goals 상태 초기화
                setGoals([]);
                setCurrentGoalId(null);
                return;    // 에러로 가지 않도록 종료
            }

            // API 구조에 맞게 데이터 가공
            const newGoal = {
                mainGoal: {
                    id: data.mainGoal.id,
                    name: data.mainGoal.name,
                    lastAchievement: data.mainGoal.lastAchievement,
                    thisAchievement: data.mainGoal.thisAchievement,
                },
                subGoals: data.subGoals,
                progress: data.progress
            };
            console.log("📦 data.mainGoal:", data.mainGoal);


            setGoals((prev) => {
                // 이미 있는 goalId면 교체, 없으면 추가
                const exists = prev.find((g) => g.mainGoal.id === newGoal.mainGoal.id);
                if (exists) {
                    return prev.map((g) => g.mainGoal.id === newGoal.mainGoal.id ? newGoal : g);
                }
                return [...prev, newGoal];
            });

            if (!goalId) {
                setCurrentGoalId(data.mainGoal.id);
            }

        } catch (err) {
            console.error("홈 데이터 불러오기 실패:", err);
            setError("홈 데이터를 불러오는 중 문제가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // 첫 진입 시에는 params 없이 호출 → isRep=true 메인골 가져오기
        (async () => {
            try {
                await fetchMainGoals(); // 메인골 목록도 불러오기
            } catch (err) {
                console.error(err);
            }
        })();
    }, []);

    // currentGoalId가 바뀔 때마다 홈데이터 새로 불러오기
    useEffect(() => {
        fetchHomeData();
    }, []);

    const currentData = goals.find(goal => goal.mainGoal.id === currentGoalId);

    const handleCreateMainGoal = () => {
        navigate("/createmyart"); // 목적지 경로는 실제 라우터에 맞게 조정하세요.
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p>로딩 중...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-red-500">{error}</p>
            </div>
        );
    }


    return (
        <div className="flex flex-col items-center justify-start min-h-screen bg-white px-6">
            {/* LogoHeader 컴포넌트 */}
            <LogoHeader />

            {/* 메인 콘텐츠 영역 */}
            <div className="mt-20 mb-20 w-full">
                {/* 메인골이 없을 경우 대체 UI */}
                {!currentData ? (
                    <div className="w-full min-h-[calc(100vh-150px)] max-w-md text-center bg-gray-50 p-8 rounded-xl shadow-sm flex flex-col items-center justify-center">

                        {/* 로고 영역 */}
                        <img
                            src="/logo_5.png"
                            alt="Welcome Logo"
                            className="w-32 h-auto mb-8"
                        />

                        {/* 텍스트와 버튼 */}
                        <div>
                            <p className="text-xl font-semibold text-gray-800 mb-2">아직 메인골이 없어요</p>
                            <p className="text-base text-gray-600">당신의 첫 마이라트를 지금 바로 만들어보세요!</p>
                            <button
                                className="bg-customMain mt-10 text-white py-3 px-5 rounded-md shadow-lg text-sm font-bold"
                                onClick={handleCreateMainGoal}
                            >
                                마이라트 생성하러 가기
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* MottoCard 컴포넌트 */}
                        < MottoCard motto={user?.comment} />

                        {/* 목표 선택 드롭다운 */}
                        <GoalSelectionDropdown
                            goalName={currentData.mainGoal.name}
                            onSelectGoal={(goal) => {
                                setCurrentGoalId(goal.id);     // 상태 업데이트
                                fetchHomeData(goal.id);        // ✅ 직접 API 다시 호출
                            }}
                            goals={mainGoals}
                        />

                        {/* 달성률 섹션 */}
                        <CompletionRate
                            lastWeek={currentData.mainGoal.lastAchievement}
                            thisWeek={currentData.mainGoal.thisAchievement}
                        />

                        {/* 한다!탑섹션 */}
                        <div className="mt-6 w-full bg-white p-4 rounded-lg shadow-[0_4px_6px_rgba(0,0,0,0.05),0_-4px_6px_rgba(0,0,0,0.05)]">
                            <h3 className="text-base font-bold text-customTextBlack mb-2">한다! 공든 탑이 무너지랴</h3>
                            {/* strict 데이터를 ActivityCalendar로 전달 */}
                            <TowerCalendar progress={currentData.progress} mainGoalId={currentData.mainGoal.id} />
                        </div>

                        {/* 체크리스트 섹션 */}
                        <CheckList title={currentData.mainGoal.name} mainGoalId={currentData.mainGoal.id} subGoals={currentData.subGoals} />
                    </>
                )}
            </div>

            {/* 네비게이션바 */}
            <Navbar initialActiveNav={1} />
        </div>
    );
}
