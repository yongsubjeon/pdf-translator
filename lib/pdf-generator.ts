import fs from 'fs';
import path from 'path';
import jsPDF from 'jspdf';
// 한글 폰트 추가
import { createRequire } from 'module';
import https from 'https';
const require = createRequire(import.meta.url);

// NanumGothic 폰트 경로
const fontPath = path.resolve(process.cwd(), './public/fonts/NanumGothic.ttf');
const fontDir = path.resolve(process.cwd(), './public/fonts');

// 폰트 다운로드 함수
async function downloadNanumGothicFont(): Promise<boolean> {
  return new Promise((resolve) => {
    // 폰트 디렉토리 생성
    if (!fs.existsSync(fontDir)) {
      fs.mkdirSync(fontDir, { recursive: true });
    }
    
    console.log('NanumGothic 폰트 다운로드 시도 중...');
    
    // 구글 폰트에서 NanumGothic 다운로드
    const fontUrl = 'https://fonts.gstatic.com/s/nanumgothic/v21/PN_3Rfi-oW3hYwmKDpxS7F_z_tLfxno73g.ttf';
    
    const file = fs.createWriteStream(fontPath);
    https.get(fontUrl, (response) => {
      if (response.statusCode !== 200) {
        console.error(`폰트 다운로드 실패: 상태 코드 ${response.statusCode}`);
        resolve(false);
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log('NanumGothic 폰트 다운로드 완료');
        resolve(true);
      });
    }).on('error', (err) => {
      fs.unlink(fontPath, () => {}); // 실패 시 파일 삭제 시도
      console.error('폰트 다운로드 중 오류 발생:', err);
      resolve(false);
    });
  });
}

export async function generatePDF(text: string, outputPath: string): Promise<void> {
  return new Promise(async (resolve, reject) => {
    try {
      // 디렉토리 확인 및 생성
      const dir = path.dirname(outputPath);
      if (!fs.existsSync(dir)) {
        console.log(`Creating directory for PDF output: ${dir}`);
        fs.mkdirSync(dir, { recursive: true });
      }

      console.log(`Creating PDF document with jsPDF`);
      
      // jsPDF 인스턴스 생성 (A4 사이즈, 세로 방향)
      const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
      });
      
      // 한글 폰트 설정
      try {
        console.log('한글 폰트 NanumGothic 로드 시도');
        
        // 폰트 파일이 존재하는지 확인
        let fontExists = fs.existsSync(fontPath);
        
        // 폰트가 없으면 다운로드 시도
        if (!fontExists) {
          console.log('NanumGothic 폰트를 찾을 수 없습니다. 다운로드를 시도합니다...');
          fontExists = await downloadNanumGothicFont();
        }
        
        if (fontExists) {
          const fontData = fs.readFileSync(fontPath);
          
          // 폰트 추가
          doc.addFileToVFS('NanumGothic.ttf', fontData.toString('base64'));
          doc.addFont('NanumGothic.ttf', 'NanumGothic', 'normal');
          doc.setFont('NanumGothic');
          console.log('NanumGothic 폰트가 성공적으로 로드되었습니다.');
        } else {
          console.warn('NanumGothic 폰트를 로드할 수 없습니다. 기본 폰트를 사용합니다.');
          doc.setFont('sans-serif', 'normal');
        }
      } catch (fontErr) {
        console.error('한글 폰트 로드 중 오류 발생:', fontErr);
        // 오류 발생 시 기본 폰트 사용
        doc.setFont('sans-serif', 'normal');
      }
      
      doc.setLanguage("ko");
      
      // PDF 제목과 작성자 설정
      doc.setProperties({
        title: '번역된 문서',
        author: 'PDF 번역 서비스',
      });
      
      // 여백 설정
      const margin = 20; // 여백 (mm)
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const contentWidth = pageWidth - 2 * margin;
      
      // 제목 추가
      doc.setFontSize(18);
      doc.text('번역된 문서', pageWidth / 2, margin, { align: 'center' });
      
      // 본문 폰트 설정
      doc.setFontSize(12);
      
      // 시작 위치 설정
      let y = margin + 10;
      
      // 텍스트 전처리: UTF-8 인코딩 확인
      const normalizedText = normalizeText(text);
      
      // (추가) 인코딩 문제 문자를 제거/치환
      const finalText = advancedFixEncoding(normalizedText);
      
      // 텍스트 줄 단위로 분할
      const lines = finalText.split('\n');
      
      // 페이지 번호
      let pageNumber = 1;
      
      // 각 줄을 PDF에 추가
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        if (!line.trim()) {
          // 빈 줄은 작은 간격 추가
          y += 3;
          continue;
        }
        
        // 텍스트 줄을 여러 줄로 분할 (너비에 맞게)
        // 한글 처리를 위해 줄 간격 조정
        const splitText = doc.splitTextToSize(line, contentWidth);
        
        // 현재 페이지에 맞지 않으면 새 페이지 추가
        if (y + splitText.length * 7 > pageHeight - margin) {
          // 페이지 번호 추가
          doc.setFontSize(10);
          doc.text(`페이지 ${pageNumber}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
          
          // 새 페이지 추가
          doc.addPage();
          pageNumber++;
          y = margin;
          
          // 본문 폰트로 다시 설정
          doc.setFontSize(12);
        }
        
        try {
          // 텍스트 추가
          doc.text(splitText, margin, y);
        } catch (textError) {
          console.error(`Error adding text to PDF: ${textError}`);
          // 오류 발생 시 텍스트 대체 (이슈가 있는 문자 제거)
          const fallbackText = `[렌더링 오류: ${line.substring(0, 30)}...]`;
          doc.text(fallbackText, margin, y);
        }
        
        // Y 위치 업데이트 (줄 높이 + 약간의 여백)
        y += splitText.length * 7;
      }
      
      // 마지막 페이지에 페이지 번호 추가
      doc.setFontSize(10);
      doc.text(`페이지 ${pageNumber}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
      
      // PDF 저장
      console.log(`Saving PDF to: ${outputPath}`);
      
      // PDF 생성 전에 안내 페이지 추가
      doc.addPage();
      pageNumber++;
      doc.setFontSize(14);
      doc.text('번역 서비스 안내', pageWidth / 2, margin, { align: 'center' });
      doc.setFontSize(12);
      const noticeText = [
        '본 문서는 자동 번역 시스템에 의해 생성되었습니다.',
        '일부 콘텐츠에서 인코딩 문제가 발생할 수 있습니다.',
        '정확한 번역이 필요하시면 원본 파일을 함께 참조해 주세요.'
      ];
      
      let noticeY = margin + 15;
      noticeText.forEach(line => {
        doc.text(line, margin, noticeY);
        noticeY += 8;
      });
      
      // ArrayBuffer로 PDF 데이터 얻기
      const pdfData = doc.output('arraybuffer');
      
      // 파일에 쓰기
      fs.writeFile(outputPath, Buffer.from(pdfData), (err) => {
        if (err) {
          console.error(`Error writing PDF file: ${err.message}`);
          reject(err);
          return;
        }
        
        console.log(`PDF successfully written to: ${outputPath}`);
        resolve();
      });
      
    } catch (error) {
      console.error(`PDF generation error: ${error instanceof Error ? error.message : String(error)}`);
      reject(error);
    }
  });
}

