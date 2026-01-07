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

    // ✅ 최초 1회: 메인골 목록만 로드 (깜빡임 방지, 대표데이터 로직과 분리)
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

    // ✅ URL이 바뀔 때마다(새로고침 포함) 해당 URL 기준으로 홈 데이터 로드
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

    // ✅ 드롭다운 선택 시: fetch 직접 호출 X, URL만 변경
    const handleSelectGoal = (goal) => {
        setSearchParams({ mainGoalId: String(goal.id) }); // push (뒤로가기 가능)
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


    // // 홈 데이터 불러오기
    // const fetchHomeData = async (goalId) => {
    //     try {
    //         setLoading(true);

    //         // goalId가 있으면 params 포함, 없으면 params 없이 호출
    //         const response = goalId
    //             ? await api.get("/api/home", { params: { mainGoalId: goalId } })
    //             : await api.get("/api/home");

    //         const data = response.data.data;

    //         // 메인골이 없는 경우 처리
    //         if (!data.mainGoal) {
    //             // 기존 goals 상태 초기화
    //             setGoals([]);
    //             setCurrentGoalId(null);
    //             return;    // 에러로 가지 않도록 종료
    //         }

    //         // API 구조에 맞게 데이터 가공
    //         const newGoal = {
    //             mainGoal: {
    //                 id: data.mainGoal.id,
    //                 name: data.mainGoal.name,
    //                 lastAchievement: data.mainGoal.lastAchievement,
    //                 thisAchievement: data.mainGoal.thisAchievement,
    //             },
    //             subGoals: data.subGoals,
    //             progress: data.progress
    //         };

    //         setGoals((prev) => {
    //             // 이미 있는 goalId면 교체, 없으면 추가
    //             const exists = prev.find((g) => g.mainGoal.id === newGoal.mainGoal.id);
    //             if (exists) {
    //                 return prev.map((g) => g.mainGoal.id === newGoal.mainGoal.id ? newGoal : g);
    //             }
    //             return [...prev, newGoal];
    //         });

    //         if (!goalId) {
    //             setCurrentGoalId(data.mainGoal.id);
    //         }

    //     } catch (err) {
    //         console.error("홈 데이터 불러오기 실패:", err);
    //         setError("홈 데이터를 불러오는 중 문제가 발생했습니다.");
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    // useEffect(() => {
    //     // 첫 진입 시에는 params 없이 호출
    //     (async () => {
    //         try {
    //             setLoading(true);
    //             const list = await fetchMainGoals(); // 메인골 목록도 불러오기
    //             console.log(list);

    //             // URL에 mainGoalId 있으면 그걸 우선
    //             if (urlGoalId) {
    //                 setCurrentGoalId(urlGoalId);
    //             } else if (list.length > 0) {
    //                 // 없으면 일단 첫 메인골로 (원하면 null 두고 /api/home 대표 호출로 시작해도 됨)
    //                 setCurrentGoalId(list[0].id);
    //             } else {
    //                 // 메인골 자체 없음
    //                 setCurrentGoalId(null);
    //             }
    //         } catch (err) {
    //             console.error(err);
    //             setError("메인골 목록을 불러오는 중 문제가 발생했습니다.");
    //         } finally {
    //             setLoading(false);
    //         }
    //     })();
    // }, []);

    // // // currentGoalId가 바뀔 때마다 홈데이터 새로 불러오기
    // useEffect(() => {
    //     fetchHomeData();
    // }, []);

    // // URL이 바뀌면(뒤로가기/앞으로가기 포함) 상태도 따라가게
    // useEffect(() => {
    //     if (urlGoalId && currentGoalId !== urlGoalId) {
    //         setCurrentGoalId(urlGoalId);
    //     }
    //     // urlGoalId가 null로 바뀌는 경우까지 엄격히 처리하고 싶으면 추가 로직 넣으면 됨
    // }, [urlGoalId]);

    // // currentGoalId 기준으로 홈 데이터 패치 + URL 갱신
    // useEffect(() => {
    //     (async () => {
    //         try {
    //             setError(null);
    //             setLoading(true);

    //             if (currentGoalId) {
    //                 // 상태 → URL 동기화
    //                 setSearchParams({ mainGoalId: String(currentGoalId) }, { replace: true });
    //                 await fetchHomeData(currentGoalId);
    //             } else {
    //                 // 선택된 메인골 없으면 대표 메인골로 요청 (서버 정책에 맞게)
    //                 await fetchHomeData();
    //             }
    //         } catch (e) {
    //             console.error(e);
    //             setError("홈 데이터를 불러오는 중 문제가 발생했습니다.");
    //         } finally {
    //             setLoading(false);
    //         }
    //     })();
    // }, [currentGoalId]);

    // const currentData = goals.find(goal => goal.mainGoal.id === currentGoalId);

    // const handleCreateMainGoal = () => {
    //     navigate("/createmyart");
    // };

    // if (loading) {
    //     return (
    //         <div className="flex items-center justify-center min-h-screen">
    //             <p>로딩 중...</p>
    //         </div>
    //     );
    // }

    // if (error) {
    //     return (
    //         <div className="flex items-center justify-center min-h-screen">
    //             <p className="text-red-500">{error}</p>
    //         </div>
    //     );
    // }


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
                        <CheckList title={homeData.mainGoal.name} mainGoalId={homeData.mainGoal.id} subGoals={homeData.subGoals} />
                    </>
                )}
            </div>

            {/* 네비게이션바 */}
            <Navbar initialActiveNav={1} />
        </div>
    );
}
