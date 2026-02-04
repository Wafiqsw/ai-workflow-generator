import React, { useState, useMemo } from 'react'
import { Button } from '../Button'

interface APIData {
    id: number
    name: string
    url: string
    param: string
    returnValue: string
    description: string
}

interface APITableModalProps {
    isOpen: boolean
    onClose: () => void
    apis?: APIData[]
}

// Mock data for testing
const mockAPIs: APIData[] = [
    {
        id: 1,
        name: 'getUserProfile',
        url: '/api/v1/users/{id}',
        param: 'id: string',
        returnValue: 'User',
        description: 'Retrieves user profile information by user ID'
    },
    {
        id: 2,
        name: 'createWorkflow',
        url: '/api/v1/workflows',
        param: 'name: string, steps: Step[]',
        returnValue: 'Workflow',
        description: 'Creates a new workflow with specified steps'
    },
    {
        id: 3,
        name: 'listWorkflows',
        url: '/api/v1/workflows',
        param: 'page: number, limit: number',
        returnValue: 'Workflow[]',
        description: 'Returns paginated list of all workflows'
    },
    {
        id: 4,
        name: 'deleteWorkflow',
        url: '/api/v1/workflows/{id}',
        param: 'id: string',
        returnValue: 'void',
        description: 'Deletes a workflow by ID'
    },
    {
        id: 5,
        name: 'executeWorkflow',
        url: '/api/v1/workflows/{id}/execute',
        param: 'id: string, input: any',
        returnValue: 'ExecutionResult',
        description: 'Executes a workflow with provided input data'
    },
    {
        id: 6,
        name: 'updateWorkflow',
        url: '/api/v1/workflows/{id}',
        param: 'id: string, updates: Partial<Workflow>',
        returnValue: 'Workflow',
        description: 'Updates an existing workflow with new data'
    },
    {
        id: 7,
        name: 'getWorkflowStatus',
        url: '/api/v1/workflows/{id}/status',
        param: 'id: string',
        returnValue: 'WorkflowStatus',
        description: 'Gets the current execution status of a workflow'
    },
    {
        id: 8,
        name: 'searchAPIs',
        url: '/api/v1/search',
        param: 'query: string, filters: Filter[]',
        returnValue: 'APIData[]',
        description: 'Searches for APIs matching the query and filters'
    },
]

const APITableModal: React.FC<APITableModalProps> = ({ isOpen, onClose, apis = mockAPIs }) => {
    const [searchQuery, setSearchQuery] = useState('')

    // Filter APIs based on search query
    const filteredAPIs = useMemo(() => {
        if (!searchQuery.trim()) return apis

        const query = searchQuery.toLowerCase()
        return apis.filter(api =>
            api.name.toLowerCase().includes(query) ||
            api.url.toLowerCase().includes(query) ||
            api.param.toLowerCase().includes(query) ||
            api.returnValue.toLowerCase().includes(query) ||
            api.description.toLowerCase().includes(query)
        )
    }, [apis, searchQuery])

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-7xl overflow-hidden rounded-3xl bg-[var(--bg-secondary)] border-2 border-[var(--border-secondary)] shadow-2xl animate-in fade-in zoom-in duration-300">
                <div className="p-10">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-3xl font-bold text-[var(--text-primary)]">API Database</h2>
                            <p className="text-sm text-[var(--text-tertiary)] mt-2">
                                {filteredAPIs.length} API{filteredAPIs.length !== 1 ? 's' : ''} {searchQuery ? 'found' : 'available'}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2.5 hover:bg-gold-500/10 rounded-xl transition-colors"
                        >
                            <svg className="w-6 h-6 text-[var(--text-tertiary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Search Bar */}
                    <div className="mb-6">
                        <div className="relative">
                            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search APIs by name, URL, parameters, or description..."
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
                        <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                            <table className="w-full">
                                <thead className="sticky top-0 z-10">
                                    <tr className="border-b-2 border-[var(--border-secondary)] bg-[var(--bg-tertiary)]">
                                        <th className="px-6 py-4 text-left text-sm font-bold text-[var(--text-primary)] whitespace-nowrap">
                                            API Name
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-[var(--text-primary)] whitespace-nowrap">
                                            API URL
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-[var(--text-primary)] whitespace-nowrap">
                                            Parameters
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-[var(--text-primary)] whitespace-nowrap">
                                            Return Value
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-[var(--text-primary)] whitespace-nowrap">
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
                                                    <span className="font-semibold text-gold-400 text-sm">
                                                        {api.name}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <code className="text-xs text-blue-400 bg-blue-500/10 px-2 py-1 rounded font-mono">
                                                        {api.url}
                                                    </code>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <code className="text-xs text-purple-400 font-mono">
                                                        {api.param}
                                                    </code>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <code className="text-xs text-green-400 font-mono">
                                                        {api.returnValue}
                                                    </code>
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
                                                    <p className="text-[var(--text-tertiary)] font-medium">No APIs found matching "{searchQuery}"</p>
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
export type { APIData }
