'use client'

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"

export default function PdfEditor() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
    const [errorMessage, setErrorMessage] = useState('')
    const fileInputRef = useRef<HTMLInputElement>(null)
    const router = useRouter()

    const validatePdfFile = (file: File): boolean => {
        // Check if file is a PDF
        if (file.type !== 'application/pdf') {
            setErrorMessage('Please upload a PDF file')
            setUploadStatus('error')
            return false
        }

        // Check file size (max 50MB)
        const maxSize = 50 * 1024 * 1024 // 50MB in bytes
        if (file.size > maxSize) {
            setErrorMessage('File size must be less than 50MB')
            setUploadStatus('error')
            return false
        }

        return true
    }

    const handleFileSelect = (file: File) => {
        setErrorMessage('')
        setUploadStatus('idle')

        if (validatePdfFile(file)) {
            setSelectedFile(file)
            setUploadStatus('success')
        }
    }

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            handleFileSelect(file)
        }
    }

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        setIsDragging(false)
    }

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        setIsDragging(false)

        const file = e.dataTransfer.files?.[0]
        if (file) {
            handleFileSelect(file)
        }
    }

    const handleBrowseClick = () => {
        fileInputRef.current?.click()
    }

    const handleOpenEditor = () => {
        if (selectedFile) {
            // Convert file to data URL and store in sessionStorage
            const reader = new FileReader()
            reader.onload = (e) => {
                const dataUrl = e.target?.result as string
                sessionStorage.setItem('pdfFile', dataUrl)
                router.push('/pdfeditor/pdfeditorworkspace')
            }
            reader.readAsDataURL(selectedFile)
        }
    }

    const handleRemoveFile = () => {
        setSelectedFile(null)
        setUploadStatus('idle')
        setErrorMessage('')
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-6">
            <div className="w-full max-w-2xl">
                <div className="text-center mb-8">
                    <h1 className="text-5xl font-bold text-white mb-4">PDF Editor</h1>
                    <p className="text-gray-300 text-lg">Upload your PDF to start editing</p>
                </div>

                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
                    {/* Upload Area */}
                    <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={handleBrowseClick}
                        className={`
                            relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer
                            transition-all duration-300 ease-in-out
                            ${isDragging
                                ? 'border-purple-400 bg-purple-500/20 scale-105'
                                : uploadStatus === 'success'
                                    ? 'border-green-400 bg-green-500/10'
                                    : uploadStatus === 'error'
                                        ? 'border-red-400 bg-red-500/10'
                                        : 'border-gray-400 bg-white/5 hover:border-purple-400 hover:bg-purple-500/10'
                            }
                        `}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf,application/pdf"
                            onChange={handleFileInputChange}
                            className="hidden"
                        />

                        {!selectedFile ? (
                            <div className="space-y-4">
                                <div className="flex justify-center">
                                    <svg
                                        className="w-20 h-20 text-purple-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                        />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-xl font-semibold text-white mb-2">
                                        {isDragging ? 'Drop your PDF here' : 'Drag & drop your PDF here'}
                                    </p>
                                    <p className="text-gray-300 mb-4">or</p>
                                    <button
                                        type="button"
                                        className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors duration-200"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleBrowseClick()
                                        }}
                                    >
                                        Browse Files
                                    </button>
                                </div>
                                <p className="text-sm text-gray-400">Maximum file size: 50MB</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex justify-center">
                                    <svg
                                        className="w-20 h-20 text-green-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-xl font-semibold text-white mb-2">
                                        {selectedFile.name}
                                    </p>
                                    <p className="text-gray-300">
                                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Error Message */}
                    {uploadStatus === 'error' && (
                        <div className="mt-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
                            <p className="text-red-200 text-center">{errorMessage}</p>
                        </div>
                    )}

                    {/* Action Buttons */}
                    {selectedFile && uploadStatus === 'success' && (
                        <div className="mt-6 flex gap-4">
                            <button
                                onClick={handleOpenEditor}
                                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
                            >
                                Open Editor
                            </button>
                            <button
                                onClick={handleRemoveFile}
                                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg transition-colors duration-200 border border-white/20"
                            >
                                Remove
                            </button>
                        </div>
                    )}
                </div>

                {/* Features */}
                <div className="mt-8 grid grid-cols-3 gap-4 text-center">
                    <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                        <p className="text-purple-400 font-semibold mb-1">✏️ Edit Text</p>
                        <p className="text-gray-400 text-sm">Modify PDF content</p>
                    </div>
                    <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                        <p className="text-purple-400 font-semibold mb-1">🎨 Highlight</p>
                        <p className="text-gray-400 text-sm">Mark important text</p>
                    </div>
                    <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                        <p className="text-purple-400 font-semibold mb-1">💾 Save</p>
                        <p className="text-gray-400 text-sm">Export your edits</p>
                    </div>
                </div>
            </div>
        </div>
    )
}