'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { useMutation } from '@tanstack/react-query';
import {
  ChevronsRight,
  CloudDownloadIcon,
  ExternalLinkIcon,
  FileAudioIcon,
  FileVideo,
  ImagePlayIcon,
  ScissorsLineDashedIcon,
  TerminalIcon,
  Trash2Icon,
} from 'lucide-react';

import { api } from '@/trpc/react';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Loader,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
  toast,
  validateFile,
} from '@/ui';
import { env } from '@/env';

export default function FilesList() {
  const utils = api.useUtils();

  const { data: files = [], isLoading } = api.files.list.useQuery(undefined, {
    refetchInterval: 5000,
  });

  const onSuccess = () => {
    void utils.files.list.invalidate();
    void utils.tasks.list.invalidate();
  }

  const { mutate: transcode, isPending: isTranscoding } = useMutation<void, Error, { fileId: string; format: string }, unknown>({
    mutationFn: async (params) => {
      const response = await fetch(`${env.NEXT_PUBLIC_BUNPEG_API}/transcode`, {
        method: 'POST',
        body: JSON.stringify(params),
      });

      if (!response.ok || response.status !== 200) {
        throw new Error('Unable to create transcode task');
      }
    },
    onSuccess,
  })

  const { mutate: trim, isPending: isTrimming } = useMutation<void, Error, { fileId: string; start: number; duration: number; outputFormat: string }, unknown>({
    mutationFn: async (params) => {
      const response = await fetch(`${env.NEXT_PUBLIC_BUNPEG_API}/trim`, {
        method: 'POST',
        body: JSON.stringify(params),
      });

      if (!response.ok || response.status !== 200) {
        throw new Error('Unable to create trim task');
      }
    },
    onSuccess,
  })

  const { mutate: cutEnd, isPending: isCutting } = useMutation<void, Error, { fileId: string; duration: number; outputFormat: string }, unknown>({
    mutationFn: async (params) => {
      const response = await fetch(`${env.NEXT_PUBLIC_BUNPEG_API}/trim-end`, {
        method: 'POST',
        body: JSON.stringify(params),
      });

      if (!response.ok || response.status !== 200) {
        throw new Error('Unable to create trim-end task');
      }
    },
    onSuccess,
  })

  const { mutate: chain, isPending: isChaining } = useMutation<void, Error, { fileId: string }, unknown>({
    mutationFn: async (params) => {
      const file = files.find((__file) => __file.id === params.fileId);
      if (!file) throw new Error('Unable to find file');

      const meta = file.metadata ? JSON.parse(file.metadata) : {};
      if (Number.isNaN(Number(meta.duration))) return;

      const parts = file.file_name.split('.');

      const response = await fetch(`${env.NEXT_PUBLIC_BUNPEG_API}/chain`, {
        method: 'POST',
        body: JSON.stringify({
          fileId: params.fileId,
          operations: [
            { type: 'trim', start: 0, duration: 10, outputFormat: parts.at(-1)! },
            { type: 'trim-end', duration: 5, outputFormat: parts.at(-1)! },
            { type: 'transcode', format: 'mp4' },
          ],
        }),
      });

      if (!response.ok || response.status !== 200) {
        throw new Error('Unable to create trim-end task');
      }
    },
    onSuccess,
  })

  const { mutate: deleteFile, isPending: isDeleting } = useMutation<void, Error, string, unknown>({
    mutationFn: async (fileId) => {
      const response = await fetch(`${env.NEXT_PUBLIC_BUNPEG_API}/delete/${fileId}`, {
        method: 'DELETE',
      });

      if (!response.ok || response.status !== 200) {
        throw new Error('Unable to delete the file');
      }
    },
    onSuccess,
  })

  const isPending = isDeleting || isTranscoding || isTrimming || isCutting || isChaining;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableCell className="w-10">
            <span className="sr-only">File type</span>
          </TableCell>
          <TableCell>File</TableCell>
          <TableCell className="w-24">
            <UploadButton />
          </TableCell>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? <SkeletonRows /> : null}
        {!isLoading && files.length === 0 ? <EmptySpace /> : null}
        {files.map((file) => {
          const meta = file.metadata ? JSON.parse(file.metadata) : {};

          return (
            <TableRow key={file.id}>
              <TableCell>
                {file.mime_type.startsWith('video/')
                  ? <FileVideo className="size-4" />
                  : <FileAudioIcon className="size-4" />}
              </TableCell>
              <TableCell>
                {file.file_name}
                <br className="hidden lg:inline"/>
                {meta?.fileSize ? ` (size: ${(meta.fileSize / 1024 / 1024).toFixed(2)} MB | duration: ${meta.duration} s)` : ''}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild disabled={isPending}>
                    <Button size="icon" variant="ghost">
                      <TerminalIcon className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Transcode</DropdownMenuLabel>
                    <DropdownMenuItem disabled={isPending} onClick={() => transcode({ fileId: file.id, format: 'mp4' })}>
                      <ImagePlayIcon className="size-4 mr-2" />
                      To .mp4
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled={isPending} onClick={() => transcode({ fileId: file.id, format: 'mov' })}>
                      <ImagePlayIcon className="size-4 mr-2" />
                      To .mov
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled={isPending} onClick={() => transcode({ fileId: file.id, format: 'mkv' })}>
                      <ImagePlayIcon className="size-4 mr-2" />
                      To .mkv
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Trim</DropdownMenuLabel>
                    <DropdownMenuItem
                      disabled={isPending}
                      onClick={() => {
                        const parts = file.file_name.split('.');
                        trim({ fileId: file.id, start: 0, duration: 10, outputFormat: parts.at(-1)! });
                      }}
                    >
                      <ScissorsLineDashedIcon className="size-4 mr-2" />
                      From start
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      disabled={isPending || !file.metadata}
                      onClick={() => {
                        if (!file.metadata) return;

                        const meta = JSON.parse(file.metadata);
                        if (Number.isNaN(Number(meta.duration))) return;

                        const parts = file.file_name.split('.');
                        trim({
                          fileId: file.id,
                          start: 5,
                          duration: Number(meta.duration) - 5,
                          outputFormat: parts.at(-1)!,
                        });
                      }}
                    >
                      <ScissorsLineDashedIcon className="size-4 mr-2 rotate-180" />
                      From end (trim)
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      disabled={isPending}
                      onClick={() => {
                        if (Number.isNaN(Number(meta.duration))) return;

                        const parts = file.file_name.split('.');
                        cutEnd({
                          fileId: file.id,
                          duration: Number(meta.duration) - 5,
                          outputFormat: parts.at(-1)!,
                        });
                      }}
                    >
                      <ScissorsLineDashedIcon className="size-4 mr-2 rotate-180" />
                      From end (trim-end)
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem disabled={isPending}>
                      <FileAudioIcon className="size-4 mr-2" />
                      Extract audio
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem disabled={isPending} onClick={() => chain({ fileId: file.id })}>
                      <ChevronsRight className="size-4 mr-2" />
                      Chain operations
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <Link href={`${env.NEXT_PUBLIC_BUNPEG_API}/output/${file.id}`} target="_blank">
                      <DropdownMenuItem disabled={isPending}>
                        <ExternalLinkIcon className="size-4 mr-2" />
                        Preview
                      </DropdownMenuItem>
                    </Link>
                    <Link href={`${env.NEXT_PUBLIC_BUNPEG_API}/download/${file.id}`} target="_blank">
                      <DropdownMenuItem disabled={isPending}>
                        <CloudDownloadIcon className="size-4 mr-2" />
                        Download
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => deleteFile(file.id)} disabled={isPending}>
                      <Trash2Icon className="size-4 mr-2" />
                      Remove
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          );
        })}
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
      <TableCell colSpan={3}>No files to show</TableCell>
    </TableRow>
  )
}

