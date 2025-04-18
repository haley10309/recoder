export const DUMMY_TEMPLATES = [
  { value: "template1", label: "template1" },
  { value: "template2", label: "template2" },
  { value: "template3", label: "template3" },
];

export const DUMMY_PROJECTS = [
  { value: "proj1", label: "Project 1" },
  { value: "proj2", label: "Project 2" },
];

export const DUMMY_PDPS = [
  { value: "features", label: "Features" },
  { value: "enhancements", label: "Enhancements" },
];

export const DUMMY_PRODUCTS = [
  { value: "prod1", label: "Product 1" },
  { value: "prod2", label: "Product 2" },
];

export const DUMMY_TO_BE_CODES = [
  { ppt: 1, code: "</sitecode/upgrade>upgrade</>" },
  { ppt: 1, code: "</sitecode/upgrade>upgrade</>" },
  { ppt: 2, code: "" },
];

export const localizationDummyData = {
  projects: ["proj1", "proj2", "proj3"],
  pdps: ["features", "enhancements", "bugfixes"],
  products: ["prod1", "prod2", "prod3"],
  validCountries: ["KR", "US", "JP"],
  translationData: {
    KR: [
      {
        ppt: "001",
        asWas: "<div>안녕하세요</div>",
        toBe: "<div>Hello</div>",
        applied: true,
      },
      {
        ppt: "002",
        asWas: "<p>반갑습니다</p>",
        toBe: "<p>Nice to meet you</p>",
        applied: false,
      },
    ],
    US: [
      {
        ppt: "003",
        asWas: "<div>Welcome</div>",
        toBe: "<div>환영합니다</div>",
        applied: true,
      },
    ],
    JP: [
      {
        ppt: "004",
        asWas: "<span>こんにちは</span>",
        toBe: "<span>안녕하세요</span>",
        applied: false,
      },
    ],
  },
};
