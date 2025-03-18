"use client"

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import PDFViewer from "./pdf-viewer";
import Navigation from "@/components/navigation";

export default function ViewerPage() {
  const searchParams = useSearchParams();
  const [documents, setDocuments] = useState<{
    id: string;
    title: string;
    date: string;
    url: string;
  }[]>([]);

  // 문서 정보
  const oldPDF = searchParams.get("oldPDF") || "";
  const newPDF = searchParams.get("newPDF") || "";
  const filename = searchParams.get("filename") || "";

  // 문서 제목
  const [documentTitle, setDocumentTitle] = useState("");

  useEffect(() => {
    // 문서 제목 설정 (파일 이름이 있으면 사용, 없으면 기본 제목)
    setDocumentTitle(`번역 문서 ${new Date().toLocaleDateString()}`);

    // 로컬 스토리지에서 문서 목록 불러오기
    try {
      const storedDocs = localStorage.getItem("recentDocuments");
      if (storedDocs) {
        setDocuments(JSON.parse(storedDocs));
      }
    } catch (e) {
      console.error("문서 목록을 불러오는 중 오류 발생:", e);
    }
  }, []);

  if (!oldPDF || !newPDF) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg p-6">
            <h1 className="text-2xl font-bold text-red-600">오류</h1>
            <p className="mt-2 text-gray-600">
              필요한 PDF 파일 정보가 없습니다. 홈으로 돌아가 새 문서를 업로드해주세요.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <div className="flex-1 overflow-hidden">
        <PDFViewer 
          originalPdfUrl={oldPDF} 
          translatedPdfUrl={newPDF} 
        />
      </div>
    </div>
  );
}