function UploadButton() {
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const utils = api.useUtils();

  const openFilePicker = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.length) {
      const files = event.target.files;

      if (files.length === 1) {
        const file = files[0]!;
        const { ok, error } = validateFile(file);

        if (!ok) {
          if (error === 'invalid') {
            toast('The file is not supported', {
              description: (
                <>
                  The file does not have a name or extension.
                  <br />
                  <br />
                  File: <span className="text-xs font-medium">{file.name}</span>
                </>
              ),
              duration: 5000,
            });
          }

          if (error === 'extension') {
            toast('The file is not supported', {
              description: (
                <>
                  The file needs to have an extension so it can be opened correctly later on.
                  <br />
                  <br />
                  File: <span className="text-xs font-medium">{file.name}</span>
                </>
              ),
              duration: 5000,
            });
          }

          if (error === 'system-file') {
            toast('The file is not supported', {
              description: (
                <>
                  You are trying to upload an operating system file.
                  <br />
                  <br />
                  File: <span className="text-xs font-medium">{file.name}</span>
                </>
              ),
              duration: 5000,
            });
          }

          // if (error === 'max-size') {
          //   toast('File size is too big', {
          //     description: (
          //       <>
          //         The size of the file is over our 4.5MB limit.
          //         <br />
          //         <br />
          //         File: <span className="text-xs font-medium">{file.name}</span>
          //       </>
          //     ),
          //     duration: 5000,
          //   });
          // }

          clearFileInput();
          return;
        }

        try {
          setLoading(true);
          const formData = new FormData();
          formData.append('file', file);

          const response = await fetch(`${env.NEXT_PUBLIC_BUNPEG_API}/upload`, {
            method: 'POST',
            body: formData,
          });

          if (response.ok && response.status >= 200) {
            const data = await response.json();
            toast('Upload completed', { description: `New file uploaded with ID: ${(data as any).fileId}` });
            void utils.files.list.invalidate();
          } else {
            console.error(response);
            toast.error('Failed to upload file', { description: await response.text() });
          }
        } catch (e: any) {
          toast.error('Failed to upload file', { description: e.message });
        } finally {
          clearFileInput();
          setLoading(false);
        }
      }
    }
  };

  const clearFileInput = () => {
    if (fileInputRef.current) {
      // @ts-ignore
      fileInputRef.current.value = null;
    }
  }

  return (
    <>
      <Button size="xs" variant="black" onClick={openFilePicker} disabled={loading}>
        {loading ? <Loader size="xs" color="white" /> : 'Upload'}
      </Button>
      <input ref={fileInputRef} type="file" accept="video/*" className="hidden" onChange={handleChange} disabled={loading} />
    </>
  );
}
