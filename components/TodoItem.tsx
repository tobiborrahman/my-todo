'use client';

import React, { useState } from 'react';
import { Todo } from '@/types';
import { GripVertical, PencilLine, Trash } from 'lucide-react';

interface TodoItemProps extends React.HTMLAttributes<HTMLDivElement> {
  todo: Todo;
  onUpdate: (id: number, updates: Partial<Todo>) => void;
  onDelete: (id: number) => void;
  onEdit: (todo: Todo) => void;
}

export default function TodoItem({ todo, onUpdate, onDelete, onEdit, className = '', ...props }: TodoItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    const confirmed = window.confirm('Are you sure you want to delete this todo?');
    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    try {
      await onDelete(todo.id);
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
          bg: 'bg-red-50',
          text: 'text-red-700',
          border: 'border-red-200'
        };
      case 'moderate':
        return {
          bg: 'bg-green-50',
          text: 'text-green-700',
          border: 'border-green-200'
        };
      case 'low':
        return {
          bg: 'bg-yellow-50',
          text: 'text-yellow-700',
          border: 'border-yellow-200'
        };
      default:
        return {
          bg: 'bg-gray-50',
          text: 'text-gray-700',
          border: 'border-gray-200'
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
        bg-white rounded-xl border border-green-100 p-5 transition-all hover:shadow-md
        ${todo.is_completed ? 'opacity-60' : ''}
        ${className}
      `}
      {...props}
    >
      <div className="flex flex-col h-full">
        {/* Header: Title on left, Priority tag + Grid icon on right */}
        <div className="flex items-start justify-between mb-3">
          <h3
            className={`
              text-lg font-bold flex-1 mr-4
              ${todo.is_completed ? 'line-through text-gray-500' : 'text-gray-900'}
            `}
          >
            {todo.title}
          </h3>
          <div className="flex items-center space-x-1 flex-shrink-0">
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium border ${priorityStyles.bg} ${priorityStyles.text} ${priorityStyles.border}`}
            >
              {todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1)}
            </span>
            <GripVertical className="w-4 h-4 text-[#8CA3CD]" />
          </div>
        </div>

        {/* Description */}
        {todo.description && (
          <p
            className={`
              text-sm mb-4 text-gray-700
              ${todo.is_completed ? 'line-through text-gray-400' : ''}
            `}
          >
            {todo.description}
          </p>
        )}

        {/* Footer: Due date on left, Action buttons on right */}
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
              className="w-8 h-8 bg-[#eef7ff] hover:bg-blue-200 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Edit"
            >
              <PencilLine className="w-4 h-4 text-[#4f46e5]" />
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="w-8 h-8 bg-[#eef7ff] hover:bg-blue-200 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Delete"
            >
              {isDeleting ? (
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <Trash className="w-4 h-4 text-[#dc2626]" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