// 텍스트 인코딩 정규화 함수
function normalizeText(text: string): string {
  try {
    // 인코딩 문제가 있는 특수 문자 처리
    let normalized = text
      .replace(/[^\x20-\x7E\u1100-\u11FF\u3130-\u318F\uAC00-\uD7AF\u0080-\u024F]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    // 줄바꿈 유지
    normalized = normalized.replace(/(?:\r\n|\r|\n)/g, '\n');
    
    return normalized;
  } catch (error) {
    console.error(`Text normalization error: ${error}`);
    return text; // 원본 반환
  }
}

// (추가) advancedFixEncoding - from lib/llm.ts
function advancedFixEncoding(rawText: string): string {
  // suspectCharMap: 반복해서 나타나는 깨진 문자나 인코딩 문제가 의심되는 문자열을 특정 문자나 공백으로 치환
  const suspectCharMap: Record<string, string> = {
    'Â': '',  // 흔히 Â 어절이 문제되는 경우
    '¼': '',  // 예시
    '»': ' ', // 공백으로 치환
    'ˆ': '',  // 악센트 기호
    '´': '',  // 악센트 기호
    'É': 'E', // 대문자 E에 악센트
    'È': 'E', // 대문자 E에 악센트
    'Å': 'A', // 대문자 A에 악센트
    'Ç': 'C', // 대문자 C에 악센트
    'Æ': 'AE', // 리가쳐
    'Õ': 'O',  // 대문자 O에 틸드
    '®': '(R)', // 등록 상표
    '©': '(C)', // 저작권
    '·': '-',  // 중간점을 하이픈으로
    '®0': '',  // 특수한 조합
    'Ì´': '',  // 특수한 조합
    'ÐÀ': '',  // 특수한 조합
    // 필요에 따라 추가
  };

  let output = rawText;
  for (const key of Object.keys(suspectCharMap)) {
    const value = suspectCharMap[key];
    const regExp = new RegExp(key, 'g');
    output = output.replace(regExp, value);
  }
  return output;
} 