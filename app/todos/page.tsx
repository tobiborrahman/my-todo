'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useAuth } from '@/contexts/AuthContext';
import { Todo } from '@/types';
import { todoApi } from '@/lib/api';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import TodoItem from '@/components/TodoItem';
import TodoForm from '@/components/TodoForm';
import Button from '@/components/Button';
import { ArrowDownUp, ArrowUpDown, Plus, Search } from 'lucide-react';
import Image from 'next/image';

function SortableTodoItem({
  todo,
  onUpdate,
  onDelete,
  onEdit,
}: {
  todo: Todo;
  onUpdate: (id: number, updates: Partial<Todo>) => void;
  onDelete: (id: number) => void;
  onEdit: (todo: Todo) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: String(todo.id) });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <TodoItem
        todo={todo}
        onUpdate={onUpdate}
        onDelete={onDelete}
        onEdit={onEdit}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}

export default function TodosPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [error, setError] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [filterDate, setFilterDate] = useState<string | null>(null);
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.filter-dropdown')) {
        setShowFilter(false);
      }
    };

    if (showFilter) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFilter]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadTodos(true);
    }
  }, [isAuthenticated, filterDate]);

  const loadTodos = async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      else setIsFetching(true);
      setError('');
      const params: any = {};
      if (filterDate) {
        params.todo_date = filterDate;
      }
      if (searchQuery) {
        params.search = searchQuery;
      }
      const response = await todoApi.getAll(params);
      const sorted = response.results.sort((a, b) => a.position - b.position);
      setTodos(sorted);
    } catch (err: any) {
      setError(err.message || 'Failed to load todos');
    } finally {
      if (showLoading) setLoading(false);
      else setIsFetching(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (isAuthenticated) {
        loadTodos();
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleCreate = async (data: { title: string; description?: string; todo_date?: string; priority?: 'extreme' | 'moderate' | 'low' }) => {
    try {
      setIsCreating(true);
      setError('');
      await todoApi.create({
        title: data.title,
        description: data.description,
        todo_date: data.todo_date,
        priority: data.priority || 'moderate',
      });
      await loadTodos();
      setIsCreating(false);
      setShowNewTaskForm(false);
    } catch (err: any) {
      setError(err.message || 'Failed to create todo');
      setIsCreating(false);
    }
  };

  const handleUpdate = async (id: number, updates: Partial<Todo>) => {
    try {
      setError('');
      const updateData: any = {};
      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.is_completed !== undefined) updateData.is_completed = updates.is_completed;
      if (updates.priority !== undefined) updateData.priority = updates.priority;
      await todoApi.update(id, updateData);
      await loadTodos();
    } catch (err: any) {
      setError(err.message || 'Failed to update todo');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setError('');
      await todoApi.delete(id);
      await loadTodos();
    } catch (err: any) {
      setError(err.message || 'Failed to delete todo');
      throw err;
    }
  };

  const handleEdit = (todo: Todo) => {
    setEditingTodo(todo);
    setShowNewTaskForm(true);
  };

  const handleEditSubmit = async (data: { title: string; description?: string; todo_date?: string; priority?: 'extreme' | 'moderate' | 'low' }) => {
    if (!editingTodo) return;
    try {
      setError('');
      await todoApi.update(editingTodo.id, {
        title: data.title,
        description: data.description,
        todo_date: data.todo_date,
        priority: data.priority,
      });
      await loadTodos();
      setEditingTodo(null);
      setShowNewTaskForm(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update todo');
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = todos.findIndex((todo) => String(todo.id) === String(active.id));
      const newIndex = todos.findIndex((todo) => String(todo.id) === String(over.id));

      const newTodos = arrayMove(todos, oldIndex, newIndex);
      setTodos(newTodos);

      try {
        const reorderedTodos = newTodos.map((todo, index) => ({
          id: todo.id,
          position: index + 1,
        }));
        await todoApi.reorder(reorderedTodos);
      } catch (err: any) {
        setError(err.message || 'Failed to reorder todos');
        await loadTodos();
      }
    }
  };

  const handleFilterDate = (days: number | null) => {
    if (days === null) {
      setFilterDate(null);
    } else {
      const date = new Date();
      date.setDate(date.getDate() + days);
      setFilterDate(date.toISOString().split('T')[0]);
    }
    setShowFilter(false);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F0F4F8]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const displayedTodos = todos;

  return (
    <div className="flex min-h-screen bg-[#F0F4F8]">
      <Sidebar />
      
      <div className="flex-1 flex flex-col ml-64">
        <Header />
        
        <main className="flex-1 p-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-[#0D224A] mb-2">Todos</h1>
              <div className="w-16 h-1 bg-[#5272FF] rounded"></div>
            </div>
            <Button 
              onClick={() => setShowNewTaskForm(true)} 
              className="bg-[#5272FF] text-white flex items-center justify-between py-[11px] cursor-pointer"
            >
              <Plus className="w-4 h-4 mr-2" /> New Task
            </Button>
          </div>

          <div className="mb-6 flex items-center space-x-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search your task here..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={() => loadTodos()}
                aria-busy={isFetching}
                disabled={isFetching}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 w-[50px] h-[50px] bg-[#5272FF] rounded-lg flex items-center justify-center transition-colors cursor-pointer disabled:opacity-60"
              >
                {isFetching ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <Search className="w-5 h-5 text-white" />
                )}
              </button>
            </div>

            <div className="relative filter-dropdown">
              <button
                onClick={() => setShowFilter(!showFilter)}
                className="px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors flex items-center space-x-4"
              >
                <span className="font-medium text-[#000000]">Sort By</span>
                <ArrowUpDown className='w-4 h-4' />
              </button>

              {showFilter && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  <div className="p-2">
                    <button
                      onClick={() => handleFilterDate(0)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded flex items-center space-x-2"
                    >
                      <input
                        type="checkbox"
                        checked={filterDate === new Date().toISOString().split('T')[0]}
                        readOnly
                        className="w-4 h-4 text-blue-600 cursor-pointer"
                      />
                      <span className="text-gray-700">Deadline Today</span>
                    </button>
                    <button
                      onClick={() => handleFilterDate(5)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded flex items-center space-x-2"
                    >
                      <input
                        type="checkbox"
                        checked={filterDate === new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                        readOnly
                        className="w-4 h-4 text-blue-600 cursor-pointer"
                      />
                      <span className="text-gray-700">Expires in 5 days</span>
                    </button>
                    <button
                      onClick={() => handleFilterDate(10)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded flex items-center space-x-2"
                    >
                      <input
                        type="checkbox"
                        checked={filterDate === new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                        readOnly
                        className="w-4 h-4 text-blue-600 cursor-pointer"
                      />
                      <span className="text-gray-700">Expires in 10 days</span>
                    </button>
                    <button
                      onClick={() => handleFilterDate(30)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded flex items-center space-x-2"
                    >
                      <input
                        type="checkbox"
                        checked={filterDate === new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                        readOnly
                        className="w-4 h-4 text-blue-600 cursor-pointer"
                      />
                      <span className="text-gray-700">Expires in 30 days</span>
                    </button>
                    {filterDate && (
                      <button
                        onClick={() => handleFilterDate(null)}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded flex items-center space-x-2 mt-2 border-t border-gray-200 pt-2"
                      >
                        <span className="text-blue-600 font-medium">Clear Filter</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {showNewTaskForm && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl p-8 w-full max-w-lg mx-4 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingTodo ? 'Edit Task' : 'Add New Task'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowNewTaskForm(false);
                      setEditingTodo(null);
                    }}
                    className="text-[#000000] font-semibold text-sm underline cursor-pointer"
                  >
                    Go Back
                  </button>
                </div>
                
                <TodoForm
                  todo={editingTodo || undefined}
                  onSubmit={editingTodo ? handleEditSubmit : handleCreate}
                  onCancel={() => {
                    setShowNewTaskForm(false);
                    setEditingTodo(null);
                  }}
                  isLoading={isCreating}
                />
              </div>
            </div>
          )}

          {displayedTodos.length === 0 ? (
            <div className="flex flex-col items-center justify-center pt-[111px]">
              <div className="relative mb-6">
                <Image src="/empty-todo.png" width={200} height={200} alt='empty state' />
              </div>
              <p className="text-[#201F1E] text-2xl font-medium">No todos yet</p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={displayedTodos.map((todo) => String(todo.id))}
                strategy={verticalListSortingStrategy}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {displayedTodos.map((todo) => (
                    <SortableTodoItem
                      key={todo.id}
                      todo={todo}
                      onUpdate={handleUpdate}
                      onDelete={handleDelete}
                      onEdit={handleEdit}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </main>
      </div>
    </div>
  );
}
