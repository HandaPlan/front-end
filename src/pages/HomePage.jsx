import { useState, useMemo, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
    const [searchParams, setSearchParams] = useSearchParams();
    const { user } = useAuth();

    // API 데이터 상태
    const [goals, setGoals] = useState([]); // mainGoal 리스트 저장
    const [mainGoals, setMainGoals] = useState([]);
    const [homeData, setHomeData] = useState(null);
    const [currentGoalId, setCurrentGoalId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // URL에서 mainGoalId 읽기
    const urlGoalId = useMemo(() => {
        const v = searchParams.get("mainGoalId");
        const n = v ? Number(v) : null;
        return Number.isFinite(n) ? n : null;
    }, [searchParams]);

    // 메인골 목록 불러오기
    const fetchMainGoals = async () => {
        const response = await api.get("/api/home/main-goals");
        const data = response.data.data;
        setMainGoals(data);
        return data;
    };

    // 홈 데이터 불러오기 (✅ 여기서는 상태를 건드리지 말고 데이터만 return)
    const fetchHomeData = async (goalId) => {
        const response = goalId
            ? await api.get("/api/home", { params: { mainGoalId: goalId } })
            : await api.get("/api/home");

        const data = response.data.data;

        // 메인골이 없는 경우
        if (!data.mainGoal) {
            return null;
        }

        return {
            mainGoal: {
                id: data.mainGoal.id,
                name: data.mainGoal.name,
                lastAchievement: data.mainGoal.lastAchievement,
                thisAchievement: data.mainGoal.thisAchievement,
            },
            subGoals: data.subGoals,
            progress: data.progress,
        };
    };

    // 최초 메인골 목록만 로드
    useEffect(() => {
        (async () => {
            try {
                await fetchMainGoals();
            } catch (e) {
                console.error(e);
                setError("메인골 목록을 불러오는 중 문제가 발생했습니다.");
            }
        })();
    }, []);

    // URL이 바뀔 때마다(새로고침 포함) 해당 URL 기준으로 홈 데이터 로드
    useEffect(() => {
        (async () => {
            try {
                setError(null);
                setLoading(true);

                const result = await fetchHomeData(urlGoalId); // urlGoalId가 null이면 대표 호출
                setHomeData(result);

                // ✅ 만약 URL에 mainGoalId가 있는데 서버가 mainGoal 없다고 주면, URL 정리
                if (urlGoalId && !result) {
                    setSearchParams({}, { replace: true });
                }
            } catch (e) {
                console.error(e);
                setError("홈 데이터를 불러오는 중 문제가 발생했습니다.");
            } finally {
                setLoading(false);
            }
        })();
        // urlGoalId가 바뀔 때만 실행
    }, [urlGoalId, setSearchParams]);

    const handleCreateMainGoal = () => {
        navigate("/createmyart");
    };

    // 홈 데이터만 다시 불러오는 refetch 함수
    const refetchHomeData = async () => {
        try {
            setError(null);
            setLoading(true);

            const result = await fetchHomeData(urlGoalId);
            setHomeData(result);

            if (urlGoalId && !result) {
                setSearchParams({}, { replace: true });
            }
        } catch (e) {
            console.error(e);
            setError("홈 데이터를 불러오는 중 문제가 발생했습니다.");
        } finally {
            setLoading(false);
        }
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
                {!homeData ? (
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
                            goalName={homeData.mainGoal.name}
                            onSelectGoal={(goal) => setSearchParams({ mainGoalId: String(goal.id) })}
                            goals={mainGoals}
                        />

                        {/* 달성률 섹션 */}
                        <CompletionRate
                            lastWeek={homeData.mainGoal.lastAchievement}
                            thisWeek={homeData.mainGoal.thisAchievement}
                        />

                        {/* 한다!탑섹션 */}
                        <div className="mt-6 w-full bg-white p-4 rounded-lg shadow-[0_4px_6px_rgba(0,0,0,0.05),0_-4px_6px_rgba(0,0,0,0.05)]">
                            <h3 className="text-base font-bold text-customTextBlack mb-2">한다! 공든 탑이 무너지랴</h3>
                            {/* strict 데이터를 ActivityCalendar로 전달 */}
                            <TowerCalendar progress={homeData.progress} mainGoalId={homeData.mainGoal.id} />
                        </div>

                        {/* 체크리스트 섹션 */}
                        <CheckList
                            title={homeData.mainGoal.name}
                            mainGoalId={homeData.mainGoal.id}
                            subGoals={homeData.subGoals}
                            onSaved={refetchHomeData}
                        />
                    </>
                )}
            </div>

            {/* 네비게이션바 */}
            <Navbar initialActiveNav={1} />
        </div>
    );
}
