import { NextRequest, NextResponse } from "next/server";
import { translatePDF } from "@/lib/llm";
import { generatePDF } from "@/lib/pdf-generator";
import { writeFile, mkdir, access } from "fs/promises";
import fs from 'fs';
import path from "path";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      console.error("No file provided");
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // 파일 이름 생성 - 보다 안정적인 방법 사용
    const timestamp = Date.now().toString();
    const randomString = crypto.randomBytes(3).toString('hex');
    const fileName = `${timestamp}-${randomString}`;

    // 업로드된 파일을 Buffer로 변환
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 업로드 디렉토리 확인 및 생성
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    
    // 디렉토리 존재 여부 확인 및 생성
    if (!fs.existsSync(uploadDir)) {
      console.log(`Creating directory: ${uploadDir}`);
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // 원본 PDF 저장 경로
    const originalPath = path.join(uploadDir, `${fileName}.pdf`);
    console.log(`Saving original PDF to: ${originalPath}`);
    
    try {
      // 원본 PDF 저장
      await writeFile(originalPath, buffer);
      console.log(`Original PDF saved successfully`);
      
      // PDF 번역
      console.log("Starting PDF translation...");
      const translatedText = await translatePDF(buffer);
      console.log("Translation completed");

      // 번역된 텍스트를 PDF로 저장
      const translatedPath = path.join(uploadDir, `${fileName}-translated.pdf`);
      console.log(`Saving translated PDF to: ${translatedPath}`);
      await generatePDF(translatedText, translatedPath);
      console.log("Translated PDF saved successfully");

      return NextResponse.json({
        success: true,
        fileName: fileName,
        originalPDF: `/uploads/${fileName}.pdf`,
        translatedPDF: `/uploads/${fileName}-translated.pdf`,
      });
    } catch (writeError) {
      console.error("Error writing files:", writeError);
      return NextResponse.json(
        { error: `Failed to write files: ${writeError instanceof Error ? writeError.message : String(writeError)}` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Translation error:", error);
    return NextResponse.json(
      { error: `Failed to process translation: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
} 