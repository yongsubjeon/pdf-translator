import OpenAI from 'openai';
import pdf from 'pdf-parse';
import fs from 'fs';
import { extractTextWithOCR } from './ocr-extractor';

// OpenAI 클라이언트 초기화
const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  : null;

// 특수 문자와 비정상적 인코딩 문자 정리 함수
function cleanText(text: string): string {
  // 일반적인 쓰레기 문자 제거
  let cleaned = text
    .replace(/[^\x20-\x7E\u1100-\u11FF\u3130-\u318F\uAC00-\uD7AF\u0080-\u024F]/g, ' ') // 한글, 영어, 라틴 문자 외 제거
    .replace(/\s+/g, ' ') // 여러 공백을 하나로
    .trim();
  
  // 비정상적으로 짧은 문장 제거 (의미 없는 파편)
  const lines = cleaned.split('\n');
  cleaned = lines
    .filter(line => line.trim().length > 2) // 너무 짧은 줄 제거 (3 → 2로 변경)
    .join('\n');
  
  return cleaned;
}

// 테스트용 모의 번역 함수
async function mockTranslate(text: string): Promise<string> {
  console.log("모의 번역 사용 중 (OPENAI_API_KEY가 설정되지 않음)");
  // 텍스트 일부를 한국어로 변환하는 간단한 모의 번역
  return `원본 텍스트: ${text.substring(0, 100)}...\n\n한국어 번역 (모의): 이것은 테스트를 위한 한국어 번역 텍스트입니다. API 키를 설정하면 실제 번역이 작동합니다.`;
}

// suspectCharMap: 반복해서 나타나는 깨진 문자나 인코딩 문제가 의심되는 문자열을 특정 문자나 공백으로 치환
const suspectCharMap: Record<string, string> = {
  'Â': '',  // 흔히 Â 어절이 문제되는 경우
  '¼': '',  // 예시
  '»': ' ', // 공백으로 치환
  // 필요에 따라 추가
};

// 인코딩 보정 로직
function advancedFixEncoding(rawText: string): string {
  let output = rawText;
  for (const key of Object.keys(suspectCharMap)) {
    const value = suspectCharMap[key];
    const regExp = new RegExp(key, 'g');
    output = output.replace(regExp, value);
  }
  return output;
}

// 텍스트를 적절한 크기의 청크로 분할하는 함수
function splitTextIntoChunks(text: string, chunkSize: number): string[] {
  const chunks: string[] = [];
  let currentChunk = '';

  // 문장 단위로 분할 (문장 구분자: 마침표, 물음표, 느낌표 뒤에 공백이 오는 경우)
  const sentences = text.split(/(?<=[.!?])\s+/);

  for (const sentence of sentences) {
    // 현재 청크 + 새 문장이 청크 크기보다 작으면 현재 청크에 추가
    if ((currentChunk + sentence).length <= chunkSize) {
      currentChunk += (currentChunk ? ' ' : '') + sentence;
    } else {
      // 청크 크기를 초과하면 현재 청크를 배열에 추가하고 새 청크 시작
      if (currentChunk) {
        chunks.push(currentChunk);
      }
      
      // 문장이 청크 크기보다 크면 문장을 더 작은 부분으로 분할
      if (sentence.length > chunkSize) {
        // 단어 단위로 분할
        const words = sentence.split(/\s+/);
        let tempChunk = '';
        
        for (const word of words) {
          if ((tempChunk + ' ' + word).length <= chunkSize) {
            tempChunk += (tempChunk ? ' ' : '') + word;
          } else {
            if (tempChunk) {
              chunks.push(tempChunk);
            }
            tempChunk = word;
          }
        }
        
        if (tempChunk) {
          currentChunk = tempChunk;
        } else {
          currentChunk = '';
        }
      } else {
        // 일반적인 경우, 새 문장으로 청크 시작
        currentChunk = sentence;
      }
    }
  }

  // 마지막 청크 추가
  if (currentChunk) {
    chunks.push(currentChunk);
  }

  return chunks;
}

