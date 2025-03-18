const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// 테스트 디렉토리 확인 및 생성
const testDir = path.join(process.cwd(), 'test', 'data');
if (!fs.existsSync(testDir)) {
  fs.mkdirSync(testDir, { recursive: true });
}

// PDF 생성
const doc = new PDFDocument();
const filePath = path.join(testDir, '05-versions-space.pdf');
doc.pipe(fs.createWriteStream(filePath));

// PDF에 텍스트 추가
doc.fontSize(25).text('테스트 PDF 파일', 100, 100);
doc.fontSize(12).text('이 파일은 테스트 목적으로 생성되었습니다.', 100, 150);

// PDF 파일 저장
doc.end();

console.log(`테스트 PDF 파일이 생성되었습니다: ${filePath}`); 