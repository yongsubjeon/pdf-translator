import Link from "next/link"
import { Clock, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import FileUpload from "@/components/file-upload"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
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
            <Link href="/" className="font-medium text-blue-500">
              Home
            </Link>
            <Link href="/document-translation" className="font-medium text-gray-600 hover:text-gray-900">
              Document Translation
            </Link>
            <Link href="/premium" className="font-medium text-gray-600 hover:text-gray-900">
              Premium
            </Link>
            <Link href="/tools" className="font-medium text-gray-600 hover:text-gray-900">
              Tools
            </Link>
            <Link href="/app" className="font-medium text-gray-600 hover:text-gray-900">
              App
            </Link>
            <Link href="/help-center" className="font-medium text-gray-600 hover:text-gray-900">
              Help Center
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-gray-500" />
            </div>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-gray-500" />
              <span className="font-medium">English</span>
            </div>
            <Button variant="outline" className="hidden md:inline-flex border-blue-500 text-blue-500 hover:bg-blue-50">
              Sign up / Log in
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="py-16 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-l from-blue-100 via-blue-50 to-transparent opacity-70"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="text-gray-800">Your</span> <span className="text-blue-500">AI</span>
                <span className="text-gray-800">-Powered Professional Document Translation Tool</span>
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                Convert the content of PDF files into different languages, perfectly retaining the original layout
              </p>

              <FileUpload />

              <div className="flex flex-wrap items-center gap-6 mt-8">
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="flex items-center gap-1">
                    <span className="text-blue-500">🔷</span> Deepseek
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="flex items-center gap-1">
                    <span className="text-green-500">🟢</span> ChatGPT
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="flex items-center gap-1">
                    <span className="text-gray-700">✦</span> Gemini
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="flex items-center gap-1">
                    <span className="text-orange-500">✴</span> Claude
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-800">More than just document translation</h2>
              <p className="text-gray-600 mt-4">Make your document processing more powerful with AI</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="border rounded-lg p-8 flex flex-col items-center justify-center min-h-[200px]">
                <h3 className="text-xl font-semibold text-gray-800">Glossary</h3>
              </div>
              <div className="border rounded-lg p-8 flex flex-col items-center justify-center min-h-[200px]">
                <h3 className="text-xl font-semibold text-gray-800">Document Conversation</h3>
              </div>
              <div className="border rounded-lg p-8 flex flex-col items-center justify-center min-h-[200px]">
                <h3 className="text-xl font-semibold text-gray-800">Online Editing</h3>
              </div>
            </div>

            <div className="flex justify-center mt-12">
              <Link href="/tools" className="text-blue-500 flex items-center gap-2 hover:underline">
                Explore More Tools
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
              </Link>
            </div>
          </div>
        </section>

        <div className="flex flex-col items-center justify-center min-h-screen py-2">
          <h1 className="text-4xl font-bold mb-8">PDF 번역 서비스</h1>
          <a
            href="/translate"
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            PDF 번역하기
          </a>
        </div>
      </main>
    </div>
  )
}

