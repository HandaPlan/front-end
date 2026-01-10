import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css'; // 기본 CSS 스타일
import 'swiper/css/pagination'; // Pagination 스타일
import { Pagination, Autoplay } from 'swiper/modules';
import { Link } from 'react-router-dom';
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { isAccessTokenValid } from "../utils/auth";

export default function WelcomePage() {
    const [isMobile, setIsMobile] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (isAccessTokenValid()) {
            navigate("/home");
        }
    }, [navigate]);

    useEffect(() => {
        const checkDevice = () => {
            const isMobileDevice =
                window.innerWidth <= 768 || /Mobi|Android/i.test(navigator.userAgent);
            setIsMobile(isMobileDevice);
        };

        checkDevice();
        window.addEventListener("resize", checkDevice);
        return () => window.removeEventListener("resize", checkDevice);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-white px-6">
            {/* 로고 영역 */}
            <img
                src="/logo_2.png"
                alt="Welcome Logo"
                className="w-32 h-auto"
            />

            {/* 서비스 소개 영역 */}
            <div className="w-full aspect-[10/13] bg-white flex items-center justify-center mb-10">
                <Swiper
                    modules={[Pagination, Autoplay]}
                    spaceBetween={20}
                    slidesPerView={1}
                    pagination={{
                        clickable: true,
                        bulletClass:
                            "swiper-pagination-bullet !bg-gray-300 opacity-50 transition-all duration-300 ease-in-out shadow-sm",
                        bulletActiveClass:
                            "!bg-purple-500 !opacity-100 shadow-md", // 활성 슬라이드 스타일
                    }}
                    autoplay={{
                        delay: 3000,
                        disableOnInteraction: false, // 유저가 터치해도 자동 슬라이드 유지
                    }}
                    className="w-full h-full"
                >
                    {/* 슬라이드 1 */}
                    <SwiperSlide>
                        <div className="flex flex-col items-center justify-center h-full">
                            <img
                                src="/ServicePage1.png"
                                alt="Service_1"
                                className="w-full max-w-[420px] h-auto mb-8 object-contain"
                                style={{ imageRendering: "-webkit-optimize-contrast" }}
                            />
                        </div>
                    </SwiperSlide>

                    {/* 슬라이드 2 */}
                    <SwiperSlide>
                        <div className="flex flex-col items-center justify-center h-full">
                            <img
                                src="/ServicePage2.png"
                                alt="Service_2"
                                className="w-full max-w-[420px] h-auto mb-8 object-contain"
                                style={{ imageRendering: "-webkit-optimize-contrast" }}
                            />
                        </div>
                    </SwiperSlide>

                    {/* 슬라이드 3 */}
                    <SwiperSlide>
                        <div className="flex flex-col items-center justify-center h-full">
                            <img
                                src="/ServicePage3.png"
                                alt="Service_3"
                                className="w-full max-w-[420px] h-auto mb-8 object-contain"
                                style={{ imageRendering: "-webkit-optimize-contrast" }}
                            />
                        </div>
                    </SwiperSlide>

                    {/* 슬라이드 4 */}
                    <SwiperSlide>
                        <div className="flex flex-col items-center justify-center h-full">
                            <img
                                src="/ServicePage4.png"
                                alt="Service_4"
                                className="w-full max-w-[420px] h-auto mb-8 object-contain"
                                style={{ imageRendering: "-webkit-optimize-contrast" }}
                            />
                        </div>
                    </SwiperSlide>
                </Swiper>
            </div>

            {/* 로그인 및 회원가입 버튼 영역 */}
            <div className="flex justify-center gap-6 text-sm text-customTextGray">
                <Link to='/signup'>회원가입</Link>
                |
                <Link to='/login'>이메일 로그인</Link>
            </div>
        </div>
    );
}
