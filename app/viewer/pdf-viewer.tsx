"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import {
  Info,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Minus,
  Plus,
  Download,
  Bot,
} from "lucide-react"
import { Button } from "@/components/ui/button"

export default function PDFViewer() {
  const searchParams = useSearchParams()
  const oldPDF = searchParams.get("oldPDF") || ""
  const newPDF = searchParams.get("newPDF") || ""
  const filename = searchParams.get("filename") || ""

  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [zoom, setZoom] = useState(100)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setTotalPages(5)
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  const handleZoomIn = () => {
    if (zoom < 200) setZoom(zoom + 10)
  }

  const handleZoomOut = () => {
    if (zoom > 50) setZoom(zoom - 10)
  }

  const handlePrevPage = () => {
    if (currentPage > 0) setCurrentPage(currentPage - 1)
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1)
  }

  const handleFirstPage = () => {
    setCurrentPage(0)
  }

  const handleLastPage = () => {
    setCurrentPage(totalPages)
  }

  const handleDownload = (type: "original" | "translated") => {
    const pdfUrl = type === "original" ? oldPDF : newPDF
    if (pdfUrl) {
      window.open(pdfUrl, "_blank")
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <div className="text-blue-500 text-3xl">
              <span className="inline-block">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  stroke="currentColor"
                  strokeWidth="0"
                >
                  <path d="M6 22h15v-2H6.012C5.55 19.988 5 19.805 5 19s.55-.988 1.012-1H21V4c0-1.103-.897-2-2-2H6c-1.206 0-3 .799-3 3v14c0 2.201 1.794 3 3 3zM5 8V5c0-.805.55-.988 1-1h13v12H5V8z" />
                </svg>
              </span>
            </div>
            <span className="font-bold text-2xl">Doclingo</span>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className="font-medium text-gray-600 hover:text-gray-900">
              Home
            </Link>
            <Link href="/translate" className="font-medium text-blue-500">
              PDF 번역
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="font-medium">한국어</span>
            </div>
          </div>
        </div>
      </header>

      <div className="border-b bg-white py-2 px-4 flex items-center">
        <button className="text-gray-500 hover:text-gray-700 mr-4">
          <Info className="h-5 w-5" />
        </button>

        <div className="flex-1 flex items-center justify-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleFirstPage}
            className="h-8 w-8 p-0"
            disabled={currentPage === 0}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePrevPage}
            className="h-8 w-8 p-0"
            disabled={currentPage === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            {currentPage + 1}/{totalPages + 1}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNextPage}
            className="h-8 w-8 p-0"
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLastPage}
            className="h-8 w-8 p-0"
            disabled={currentPage === totalPages}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" onClick={handleZoomOut} className="h-8 w-8 p-0">
            <Minus className="h-4 w-4" />
          </Button>
          <span className="text-sm w-12 text-center">{zoom}%</span>
          <Button variant="ghost" size="sm" onClick={handleZoomIn} className="h-8 w-8 p-0">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="ml-4 flex space-x-2">
          <Button onClick={() => handleDownload("original")} className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white">
            <Download className="h-4 w-4" />
            <span>원본 다운로드</span>
          </Button>
          <Button onClick={() => handleDownload("translated")} className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white">
            <Download className="h-4 w-4" />
            <span>번역본 다운로드</span>
          </Button>
        </div>
      </div>

      <div className="flex-1 relative">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="h-full flex">
            <div className="flex-1 p-4 overflow-auto border-r">
              <div className="bg-white shadow-sm rounded-lg p-8">
                <h3 className="text-lg font-semibold mb-4">원문</h3>
                <div
                  className="min-h-full flex justify-center"
                  style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top center" }}
                >
                  <iframe src={oldPDF} className="w-full h-[800px]" />
                </div>
              </div>
            </div>
            <div className="flex-1 p-4 overflow-auto">
              <div className="bg-white shadow-sm rounded-lg p-8">
                <h3 className="text-lg font-semibold mb-4">번역문</h3>
                <div
                  className="min-h-full flex justify-center"
                  style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top center" }}
                >
                  <iframe src={newPDF} className="w-full h-[800px]" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AI Assistant Button */}
        <div className="fixed bottom-6 right-6">
          <button className="bg-white text-blue-500 p-3 rounded-full shadow-lg hover:shadow-xl border border-blue-100 transition-all">
            <Bot className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  )
} 