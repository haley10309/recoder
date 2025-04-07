import React, { useEffect, useState } from 'react';
import '@Guide/Guide.scss'; // Import CSS for styling
import guide_kv from '@/assets/guide/guide_kv.png';
import create_template_nav from '@/assets/guide/create_template_nav.png';
import create_template_1 from '@/assets/guide/create_template_1.png';
import create_template_asset from '@/assets/guide/create_template_asset.png';
import create_template_whole_ready from '@/assets/guide/create_template_whole_ready.png';
import tobe_applied_1 from '@/assets/guide/tobe_applied_6.png';
import tobe_applied_2 from '@/assets/guide/tobe_applied_7.png';
import tobe_applied_3 from '@/assets/guide/tobe_applied_8.png';
import qa_check_1 from '@/assets/guide/qa_check_1.png';
import qa_check_2 from '@/assets/guide/qa_check_2.png';
import qa_check_3 from '@/assets/guide/qa_check_3.png';
import localization_guide_1 from '@/assets/guide/localization_guide_1.png';
import localization_guide_2 from '@/assets/guide/localization_guide_2.png';
import localization_guide_3 from '@/assets/guide/localization_guide_3.png';
import localization_guide_4 from '@/assets/guide/localization_guide_4.png';
import localization_guide_5 from '@/assets/guide/localization_guide_5.png';
import localization_guide_6 from '@/assets/guide/localization_guide_6.png';
import localization_guide_7 from '@/assets/guide/localization_guide_7.png';
import localization_guide_8 from '@/assets/guide/localization_guide_8.png';
import localization_guide_9 from '@/assets/guide/localization_guide_9.png';
import localization_guide_10 from '@/assets/guide/localization_guide_10.png';
import localization_guide_11 from '@/assets/guide/localization_guide_11.png';
import localization_guide_12 from '@/assets/guide/localization_guide_12.png';
import localization_guide_13 from '@/assets/guide/localization_guide_13.png';
import localization_guide_14 from '@/assets/guide/localization_guide_14.png';
import localization_guide_15 from '@/assets/guide/localization_guide_15.png';
import firewall_setting1 from '@/assets/guide/firewall_setting1.png';

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
            behavior: 'smooth' // Smooth scrolling effect
        });
    };

    useEffect(() => {
        window.addEventListener('scroll', toggleVisibility);
        
        return () => window.removeEventListener('scroll', toggleVisibility); // Cleanup event listener on unmount
    }, []);

    return (
        <div className="guide-container">
            <img className='img_guide_kv' src={guide_kv}/>
            
            <nav className="anchor-nav">
                <ul>
                <li><a href="#section1">방화벽 신청 가이드</a></li>
                    <li><a href="#section2">템플릿 세팅 가이드</a></li>
                    <li><a href="#section3">코드 적용 가이드</a></li>
                    <li><a href="#section4">QA 가이드</a></li>
                    <li><a href="#section5">로컬라이제이션 가이드</a></li>
                </ul>
            </nav>
            <div id="section1" className="guide-section">
                <h2 className='guide_title'>방화벽 신청</h2>
                {/* <p>여기에서는 파일을 어떻게 업로드하는지에 대한 설명이 들어갑니다.</p> */}
                <img className='img_guide' src={firewall_setting1}/>
                
            </div>

            
            <div id="section2" className="guide-section">
                <h2 className='guide_title'>템플릿 세팅 가이드</h2>
                {/* <p>여기에서는 파일을 어떻게 업로드하는지에 대한 설명이 들어갑니다.</p> */}
                <img className='img_guide' src={create_template_nav}/>
                
            </div>

             
             <div id="section3" className="guide-section">
                <h1 className='guide_title'>코드 적용 가이드</h1>
                <h2 className='explain_h2'>1. 템플릿 호출 방식</h2>
                <img className='img_guide' src={tobe_applied_1}/>
                <h2 className='explain_h2'>2. 템플릿 호출 되었을 때 화면 및 대상 파일 업로드화면</h2>
                <img className='img_guide' src={tobe_applied_2}/>
                <h2 className='explain_h2'>3. 템플릿 적용 대상 파일 업로드 시 화면</h2>
                <img className='img_guide' src={tobe_applied_3}/>
                
            </div>
            <div id="section4" className="guide-section">
                <h2 className='guide_title'>QA 가이드</h2>
                <h2 className='explain_h2'>1. 템플릿 호출 방식</h2>
                <img className='img_guide' src={qa_check_1}/>
                <h2 className='explain_h2'>2. 템플릿 호출 되었을 때 화면</h2>
                <img className='img_guide' src={qa_check_2}/>
                <h2 className='explain_h2'>3. QA 대상 파일 업로드 시 화면</h2>
                <img className='img_guide' src={qa_check_3}/>
                
                
            </div>
            <div id="section5" className="localization-section">
                <h1 className='guide_title'>로컬라이제이션 가이드</h1>
                <img className='img_guide' src={localization_guide_1}/>
                <img className='img_guide' src={localization_guide_2}/>
                <img className='img_guide' src={localization_guide_3}/>
                <img className='img_guide' src={localization_guide_4}/>
                <img className='img_guide' src={localization_guide_5}/>
                <img className='img_guide' src={localization_guide_6}/>
                <img className='img_guide' src={localization_guide_7}/>
                <img className='img_guide' src={localization_guide_8}/>
                <img className='img_guide' src={localization_guide_9}/>
                <img className='img_guide' src={localization_guide_10}/>
                <img className='img_guide' src={localization_guide_11}/>
                <img className='img_guide' src={localization_guide_12}/>
                <img className='img_guide' src={localization_guide_13}/>
                <h2 className='explain_h2'>* 모든 시트가 병합될 때까지 6단계 반복</h2>
                <img className='img_guide' src={localization_guide_14}/>
                <img className='img_guide' src={localization_guide_15}/>


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