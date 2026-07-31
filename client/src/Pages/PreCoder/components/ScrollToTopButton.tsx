import React, { useEffect, useState } from "react";
import styled from "styled-components";

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 300);
    };
    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!isVisible) return null;

  return (
    <FloatingButton onClick={scrollToTop} aria-label="맨 위로 이동" title="맨 위로 이동">
      ↑
    </FloatingButton>
  );
};

export default ScrollToTopButton;

const FloatingButton = styled.button`
  position: fixed;
  right: 2.2rem;
  bottom: 2.2rem;
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background: #ff782f;
  color: #ffffff;
  font-size: 1.3rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.18);
  z-index: 50;
  transition: transform 0.15s ease, background 0.15s ease;

  &:hover {
    background: #e8661d;
    transform: translateY(-2px);
  }
`;
