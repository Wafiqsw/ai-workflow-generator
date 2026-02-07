import React, { useState, useMemo, useEffect } from 'react'
import { Button } from '../Button'
import { mysqlApi, type APIRecord } from '../../api'

interface APITableModalProps {
    isOpen: boolean
    onClose: () => void
}

const APITableModal: React.FC<APITableModalProps> = ({ isOpen, onClose }) => {
    const [apis, setApis] = useState<APIRecord[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')

    const fetchApis = async () => {
        setIsLoading(true)
        try {
            const data = await mysqlApi.getAllApis()
            setApis(data)
        } catch (error) {
            console.error('Failed to fetch APIs:', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (isOpen) {
            fetchApis()
        }
    }, [isOpen])

    // Filter APIs based on search query
    const filteredAPIs = useMemo(() => {
        if (!searchQuery.trim()) return apis

        const query = searchQuery.toLowerCase()
        return apis.filter(api =>
            api.api_name.toLowerCase().includes(query) ||
            api.system_name.toLowerCase().includes(query) ||
            api.description.toLowerCase().includes(query) ||
            JSON.stringify(api.params_values || {}).toLowerCase().includes(query) ||
            JSON.stringify(api.return_values || {}).toLowerCase().includes(query)
        )
    }, [apis, searchQuery])

    // Structured JSON renderer for better scannability
    const JSONTagView = ({ data, colorClass = 'purple' }: { data: any, colorClass?: 'purple' | 'green' | 'blue' }) => {
        if (!data) return <span className="text-gray-500 italic text-xs">None</span>

        // Colors mapping
        const colors = {
            purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
            green: 'text-green-400 bg-green-500/10 border-green-500/20',
            blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20'
        }
        const activeColor = colors[colorClass]

        // Case 1: Array of Objects (e.g., standard API parameters)
        if (Array.isArray(data)) {
            return (
                <div className="flex flex-col gap-2.5 py-1">
                    {data.map((item, i) => {
                        const entries = Object.entries(item).filter(([k, v]) => k !== 'required' || v === true);
                        return (
                            <div key={i} className={`flex flex-wrap gap-2 p-2.5 rounded-xl border ${activeColor}`}>
                                {entries.map(([k, v], idx) => (
                                    <div key={k} className="flex items-center gap-1.5 text-xs">
                                        {k === 'required' ? (
                                            <span className="bg-red-500/20 text-red-500 text-[10px] font-extrabold px-1.5 py-0.5 rounded border border-red-500/20 tracking-tighter">REQUIRED</span>
                                        ) : (
                                            <>
                                                <span className="opacity-60 font-bold uppercase text-[9px] tracking-wider">{k}</span>
                                                <span className="font-semibold">{String(v)}</span>
                                            </>
                                        )}
                                        {idx < entries.length - 1 && (
                                            <span className="opacity-20 mx-1 text-lg leading-none font-thin text-[var(--text-tertiary)]">|</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        );
                    })}
                </div>
            )
        }

        // Case 2: Standard Object
        if (typeof data === 'object') {
            const entries = Object.entries(data).filter(([k, v]) => k !== 'required' || v === true);
            return (
                <div className={`flex flex-wrap gap-2.5 p-2.5 rounded-xl border ${activeColor}`}>
                    {entries.map(([k, v], idx) => (
                        <div key={k} className="flex items-center gap-1.5 text-xs">
                            {k === 'required' ? (
                                <span className="bg-red-500/20 text-red-500 text-[10px] font-extrabold px-1.5 py-0.5 rounded border border-red-500/20 tracking-tighter">REQUIRED</span>
                            ) : (
                                <>
                                    <span className="opacity-60 font-bold uppercase text-[9px] tracking-wider">{k}</span>
                                    <span className="font-semibold">{String(v)}</span>
                                </>
                            )}
                            {idx < entries.length - 1 && (
                                <span className="opacity-20 mx-1 text-lg leading-none font-thin text-[var(--text-tertiary)]">|</span>
                            )}
                        </div>
                    ))}
                </div>
            )
        }

        // Case 3: Simple values
        return <span className={`px-2 py-0.5 rounded text-xs font-mono border ${activeColor}`}>{String(data)}</span>
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-[95vw] 2xl:max-w-[1600px] overflow-hidden rounded-3xl bg-[var(--bg-secondary)] border-2 border-[var(--border-secondary)] shadow-2xl animate-in fade-in zoom-in duration-300">
                <div className="p-10">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-3xl font-bold text-[var(--text-primary)]">API Database</h2>
                            <p className="text-sm text-[var(--text-tertiary)] mt-2">
                                {isLoading ? 'Refreshing data...' :
                                    `${filteredAPIs.length} API${filteredAPIs.length !== 1 ? 's' : ''} ${searchQuery ? 'found' : 'available'}`
                                }
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={fetchApis}
                                disabled={isLoading}
                                className="p-2.5 hover:bg-gold-500/10 rounded-xl transition-colors disabled:opacity-50"
                                title="Refresh data"
                            >
                                <svg className={`w-5 h-5 text-gold-500 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            </button>
                            <button
                                onClick={onClose}
                                className="p-2.5 hover:bg-gold-500/10 rounded-xl transition-colors"
                            >
                                <svg className="w-6 h-6 text-[var(--text-tertiary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="mb-6">
                        <div className="relative">
                            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search APIs by name, system, parameters, or description..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3.5 bg-[var(--bg-tertiary)] border-2 border-[var(--border-secondary)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:border-gold-500 focus:outline-none transition-colors"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gold-500/10 rounded-lg transition-colors"
                                >
                                    <svg className="w-4 h-4 text-[var(--text-tertiary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Table Container with Scroll */}
                    <div className="overflow-hidden rounded-2xl border-2 border-[var(--border-secondary)] bg-[var(--bg-tertiary)]/30">
                        <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
                            <table className="w-full">
                                <thead className="sticky top-0 z-10">
                                    <tr className="border-b-2 border-[var(--border-secondary)] bg-[var(--bg-tertiary)]">
                                        <th className="px-6 py-4 text-left text-sm font-bold text-[var(--text-primary)] whitespace-nowrap w-[15%]">
                                            System Name
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-[var(--text-primary)] whitespace-nowrap w-[15%]">
                                            API Name
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-[var(--text-primary)] whitespace-nowrap min-w-[300px] w-[30%]">
                                            Parameters
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-[var(--text-primary)] whitespace-nowrap min-w-[250px] w-[20%]">
                                            Return Value
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-[var(--text-primary)] whitespace-nowrap w-[20%]">
                                            Description
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredAPIs.length > 0 ? (
                                        filteredAPIs.map((api, index) => (
                                            <tr
                                                key={api.id}
                                                className={`
                                                    border-b border-[var(--border-secondary)] 
                                                    hover:bg-gold-500/5 transition-colors
                                                    ${index % 2 === 0 ? 'bg-[var(--bg-secondary)]' : 'bg-[var(--bg-tertiary)]/20'}
                                                `}
                                            >
                                                <td className="px-6 py-4">
                                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-500/10 px-2 py-1 rounded">
                                                        {api.system_name}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="font-semibold text-gold-400 text-sm">
                                                        {api.api_name}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <JSONTagView data={api.params_values} colorClass="purple" />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <JSONTagView data={api.return_values} colorClass="green" />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm text-[var(--text-secondary)]">
                                                        {api.description}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center">
                                                <div className="flex flex-col items-center gap-3">
                                                    <svg className="w-12 h-12 text-[var(--text-tertiary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    <p className="text-[var(--text-tertiary)] font-medium">
                                                        {isLoading ? 'Fetching data...' : `No APIs found matching "${searchQuery}"`}
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-8 flex justify-end">
                        <Button variant="secondary" size="lg" onClick={onClose}>
                            Close
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export { APITableModal }
