"use client"

import { useEffect, useState } from "react"
import { Resizable } from "@/components/ui/resizable"
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

interface PDFViewerProps {
  originalPdfUrl: string;
  translatedPdfUrl: string;
}

export default function PDFViewer({ originalPdfUrl, translatedPdfUrl }: PDFViewerProps) {
  const [windowWidth, setWindowWidth] = useState(0)
  
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth)
    }
    
    // 초기 설정
    setWindowWidth(window.innerWidth)
    
    // 리사이즈 이벤트 리스너 추가
    window.addEventListener('resize', handleResize)
    
    // 컴포넌트 언마운트 시 리스너 제거
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <div className="h-screen bg-gray-100">
      <Resizable
        defaultSize={{
          width: "100%",
          height: "100%",
        }}
      >
        <Resizable.Handle withHandle />
        <div className="flex h-full">
          <Resizable.Panel defaultSize={50} minSize={20} maxSize={80}>
            <div className="h-full bg-white p-4 rounded-md shadow">
              <div className="mb-2 flex justify-between items-center">
                <h2 className="font-bold text-lg">원본</h2>
              </div>
              <iframe 
                src={originalPdfUrl} 
                className="w-full h-[calc(100%-40px)]" 
                loading="lazy"
              />
            </div>
          </Resizable.Panel>
          <Resizable.Handle withHandle className="bg-gray-300 w-1" />
          <Resizable.Panel defaultSize={50}>
            <div className="h-full bg-white p-4 rounded-md shadow">
              <div className="mb-2 flex justify-between items-center">
                <h2 className="font-bold text-lg">번역</h2>
              </div>
              <iframe 
                src={translatedPdfUrl} 
                className="w-full h-[calc(100%-40px)]" 
                loading="lazy"
              />
            </div>
          </Resizable.Panel>
        </div>
      </Resizable>
    </div>
  )
} 