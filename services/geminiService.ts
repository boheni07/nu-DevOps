
import { GoogleGenAI, Type } from "@google/genai";
import { Task, Resource } from "../types";


const getAI = () => {
  const apiKey = (process.env.GEMINI_API_KEY || process.env.API_KEY) as string;
  if (!apiKey || apiKey === 'undefined' || apiKey === 'null' || apiKey.trim() === '') {
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const geminiService = {
  async generateProgressReport(tasks: Task[], resources: Resource[]) {
    const ai = getAI();
    if (!ai) return "AI 서비스를 위한 API 키가 설정되지 않았습니다.";

    const prompt = `
      다음 소프트웨어 개발 프로젝트의 일감과 자원 데이터를 분석해주세요.
      일감 데이터: ${JSON.stringify(tasks)}
      자원 데이터: ${JSON.stringify(resources)}
      
      다음 내용을 포함하는 간결한 진행 보고서를 작성해주세요:
      1. 프로젝트 요약 (Executive Summary)
      2. 주요 성과 및 완료된 항목
      3. 주요 리스크 및 병목 현상
      4. 다음 기간을 위한 권장 사항
      
      반드시 한국어로 작성하고, 깔끔한 마크다운 형식을 사용하세요.
    `;

    try {
      const model = ai.getGenerativeModel({ model: "gemini-2.0-flash" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("Gemini report error:", error);
      return "현재 보고서를 생성할 수 없습니다.";
    }
  },

  async optimizeResources(tasks: Task[], resources: Resource[]) {
    const ai = getAI();
    if (!ai) return "AI 서비스를 위한 API 키가 설정되지 않았습니다.";

    const prompt = `
      기술 프로젝트 매니저로서 다음 일감과 자원을 분석하여 최적의 할당 방안을 제시해주세요.
      현재 진행 중인 일감: ${JSON.stringify(tasks.filter(t => t.status !== 'Done'))}
      가용 자원: ${JSON.stringify(resources)}
      
      업무가 과부하되었거나 유휴 상태인 팀원을 식별하고, 마감 기한을 맞추기 위한 업무 재배치 전략을 제안해주세요.
      구체적인 일감 재할당 방안을 포함해야 합니다.
      반드시 한국어로 작성하세요.
    `;

    try {
      const model = ai.getGenerativeModel({ model: "gemini-2.0-flash" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("Gemini optimization error:", error);
      return "최적화 제안을 불러올 수 없습니다.";
    }
  }
};
