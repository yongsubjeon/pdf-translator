// OCR(Optical Character Recognition)을 이용한 PDF 텍스트 추출 기능
import Tesseract from 'tesseract.js';
import * as pdfImgConvert from 'pdf-img-convert';
import fs from 'fs';
import path from 'path';
import os from 'os';

interface OCRResult {
  text: string;
  confidence: number;
}

/**
 * PDF 파일에서 이미지를 추출한 후 OCR로 텍스트를 인식하는 함수
 */
export async function extractTextWithOCR(pdfBuffer: Buffer): Promise<string> {
  try {
    console.log("OCR을 이용한 PDF 텍스트 추출 시작...");
    
    // 임시 작업 디렉토리 생성
    const tmpDir = path.join(os.tmpdir(), `pdf-ocr-${Date.now()}`);
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }
    
    console.log(`임시 작업 디렉토리 생성: ${tmpDir}`);
    
    // PDF를 이미지로 변환
    console.log("PDF를 이미지로 변환 중...");
    const pdfOptions = {
      width: 2000, // 이미지 너비 (더 높은 값은 더 선명한 이미지를 생성하지만 처리 시간이 오래 걸림)
      height: 2000 // 이미지 높이
    };
    
    // PDF를 이미지로 변환
    let pdfImages: any[] = [];
    try {
      pdfImages = await pdfImgConvert.convert(pdfBuffer, pdfOptions);
      console.log(`PDF에서 ${pdfImages.length}개의 이미지가 추출되었습니다`);
    } catch (convErr) {
      console.error("PDF를 이미지로 변환하는 중 오류 발생:", convErr);
      return "PDF를 이미지로 변환하는 데 실패했습니다. 텍스트 추출을 위한 대체 내용을 제공합니다.";
    }
    
    // 최대 처리할 페이지 수 제한 (성능 향상을 위해)
    const maxPages = Math.min(pdfImages.length, 10); // 최대 10페이지만 처리
    
    // 각 이미지에 OCR 적용
    console.log(`OCR 처리 시작 (최대 ${maxPages}페이지)...`);
    const ocrResults: OCRResult[] = [];
    
    for (let i = 0; i < maxPages; i++) {
      try {
        console.log(`페이지 ${i + 1}/${maxPages} OCR 처리 중...`);
        
        // 이미지 파일로 저장
        const imagePath = path.join(tmpDir, `page-${i + 1}.png`);
        fs.writeFileSync(imagePath, pdfImages[i]);
        
        // Tesseract OCR 처리
        const result = await Tesseract.recognize(
          imagePath,
          'kor+eng', // 한국어 + 영어 인식
          {
            logger: m => {
              if (m.status === 'recognizing text') {
                console.log(`OCR 진행률: ${Math.round(m.progress * 100)}%`);
              }
            }
          }
        );
        
        ocrResults.push({
          text: result.data.text,
          confidence: result.data.confidence
        });
        
        // 임시 파일 삭제
        fs.unlinkSync(imagePath);
        
      } catch (ocrErr) {
        console.error(`페이지 ${i + 1} OCR 처리 중 오류 발생:`, ocrErr);
        ocrResults.push({
          text: `[페이지 ${i + 1} OCR 오류]`,
          confidence: 0
        });
      }
    }
    
    // 추출된 텍스트 합치기
    let extractedText = ocrResults.map(result => result.text).join('\n\n');
    console.log(`OCR을 통해 추출된 총 텍스트 길이: ${extractedText.length}`);
    
    // 평균 신뢰도 계산
    const avgConfidence = ocrResults.reduce((sum, result) => sum + result.confidence, 0) / ocrResults.length;
    console.log(`OCR 평균 신뢰도: ${avgConfidence.toFixed(2)}%`);
    
    // 임시 디렉토리 삭제
    try {
      fs.rmdirSync(tmpDir, { recursive: true });
    } catch (rmErr) {
      console.warn("임시 디렉토리 삭제 중 오류:", rmErr);
    }
    
    // 추출된 텍스트가 없거나 신뢰도가 너무 낮은 경우 메시지 추가
    if (extractedText.trim().length < 50 || avgConfidence < 30) {
      extractedText += "\n\nOCR 텍스트 추출 결과가 신뢰할 수 없거나 불완전할 수 있습니다. 다른 PDF 파일을 업로드해 보세요.";
    }
    
    return extractedText;
  } catch (error) {
    console.error("OCR 텍스트 추출 중 오류 발생:", error);
    return "OCR 텍스트 추출에 실패했습니다. 텍스트 추출을 위한 대체 내용을 제공합니다.";
  }
} 