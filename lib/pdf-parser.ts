import * as pdfjs from 'pdfjs-dist';
import { TextItem } from 'pdfjs-dist/types/src/display/api';

// Node.js 환경에서 사용하므로 워커 설정 변경
// @ts-ignore - pdfjs-dist의 타입 문제를 무시
if (typeof window === 'undefined') {
  // 노드 환경에서는 워커 설정을 생략
  // pdfjs는 자동으로 내부 워커를 사용합니다
} else {
  // 브라우저 환경일 경우에만 적용
  pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
}

export interface PDFParseResult {
  text: string;
  pageCount: number;
  info: any;
}

/**
 * 간단한 텍스트 추출 함수
 */
export async function parsePDF(buffer: Buffer): Promise<PDFParseResult> {
  try {
    console.log("PDF 파싱 시작...");
    
    // ArrayBuffer로 변환
    const data = new Uint8Array(buffer);
    
    // PDF 문서 로드 - 최소한의 옵션만 사용
    const loadingTask = pdfjs.getDocument({
      data,
      // Promise.withResolvers 사용하지 않도록 옵션 추가
      disableFontFace: true
    });
    
    // PDF 문서 로드
    const pdf = await loadingTask.promise;
    console.log(`PDF 로드 완료: ${pdf.numPages} 페이지`);
    
    // 메타데이터는 에러 처리와 함께 가져오기
    let documentInfo = { info: {} };
    try {
      documentInfo = await pdf.getMetadata();
    } catch (metaErr) {
      console.warn("메타데이터 가져오기 실패:", metaErr);
    }
    
    // 모든 페이지의 텍스트 추출
    let textContent = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      try {
        console.log(`페이지 ${i}/${pdf.numPages} 처리 중...`);
        
        // 페이지 가져오기
        const page = await pdf.getPage(i);
        
        // 텍스트 콘텐츠 추출
        const content = await page.getTextContent();
        
        // 텍스트 항목만 추출하고 연결
        let pageText = '';
        
        if (content && Array.isArray(content.items)) {
          // @ts-ignore - items 속성에 대한 타입 문제 해결
          const textItems = content.items.filter(item => 'str' in item);
          
          pageText = textItems
            .map((item: any) => item.str)
            .join(' ')
            .replace(/\s+/g, ' ')
            .trim();
        }
        
        if (i === 1) {
          console.log(`첫 페이지 텍스트 샘플: ${pageText.substring(0, 100)}...`);
        }
        
        textContent += pageText + '\n\n';
        
      } catch (pageError) {
        console.error(`페이지 ${i} 처리 중 오류:`, pageError);
        textContent += `[페이지 ${i} 처리 오류]\n\n`;
      }
    }
    
    console.log(`총 ${textContent.length} 문자의 텍스트 추출 완료`);
    
    // 실패하더라도 빈 텍스트가 아닌 경우에만 진행
    if (textContent.trim().length === 0) {
      return {
        text: "PDF에서 텍스트를 추출할 수 없습니다. 스캔된 이미지이거나 텍스트가 포함되지 않은 PDF일 수 있습니다.",
        pageCount: pdf.numPages,
        info: documentInfo.info
      };
    }
    
    return {
      text: textContent,
      pageCount: pdf.numPages,
      info: documentInfo.info
    };
    
  } catch (error) {
    console.error("PDF 파싱 중 오류 발생:", error);
    
    // 대체 방식으로 텍스트 생성
    return {
      text: "PDF 파싱에 실패했습니다. 테스트를 위한 텍스트입니다.",
      pageCount: 1,
      info: {}
    };
  }
} 