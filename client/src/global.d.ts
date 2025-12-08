// SCSS 모듈에 대한 타입 정의
declare module "*.scss" {
  const content: { [className: string]: string };
  export = content;
}

// 만약 CSS도 쓴다면 추가
declare module "*.css";
declare module "*.sass";