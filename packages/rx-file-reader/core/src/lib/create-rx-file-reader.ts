import { Observable, scan } from 'rxjs';

/**
 * @publicApi
 * @description
 * The result of RxFileReader
 *
 * @param R The result format
 */
export interface FileReaderResult<R extends string | ArrayBuffer | null> {
  fileName: string;
  sourceFile: File;
  content: R;
  progress: ProgressEvent<FileReader>;
}

/**
 * @publicApi
 * @description
 * The supported result formats of RxFileReader.
 *
 * See https://developer.mozilla.org/en-US/docs/Web/API/FileReader/result
 */
export type RxFileReaderResultFormat =
  | 'text'
  | 'arrayBuffer'
  | 'dataURL'
  | 'binaryString';

/**
 * @publicApi
 *
 * @description
 * The configuration for RxFileReader.
 */
export interface RxFileReaderConfig {
  resultFormat: RxFileReaderResultFormat;
}

/**
 * @publicApi
 *
 * @description
 * Create an observable which does wrap the browser FileReaderApi: https://developer.mozilla.org/en-US/docs/Web/API/FileReader
 *
 * @example
 *
 * const fileReader$ = createRxFileReader$(file, 'text');
 * fileReader$.subscribe({
 *  next: (result) => {// do something with the read file},
 *  error: (error) => { // handle error while reading the file },
 * })
 *
 *
 * @param file - The file to read
 * @param format - The result format. @see RxFileReaderResultFormat
 */
export function createRxFileReader$(
  file: File,
  format: 'text'
): Observable<FileReaderResult<string>>;
export function createRxFileReader$(
  file: File,
  format: 'arrayBuffer'
): Observable<FileReaderResult<ArrayBuffer>>;
export function createRxFileReader$(
  file: File,
  format: 'dataURL'
): Observable<FileReaderResult<string>>;
export function createRxFileReader$(
  file: File,
  format: 'binaryString'
): Observable<FileReaderResult<string>>;
export function createRxFileReader$<R extends string | ArrayBuffer | null>(
  file: File,
  format: RxFileReaderResultFormat
): Observable<FileReaderResult<R>> {
  return new Observable<Partial<FileReaderResult<R>>>((observer) => {
    const fileReader = new FileReader();
    fileReader.onload = () => {
      observer.next({
        fileName: file.name,
        sourceFile: file,
        content: fileReader.result as R,
      });
      observer.complete();
    };

    fileReader.onerror = (error) => {
      observer.error(error);
    };

    fileReader.onabort = () => {
      observer.unsubscribe();
    };

    fileReader.onprogress = (progressEvent: ProgressEvent<FileReader>) => {
      // todo accumulate progress. look at suspensify operator from jscutlery
      observer.next({ progress: progressEvent });
    };

    if (format === 'text') {
      fileReader.readAsText(file);
    } else if (format === 'arrayBuffer') {
      fileReader.readAsArrayBuffer(file);
    } else if (format === 'dataURL') {
      fileReader.readAsDataURL(file);
    } else if (format === 'binaryString') {
      fileReader.readAsBinaryString(file);
    } else {
      throw new Error('Unknown result format');
    }

    return () => {
      // Clean up file reader if subscription is unsubscribed
      fileReader.abort();
    };
  }).pipe(
    scan((acc, value) => ({ ...acc, ...value }), {} as FileReaderResult<R>)
  );
}
