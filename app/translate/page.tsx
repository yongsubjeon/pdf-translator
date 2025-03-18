"use client";

import { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Progress } from "@/components/ui/progress";
import { useRouter } from "next/navigation";

export default function PDFTranslatePage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [originalUrl, setOriginalUrl] = useState("");
  const [translationUrl, setTranslationUrl] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");

  // 번역 진행률 시뮬레이션
  useEffect(() => {
    if (isTranslating) {
      const timer = setTimeout(() => {
        // 진행률에 따라 증가 속도 조절
        let increment;
        if (progress < 70) {
          // 초반에는 빠르게 증가 (1-5%)
          increment = Math.floor(Math.random() * 5) + 1;
        } else if (progress < 90) {
          // 중반에는 조금 천천히 (0.5-2%)
          increment = Math.floor(Math.random() * 15 + 5) / 10;
        } else if (progress < 99) {
          // 후반에는 매우 천천히 (0.1-0.5%)
          increment = Math.floor(Math.random() * 4 + 1) / 10;
        } else {
          // 99% 이후는 미세하게 증가
          increment = 0.05;
        }
        
        // 99.5%를 넘지 않도록 설정
        setProgress(prev => Math.min(prev + increment, 99.5));
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isTranslating, progress]);

  // 번역 완료시 자동으로 뷰어 페이지로 이동
  useEffect(() => {
    if (progress === 100 && originalUrl && translationUrl && fileName) {
      // 약간의 딜레이 후 이동
      const redirectTimer = setTimeout(() => {
        router.push(`/viewer?oldPDF=${originalUrl}&newPDF=${translationUrl}&filename=${fileName}`);
      }, 1000);
      
      return () => clearTimeout(redirectTimer);
    }
  }, [progress, originalUrl, translationUrl, fileName, router]);

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024, // 50MB
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setFile(acceptedFiles[0]);
        await handleUpload(acceptedFiles[0]);
      }
    },
  });

  const handleUpload = async (uploadedFile: File) => {
    try {
      setIsTranslating(true);
      setProgress(0);
      setError(null);

      const formData = new FormData();
      formData.append("file", uploadedFile);

      const response = await fetch("/api/translate", {
        method: "POST",
        body: formData,
      });

      console.log("API 응답 상태:", response.status);
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error("API 에러 응답:", errorData);
        throw new Error(`Translation failed: ${response.status} - ${errorData}`);
      }

      const data = await response.json();

      if (data.success) {
        setOriginalUrl(data.originalPDF);
        setTranslationUrl(data.translatedPDF);
        setFileName(data.fileName);
        setProgress(100);
      } else {
        throw new Error(data.error || "Translation failed");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "번역 중 오류가 발생했습니다");
      console.error("Translation error:", err);
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">PDF 번역</h1>
      
      {!file && !isTranslating && (
        <div
          {...getRootProps()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-gray-400 transition-colors"
        >
          <input {...getInputProps()} />
          <p className="text-lg mb-2">PDF 파일을 드래그하여 업로드하거나 클릭하여 선택하세요</p>
          <p className="text-sm text-gray-500">최대 500페이지, 50MB까지 가능</p>
        </div>
      )}

      {(file || isTranslating) && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">
            {file?.name}
          </h2>
          <div className="space-y-4">
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-gray-600">
              {progress === 100 ? "번역 완료! 뷰어 페이지로 이동 중..." : `번역 중... ${progress}%`}
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-8 p-4 bg-red-50 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {translationUrl && !isTranslating && (
        <div className="mt-8 p-4 bg-green-50 rounded-lg">
          <p className="text-green-700">번역이 완료되었습니다!</p>
          <div className="flex space-x-4 mt-2">
            <button
              onClick={() => router.push(`/viewer?oldPDF=${originalUrl}&newPDF=${translationUrl}&filename=${fileName}`)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              양쪽 분할 뷰어로 보기
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 