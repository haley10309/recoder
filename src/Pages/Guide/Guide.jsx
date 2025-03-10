import React, { useEffect, useState } from 'react';
import './Guide.scss'; // Import CSS for styling
import guide_kv from '../../assets/guide/guide_kv.png';
import create_template_nav from '../../assets/guide/create_template_nav.png';
import create_template_1 from '../../assets/guide/create_template_1.png';
import create_template_asset from '../../assets/guide/create_template_asset.png';
import create_template_whole_ready from '../../assets/guide/create_template_whole_ready.png';
import tobe_applied_1 from '../../assets/guide/tobe_applied_6.png';
import tobe_applied_2 from '../../assets/guide/tobe_applied_7.png';
import tobe_applied_3 from '../../assets/guide/tobe_applied_8.png';
import qa_check_1 from '../../assets/guide/qa_check_1.png';
import qa_check_2 from '../../assets/guide/qa_check_2.png';
import qa_check_3 from '../../assets/guide/qa_check_3.png';



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
                    <li><a href="#section1">템플릿 세팅 가이드</a></li>
                    <li><a href="#section2">코드 적용 가이드</a></li>
                    <li><a href="#section3">QA 가이드</a></li>
                </ul>
            </nav>

            {/* Sections with corresponding IDs */}
            <div id="section1" className="guide-section">
                <h2 className='guide_title'>템플릿 세팅 가이드</h2>
                {/* <p>여기에서는 파일을 어떻게 업로드하는지에 대한 설명이 들어갑니다.</p> */}
                <img className='img_guide' src={create_template_nav}/>
                {/* More content */}
            </div>

             {/* Other sections remain unchanged */}
             <div id="section2" className="guide-section">
                <h1 className='guide_title'>코드 적용 가이드</h1>
                <h2 className='explain_h2'>1. 템플릿 호출 방식</h2>
                <img className='img_guide' src={tobe_applied_1}/>
                <h2 className='explain_h2'>2. 템플릿 호출 되었을 때 화면 및 대상 파일 업로드화면</h2>
                <img className='img_guide' src={tobe_applied_2}/>
                <h2 className='explain_h2'>3. 템플릿 적용 대상 파일 업로드 시 화면</h2>
                <img className='img_guide' src={tobe_applied_3}/>
                {/* More content */}
            </div>
            <div id="section3" className="guide-section">
                <h2 className='guide_title'>QA 가이드</h2>
                <h2 className='explain_h2'>1. 템플릿 호출 방식</h2>
                <img className='img_guide' src={qa_check_1}/>
                <h2 className='explain_h2'>2. 템플릿 호출 되었을 때 화면</h2>
                <img className='img_guide' src={qa_check_2}/>
                <h2 className='explain_h2'>3. QA 대상 파일 업로드 시 화면</h2>
                <img className='img_guide' src={qa_check_3}/>
                
                {/* More content */}
            </div>

             {/* Scroll to Top Button */}
             {isVisible && (
                 <button className="scroll-to-top" onClick={scrollToTop}>
                     ↑ Top
                 </button>
             )}
         </div>
     );
};

export default Guide;