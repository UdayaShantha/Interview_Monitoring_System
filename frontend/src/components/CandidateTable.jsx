import React from 'react';
import { format } from 'date-fns';
import { UserPlusIcon, TrashIcon } from '@heroicons/react/24/outline';

const CandidateTable = ({ candidates }) => {
  if (!candidates || candidates.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        No candidates found
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead className="bg-gray-200">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">ID</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Position</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {candidates.map((candidate) => (
            <tr key={candidate.userId}>
              <td className="px-6 py-4 text-sm text-gray-900">{candidate.userId}</td>
              <td className="px-6 py-4 text-sm text-gray-900">{candidate.name}</td>
              <td className="px-6 py-4 text-sm text-gray-900">{candidate.positionType}</td>
              <td className="px-6 py-4 text-sm text-gray-900">
                <div className="flex space-x-2">
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <UserPlusIcon className="h-5 w-5 text-gray-600" />
                  </button>
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <TrashIcon className="h-5 w-5 text-red-600" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CandidateTable;