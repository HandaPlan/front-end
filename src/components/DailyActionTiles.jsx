import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import hexToColorClass from "../constants/colorMappings";
import GoalTile from "./GoalTile";
import BottomModalLayout from "./BottomModalLayout";
import Input from "./Input";
import { BsFillPlusCircleFill, BsDashCircleFill } from "react-icons/bs";
import api from "../api/axiosInstance";

export default function DailyActionTiles({ title, dailyActions, color, importedGoal, mainGoalId, subGoalId, onDailyActionCreated }) {
    const navigate = useNavigate();
    const [showAddModal, setShowAddModal] = useState(false);
    const [titleError, setTitleError] = useState("");
    const [contentError, setContentError] = useState("");


    // 입력 상태
    const [titleInput, setTitle] = useState("");
    const [contentInput, setContent] = useState("");
    const [routine, setRoutine] = useState(1);

    // importedGoal이 존재하면 초기값으로 설정
    useEffect(() => {
        if (importedGoal) {
            setTitle(importedGoal.title || "");
            setContent(importedGoal.content || "");
            setRoutine(importedGoal.targetNum || 1);
            setShowAddModal(true); // 자동으로 모달도 열리게
        }
    }, [importedGoal]);

    const handleSave = async () => {
        let hasError = false;

        if (titleInput.trim() === "") {
            setTitleError("제목 값은 필수 값입니다.");
            hasError = true;
        } else {
            setTitleError("");
        }

        if (contentInput.trim() === "") {
            setContentError("내용 값은 필수 값입니다.");
            hasError = true;
        } else {
            setContentError("");
        }

        if (hasError) return;

        try {
            // ✅ API 요청 보내기
            const response = await api.post(`/api/sub-goals/${subGoalId}/daily-actions`, {
                title: titleInput,
                content: contentInput,
                targetNum: routine
            });

            if (response.data.code === "200") {
                const newDailyAction = response.data.data;

                // ✅ 부모 컴포넌트 상태 갱신 (콜백)
                if (onDailyActionCreated) {
                    onDailyActionCreated(newDailyAction);
                }

                // 입력값 초기화
                setTitle("");
                setContent("");
                setRoutine(1);

                closeAddModal();
            } else {
                alert("데일리 액션 생성에 실패했습니다.");
            }
        } catch (error) {
            console.error("데일리 액션 생성 오류:", error);
            alert("데일리 액션 생성 중 오류가 발생했습니다.");
        }
    };


    const addTileClick = () => {
        setTitle(""); // 직접 추가할 땐 초기화
        setContent("");
        setRoutine(1);
        setShowAddModal(true);
    };

    const closeAddModal = () => {
        setShowAddModal(false);
        setTitleError(""); // 에러 초기화
    };

    const cloneButtonClick = () => {
        setShowAddModal(false);
        setTimeout(() => {
            navigate('/importclone', { state: { type: 'dailyaction', mainGoalId, subGoalId } });
        }, 300);
    };

    const idLayout = [
        ["0", "1", "2"], // index 0,1,2
        ["7", "t", "3"], // index 7,3
        ["6", "5", "4"], // index 6,5,4
    ];

    // id 기준으로 정렬된 dailyActions
    const sortedActions = [...dailyActions].sort((a, b) => a.id - b.id);

    return (
        <div className="flex flex-col items-center justify-center">
            <div className="w-4/5 h-auto grid grid-cols-3 gap-3 justify-items-center items-center my-5">
                {idLayout.flat().map((cell, index) => {
                    if (cell === "t") {
                        return <GoalTile key={`title-${index}`} text={title} color={color} />;
                    }

                    const actionIndex = parseInt(cell, 10); // cell에 적힌 숫자를 actionIndex로 사용
                    const action = sortedActions[actionIndex];

                    if (action) {
                        if (action.attainment === true) {
                            return (
                                <button
                                    key={`goal-${action.id}`}
                                    className="w-full"
                                >
                                    <GoalTile
                                        text={action.title}
                                        color={color}
                                        type="achievement"
                                        goal="dailyAction"
                                    />
                                </button>
                            );
                        };
                        return (
                            <button key={`goal-${action.id}`} className="w-full">
                                <GoalTile text={action.title} color={color} type="dailyaction" />
                            </button>
                        );
                    }

                    return (
                        <button key={`add-${index}`} className="w-full">
                            <GoalTile type="empty" />
                        </button>
                    );
                })}
            </div>

            <button
                className={`p-3 m-1 text-xs font-semibold rounded-md 
                    ${dailyActions.length >= 8
                        ? "bg-gray-100 text-customTextGray cursor-not-allowed"
                        : "bg-customMain text-white"}`}
                onClick={addTileClick}
                disabled={dailyActions.length >= 8} // ✅ 8개 이상이면 비활성화
            >
                데일리 액션 추가 생성하기
            </button>

            <BottomModalLayout isOpen={showAddModal} onClose={closeAddModal}>
                <div className="p-6 text-center">
                    {/* 제목 수정 */}
                    <div className="flex justify-between">
                        <h2 className="text-base font-bold mb-4 text-center">Daily Action 생성</h2>
                        <button
                            className="p-3 w-24 text-xs font-normal bg-customMain text-white rounded-md"
                            onClick={cloneButtonClick}
                        >
                            가져오기
                        </button>
                    </div>

                    {/* 제목 입력 */}
                    <div className="text-left">
                        <Input
                            id="title"
                            type="text"
                            label={"Daily Action 제목"}
                            value={titleInput}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Daily Action 제목을 입력하세요"
                            required={true}
                            error={titleError}
                        />
                    </div>

                    {/* 데일리 액션 내용 입력 */}
                    <div className="text-left">
                        <Input
                            id="content"
                            type="text"
                            label={"Daily Action을 입력해주세요"}
                            value={contentInput}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Daily Action 내용을 입력하세요"
                            required={true}
                            error={contentError}
                        />
                    </div>

                    {/* 루틴 수정 */}
                    <div className="flex justify-between mt-6 text-left">
                        <label className="block text-sm font-medium text-customTextBlack">
                            일주일 목표 진행 횟수<span className="text-red-500">*</span>
                        </label>
                        <div className="flex justify-between items-center gap-4">
                            {/* 마이너스 버튼 */}
                            <button
                                type="button"
                                onClick={() => setRoutine(prev => Math.max(prev - 1, 1))}
                                disabled={routine === 1}
                            >
                                <BsDashCircleFill
                                    className={`text-2xl ${routine === 1 ? "text-gray-300" : "text-customMain"
                                        }`}
                                />
                            </button>

                            {/* 현재 routine 값 표시 */}
                            <span className="text-base font-medium">{routine}</span>

                            {/* 플러스 버튼 */}
                            <button
                                type="button"
                                onClick={() => setRoutine(prev => Math.min(prev + 1, 7))}
                                disabled={routine === 7}
                            >
                                <BsFillPlusCircleFill
                                    className={`text-2xl ${routine === 7 ? "text-gray-300" : "text-customMain"
                                        }`}
                                />
                            </button>
                        </div>
                    </div>
                    {/* 버튼 그룹 */}
                    <div className="mt-6 flex justify-center space-x-4">
                        <button
                            className="p-2 text-xs font-normal w-24 bg-gray-100 text-gray-400 rounded-md"
                            onClick={closeAddModal}
                        >
                            취소
                        </button>
                        <button
                            className="p-3 w-24 text-xs font-normal bg-customMain text-white rounded-md"
                            onClick={handleSave}
                        >
                            저장
                        </button>
                    </div>
                </div>
            </BottomModalLayout>
        </div>
    );
}
