import React, { useEffect, useState } from "react";
import "@Guide/Guide.scss"; // Import CSS for styling
import guide_kv from "@/assets/guide/guide_kv.png";
import apply_template_1 from "@/assets/guide/apply_template_6.png";
import apply_template_2 from "@/assets/guide/apply_template_7.png";
import apply_template_3 from "@/assets/guide/apply_template_8.png";
import qa_check_1 from "@/assets/guide/qa_check_1.png";
import qa_check_2 from "@/assets/guide/qa_check_2.png";
import qa_check_3 from "@/assets/guide/qa_check_3.png";
import localization_guide_1 from "@/assets/guide/localization_guide_1.png";
import localization_guide_2 from "@/assets/guide/localization_guide_2.png";
import localization_guide_3 from "@/assets/guide/localization_guide_3.png";
import localization_guide_4 from "@/assets/guide/localization_guide_4.png";
import localization_guide_5 from "@/assets/guide/localization_guide_5.png";
import localization_guide_6 from "@/assets/guide/localization_guide_6.png";
import localization_guide_7 from "@/assets/guide/localization_guide_7.png";
import localization_guide_8 from "@/assets/guide/localization_guide_8.png";
import localization_guide_9 from "@/assets/guide/localization_guide_9.png";
import localization_guide_10 from "@/assets/guide/localization_guide_10.png";
import localization_guide_11 from "@/assets/guide/localization_guide_11.png";
import localization_guide_12 from "@/assets/guide/localization_guide_12.png";
import localization_guide_13 from "@/assets/guide/localization_guide_13.png";
import localization_guide_14 from "@/assets/guide/localization_guide_14.png";
import localization_guide_15 from "@/assets/guide/localization_guide_15.png";
import firewall_setting1 from "@/assets/guide/firewall_setting1.png";

import createTemplate from "@/assets/guide/create-template.png";
import fileUpload from "@/assets/guide/file-upload.png";
import codeCheck from "@/assets/guide/code-check.png";

const Guide = () => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    if (window.scrollY > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth", // Smooth scrolling effect
    });
  };

  useEffect(() => {
    window.addEventListener("scroll", toggleVisibility);

    return () => window.removeEventListener("scroll", toggleVisibility); // Cleanup event listener on unmount
  }, []);

  return (
    <div className="guide-container">
      <img className="img_guide_kv" src={guide_kv} />

      <nav className="anchor-nav">
        <ul>
          <li>
            <a href="#section1">방화벽 신청</a>
          </li>
          <li>
            <a href="#section2">템플릿 세팅</a>
          </li>
          <li>
            <a href="#section3">템플릿 적용</a>
          </li>
          <li>
            <a href="#section4">QA</a>
          </li>
          <li>
            <a href="#section5">번역 텍스트파일 생성</a>
          </li>
        </ul>
      </nav>
      <div id="section1" className="guide-section">
        <h2 className="guide_title">방화벽 신청</h2>
        <h5>
          knox email {`>`} CPT System {`>`} IOPS(FireWall) {`>`} 신규 방화벽 신청{" "}
        </h5>
        <br />
        <li>구성 방식 : pc - 서버</li>
        <li>신청 사유 : 자사 개발 프로그램 사용 및 운영</li>
        <li>수신자 : 김영민 혹은 안다희 검색 후 선택</li>
        <li>구분 : TCP</li>
        <li>출발지 IP 대역 : 제일기획_수원_자회사방화벽_내부대역 | 목적지 IP 대역 : 제일기획_수원_자회사방화벽_서버대역</li>
        <li>결제자 : '김석경'팀 리더 추가 후 선택</li>
        <img className="firewall_img_guide" src={firewall_setting1} />
      </div>

      <div id="section2" className="guide-section">
        <h2 className="guide_title">템플릿 세팅 가이드</h2>
        <img className="img_guide" src={createTemplate} />
        <li>① 지라 티켓 번호, ② 작업 페이지 URL 입력 후 ③ 확인버튼을 누릅릅니다.</li>
        <br />
        <br />
        <br />
        <img className="img_guide" src={fileUpload} />
        <li>이후 ④ AS-WAW / TO-BE 코드가 있는 텍스트 파일, ⑤ 벋역 텍스트 파일, ⑥ 원본 코드를 업로드합니다. </li>
        <br />
        <br />
        <br />
        <img className="img_guide" src={codeCheck} />
        <li>AS-WAS / TO-BE 코드를 확인 후 ⑦ 저장버튼을 누릅니다. 코드 수정이 필요한 경우 수정 후 저장버튼을 누릅니다.</li>
        <li>번역이 필요한 코드의 위치를 확인 후 ⑧ 템플릿 생성 버튼을 누르면 상단의 코드를 기반으로 템플릿이 생성됩니다.</li>
      </div>

      <div id="section3" className="guide-section">
        <h1 className="guide_title">코드 적용 가이드</h1>
        <h2 className="explain_h2">1. 템플릿 호출 방식</h2>
        <img className="img_guide" src={apply_template_1} />
        <h2 className="explain_h2">2. 템플릿 호출 되었을 때 화면 및 대상 파일 업로드화면</h2>
        <img className="img_guide" src={apply_template_2} />
        <h2 className="explain_h2">3. 템플릿 적용 대상 파일 업로드 시 화면</h2>
        <img className="img_guide" src={apply_template_3} />
      </div>
      <div id="section4" className="guide-section">
        <h2 className="guide_title">QA 가이드</h2>
        <h2 className="explain_h2">1. 템플릿 호출 방식</h2>
        <img className="img_guide" src={qa_check_1} />
        <h2 className="explain_h2">2. 템플릿 호출 되었을 때 화면</h2>
        <img className="img_guide" src={qa_check_2} />
        <h2 className="explain_h2">3. QA 대상 파일 업로드 시 화면</h2>
        <img className="img_guide" src={qa_check_3} />
      </div>
      <div id="section5" className="guide-section">
        <h1 className="guide_title">로컬라이제이션 가이드</h1>
        <img className="img_guide" src={localization_guide_1} />
        <img className="img_guide" src={localization_guide_2} />
        <img className="img_guide" src={localization_guide_3} />
        <img className="img_guide" src={localization_guide_4} />
        <img className="img_guide" src={localization_guide_5} />
        <img className="img_guide" src={localization_guide_6} />
        <img className="img_guide" src={localization_guide_7} />
        <img className="img_guide" src={localization_guide_8} />
        <img className="img_guide" src={localization_guide_9} />
        <img className="img_guide" src={localization_guide_10} />
        <img className="img_guide" src={localization_guide_11} />
        <img className="img_guide" src={localization_guide_12} />
        <img className="img_guide" src={localization_guide_13} />
        <h2 className="explain_h2">* 모든 시트가 병합될 때까지 6단계 반복</h2>
        <img className="img_guide" src={localization_guide_14} />
        <img className="img_guide" src={localization_guide_15} />
      </div>

      {/* 최상단으로 이동 버튼 */}
      {isVisible && (
        <button className="scroll-to-top" onClick={scrollToTop}>
          ↑ Top
        </button>
      )}
    </div>
  );
};

export default Guide;
