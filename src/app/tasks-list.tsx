'use client';

import { api } from '@/trpc/react';
import { Skeleton, Table, TableBody, TableCell, TableHeader, TableRow } from '@/ui';

export default function TasksList() {
  const { data: tasks = [], isLoading } = api.tasks.list.useQuery(undefined, {
    refetchInterval: 5000,
  });

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableCell>Operation</TableCell>
          <TableCell>Args</TableCell>
          <TableCell>Status</TableCell>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? <SkeletonRows /> : null}
        {!isLoading && tasks.length === 0 ? <EmptySpace /> : null}
        {tasks.map((task) => (
          <TableRow key={task.id}>
            <TableCell>{task.operation}</TableCell>
            <TableCell>{task.args}</TableCell>
            <TableCell>{task.status}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function SkeletonRows() {
  return (
    <>
      <SkeletonRow />
      <SkeletonRow />
      <SkeletonRow />
    </>
  );
}

function SkeletonRow() {
  return (
    <TableRow>
      <TableCell>
        <Skeleton className="h-5" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-5" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-5" />
      </TableCell>
    </TableRow>
  );
}

function EmptySpace() {
  return (
    <TableRow>
      <TableCell colSpan={3}>No tasks to show</TableCell>
    </TableRow>
  )
}
