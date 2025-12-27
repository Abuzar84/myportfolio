'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

type Tool = 'select' | 'highlight' | 'pen' | 'text' | 'eraser' | 'edit'
type HighlightColor = 'yellow' | 'green' | 'blue' | 'pink'

interface Annotation {
    id: string
    type: Tool
    color?: HighlightColor
    x: number
    y: number
    width?: number
    height?: number
    points?: { x: number; y: number }[]
    text?: string
}

interface TextBox {
    id: string
    x: number
    y: number
    text: string
    fontSize: number
    color: string
    pageNumber: number
}

export default function PdfEditorWorkspace() {
    const router = useRouter()
    const [numPages, setNumPages] = useState<number>(0)
    const [currentPage, setCurrentPage] = useState<number>(1)
    const [scale, setScale] = useState<number>(1.5)
    const [pdfFile, setPdfFile] = useState<string | null>(null)
    const [selectedTool, setSelectedTool] = useState<Tool>('select')
    const [highlightColor, setHighlightColor] = useState<HighlightColor>('yellow')
    const [annotations, setAnnotations] = useState<Record<number, Annotation[]>>({})
    const [isDrawing, setIsDrawing] = useState(false)
    const [currentDrawing, setCurrentDrawing] = useState<{ x: number; y: number }[]>([])
    const [textBoxes, setTextBoxes] = useState<TextBox[]>([])
    const [editingTextBoxId, setEditingTextBoxId] = useState<string | null>(null)
    const [editedTexts, setEditedTexts] = useState<Record<string, string>>({})
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const pdfContainerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        // Get PDF from sessionStorage
        const storedFile = sessionStorage.getItem('pdfFile')
        if (storedFile) {
            setPdfFile(storedFile)
            // Immediately remove from sessionStorage for privacy
            sessionStorage.removeItem('pdfFile')
        }
    }, [])

    // Make PDF text layer editable when edit tool is selected
    useEffect(() => {
        if (selectedTool === 'edit') {
            // Wait for text layer to render
            const timer = setTimeout(() => {
                const textLayer = document.querySelector('.react-pdf__Page__textContent')
                if (textLayer) {
                    const spans = textLayer.querySelectorAll('span')
                    spans.forEach((span) => {
                        span.setAttribute('contenteditable', 'true')
                        span.style.cursor = 'text'
                        span.style.backgroundColor = 'rgba(255, 255, 0, 0.1)'

                        // Store original text
                        const originalText = span.textContent || ''

                        // Handle text changes
                        span.addEventListener('blur', (e) => {
                            const target = e.target as HTMLElement
                            const newText = target.textContent || ''
                            if (newText !== originalText) {
                                setEditedTexts(prev => ({
                                    ...prev,
                                    [span.getAttribute('data-index') || Math.random().toString()]: newText
                                }))
                            }
                        })

                        // Prevent Enter from creating new lines, just blur
                        span.addEventListener('keydown', (e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault()
                                    ; (e.target as HTMLElement).blur()
                            }
                        })
                    })
                }
            }, 100)

            return () => {
                clearTimeout(timer)
                // Cleanup: remove contenteditable when switching tools
                const textLayer = document.querySelector('.react-pdf__Page__textContent')
                if (textLayer) {
                    const spans = textLayer.querySelectorAll('span')
                    spans.forEach((span) => {
                        span.removeAttribute('contenteditable')
                        span.style.cursor = 'default'
                        span.style.backgroundColor = 'transparent'
                    })
                }
            }
        }
    }, [selectedTool, currentPage])

    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
        setNumPages(numPages)
        setCurrentPage(1)
    }

    const handlePreviousPage = () => {
        setCurrentPage((prev) => Math.max(prev - 1, 1))
    }

    const handleNextPage = () => {
        setCurrentPage((prev) => Math.min(prev + 1, numPages))
    }

    const handleZoomIn = () => {
        setScale((prev) => Math.min(prev + 0.25, 3))
    }

    const handleZoomOut = () => {
        setScale((prev) => Math.max(prev - 0.25, 0.5))
    }

    const handlePdfClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (selectedTool === 'edit') {
            const container = pdfContainerRef.current
            if (!container) return

            const rect = container.getBoundingClientRect()
            const x = e.clientX - rect.left
            const y = e.clientY - rect.top

            // Create new text box
            const newTextBox: TextBox = {
                id: Date.now().toString(),
                x,
                y,
                text: 'Click to edit',
                fontSize: 16,
                color: '#000000',
                pageNumber: currentPage,
            }

            setTextBoxes((prev) => [...prev, newTextBox])
            setEditingTextBoxId(newTextBox.id)
        }
    }

    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (selectedTool === 'select' || selectedTool === 'edit') return

        const canvas = canvasRef.current
        if (!canvas) return

        const rect = canvas.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        setIsDrawing(true)
        setCurrentDrawing([{ x, y }])
    }

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing || selectedTool === 'select' || selectedTool === 'edit') return

        const canvas = canvasRef.current
        if (!canvas) return

        const rect = canvas.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        setCurrentDrawing((prev) => [...prev, { x, y }])

        // Draw on canvas
        const ctx = canvas.getContext('2d')
        if (ctx && currentDrawing.length > 0) {
            const lastPoint = currentDrawing[currentDrawing.length - 1]
            ctx.strokeStyle = selectedTool === 'highlight'
                ? `${highlightColor}`
                : selectedTool === 'pen'
                    ? '#000000'
                    : '#ffffff'
            ctx.lineWidth = selectedTool === 'highlight' ? 20 : selectedTool === 'pen' ? 2 : 10
            ctx.globalAlpha = selectedTool === 'highlight' ? 0.3 : 1
            ctx.lineCap = 'round'
            ctx.beginPath()
            ctx.moveTo(lastPoint.x, lastPoint.y)
            ctx.lineTo(x, y)
            ctx.stroke()
        }
    }

    const handleMouseUp = () => {
        if (isDrawing && currentDrawing.length > 0) {
            const newAnnotation: Annotation = {
                id: Date.now().toString(),
                type: selectedTool,
                color: selectedTool === 'highlight' ? highlightColor : undefined,
                x: currentDrawing[0].x,
                y: currentDrawing[0].y,
                points: currentDrawing,
            }

            setAnnotations((prev) => ({
                ...prev,
                [currentPage]: [...(prev[currentPage] || []), newAnnotation],
            }))
        }

        setIsDrawing(false)
        setCurrentDrawing([])
    }

    const handleTextBoxChange = (id: string, newText: string) => {
        setTextBoxes((prev) =>
            prev.map((box) => (box.id === id ? { ...box, text: newText } : box))
        )
    }

    const handleDeleteTextBox = (id: string) => {
        setTextBoxes((prev) => prev.filter((box) => box.id !== id))
        if (editingTextBoxId === id) {
            setEditingTextBoxId(null)
        }
    }

    const handleDownloadPdf = () => {
        // In a real implementation, you would merge annotations with the PDF
        alert('Download functionality would save the PDF with annotations and text edits here')
    }

    const handleGoBack = () => {
        // Clear PDF data before going back
        setPdfFile(null)
        setAnnotations({})
        router.push('/pdfeditor')
    }

    const clearCanvas = () => {
        const canvas = canvasRef.current
        if (canvas) {
            const ctx = canvas.getContext('2d')
            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height)
            }
        }
    }

    const redrawAnnotations = () => {
        clearCanvas()
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const pageAnnotations = annotations[currentPage] || []
        pageAnnotations.forEach((annotation) => {
            if (annotation.points && annotation.points.length > 1) {
                ctx.strokeStyle = annotation.type === 'highlight'
                    ? `${annotation.color}`
                    : annotation.type === 'pen'
                        ? '#000000'
                        : '#ffffff'
                ctx.lineWidth = annotation.type === 'highlight' ? 20 : annotation.type === 'pen' ? 2 : 10
                ctx.globalAlpha = annotation.type === 'highlight' ? 0.3 : 1
                ctx.lineCap = 'round'

                ctx.beginPath()
                ctx.moveTo(annotation.points[0].x, annotation.points[0].y)
                annotation.points.forEach((point) => {
                    ctx.lineTo(point.x, point.y)
                })
                ctx.stroke()
            }
        })
    }

    useEffect(() => {
        redrawAnnotations()
    }, [currentPage, annotations])

    if (!pdfFile) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-white mb-4">No PDF Loaded</h1>
                    <p className="text-gray-300 mb-6">Please upload a PDF file first</p>
                    <button
                        onClick={handleGoBack}
                        className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
                    >
                        Go Back to Upload
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col">
            {/* Top Toolbar */}
            <div className="bg-slate-800 border-b border-slate-700 p-4">
                <div className="flex items-center justify-between max-w-7xl mx-auto">
                    {/* Left: Back and Title */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleGoBack}
                            className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-white"
                            title="Back to Upload"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <h1 className="text-xl font-bold text-white">PDF Editor</h1>
                    </div>

                    {/* Center: Tools */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setSelectedTool('select')}
                            className={`p-3 rounded-lg transition-colors ${selectedTool === 'select' ? 'bg-purple-600 text-white' : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                                }`}
                            title="Select"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                            </svg>
                        </button>

                        <button
                            onClick={() => setSelectedTool('highlight')}
                            className={`p-3 rounded-lg transition-colors ${selectedTool === 'highlight' ? 'bg-purple-600 text-white' : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                                }`}
                            title="Highlight"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                        </button>

                        {selectedTool === 'highlight' && (
                            <div className="flex gap-1 ml-2 p-1 bg-slate-700 rounded-lg">
                                {(['yellow', 'green', 'blue', 'pink'] as HighlightColor[]).map((color) => (
                                    <button
                                        key={color}
                                        onClick={() => setHighlightColor(color)}
                                        className={`w-8 h-8 rounded border-2 transition-all ${highlightColor === color ? 'border-white scale-110' : 'border-transparent'
                                            }`}
                                        style={{ backgroundColor: color }}
                                        title={color}
                                    />
                                ))}
                            </div>
                        )}

                        <button
                            onClick={() => setSelectedTool('pen')}
                            className={`p-3 rounded-lg transition-colors ${selectedTool === 'pen' ? 'bg-purple-600 text-white' : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                                }`}
                            title="Pen"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                        </button>

                        <button
                            onClick={() => setSelectedTool('edit')}
                            className={`p-3 rounded-lg transition-colors ${selectedTool === 'edit' ? 'bg-purple-600 text-white' : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                                }`}
                            title="Edit Text"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </button>

                        <button
                            onClick={() => setSelectedTool('eraser')}
                            className={`p-3 rounded-lg transition-colors ${selectedTool === 'eraser' ? 'bg-purple-600 text-white' : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                                }`}
                            title="Eraser"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>

                        <div className="w-px h-8 bg-slate-600 mx-2" />

                        <button
                            onClick={() => setAnnotations((prev) => ({ ...prev, [currentPage]: [] }))}
                            className="p-3 bg-slate-700 text-gray-300 hover:bg-slate-600 rounded-lg transition-colors"
                            title="Clear Page Annotations"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Right: Download */}
                    <button
                        onClick={handleDownloadPdf}
                        className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all"
                    >
                        Download PDF
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Sidebar - Page Thumbnails */}
                <div className="w-48 bg-slate-800 border-r border-slate-700 overflow-y-auto p-4">
                    <h3 className="text-sm font-semibold text-gray-400 mb-3">Pages</h3>
                    <div className="space-y-3">
                        {Array.from({ length: numPages }, (_, i) => i + 1).map((pageNum) => (
                            <button
                                key={pageNum}
                                onClick={() => setCurrentPage(pageNum)}
                                className={`w-full p-2 rounded-lg border-2 transition-all ${currentPage === pageNum
                                    ? 'border-purple-500 bg-purple-500/20'
                                    : 'border-slate-600 hover:border-slate-500 bg-slate-700'
                                    }`}
                            >
                                <div className="text-xs text-white font-medium mb-1">Page {pageNum}</div>
                                <div className="bg-white rounded overflow-hidden">
                                    <Document file={pdfFile}>
                                        <Page pageNumber={pageNum} width={100} renderTextLayer={false} renderAnnotationLayer={false} />
                                    </Document>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Center - PDF Viewer */}
                <div className="flex-1 overflow-auto bg-slate-900" ref={containerRef}>
                    <div className="flex flex-col items-center p-8">
                        <div
                            ref={pdfContainerRef}
                            className="relative bg-white shadow-2xl"
                            onClick={handlePdfClick}
                            style={{ cursor: selectedTool === 'edit' ? 'crosshair' : 'default' }}
                        >
                            <Document
                                file={pdfFile}
                                onLoadSuccess={onDocumentLoadSuccess}
                                loading={
                                    <div className="flex items-center justify-center p-20">
                                        <div className="text-purple-600 text-lg">Loading PDF...</div>
                                    </div>
                                }
                            >
                                <Page
                                    pageNumber={currentPage}
                                    scale={scale}
                                    renderTextLayer={true}
                                    renderAnnotationLayer={true}
                                />
                            </Document>
                            <canvas
                                ref={canvasRef}
                                width={595 * scale}
                                height={842 * scale}
                                className="absolute top-0 left-0 cursor-crosshair"
                                onMouseDown={handleMouseDown}
                                onMouseMove={handleMouseMove}
                                onMouseUp={handleMouseUp}
                                onMouseLeave={handleMouseUp}
                                style={{ pointerEvents: selectedTool === 'select' || selectedTool === 'edit' ? 'none' : 'auto' }}
                            />

                            {/* Text Boxes Overlay */}
                            {textBoxes
                                .filter((box) => box.pageNumber === currentPage)
                                .map((box) => (
                                    <div
                                        key={box.id}
                                        className="absolute group"
                                        style={{
                                            left: `${box.x}px`,
                                            top: `${box.y}px`,
                                            fontSize: `${box.fontSize}px`,
                                            color: box.color,
                                        }}
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            setEditingTextBoxId(box.id)
                                        }}
                                    >
                                        <div
                                            contentEditable={editingTextBoxId === box.id}
                                            suppressContentEditableWarning
                                            onBlur={(e) => {
                                                handleTextBoxChange(box.id, e.currentTarget.textContent || '')
                                                setEditingTextBoxId(null)
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault()
                                                    e.currentTarget.blur()
                                                }
                                            }}
                                            className={`min-w-[100px] px-2 py-1 outline-none ${editingTextBoxId === box.id
                                                ? 'bg-yellow-100 border-2 border-purple-500 rounded'
                                                : 'bg-transparent'
                                                }`}
                                            style={{ whiteSpace: 'pre-wrap' }}
                                        >
                                            {box.text}
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleDeleteTextBox(box.id)
                                            }}
                                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs"
                                            title="Delete text box"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Toolbar */}
            <div className="bg-slate-800 border-t border-slate-700 p-4">
                <div className="flex items-center justify-between max-w-7xl mx-auto">
                    {/* Page Navigation */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handlePreviousPage}
                            disabled={currentPage <= 1}
                            className="p-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <span className="text-white font-medium">
                            Page {currentPage} of {numPages}
                        </span>
                        <button
                            onClick={handleNextPage}
                            disabled={currentPage >= numPages}
                            className="p-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>

                    {/* Zoom Controls */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleZoomOut}
                            className="p-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
                            title="Zoom Out"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
                            </svg>
                        </button>
                        <span className="text-white font-medium w-16 text-center">
                            {Math.round(scale * 100)}%
                        </span>
                        <button
                            onClick={handleZoomIn}
                            className="p-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
                            title="Zoom In"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
