const fs = require('fs');
// 단순화된 임포트 방식
const pdf = require('pdf-parse');
const path = require('path');

async function testPdfExtraction() {
  try {
    console.log('테스트 시작: PDF 텍스트 추출 디버깅');
    const filePath = './public/uploads/1742260769138-64626f.pdf';
    const buffer = fs.readFileSync(filePath);
    console.log(`파일 로드 완료: ${filePath} (${buffer.length} 바이트)`);
    
    // PDF 파싱 옵션
    const pdfOptions = {
      max: 50,
      render: {
        normalizeWhitespace: true,
        disableCombineTextItems: false
      }
    };
    
    // PDF 파싱 시도
    const data = await pdf(buffer, pdfOptions);
    let text = data.text;
    
    console.log(`PDF에서 추출된 텍스트 길이: ${text.length} 문자`);
    console.log(`PDF 페이지 수: ${data.numpages}`);
    
    // 추출된 텍스트 샘플 출력
    console.log('추출된 텍스트 샘플:');
    console.log('-'.repeat(50));
    console.log(text.substring(0, 1000));
    console.log('-'.repeat(50));
    
    // 한글 비율 확인
    const koreanRegex = /[가-힣]/g;
    const koreanMatches = text.match(koreanRegex);
    const koreanPercentage = koreanMatches ? koreanMatches.length / text.length : 0;
    console.log(`한글 비율: ${(koreanPercentage * 100).toFixed(2)}%`);
    
    // 정제 함수 구현
    function cleanText(text) {
      // 일반적인 쓰레기 문자 제거
      let cleaned = text
        .replace(/[^\x20-\x7E\u1100-\u11FF\u3130-\u318F\uAC00-\uD7AF\u0080-\u024F]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      // 비정상적으로 짧은 문장 제거 (의미 없는 파편)
      const lines = cleaned.split('\n');
      cleaned = lines
        .filter(line => line.trim().length > 3)
        .join('\n');
      
      return cleaned;
    }
    
    // 텍스트 정제
    const cleanedText = cleanText(text);
    console.log('정제된 텍스트 샘플:');
    console.log('-'.repeat(50));
    console.log(cleanedText.substring(0, 1000));
    console.log('-'.repeat(50));
    console.log(`정제된 텍스트 길이: ${cleanedText.length} 문자`);
    
  } catch (error) {
    console.error('테스트 중 오류 발생:', error);
  }
}

testPdfExtraction(); 