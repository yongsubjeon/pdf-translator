"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Upload, File, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function FileUpload() {
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile.type === "application/pdf") {
        setFile(droppedFile)
        setError(null)
      } else {
        setError("PDF 파일만 업로드할 수 있습니다.")
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0]
      if (selectedFile.type === "application/pdf") {
        setFile(selectedFile)
        setError(null)
      } else {
        setError("PDF 파일만 업로드할 수 있습니다.")
      }
    }
  }

  const handleUpload = async () => {
    if (file) {
      setIsLoading(true)
      setError(null)

      try {
        const formData = new FormData()
        formData.append("file", file)

        const response = await fetch("/api/translate", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          throw new Error("번역 중 오류가 발생했습니다.")
        }

        const data = await response.json()

        if (data.success) {
          router.push(`/viewer?oldPDF=${data.originalPDF}&newPDF=${data.translatedPDF}&filename=${data.fileName}`)
        } else {
          throw new Error(data.error || "번역 중 오류가 발생했습니다.")
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "번역 중 오류가 발생했습니다.")
        console.error("Translation error:", err)
      } finally {
        setIsLoading(false)
      }
    }
  }

  return (
    <div className="w-full">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center ${
          isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"
        } transition-colors`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="p-3 bg-blue-100 rounded-full">
            <Upload className="h-8 w-8 text-blue-500" />
          </div>
          <div>
            <h3 className="text-lg font-medium">PDF 문서 업로드</h3>
            <p className="text-sm text-gray-500 mt-1">파일을 드래그하여 업로드하거나 클릭하여 선택하세요</p>
          </div>

          <label className="relative">
            <input type="file" accept="application/pdf" className="sr-only" onChange={handleFileChange} />
            <Button type="button" variant="outline" className="border-blue-500 text-blue-500 hover:bg-blue-50">
              파일 선택
            </Button>
          </label>

          {error && (
            <div className="text-red-500 text-sm mt-2">{error}</div>
          )}

          {file && (
            <div className="flex items-center gap-2 mt-4 p-2 bg-gray-50 rounded w-full max-w-md">
              <File className="h-5 w-5 text-blue-500" />
              <span className="text-sm truncate flex-1">{file.name}</span>
              <Button onClick={handleUpload} disabled={isLoading} className="bg-blue-500 hover:bg-blue-600 text-white">
                {isLoading ? "번역 중..." : "번역하기"}
                {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