export async function translatePDF(file: Buffer): Promise<string> {
  try {
    console.log("PDF 파싱 시작...");
    
    // PDF 파싱 옵션 (페이지 제한 없음)
    const pdfOptions = {
      // 페이지 수 제한 제거 (전체 페이지 처리)
      // max 옵션 제거
      render: {
        normalizeWhitespace: true, // 공백 정규화
        disableCombineTextItems: false // 텍스트 항목 결합 활성화
      }
    };
    
    // PDF 파싱 시도
    const data = await pdf(file, pdfOptions);
    let text = data.text;
    console.log(`PDF에서 추출된 텍스트 길이: ${text.length} 문자`);
    console.log(`PDF 페이지 수: ${data.numpages}`);
    console.log('총 페이지를 모두 처리합니다.');
    
    // 추출된 텍스트 일부를 로그에 출력 (디버깅용)
    console.log('추출된 텍스트 샘플:', text.substring(0, 200));
    
    // 텍스트가 비어있거나 너무 적으면 OCR 시도
    if (text.trim().length < 20) {
      console.log("텍스트가 충분하지 않습니다. OCR 텍스트 추출을 시도합니다...");
      try {
        // OCR을 통한 텍스트 추출 (스캔된 PDF나 이미지 PDF 처리)
        text = await extractTextWithOCR(file);
        console.log(`OCR을 통해 추출된 텍스트 길이: ${text.length} 문자`);
        console.log('OCR 추출 텍스트 샘플:', text.substring(0, 200));
      } catch (ocrError) {
        console.error("OCR 처리 중 오류 발생:", ocrError);
        return "PDF에서 텍스트를 추출할 수 없습니다. 이 파일은 스캔된 이미지이거나 텍스트가 포함되지 않은 PDF일 수 있습니다.";
      }
      
      // OCR 후에도 텍스트가 없으면 오류 메시지 반환
      if (text.trim().length < 20) {
        return "PDF에서 텍스트를 추출할 수 없습니다. 이 파일은 스캔된 이미지이거나 텍스트가 포함되지 않은 PDF일 수 있습니다.";
      }
    }
    
    // 텍스트 정제 (특수문자, 쓰레기 문자 제거)
    text = cleanText(text);
    console.log(`정제 후 텍스트 길이: ${text.length} 문자`);
    
    // 정제된 텍스트 샘플 출력 (디버깅용)
    console.log('정제 후 텍스트 샘플:', text.substring(0, 300));
    
    // 추가 인코딩 보정 (advancedFixEncoding)
    text = advancedFixEncoding(text);
    
    // 최종 텍스트 샘플 출력 (디버깅용)
    console.log('최종 전송 텍스트 샘플:', text.substring(0, 300));
    console.log('최종 처리된 텍스트 크기:', text.length, '자');
    
    // 최종 결과가 너무 짧으면 기본 메시지 반환
    if (text.trim().length < 10) {
      return "PDF에서 텍스트를 추출할 수 없습니다. 이 파일은 스캔된 이미지이거나 텍스트가 포함되지 않은 PDF일 수 있습니다.";
    }

    // OpenAI API 키가 없으면 모의 번역 사용
    if (!openai) {
      return await mockTranslate(text);
    }

    // 텍스트를 적절한 크기의 청크로 분할
    const chunks = splitTextIntoChunks(text, 3000);
    console.log(`청크 수: ${chunks.length}`);
    
    // 각 청크를 번역
    const translatedChunks = await Promise.all(
      chunks.map(async (chunk, index) => {
        console.log(`청크 ${index + 1}/${chunks.length} 번역 중... (길이: ${chunk.length}자)`);
        try {
          // 청크 내용 샘플 출력 (디버깅용)
          console.log(`청크 ${index + 1} 샘플:`, chunk.substring(0, 100), '...');
          
          const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
              {
                role: "system",
                content: "You are a professional translator. Translate the following text to Korean while maintaining the original formatting and structure. Keep any technical terms or proper nouns in their original form if necessary. The target language is Korean."
              },
              {
                role: "user",
                content: chunk
              }
            ],
            temperature: 0.3,
          });

          const translatedContent = response.choices[0].message.content || "";
          console.log(`청크 ${index + 1} 번역 결과 샘플:`, translatedContent.substring(0, 100), '...');
          
          return translatedContent;
        } catch (chunkError) {
          console.error(`청크 ${index + 1} 번역 중 오류 발생:`, chunkError);
          return `[번역 실패: ${chunk.substring(0, 50)}...]`;
        }
      })
    );

    // 번역된 청크들을 하나의 문서로 결합
    const result = translatedChunks.join('\n\n');
    console.log(`번역 완료: 총 ${result.length}자`);
    return result;
  } catch (error) {
    console.error('Translation error:', error);
    return "PDF 번역 중 오류가 발생했습니다. 텍스트를 추출할 수 없는 PDF 형식일 수 있습니다.";
  }
}
