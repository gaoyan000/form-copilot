export type Locale = "en" | "zh";

export interface Strings {
  brand: string;
  navTagline: string;
  heroHeading: string;
  heroSub: string;
  uploadCta: string;
  uploadHint: string;
  uploadDrop: string;
  uploadAgain: string;
  analyzing: string;
  resultsTitle: string;
  overallPass: string;
  overallNeedsWork: string;
  overallFail: string;
  fixesTitle: string;
  noFixes: string;
  errorTitle: string;
  retry: string;
  disclaimer: string;
  reqsTitle: string;
  reqs: string[];
  sourceLabel: string;
  sourceLinkText: string;
  fileTooBig: string;
  badType: string;
  privacyNote: string;
  feedbackPrompt: string;
  feedbackUp: string;
  feedbackDown: string;
  feedbackCommentPlaceholder: string;
  feedbackSubmit: string;
  feedbackThanks: string;
  emailPrompt: string;
  emailPlaceholder: string;
  emailSubmit: string;
  emailThanks: string;
  emailError: string;
  emailInvalid: string;
}

export const SOURCE_URL =
  "https://travel.state.gov/content/travel/en/us-visas/visa-information-resources/photos.html";

export const STRINGS: Record<Locale, Strings> = {
  en: {
    brand: "Form Copilot",
    navTagline: "DS-160 Photo Checker",
    heroHeading: "Will your DS-160 photo be rejected?",
    heroSub:
      "Most consulate rejections are for the photo, not the form. Upload yours for a free AI check before you submit.",
    uploadCta: "Choose a photo",
    uploadHint: "JPEG, PNG, or WebP · max 8 MB",
    uploadDrop: "or drop a photo here",
    uploadAgain: "Check another photo",
    analyzing: "Analyzing photo…",
    resultsTitle: "Results",
    overallPass: "Looks good",
    overallNeedsWork: "Needs adjustments",
    overallFail: "Likely to be rejected",
    fixesTitle: "How to fix it",
    noFixes: "No fixes needed.",
    errorTitle: "Something went wrong",
    retry: "Try again",
    disclaimer:
      "Form Copilot is a preparation tool, not a law firm. Final responsibility for your photo and DS-160 rests with you.",
    reqsTitle: "DS-160 photo requirements",
    reqs: [
      "Plain white or off-white background, no patterns",
      "Head 50–69% of frame height, centered",
      "Eyes open, looking at camera, neutral expression",
      "No glasses, hats, or shadows on face",
      "Sharp focus, taken within last 6 months",
    ],
    sourceLabel:
      "Checks are based on the official U.S. Department of State photo requirements:",
    sourceLinkText: "travel.state.gov — Photo requirements",
    fileTooBig: "File is too large. Max 8 MB.",
    badType: "Unsupported file type. Use JPEG, PNG, or WebP.",
    privacyNote:
      "Your photo is not stored. It is sent to an AI model for this check and then discarded.",
    feedbackPrompt: "Was this check helpful?",
    feedbackUp: "Yes",
    feedbackDown: "No",
    feedbackCommentPlaceholder: "Anything we got wrong or could improve? (optional)",
    feedbackSubmit: "Send feedback",
    feedbackThanks: "Thanks for the feedback.",
    emailPrompt:
      "Want the full DS-160 copilot when it launches? Leave your email (optional).",
    emailPlaceholder: "you@example.com",
    emailSubmit: "Notify me",
    emailThanks: "You're on the list. Thanks!",
    emailError: "Couldn't save that. Please try again later.",
    emailInvalid: "Please enter a valid email address.",
  },
  zh: {
    brand: "Form Copilot",
    navTagline: "DS-160 照片检查器",
    heroHeading: "你的 DS-160 照片会被拒吗？",
    heroSub:
      "签证照片是最常见的拒绝原因之一。上传你的照片，AI 免费帮你检查后再提交。",
    uploadCta: "选择照片",
    uploadHint: "支持 JPEG、PNG 或 WebP · 最大 8 MB",
    uploadDrop: "或将照片拖到这里",
    uploadAgain: "检查另一张",
    analyzing: "正在分析照片…",
    resultsTitle: "结果",
    overallPass: "通过",
    overallNeedsWork: "需要调整",
    overallFail: "可能会被拒绝",
    fixesTitle: "如何修复",
    noFixes: "无需修改。",
    errorTitle: "出错了",
    retry: "重试",
    disclaimer:
      "Form Copilot 是准备工具，不是律所。照片和 DS-160 的最终责任由你本人承担。",
    reqsTitle: "DS-160 照片要求",
    reqs: [
      "纯白或近白背景，无图案",
      "头部占画面 50–69%，居中",
      "睁眼看镜头，表情自然",
      "不戴眼镜、帽子，脸部无阴影",
      "对焦清晰，6 个月内拍摄",
    ],
    sourceLabel: "检查标准依据美国国务院官方照片要求：",
    sourceLinkText: "travel.state.gov — 照片要求",
    fileTooBig: "文件过大，上限 8 MB。",
    badType: "不支持的文件类型，请使用 JPEG、PNG 或 WebP。",
    privacyNote:
      "我们不会保存你的照片。照片仅发送给 AI 模型进行本次检查，随后即被丢弃。",
    feedbackPrompt: "这次检查对你有帮助吗？",
    feedbackUp: "有帮助",
    feedbackDown: "没帮助",
    feedbackCommentPlaceholder: "有哪里出错或可以改进？(选填)",
    feedbackSubmit: "提交反馈",
    feedbackThanks: "感谢你的反馈。",
    emailPrompt: "想在完整版 DS-160 助手上线时收到通知？留下邮箱(选填)。",
    emailPlaceholder: "you@example.com",
    emailSubmit: "通知我",
    emailThanks: "已加入名单，谢谢！",
    emailError: "保存失败，请稍后再试。",
    emailInvalid: "请输入有效的邮箱地址。",
  },
};
