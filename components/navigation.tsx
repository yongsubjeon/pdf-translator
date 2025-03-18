"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"

interface NavigationProps {
  recentDocuments?: {
    id: string;
    title: string;
    date: string;
    url: string;
  }[];
}

export default function Navigation({ recentDocuments = [] }: NavigationProps) {
  const pathname = usePathname()
  const [isSubmenuOpen, setIsSubmenuOpen] = useState(false)
  const [documents, setDocuments] = useState<typeof recentDocuments>([])

  // 로컬 스토리지에서 최근 문서 불러오기
  useEffect(() => {
    try {
      const storedDocs = localStorage.getItem("recentDocuments")
      if (storedDocs) {
        setDocuments(JSON.parse(storedDocs))
      }
    } catch (e) {
      console.error("문서 목록을 불러오는 중 오류 발생:", e)
    }
  }, [])

  return (
    <nav className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-gray-900">
                PDF 번역기
              </Link>
            </div>
            <div className="ml-6 flex space-x-8">
              <Link 
                href="/" 
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  pathname === "/" 
                    ? "border-indigo-500 text-gray-900" 
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`}
              >
                홈
              </Link>
              <div className="relative">
                <button
                  onClick={() => setIsSubmenuOpen(!isSubmenuOpen)}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    pathname.startsWith("/translate") || pathname.startsWith("/viewer")
                      ? "border-indigo-500 text-gray-900" 
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  }`}
                >
                  PDF 번역
                  <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {isSubmenuOpen && (
                  <div className="absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                    <div className="py-1">
                      <Link 
                        href="/translate" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsSubmenuOpen(false)}
                      >
                        새 PDF 번역
                      </Link>
                      
                      {documents.length > 0 && (
                        <div className="pt-2 pb-1">
                          <div className="px-4 text-xs font-bold text-gray-500 uppercase">최근 문서</div>
                          {documents.map((doc) => (
                            <Link
                              key={doc.id}
                              href={doc.url}
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              onClick={() => setIsSubmenuOpen(false)}
                            >
                              {doc.title}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
} 