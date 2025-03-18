"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useDropzone } from "react-dropzone"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import Navigation from "@/components/navigation"

export default function Home() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [isTranslating, setIsTranslating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [originalUrl, setOriginalUrl] = useState<string | null>(null)
  const [translationUrl, setTranslationUrl] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'application/pdf': ['.pdf']
    },
    maxSize: 50 * 1024 * 1024, // 50MB
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setFile(acceptedFiles[0])
        handleUpload(acceptedFiles[0])
      }
    },
    onDropRejected: (fileRejections) => {
      const error = fileRejections[0]?.errors[0]
      if (error?.code === 'file-too-large') {
        setError("파일 크기가 너무 큽니다. 50MB 이하의 파일만 업로드 가능합니다.")
      } else if (error?.code === 'file-invalid-type') {
        setError("PDF 파일만 업로드 가능합니다.")
      } else {
        setError("파일 업로드 중 오류가 발생했습니다.")
      }
    }
  })

  const handleUpload = async (uploadedFile: File) => {
    try {
      setIsTranslating(true)
      setProgress(0)
      setError(null)

      const formData = new FormData()
      formData.append("file", uploadedFile)

      const response = await fetch("/api/translate", {
        method: "POST",
        body: formData,
      })

      console.log("API 응답 상태:", response.status)
      
      if (!response.ok) {
        const errorData = await response.text()
        console.error("API 에러 응답:", errorData)
        throw new Error(`Translation failed: ${response.status} - ${errorData}`)
      }

      const data = await response.json()

      if (data.success) {
        setOriginalUrl(data.originalPDF)
        setTranslationUrl(data.translatedPDF)
        setFileName(data.fileName)
        setProgress(100)

        // 최근 문서 저장
        saveRecentDocument({
          id: data.fileName,
          title: uploadedFile.name || `PDF 문서 ${new Date().toLocaleDateString()}`,
          date: new Date().toISOString(),
          url: `/viewer?oldPDF=${data.originalPDF}&newPDF=${data.translatedPDF}&filename=${data.fileName}`
        })

        // 1초 후 결과 페이지로 이동
        setTimeout(() => {
          router.push(`/viewer?oldPDF=${data.originalPDF}&newPDF=${data.translatedPDF}&filename=${data.fileName}`)
        }, 1000)
      } else {
        throw new Error(data.error || "Translation failed")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "번역 중 오류가 발생했습니다")
      console.error("Translation error:", err)
    } finally {
      setIsTranslating(false)
    }
  }

  // 최근 문서 저장 함수
  const saveRecentDocument = (document: {
    id: string;
    title: string;
    date: string;
    url: string;
  }) => {
    try {
      // 로컬 스토리지에서 기존 문서 목록 가져오기
      const storedDocs = localStorage.getItem("recentDocuments")
      let documents = storedDocs ? JSON.parse(storedDocs) : []

      // 중복 제거 (같은 ID가 있으면 제거)
      documents = documents.filter((doc: any) => doc.id !== document.id)

      // 새 문서 추가 (최대 5개만 유지)
      documents.unshift(document)
      if (documents.length > 5) {
        documents = documents.slice(0, 5)
      }

      // 저장
      localStorage.setItem("recentDocuments", JSON.stringify(documents))
    } catch (e) {
      console.error("문서 저장 중 오류 발생:", e)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            PDF 번역 서비스
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            PDF 파일을 업로드하여 빠르게 번역하세요. 한글 번역을 지원합니다.
          </p>
        </div>

        <div className="mt-12 max-w-3xl mx-auto">
          {!file && !isTranslating && (
            <div
              {...getRootProps()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-gray-400 transition-colors"
            >
              <input {...getInputProps()} />
              <div className="space-y-2">
                <div className="mx-auto h-24 w-24 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-lg font-medium text-gray-900">PDF 파일을 드래그하여 업로드하세요</p>
                <p className="text-sm text-gray-500">또는 클릭하여 파일을 선택하세요</p>
                <p className="text-xs text-gray-400">최대 50MB, PDF 파일</p>
              </div>
            </div>
          )}

          {(file || isTranslating) && (
            <div className="bg-white shadow overflow-hidden rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900">
                  {file?.name}
                </h3>
                <div className="mt-2">
                  <Progress value={progress} className="w-full h-2" />
                  <p className="mt-2 text-sm text-gray-500">
                    {progress === 100 ? "번역 완료! 뷰어 페이지로 이동 중..." : `번역 중... ${progress}%`}
                  </p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-12">
            <h2 className="text-xl font-semibold text-gray-900">PDF 번역 이용 방법</h2>
            <div className="mt-6 grid gap-6 lg:grid-cols-3">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                  <span className="text-blue-600 font-bold">1</span>
                </div>
                <h3 className="font-medium text-gray-900">PDF 업로드</h3>
                <p className="mt-2 text-sm text-gray-500">PDF 파일을 업로드 영역에 드래그하거나 클릭하여 선택하세요.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                  <span className="text-blue-600 font-bold">2</span>
                </div>
                <h3 className="font-medium text-gray-900">번역 진행</h3>
                <p className="mt-2 text-sm text-gray-500">자동으로 번역이 진행됩니다. 진행 상황을 확인할 수 있습니다.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                  <span className="text-blue-600 font-bold">3</span>
                </div>
                <h3 className="font-medium text-gray-900">결과 확인</h3>
                <p className="mt-2 text-sm text-gray-500">번역이 완료되면 결과 화면에서 원본과 번역본을 나란히 확인할 수 있습니다.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

