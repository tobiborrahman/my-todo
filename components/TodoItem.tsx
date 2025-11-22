'use client';

import React, { useState } from 'react';
import { Todo } from '@/types';
import { GripVertical, PencilLine, Trash } from 'lucide-react';

interface TodoItemProps extends React.HTMLAttributes<HTMLDivElement> {
  todo: Todo;
  onUpdate: (id: number, updates: Partial<Todo>) => void;
  onDelete: (id: number) => void;
  onEdit: (todo: Todo) => void;
  dragHandleProps?: Record<string, any>;
}

export default function TodoItem({ todo, onUpdate, onDelete, onEdit, dragHandleProps, className = '', ...props }: TodoItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(todo.id);
      setShowConfirmModal(false);
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete todo. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(todo);
  };

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case 'extreme':
        return {
          bg: 'bg-[#FEE2E2]',
          text: 'text-[#DC2626]',
          border: 'border-[#FEE2E2]'
        };
      case 'moderate':
        return {
          bg: 'bg-[#DCFCE7]',
          text: 'text-[#16A34A]',
          border: 'border-[#DCFCE7]'
        };
      case 'low':
        return {
          bg: 'bg-[#FEF9C3]',
          text: 'text-[#CA8A04]',
          border: 'border-[#FEF9C3]'
        };
      default:
        return {
          bg: 'bg-gray-50',
          text: 'text-gray-700',
        };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `Due ${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };

  const priorityStyles = getPriorityStyles(todo.priority);

  return (
    <div
      className={`
        bg-white rounded-xl min-h-[180px] border-[1px] ${priorityStyles.border} p-5 transition-all hover:shadow-md
        ${todo.is_completed ? 'opacity-60' : ''}
        ${className}
      `}
      {...props}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-start justify-between mb-3">
          <h3
            className={`
              text-lg font-bold flex-1 mr-2 line-clamp-1
              ${todo.is_completed ? 'line-through text-gray-500' : 'text-gray-900'}
            `}
          >
            {todo.title}
          </h3>
          <div className="flex items-center flex-shrink-0">
            <span
              className={`px-3 py-1 rounded-sm text-xs font-medium ${priorityStyles.bg} ${priorityStyles.text}`}
            >
              {todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1)}
            </span>
            <button
              type="button"
              {...(dragHandleProps || {})}
              className="flex items-center justify-center rounded cursor-move"
              aria-label="Drag handle"
            >
              <GripVertical className="w-4 h-4 text-[#8CA3CD]" />
            </button>
          </div>
        </div>

        {todo.description && (
          <p
            className={`
              text-sm mb-4 text-gray-700 line-clamp-2
              ${todo.is_completed ? 'line-through text-gray-400' : ''}
            `}
          >
            {todo.description}
          </p>
        )}

        <div className="flex items-center justify-between mt-auto pt-3">
          {todo.todo_date && (
            <p className="text-sm text-gray-700">
              {formatDate(todo.todo_date)}
            </p>
          )}
          {!todo.todo_date && <div />}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleEdit}
              disabled={todo.is_completed || isDeleting}
              className="w-8 h-8 bg-[#eef7ff] hover:bg-blue-200 rounded-lg cursor-pointer flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Edit"
            >
              <PencilLine className="w-4 h-4 text-[#4f46e5]" />
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="w-8 h-8 bg-[#eef7ff] hover:bg-blue-200 rounded-lg cursor-pointer flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Delete"
            >
              <Trash className="w-4 h-4 text-[#dc2626]" />
            </button>
          </div>
        </div>
      </div>
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg max-w-sm w-full p-6 mx-4">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <Trash className="w-6 h-6 text-red-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">Delete task</h3>
                <p className="mt-2 text-sm text-gray-600">Are you sure you want to delete this task? This action cannot be undone.</p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-md bg-white cursor-pointer border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-md bg-red-600 cursor-pointer text-white hover:bg-red-700 disabled:opacity-50 flex items-center"
              >
                {isDeleting ? (
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <Trash className="w-4 h-4 mr-2" />
                )}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
